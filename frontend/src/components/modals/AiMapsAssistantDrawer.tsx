import React, { useState, useEffect, useRef } from 'react';
import { ChatbotRole, ChatMessage, GroundingMapPlace } from '../../types';

interface AiMapsAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  initialRole?: ChatbotRole;
}

export const AiMapsAssistantDrawer: React.FC<AiMapsAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialRole = 'maps',
}) => {
  const [role, setRole] = useState<ChatbotRole>(initialRole);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>({
    latitude: 12.9716,
    longitude: 77.5946,
    label: 'Bengaluru EV Metro Hub (12.9716° N, 77.5946° E)',
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'model',
      content:
        '👋 Welcome to the **ChargeOne AI & Maps Grounding Intelligence Center**.\n\n' +
        'I am powered by **Gemini 3.5 Flash** with the **Google Maps tool** to fetch up-to-date and accurate real-world EV charging locations, highway amenities, and navigation details.\n\n' +
        'You can also switch to **Rapid Telemetry Triage** (`gemini-3.1-flash-lite`) for fast fault lookups, or **Complex Grid Audit** (`gemini-3.1-pro-preview`) for deep tariff modeling.',
      modelUsed: 'gemini-3.5-flash (with googleMaps tool)',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update role if changed via props
  useEffect(() => {
    if (initialRole) setRole(initialRole);
  }, [initialRole]);

  // If initialQuery is passed and drawer opens, prefill or send
  useEffect(() => {
    if (isOpen && initialQuery) {
      setInputMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        label: 'Default Hub: Bengaluru Central (12.9716° N, 77.5946° E)',
      });
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: `GPS Detected (${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E)`,
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation unavailable:', err?.message || 'Access denied');
        setIsDetectingLocation(false);
        // Graceful fallback without blocking window alerts
        setUserLocation({
          latitude: 12.9716,
          longitude: 77.5946,
          label: 'Default Hub: Bengaluru Central (12.9716° N, 77.5946° E)',
        });
      },
      { timeout: 8000 }
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          role,
          userLocation: userLocation
            ? { latitude: userLocation.latitude, longitude: userLocation.longitude }
            : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || 'No response returned.',
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: data.groundingChunks || [],
        mapsPlaces: data.mapsPlaces || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Request Error:** ${err.message || 'Failed to connect to the Gemini server.'}\n\nPlease check your server configuration and \`GEMINI_API_KEY\` in Settings > Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = {
    maps: {
      name: 'Google Maps Grounding & EV Hubs',
      model: 'gemini-3.5-flash',
      icon: 'pin_drop',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
      description: 'Live EV charging locations, highway corridors, verified amenities & directions via Google Maps',
      suggested: [
        'Find 24/7 EV fast-chargers near Indiranagar, Bengaluru with coffee shops',
        'Locate high-power 360kW DC stations along Mumbai-Pune expressway',
        'Show CCS2 chargers near Delhi Airport Terminal 3 with restrooms',
        'Find EV hubs with dining amenities in Whitefield Bangalore',
      ],
    },
    fast: {
      name: 'Rapid Telemetry Triage',
      model: 'gemini-3.1-flash-lite',
      icon: 'bolt',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300',
      description: 'Sub-second diagnostics, OCPP 2.0.1 fault codes & on-call technician triage',
      suggested: [
        'Explain OCPP error GroundFailure on ABB Terra 360 and immediate reset',
        'Bay 02 temperature warning at 68°C - mitigation protocol',
        'What does HighTemperature alert on liquid-cooled CCS2 cable mean?',
      ],
    },
    complex: {
      name: 'Complex Grid & Tariff Auditor',
      model: 'gemini-3.1-pro-preview',
      icon: 'calculate',
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300',
      description: 'High-precision tariff modeling, TOU arbitrage & multi-CPO roaming reconciliation',
      suggested: [
        'Analyze peak vs off-peak tariff arbitrage for a 1.2MW DC fleet depot',
        'Draft an OCPI 2.2.1 dispute CDR credit adjustment for ₹45,200 billing mismatch',
        'Calculate 800V vs 400V heat losses and battery throughput curves',
      ],
    },
    general: {
      name: 'Network Operations Co-Pilot',
      model: 'gemini-3.5-flash',
      icon: 'smart_toy',
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300',
      description: 'General CPO command, roaming partner health, and charging session overviews',
      suggested: [
        'Summarize today’s total energy delivered across all CPO hubs',
        'How does OCPI 2.2.1 handle token authorization timeouts?',
      ],
    },
  };

  const activeConfig = roleConfigs[role];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-surface-container-lowest h-full shadow-2xl flex flex-col border-l border-outline-variant/30 animate-slideInRight">
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline-variant/20 bg-surface-container-low/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs">
                <span className="material-symbols-outlined text-[20px]">explore</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-on-surface leading-tight">
                    Maps Grounding &amp; AI Copilot
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed border border-primary/20">
                    Live Data
                  </span>
                </div>
                <p className="text-[11px] text-secondary">
                  Active Model: <strong className="text-primary font-mono">{activeConfig.model}</strong>
                  {role === 'maps' && ' • Google Maps Tool Grounded'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 text-secondary hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
                title="Clear conversation"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-secondary hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setRole('maps')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all ${
                role === 'maps'
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-primary/20'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-primary">pin_drop</span>
              <span>Maps Grounding</span>
            </button>

            <button
              onClick={() => setRole('fast')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all ${
                role === 'fast'
                  ? 'bg-surface-container-lowest text-amber-700 shadow-xs border border-amber-300'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600">bolt</span>
              <span>Rapid Triage</span>
            </button>

            <button
              onClick={() => setRole('complex')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all ${
                role === 'complex'
                  ? 'bg-surface-container-lowest text-purple-700 shadow-xs border border-purple-300'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-purple-600">calculate</span>
              <span>Complex Audit</span>
            </button>
          </div>

          {/* Location & Grounding Context Bar */}
          {role === 'maps' && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-[11px]">
              <div className="flex items-center gap-1.5 text-secondary truncate mr-2">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">my_location</span>
                <span className="truncate">{userLocation?.label || 'No location set'}</span>
              </div>
              <button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDetectingLocation ? 'sync' : 'near_me'}
                </span>
                <span>{isDetectingLocation ? 'Detecting...' : 'Detect GPS'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-secondary">
                <span className="font-semibold text-on-surface">
                  {msg.role === 'user' ? 'You' : 'ChargeOne Intelligence'}
                </span>
                {msg.modelUsed && (
                  <span className="px-1.5 py-0.2 rounded bg-surface-container text-[10px] font-mono text-secondary">
                    {msg.modelUsed}
                  </span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-[13px] leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-xs'
                    : msg.error
                    ? 'bg-error-container text-on-error-container border border-error/30 rounded-bl-xs'
                    : 'bg-surface-container-low text-on-surface border border-outline-variant/30 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {renderMarkdown(msg.content)}
                </div>

                {/* Grounding Places & URLs Section (Extracted from Google Maps groundingChunks) */}
                {msg.mapsPlaces && msg.mapsPlaces.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 flex flex-col gap-2.5">
                    <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span>Verified Google Maps Places ({msg.mapsPlaces.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.mapsPlaces.map((place, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary/40 shadow-xs flex flex-col justify-between gap-2 transition-all group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-[13px] text-on-surface line-clamp-2">
                                {place.title}
                              </h4>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" title="Verified Place"></span>
                            </div>

                            {/* Review snippets from placeAnswerSources */}
                            {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                              <p className="text-[11px] text-secondary italic mt-1 line-clamp-2">
                                &ldquo;{place.reviewSnippets[0]}&rdquo;
                              </p>
                            )}
                          </div>

                          {place.uri && (
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-between px-2.5 py-1.5 bg-surface-container hover:bg-primary hover:text-on-primary rounded-lg text-[11px] font-bold text-primary transition-colors mt-1"
                            >
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">map</span>
                                <span>Open in Google Maps</span>
                              </span>
                              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-3.5 border border-outline-variant/30 text-[12px] flex items-center gap-2 text-secondary">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>
                  {role === 'maps'
                    ? 'Consulting Google Maps data and retrieving verified charging nodes...'
                    : role === 'fast'
                    ? 'Executing lightning fast triage via gemini-3.1-flash-lite...'
                    : 'Computing complex grid analysis via gemini-3.1-pro-preview...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-5 py-2 border-t border-outline-variant/10 bg-surface-container-low/50">
          <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">lightbulb</span>
            <span>Suggested Prompts for {activeConfig.name}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {activeConfig.suggested.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] bg-surface-container-lowest text-on-surface-variant hover:bg-primary hover:text-on-primary border border-outline-variant/30 whitespace-nowrap transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  role === 'maps'
                    ? 'Ask about live EV charging hubs, addresses, amenities, or route corridors...'
                    : role === 'fast'
                    ? 'Enter charger error code, telemetry anomaly, or rapid triage request...'
                    : 'Describe complex tariff structure, TOU rates, or settlement dispute...'
                }
                className="w-full p-3 bg-surface-container rounded-xl text-[13px] text-on-surface placeholder:text-secondary border border-outline-variant/30 focus:outline-none focus:border-primary resize-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-secondary px-1">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span>Google Maps Grounding • Enterprise CPO OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Markdown parser for bolding, bullet points, headers, code blocks
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    // Header 3
    if (line.startsWith('### ')) {
      return (
        <h4 key={index} className="text-[14px] font-bold text-on-surface mt-2 mb-1">
          {formatInline(line.substring(4))}
        </h4>
      );
    }
    // Header 2
    if (line.startsWith('## ')) {
      return (
        <h3 key={index} className="text-[15px] font-bold text-primary mt-2 mb-1">
          {formatInline(line.substring(3))}
        </h3>
      );
    }
    // Header 1
    if (line.startsWith('# ')) {
      return (
        <h2 key={index} className="text-[16px] font-bold text-on-surface mt-2.5 mb-1.5">
          {formatInline(line.substring(2))}
        </h2>
      );
    }
    // Bullet point
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={index} className="flex items-start gap-1.5 ml-2 my-0.5">
          <span className="text-primary font-bold mt-1 text-[10px]">●</span>
          <span>{formatInline(line.trim().substring(2))}</span>
        </div>
      );
    }
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      return (
        <div key={index} className="flex items-start gap-1.5 ml-2 my-0.5">
          <span className="text-primary font-bold font-mono text-[11px] shrink-0">
            {numMatch[1]}.
          </span>
          <span>{formatInline(numMatch[2])}</span>
        </div>
      );
    }
    // Empty line
    if (!line.trim()) {
      return <div key={index} className="h-1.5" />;
    }
    // Normal paragraph
    return <p key={index}>{formatInline(line)}</p>;
  });
}

function formatInline(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-on-surface">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 bg-surface-container-high rounded text-[11px] font-mono text-primary font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
