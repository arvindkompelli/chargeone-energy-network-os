import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { prisma } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load unified root environment configuration
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5173;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // CORS middleware for standalone frontend dev server
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Production Security Headers
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Shared Gemini client utility initialized on server with User-Agent telemetry
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Helper to verify if a valid Gemini API key is configured
  const isRealApiKey = (key: string): boolean => {
    return Boolean(
      key &&
      key.trim().length > 10 &&
      !key.includes('YOUR_GEMINI_API_KEY') &&
      !key.includes('YOUR_API_KEY') &&
      !key.startsWith('placeholder')
    );
  };

  const hasConfiguredKey = isRealApiKey(apiKey);

  const cleanErrorMessage = (err: any): string => {
    const raw = err?.message || 'An error occurred while calling the Gemini API';
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) {
        return parsed.error.message;
      }
    } catch {
      // not json
    }
    return raw;
  };

  // Health check endpoint
  app.get('/api/health', async (_req: Request, res: Response) => {
    let dbStatus = 'disconnected';
    let dbCounts = null;
    try {
      const [stationCount, chargerCount, sessionCount] = await Promise.all([
        prisma.station.count(),
        prisma.chargerNode.count(),
        prisma.activeSession.count(),
      ]);
      dbStatus = 'connected';
      dbCounts = { stations: stationCount, chargers: chargerCount, sessions: sessionCount };
    } catch {
      dbStatus = 'unreachable';
    }

    res.json({
      status: 'ok',
      database: dbStatus,
      dbCounts,
      hasApiKey: hasConfiguredKey,
      supportedModels: [
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.1-pro-preview',
        'gemini-3.8-flash',
      ],
      features: ['googleMaps-grounding', 'rapid-triage', 'complex-auditing', 'postgresql-prisma'],
    });
  });

  // Database status and inventory endpoints
  app.get('/api/db/status', async (_req: Request, res: Response) => {
    try {
      const [stations, chargers, sessions, partners, batches] = await Promise.all([
        prisma.station.count(),
        prisma.chargerNode.count(),
        prisma.activeSession.count(),
        prisma.roamingPartner.count(),
        prisma.settlementBatch.count(),
      ]);

      return res.json({
        database: 'chargeone',
        provider: 'postgresql',
        status: 'healthy',
        counts: {
          stations,
          chargers,
          sessions,
          roamingPartners: partners,
          settlementBatches: batches,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Database query failed', message: err?.message });
    }
  });

  app.get('/api/stations', async (_req: Request, res: Response) => {
    try {
      const stations = await prisma.station.findMany({
        include: { chargers: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(stations);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch stations', message: err?.message });
    }
  });

  app.get('/api/chargers', async (_req: Request, res: Response) => {
    try {
      const chargers = await prisma.chargerNode.findMany({
        orderBy: { id: 'asc' },
      });
      return res.json(chargers);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch chargers', message: err?.message });
    }
  });

  app.get('/api/sessions', async (_req: Request, res: Response) => {
    try {
      const sessions = await prisma.activeSession.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.json(sessions);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch sessions', message: err?.message });
    }
  });

  app.get('/api/roaming-partners', async (_req: Request, res: Response) => {
    try {
      const partners = await prisma.roamingPartner.findMany({
        orderBy: { id: 'asc' },
      });
      return res.json(partners);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch roaming partners', message: err?.message });
    }
  });

  // Main Chat & Maps Grounding endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const {
        message,
        history = [],
        role = 'maps',
        userLocation,
        modelOverride,
      } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required and must be a string' });
      }

      // If no valid key is configured, return rich simulated response for seamless local demo
      if (!hasConfiguredKey) {
        if (role === 'fast') {
          return res.json({
            text: `### ⚡ Rapid Telemetry & Fault Triage Analysis\n\n- **Target Inquiry**: "${message}"\n- **OCPP Diagnostic Profile**: Protocol 2.0.1 Ingress Event / Solenoid Lock Analysis\n- **Automated Triage Steps**:\n  1. **Immediate Action**: Dispatched soft reset command (\`Reset(type="OnIdle")\`) to verify connector solenoid state.\n  2. **Thermal Sensor Evaluation**: Fluid cooling sensors report 42°C nominal (threshold: 75°C).\n  3. **Operational Recommendation**: Clear transient ground retry loop. If fault persists across 3 transaction attempts, auto-isolate dispenser gun and route inbound drivers to Bay 02.\n\n*(Note: Running in Simulated Demo Mode. Configure \`GEMINI_API_KEY\` in \`.env\` to connect to live Gemini 3.1 Flash-Lite.)*`,
            modelUsed: 'gemini-3.1-flash-lite (Simulated Demo)',
            groundingChunks: [],
            mapsPlaces: [],
            role,
          });
        }

        if (role === 'complex') {
          return res.json({
            text: `### 📊 Complex Grid & Multi-CPO Tariff Audit Report\n\n- **Query**: "${message}"\n- **Dynamic Arbitrage Breakdown**:\n  - **Off-Peak Window (00:00 - 06:00 IST)**: Wholesale grid input ₹5.10/kWh. Retail tariff configured at ₹14.00/kWh (Gross Margin: 63.5%).\n  - **Super-Peak Commute (18:00 - 22:00 IST)**: Grid demand penalty ₹4.80/kVA. Active load shed throttles dispensers to 120kW max to protect substation transformer headroom.\n  - **OCPI 2.2.1 Clearinghouse Reconciliation**: Bilateral netting between Starlight Energy and Shell Recharge eliminated ₹4.18L in duplicate gateway interchange fees this cycle.\n\n*(Note: Running in Simulated Demo Mode. Configure \`GEMINI_API_KEY\` in \`.env\` to connect to live Gemini 3.1 Pro.)*`,
            modelUsed: 'gemini-3.1-pro-preview (Simulated Demo)',
            groundingChunks: [],
            mapsPlaces: [],
            role,
          });
        }

        // Default: maps grounding
        return res.json({
          text: `### ⚡ Verified EV Fast-Charging Hubs & Highway Corridors\n\nBased on your location (**Bengaluru Metro Corridor**), here are live verified high-power EV charging locations matching: "${message}"\n\n1. **ChargeOne Superhub - Indiranagar 100ft Road**\n   - **Address**: 100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038\n   - **Hardware**: 4x ABB Terra 360 kW DC Ultra-Fast (Dual CCS2) • 2x 22 kW Type 2 AC\n   - **Amenities**: Third Wave Coffee (open 24/7), Clean Restrooms, Dedicated EV staging bay\n   - **Status**: 6 of 8 Guns Available • Grid Synced\n\n2. **Tata Power EZ Charge - Defence Colony Hub**\n   - **Address**: 12th Main Rd, Indiranagar, Bengaluru 560008\n   - **Hardware**: 2x 60 kW DC Fast Chargers (CCS2)\n   - **Amenities**: Starbucks, Pharmacy, ATM\n   - **Status**: 2 of 4 Guns Available\n\n3. **Shell Recharge - Old Airport Road Plaza**\n   - **Address**: Old Airport Rd, Kodihalli, Bengaluru 560008\n   - **Hardware**: 2x 120 kW High-Power CCS2 Dispensers\n   - **Amenities**: Shell Select Convenience Store, Fresh Cafe, EV Driver Lounge\n   - **Status**: 3 of 4 Guns Available\n\n*(Note: Running in Simulated Demo Mode. Configure \`GEMINI_API_KEY\` in \`.env\` to connect to live Gemini 3.5 Flash and Google Maps Grounding tool.)*`,
          modelUsed: 'gemini-3.5-flash (Simulated Demo)',
          groundingChunks: [],
          mapsPlaces: [
            {
              title: 'ChargeOne Superhub Indiranagar (360kW DC)',
              uri: 'https://maps.google.com/?q=Indiranagar+Bengaluru+EV+Charging',
              reviewSnippets: [
                'Ultra-fast 360 kW charging. Charged my EV6 from 10% to 80% in 18 minutes while grabbing coffee.',
                'Very clean station with dedicated security guard and canopy overhead.'
              ]
            },
            {
              title: 'Tata Power EZ Charge - Defence Colony',
              uri: 'https://maps.google.com/?q=Tata+Power+EZ+Indiranagar',
              reviewSnippets: [
                'Reliable CCS2 fast charging with seamless RFID app tap.'
              ]
            },
            {
              title: 'Shell Recharge Hub - Old Airport Rd',
              uri: 'https://maps.google.com/?q=Shell+Recharge+Bengaluru',
              reviewSnippets: [
                'Great coffee shop and reliable 120kW CCS2 dispensers.'
              ]
            }
          ],
          role,
        });
      }

      // Live Gemini API call with configured key
      let selectedModel = 'gemini-3.5-flash';
      let systemInstruction = '';
      let tools: any[] | undefined = undefined;
      let toolConfig: any = undefined;

      if (role === 'maps') {
        selectedModel = 'gemini-3.5-flash';
        systemInstruction =
          'You are the ChargeOne Geospatial Navigation & EV Station Grounding Specialist. ' +
          'You specialize in locating live EV fast-charging stations, charging corridors, nearby amenities (restrooms, cafes, hotels, food courts), ' +
          'real-time site access details, and navigation guidance using Google Maps data. ' +
          'Always cite real locations, station operators (ChargeOne, Tata Power EZ, Shell Recharge, Electrify America, Zeon, Tesla Superchargers, etc.), ' +
          'plug types (CCS2, Type 2, GB/T, NACS), and address details. ' +
          'Format your responses clearly with Markdown headings and bullet points. ' +
          'Always highlight amenities around charging plazas so drivers know where to rest or eat while charging.';

        tools = [{ googleMaps: {} }];

        if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
          toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          };
        }
      } else if (role === 'fast') {
        selectedModel = 'gemini-3.1-flash-lite';
        systemInstruction =
          'You are the ChargeOne Rapid Telemetry & Dispatch Triage Bot. ' +
          'You provide instant, concise, high-priority diagnostics for CPO field engineers and technicians. ' +
          'Explain OCPP 2.0.1 and 1.6J error codes (e.g., GroundFailure, HighTemperature, PowerMeterFailure, CableLockFailure), ' +
          'identify immediate risk levels, and provide rapid operational instructions in under 150 words.';
      } else if (role === 'complex') {
        selectedModel = 'gemini-3.1-pro-preview';
        systemInstruction =
          'You are the ChargeOne Senior Grid Economist & Multi-CPO Roaming Auditor. ' +
          'You specialize in complex tariff engineering, time-of-use (TOU) dynamic arbitrage, demand response penalties, ' +
          'OCPI 2.2.1 clearinghouse settlement dispute reconciliation, and 800V high-power depot load balancing. ' +
          'Provide deep mathematical reasoning, step-by-step auditing, and structured financial impact breakdowns.';
      } else {
        selectedModel = 'gemini-3.5-flash';
        systemInstruction =
          'You are the ChargeOne Intelligent Energy & EV Network Co-Pilot. ' +
          'You assist CPO operators, fleet dispatchers, and network engineers in managing charging sessions, ' +
          'roaming agreements, hardware availability, and driver support.';
      }

      if (modelOverride) {
        selectedModel = modelOverride;
      }

      // Build conversation contents
      const formattedContents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-8)) {
          if (item.content && (item.role === 'user' || item.role === 'model')) {
            formattedContents.push({
              role: item.role,
              parts: [{ text: item.content }],
            });
          }
        }
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const config: any = {
        systemInstruction,
      };

      if (tools) {
        config.tools = tools;
      }
      if (toolConfig) {
        config.toolConfig = toolConfig;
      }

      let response: any;
      let actualModelUsed = selectedModel;

      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config,
        });
      } catch (genError: any) {
        console.warn(`Primary model call to ${selectedModel} failed, trying fallback:`, genError?.message);
        if (selectedModel === 'gemini-3.1-pro-preview') {
          actualModelUsed = 'gemini-3.8-flash';
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: formattedContents,
            config,
          });
        } else {
          throw genError;
        }
      }

      const text = response?.text || 'No response generated.';
      const candidate = response?.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const mapsPlaces: Array<{
        title: string;
        uri: string;
        reviewSnippets?: string[];
      }> = [];

      for (const chunk of groundingChunks) {
        if (chunk.maps) {
          const snippets: string[] = [];
          if (chunk.maps.placeAnswerSources?.reviewSnippets) {
            for (const s of chunk.maps.placeAnswerSources.reviewSnippets) {
              const item = s as any;
              if (typeof item === 'string') {
                snippets.push(item);
              } else if (typeof item?.reviewText === 'string') {
                snippets.push(item.reviewText);
              } else if (typeof item?.content === 'string') {
                snippets.push(item.content);
              } else if (typeof item?.snippet === 'string') {
                snippets.push(item.snippet);
              }
            }
          }
          mapsPlaces.push({
            title: chunk.maps.title || 'Google Maps Place',
            uri: chunk.maps.uri || '',
            reviewSnippets: snippets,
          });
        }
      }

      return res.json({
        text,
        modelUsed: actualModelUsed,
        groundingChunks,
        mapsPlaces,
        role,
      });
    } catch (error: any) {
      console.error('Error calling Gemini API in /api/chat:', error);
      return res.status(500).json({
        error: cleanErrorMessage(error),
      });
    }
  });

  // Dedicated Google Maps Grounding endpoint for EV station searches
  app.post('/api/stations/ground', async (req: Request, res: Response) => {
    try {
      const { query, latLng } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      if (!hasConfiguredKey) {
        return res.json({
          text: `Verified 3 real-world high-power EV charging hubs for "${query}" with Google Maps coordinates and live connectors.`,
          groundingChunks: [],
          mapsPlaces: [
            {
              title: 'ChargeOne Superhub - Indiranagar 100ft Road (360 kW DC)',
              uri: 'https://maps.google.com/?q=Indiranagar+Bengaluru+EV+Charging',
              reviewSnippets: [
                'Ultra-fast 360 kW dual guns. 10% to 80% in 18 minutes.',
                'Right next to 24/7 cafes and clean facilities.'
              ]
            },
            {
              title: 'Tata Power EZ Charge - Defence Colony (60 kW DC)',
              uri: 'https://maps.google.com/?q=Tata+Power+EZ+Indiranagar',
              reviewSnippets: [
                'Reliable CCS2 fast charging with seamless RFID app tap.'
              ]
            },
            {
              title: 'Shell Recharge - Old Airport Road Plaza (120 kW DC)',
              uri: 'https://maps.google.com/?q=Shell+Recharge+Bengaluru',
              reviewSnippets: [
                'High speed liquid-cooled cables with 24/7 convenience store.'
              ]
            }
          ],
          modelUsed: 'gemini-3.5-flash (Simulated Demo)',
        });
      }

      const config: any = {
        systemInstruction:
          'You are the ChargeOne Geospatial Station Locator powered by Google Maps. ' +
          'Provide accurate, real-world EV charging locations, exact addresses, connector ratings (CCS2, Type 2, GB/T, NACS), ' +
          'nearby amenities (cafes, restrooms, shopping), and direct Google Maps links. ' +
          'Format results clearly with numbered stations.',
        tools: [{ googleMaps: {} }],
      };

      if (latLng && typeof latLng.latitude === 'number' && typeof latLng.longitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: latLng.latitude,
              longitude: latLng.longitude,
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: query,
        config,
      });

      const text = response?.text || '';
      const candidate = response?.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

      const mapsPlaces: Array<{
        title: string;
        uri: string;
        reviewSnippets?: string[];
      }> = [];

      for (const chunk of groundingChunks) {
        if (chunk.maps) {
          const snippets: string[] = [];
          if (chunk.maps.placeAnswerSources?.reviewSnippets) {
            for (const s of chunk.maps.placeAnswerSources.reviewSnippets) {
              const item = s as any;
              if (typeof item === 'string') {
                snippets.push(item);
              } else if (typeof item?.reviewText === 'string') {
                snippets.push(item.reviewText);
              } else if (typeof item?.content === 'string') {
                snippets.push(item.content);
              } else if (typeof item?.snippet === 'string') {
                snippets.push(item.snippet);
              }
            }
          }
          mapsPlaces.push({
            title: chunk.maps.title || 'EV Charging Point',
            uri: chunk.maps.uri || '',
            reviewSnippets: snippets,
          });
        }
      }

      return res.json({
        text,
        groundingChunks,
        mapsPlaces,
        modelUsed: 'gemini-3.5-flash (with googleMaps tool)',
      });
    } catch (error: any) {
      console.error('Error in /api/stations/ground:', error);
      return res.status(500).json({
        error: cleanErrorMessage(error),
      });
    }
  });

  // ─── Wallet & Payment Gateway API Endpoints ───────────────────────────────

  // In-memory wallet store (persists per server process; use DB in production)
  const walletStore: {
    balance: number;
    transactions: Array<{
      id: string;
      type: 'credit' | 'debit';
      amount: number;
      description: string;
      method: string;
      timestamp: string;
      status: 'success' | 'pending' | 'failed';
    }>;
  } = {
    balance: 2450.00,
    transactions: [
      { id: 'txn-001', type: 'credit', amount: 1000, description: 'Added via UPI AutoPay', method: 'UPI • HDFC Bank', timestamp: '2026-09-28T18:00:00Z', status: 'success' },
      { id: 'txn-002', type: 'debit', amount: 765.00, description: 'Charging – Tata Power MegaHub', method: 'Wallet', timestamp: '2026-09-28T18:42:00Z', status: 'success' },
      { id: 'txn-003', type: 'credit', amount: 2000, description: 'Added via Net Banking', method: 'HDFC Bank NetBanking', timestamp: '2026-09-24T10:00:00Z', status: 'success' },
      { id: 'txn-004', type: 'debit', amount: 548.73, description: 'Charging – Shell Recharge Whitefield', method: 'Wallet', timestamp: '2026-09-24T11:20:00Z', status: 'success' },
    ],
  };

  // GET wallet balance & summary
  app.get('/api/wallet/balance', (_req: Request, res: Response) => {
    return res.json({
      balance: walletStore.balance,
      currency: 'INR',
      autoTopupEnabled: true,
      autoTopupThreshold: 500,
      autoTopupAmount: 1000,
      linkedMethod: 'HDFC Bank •••• 9104 (UPI AutoPay)',
    });
  });

  // GET transaction history
  app.get('/api/wallet/transactions', (req: Request, res: Response) => {
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const page = parseInt((req.query.page as string) || '1', 10);
    const start = (page - 1) * limit;
    const paginated = walletStore.transactions.slice(start, start + limit);
    return res.json({
      transactions: paginated,
      total: walletStore.transactions.length,
      page,
      limit,
    });
  });

  // POST wallet topup (payment gateway)
  app.post('/api/wallet/topup', async (req: Request, res: Response) => {
    try {
      const { amount, method, upiId, cardLast4, bankName } = req.body;

      if (!amount || typeof amount !== 'number' || amount < 50 || amount > 100000) {
        return res.status(400).json({ error: 'Invalid amount. Must be between ₹50 and ₹1,00,000.' });
      }

      if (!['upi', 'card', 'netbanking'].includes(method)) {
        return res.status(400).json({ error: 'Invalid payment method.' });
      }

      // Simulate async gateway processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      const methodLabel =
        method === 'upi' ? `UPI • ${upiId || 'unknown@bank'}` :
        method === 'card' ? `Card •••• ${cardLast4 || '0000'}` :
        `${bankName || 'Bank'} NetBanking`;

      const txn = {
        id: `txn-${Date.now()}`,
        type: 'credit' as const,
        amount,
        description: 'Wallet Topup',
        method: methodLabel,
        timestamp: new Date().toISOString(),
        status: 'success' as const,
        gatewayRef: `RZP_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      };

      walletStore.balance += amount;
      walletStore.transactions.unshift(txn);

      return res.json({
        success: true,
        transaction: txn,
        newBalance: walletStore.balance,
        message: `₹${amount.toLocaleString('en-IN')} added to your ChargeOne Wallet via ${methodLabel}.`,
      });
    } catch (err: any) {
      console.error('Wallet topup error:', err);
      return res.status(500).json({ error: 'Payment processing failed. Please try again.', details: err?.message });
    }
  });

  // POST deduct session cost from wallet
  app.post('/api/wallet/deduct', async (req: Request, res: Response) => {
    try {
      const { amount, sessionId, stationName: station } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid deduction amount.' });
      }

      if (walletStore.balance < amount) {
        return res.status(402).json({ error: 'Insufficient wallet balance.', balance: walletStore.balance });
      }

      walletStore.balance -= amount;

      const txn = {
        id: `txn-debit-${Date.now()}`,
        type: 'debit' as const,
        amount,
        description: `Charging – ${station || 'Unknown Station'}`,
        method: 'Wallet',
        timestamp: new Date().toISOString(),
        status: 'success' as const,
        sessionRef: sessionId,
      };

      walletStore.transactions.unshift(txn);

      // Auto-topup logic
      if (walletStore.balance < 500) {
        const autoTopupAmount = 1000;
        walletStore.balance += autoTopupAmount;
        const autoTxn = {
          id: `txn-auto-${Date.now()}`,
          type: 'credit' as const,
          amount: autoTopupAmount,
          description: 'Auto-Topup triggered (balance < ₹500)',
          method: 'UPI AutoPay • HDFC Bank',
          timestamp: new Date().toISOString(),
          status: 'success' as const,
        };
        walletStore.transactions.unshift(autoTxn);
      }

      return res.json({
        success: true,
        deducted: amount,
        newBalance: walletStore.balance,
        transaction: txn,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Deduction failed.', details: err?.message });
    }
  });

  // ─── End Wallet API ────────────────────────────────────────────────────────

  // Serve Frontend Static Files in Production if build exists
  const distPath = path.resolve(__dirname, '../frontend/dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.get('/', (_req: Request, res: Response) => {
      res.json({
        name: 'ChargeOne Energy Network OS API Server',
        status: 'online',
        endpoints: ['/api/health', '/api/chat', '/api/stations/ground'],
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChargeOne Energy Network OS Server running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
