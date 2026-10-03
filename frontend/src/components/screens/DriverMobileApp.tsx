import React, { useState, useEffect, useRef } from 'react';
import { ChargeOneLogo } from '../ChargeOneLogo';

interface DriverMobileAppProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onExitMobileView?: () => void;
}

export const DriverMobileApp: React.FC<DriverMobileAppProps> = ({
  onShowToast,
  onExitMobileView,
}) => {
  const [soc, setSoc] = useState(72);
  const [chargeLimit, setChargeLimit] = useState(80);
  const [isCharging, setIsCharging] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(1884); // 31m 24s
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'live' | 'activity' | 'wallet' | 'profile'>('explore');

  // ── Wallet & Payment Gateway State ──────────────────────────────────
  const [walletBalance, setWalletBalance] = useState(2450.00);
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<500 | 1000 | 2000 | 'custom'>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('arvind@hdfcbank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(true);
  const [walletTransactions, setWalletTransactions] = useState<Array<{
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    method: string;
    timestamp: string;
  }>>([{
    id: 'txn-001',
    type: 'credit',
    amount: 1000,
    description: 'Added via UPI AutoPay',
    method: 'UPI • HDFC Bank',
    timestamp: 'Yesterday, 18:00',
  }, {
    id: 'txn-002',
    type: 'debit',
    amount: 765.00,
    description: 'Charging – Tata Power MegaHub',
    method: 'Wallet',
    timestamp: 'Yesterday, 18:42',
  }, {
    id: 'txn-003',
    type: 'credit',
    amount: 2000,
    description: 'Added via Net Banking',
    method: 'HDFC Bank NetBanking',
    timestamp: 'Sep 24, 10:00',
  }, {
    id: 'txn-004',
    type: 'debit',
    amount: 548.73,
    description: 'Charging – Shell Recharge Whitefield',
    method: 'Wallet',
    timestamp: 'Sep 24, 11:20',
  }]);

  const getFinalPaymentAmount = (): number => {
    if (paymentAmount === 'custom') {
      const val = parseFloat(customAmount);
      return isNaN(val) || val < 50 ? 0 : val;
    }
    return paymentAmount;
  };

  const handleOpenPaymentGateway = (preset: 500 | 1000 | 2000 | 'custom') => {
    setPaymentAmount(preset);
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
    setIsPaymentGatewayOpen(true);
  };

  const handleProcessPayment = async () => {
    const amount = getFinalPaymentAmount();
    if (amount <= 0) {
      onShowToast('Please enter a valid amount (minimum ₹50)', 'error');
      return;
    }
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        onShowToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      if (!cardExpiry || !cardCvv || !cardName) {
        onShowToast('Please fill all card details', 'error');
        return;
      }
    }
    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      onShowToast('Please enter a valid UPI ID (e.g. name@bank)', 'error');
      return;
    }

    setIsProcessingPayment(true);
    // Simulate payment gateway processing
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const methodLabel =
      paymentMethod === 'upi' ? `UPI • ${upiId}` :
      paymentMethod === 'card' ? `Card •••• ${cardNumber.slice(-4)}` :
      `${selectedBank} NetBanking`;

    const newTxn = {
      id: `txn-${Date.now()}`,
      type: 'credit' as const,
      amount,
      description: 'Wallet Topup',
      method: methodLabel,
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
    };

    setWalletBalance((prev) => prev + amount);
    setWalletTransactions((prev) => [newTxn, ...prev]);
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    onShowToast(`₹${amount.toLocaleString('en-IN')} added to your ChargeOne Wallet!`, 'success');

    // Auto close after 1.8s
    setTimeout(() => {
      setIsPaymentGatewayOpen(false);
      setPaymentSuccess(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }, 1800);
  };
  // ── End Wallet State ─────────────────────────────────────────────────
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [manualChargerId, setManualChargerId] = useState('');
  const [stationName, setStationName] = useState('Tata Power MegaHub - Indiranagar');
  const [bayName, setBayName] = useState('Bay 02');
  const [chargerSpec, setChargerSpec] = useState('CCS2 (Gun A) • Max 180 kW');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [hasTorchCapability, setHasTorchCapability] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isScanningSimulation, setIsScanningSimulation] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanCancelling, setIsScanCancelling] = useState(false);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanAnimRef = useRef<number | null>(null);
  const [showQrHelpModal, setShowQrHelpModal] = useState(false);
  const [hasSeenQrGuide, setHasSeenQrGuide] = useState(false);
  const [qrHelpTab, setQrHelpTab] = useState<'visual' | 'troubleshoot'>('visual');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<'all' | 'ultrafast' | 'ccs2' | 'available'>('all');
  const [selectedStationForModal, setSelectedStationForModal] = useState<string | null>(null);

  // Google Maps Grounding state (powered by gemini-3.5-flash with googleMaps tool)
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);
  const [groundedPlaces, setGroundedPlaces] = useState<Array<{ title: string; uri: string; reviewSnippets?: string[] }>>([]);
  const [hasSearchedGrounding, setHasSearchedGrounding] = useState(false);

  const handleFetchGroundedStations = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsGroundingLoading(true);
    setHasSearchedGrounding(true);
    onShowToast(`Grounding '${queryText}' with live Google Maps data...`, 'info');
    try {
      const res = await fetch('/api/stations/ground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          latLng: { latitude: 12.9716, longitude: 77.5946 },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.mapsPlaces && data.mapsPlaces.length > 0) {
        setGroundedPlaces(data.mapsPlaces);
        onShowToast(`Found ${data.mapsPlaces.length} live verified Google Maps EV stations!`, 'success');
      } else {
        onShowToast('Grounding complete.', 'info');
      }
    } catch (err: any) {
      console.error('Grounding search failed:', err);
      onShowToast(`Maps grounding query: ${err.message}`, 'error');
    } finally {
      setIsGroundingLoading(false);
    }
  };

  // Nearby stations for explore tab
  const nearbyStations = [
    {
      id: 'st-1',
      name: 'Tata Power MegaHub - Indiranagar',
      bay: 'Bay 02',
      distance: '0.4 km',
      available: '4 / 6 Guns Free',
      speed: '360 kW DC Ultra-Fast',
      connector: 'Dual CCS2',
      tariff: '₹18.00 / kWh',
      chargerId: 'CH-BLR-089-B',
    },
    {
      id: 'st-2',
      name: 'BKC Mumbai Hypercharge Express',
      bay: 'Bay 01',
      distance: '1.2 km',
      available: '6 / 8 Guns Free',
      speed: '360 kW DC Ultra-Fast',
      connector: 'Dual CCS2',
      tariff: '₹18.00 / kWh',
      chargerId: 'CH-MUM-104-A',
    },
    {
      id: 'st-3',
      name: 'Aerocity Airport MegaHub 01',
      bay: 'Bay 04',
      distance: '2.5 km',
      available: '10 / 12 Guns Free',
      speed: '240 kW DC Fast',
      connector: 'CCS2 + Type 2',
      tariff: '₹18.00 / kWh',
      chargerId: 'CH-DEL-012-C',
    },
    {
      id: 'st-4',
      name: 'Shell Recharge Whitefield Express',
      bay: 'Bay 03',
      distance: '3.8 km',
      available: '3 / 4 Guns Free',
      speed: '180 kW DC',
      connector: 'CCS2',
      tariff: '₹19.50 / kWh',
      chargerId: 'CH-HYD-041-A',
    },
  ];

  const handleCancelScan = (notify = true) => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (scanAnimRef.current) {
      cancelAnimationFrame(scanAnimRef.current);
      scanAnimRef.current = null;
    }
    setIsScanCancelling(true);
    setScanProgress(0);
    setTimeout(() => {
      setIsScanningSimulation(false);
      setIsScanCancelling(false);
      if (notify) {
        onShowToast('Scan cancelled. Reticle reset.', 'info');
      }
    }, 180);
  };

  const handleInitiateChargingFromQr = (station: {
    name: string;
    bay: string;
    speed: string;
    connector: string;
    chargerId: string;
  }) => {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);

    setIsScanningSimulation(true);
    setIsScanCancelling(false);
    setScanProgress(0);
    onShowToast(`Scanning QR code for ${station.name} (${station.chargerId})...`, 'info');

    // Trigger smooth CSS transition fill animation from 0 to 100%
    scanAnimRef.current = requestAnimationFrame(() => {
      setTimeout(() => {
        setScanProgress(100);
      }, 40);
    });

    scanTimeoutRef.current = setTimeout(() => {
      setIsScanningSimulation(false);
      setScanProgress(0);
      setIsQrScannerOpen(false);
      setStationName(station.name);
      setBayName(station.bay);
      setChargerSpec(`${station.connector} • ${station.speed}`);
      setSoc(Math.floor(Math.random() * 20 + 45));
      setIsCharging(true);
      setElapsedSeconds(0);
      setActiveTab('live');
      onShowToast(`Connected to ${station.name}! Solenoid locked. OCPP 2.0.1 energy flow active.`, 'success');
    }, 1400);
  };

  // ── Camera Scanner Lifecycle & Permissions ──────────────────────────
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    // Release any previous track
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setCameraErrorMessage('Camera access is not supported by your browser or environment.');
      return;
    }

    try {
      setCameraState('requesting');
      setCameraErrorMessage(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Check for hardware torch / flashlight capability
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === 'function') {
        const caps: any = track.getCapabilities();
        setHasTorchCapability(Boolean(caps && caps.torch));
      } else {
        setHasTorchCapability(false);
      }

      setCameraState('active');
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setCameraState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraErrorMessage('Camera permission was blocked. Please allow camera access in browser site settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraErrorMessage('No camera device detected on this system.');
      } else {
        setCameraErrorMessage(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState('idle');
    setFlashlightOn(false);
  };

  const handleToggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const handleToggleTorch = async () => {
    const newTorchState = !flashlightOn;
    setFlashlightOn(newTorchState);
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          const caps: any = typeof track.getCapabilities === 'function' ? track.getCapabilities() : {};
          if (caps && caps.torch) {
            await (track as any).applyConstraints({
              advanced: [{ torch: newTorchState }],
            });
            onShowToast(newTorchState ? 'Camera flashlight turned on' : 'Camera flashlight turned off', 'info');
            return;
          }
        } catch {
          // torch constraint not supported
        }
      }
    }
    onShowToast(newTorchState ? 'Flashlight simulated on' : 'Flashlight turned off', 'info');
  };

  // Start / stop camera on modal open
  useEffect(() => {
    if (isQrScannerOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isQrScannerOpen]);

  // Real-time Barcode / QR detection loop via native BarcodeDetector if supported
  useEffect(() => {
    if (!isQrScannerOpen || cameraState !== 'active') return;

    let animId: number;
    let detector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        detector = null;
      }
    }

    const checkFrame = async () => {
      if (videoRef.current && detector && !isScanningSimulation && videoRef.current.readyState >= 2) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const raw = barcodes[0].rawValue || '';
            const match = nearbyStations.find(
              (s) => s.chargerId.toLowerCase() === raw.toLowerCase() || raw.toLowerCase().includes(s.chargerId.toLowerCase())
            ) || nearbyStations[0];
            handleInitiateChargingFromQr(match);
            return;
          }
        } catch {
          // ignore detection frame errors
        }
      }
      animId = requestAnimationFrame(checkFrame);
    };

    animId = requestAnimationFrame(checkFrame);
    return () => cancelAnimationFrame(animId);
  }, [isQrScannerOpen, cameraState, isScanningSimulation]);

  // Clean up scanning timers on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
      stopCamera();
    };
  }, []);

  // Interactive slide-to-stop tracking
  const [sliderPos, setSliderPos] = useState(0);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  // Timer simulation
  useEffect(() => {
    if (!isCharging) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCharging]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Slider handlers
  const handleTouchStart = (clientX: number) => {
    if (!isCharging) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDraggingRef.current || !sliderContainerRef.current) return;
    const maxDist = sliderContainerRef.current.clientWidth - 56;
    const delta = clientX - startXRef.current;
    const newPos = Math.max(0, Math.min(delta, maxDist));
    setSliderPos(newPos);

    if (newPos >= maxDist - 8) {
      isDraggingRef.current = false;
      setIsCharging(false);
      setSliderPos(0);
      // Deduct session cost from wallet
      const sessionCost = 266.76;
      setWalletBalance((prev) => {
        const newBalance = Math.max(0, prev - sessionCost);
        // Auto-topup if balance falls below ₹500
        if (autoTopupEnabled && newBalance < 500) {
          setTimeout(() => {
            setWalletBalance((b) => b + 1000);
            setWalletTransactions((txns) => [{
              id: `txn-auto-${Date.now()}`,
              type: 'credit',
              amount: 1000,
              description: 'Auto-Topup triggered (balance < ₹500)',
              method: 'UPI AutoPay • HDFC Bank',
              timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
            }, ...txns]);
            onShowToast('₹1,000 auto-topup via UPI AutoPay', 'success');
          }, 1500);
        }
        return newBalance;
      });
      setWalletTransactions((prev) => [{
        id: `txn-debit-${Date.now()}`,
        type: 'debit',
        amount: sessionCost,
        description: `Charging – ${stationName}`,
        method: 'Wallet',
        timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
      }, ...prev]);
      onShowToast(`Session stopped. ₹${sessionCost} deducted from wallet. Cable unlocked safely.`, 'success');
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setSliderPos(0);
  };

  // Calculate SVG stroke offset for battery dial
  // circumference = 2 * pi * 82 ≈ 515.22
  const circumference = 515.22;
  const strokeOffset = circumference - (soc / 100) * circumference;

  const filteredStations = nearbyStations.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      st.chargerId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      st.connector.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedTag === 'ultrafast') return st.speed.includes('360 kW') || st.speed.includes('240 kW');
    if (selectedTag === 'ccs2') return st.connector.includes('CCS2');
    if (selectedTag === 'available') return !st.available.startsWith('0');
    return true;
  });

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen sm:min-h-[calc(100vh-4rem)] p-0 sm:py-4">
      {onExitMobileView && (
        <div className="w-full sm:max-w-[420px] flex items-center justify-between px-3.5 py-2 sm:mb-2 bg-surface-container-lowest/95 backdrop-blur-md rounded-none sm:rounded-xl border-b sm:border border-outline-variant/30 text-xs shadow-xs z-30">
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-[16px] text-primary">phone_iphone</span>
            <span className="font-semibold text-on-surface">Driver Companion App</span>
          </div>
          <button
            onClick={onExitMobileView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-semibold transition-all cursor-pointer text-[11px]"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Exit to Console</span>
          </button>
        </div>
      )}
      {/* Mobile Frame Container */}
      <div className="w-full sm:max-w-[420px] bg-surface rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border-4 border-surface-container-high overflow-hidden flex flex-col relative select-none animate-fadeIn h-[calc(100vh-44px)] sm:h-[820px] sm:max-h-[860px]">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl shadow-xs px-4 pt-3 pb-3 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ChargeOneLogo size={28} className="h-7 w-7 shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">
                  ChargeOne
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              </div>
              <button
                className="flex items-center gap-0.5 text-left min-w-0 group"
                onClick={() => {
                  if (activeTab !== 'explore') {
                    onShowToast(`Active session at ${stationName} (${bayName})`, 'info');
                  }
                }}
              >
                <span className="text-[14px] text-on-surface font-bold truncate">
                  {activeTab === 'explore'
                    ? 'Find & Charge'
                    : activeTab === 'live'
                    ? 'Live Session'
                    : activeTab === 'activity'
                    ? 'Recent Sessions'
                    : activeTab === 'wallet'
                    ? 'Energy Wallet'
                    : 'Driver Account'}
                </span>
                {activeTab !== 'explore' && (
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    expand_more
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeTab === 'explore' && (
              <button
                onClick={() => setIsQrScannerOpen(true)}
                title="Scan Station QR Code"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              </button>
            )}
            <button
              onClick={() => onShowToast('You have 1 active charging alert.', 'info')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors relative"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-surface"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[12px]">
              AS
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 flex flex-col p-3.5 gap-3.5 overflow-y-auto no-scrollbar pb-24 relative">
          {/* TAB 1: EXPLORE (Find stations & QR Code Scanning) */}
          {activeTab === 'explore' && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search station, hub, or charger ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-surface-container-lowest rounded-xl pl-9 pr-9 py-2.5 text-[13px] text-on-surface placeholder:text-secondary/70 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-xs"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute right-3 text-secondary hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All Hubs' },
                  { id: 'ultrafast', label: '⚡ 360 kW Fast' },
                  { id: 'ccs2', label: '🔌 CCS2' },
                  { id: 'available', label: '🟢 Available Now' },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTag === tag.id
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest text-secondary border border-outline-variant/30 hover:bg-surface-container-low'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>

              {/* Quick Connect Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004f35] to-[#003825] text-white p-4 shadow-md border border-emerald-500/20">
                <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Quick Connect</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 text-[10px] font-mono">
                      OCPP 2.0.1
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[16px] font-bold text-white tracking-tight">At the Charger?</h3>
                    <p className="text-[12px] text-emerald-100/80 mt-0.5 leading-snug">
                      Scan the QR code on your bay sticker to start charging in seconds.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => setIsQrScannerOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-[#004f35] hover:bg-emerald-50 active:scale-[0.98] font-bold text-[12px] rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>Scan QR to Charge</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsQrScannerOpen(true);
                        setShowQrHelpModal(true);
                      }}
                      title="View alignment & troubleshooting guide"
                      className="px-3 py-2.5 bg-white/15 hover:bg-white/20 active:scale-95 text-emerald-200 rounded-xl text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">help</span>
                      <span>Guide</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Google Maps Grounding Card for EV Drivers */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                      <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-[13px] font-bold text-on-surface">
                        Live Google Maps EV Grounding
                      </h4>
                      <span className="text-[10px] text-secondary font-mono">
                        Powered by gemini-3.5-flash
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 text-[10px] font-bold">
                    GPS Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFetchGroundedStations('EV fast charging stations with cafes near Indiranagar Bangalore')}
                    disabled={isGroundingLoading}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px]">near_me</span>
                    <span>{isGroundingLoading ? 'Grounding...' : 'Find Chargers Near Me'}</span>
                  </button>

                  <button
                    onClick={() => handleFetchGroundedStations('360kW DC hyperchargers on Mumbai Pune expressway with washrooms')}
                    disabled={isGroundingLoading}
                    className="flex-1 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px]">route</span>
                    <span>Expressway Hubs</span>
                  </button>
                </div>

                {/* Grounded Places Result Display */}
                {groundedPlaces.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-700">
                        Verified Live Maps Results ({groundedPlaces.length})
                      </span>
                      <button
                        onClick={() => setGroundedPlaces([])}
                        className="text-secondary hover:text-on-surface text-[10px]"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                      {groundedPlaces.map((place, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5 text-left"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-[12px] font-bold text-on-surface line-clamp-1">
                              {place.title}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1"></span>
                          </div>

                          {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                            <p className="text-[10px] text-secondary italic line-clamp-2">
                              &ldquo;{place.reviewSnippets[0]}&rdquo;
                            </p>
                          )}

                          {place.uri && (
                            <a
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="self-start inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors mt-0.5 shadow-2xs"
                            >
                              <span className="material-symbols-outlined text-[12px]">directions</span>
                              <span>Open in Google Maps</span>
                              <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Nearby Stations List */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[13px] font-bold text-on-surface">
                  Nearby Charging Hubs ({filteredStations.length})
                </span>
                <span className="text-[11px] text-secondary font-medium">Auto-Roaming Enabled</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredStations.map((station) => (
                  <div
                    key={station.id}
                    className="bg-surface-container-lowest rounded-xl p-3.5 shadow-xs border border-outline-variant/20 flex flex-col gap-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-bold text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                            {station.distance}
                          </span>
                          <span className="text-[11px] font-bold text-on-surface-variant font-mono">
                            {station.bay}
                          </span>
                        </div>
                        <h4 className="text-[14px] font-bold text-on-surface truncate">
                          {station.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-secondary">
                          <span className="material-symbols-outlined text-[14px] text-primary">
                            bolt
                          </span>
                          <span>{station.speed}</span>
                          <span>•</span>
                          <span>{station.connector}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]"></span>
                          {station.available}
                        </span>
                        <span className="text-[11px] text-secondary font-mono font-medium">
                          {station.tariff}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-secondary font-mono">
                        ID: {station.chargerId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onShowToast(`Opening route to ${station.name}...`, 'info')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-secondary hover:text-on-surface text-[11px] font-semibold hover:bg-surface-container transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">directions</span>
                          <span>Route</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStationForModal(station.chargerId);
                            handleInitiateChargingFromQr(station);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-bold shadow-xs hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">bolt</span>
                          <span>Start Charge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SESSION */}
          {activeTab === 'live' && (
            <div className="flex flex-col gap-3.5 animate-fadeIn">
              {/* Live Session Banner & Station Details */}
              <div className="flex flex-col w-full bg-surface-container rounded-xl p-3.5 shadow-xs border border-outline-variant/20">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                      {isCharging ? 'Live Session' : 'Completed'}
                    </span>
                    <span className="text-secondary text-[12px] font-bold">{bayName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Roaming Active</span>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-bold text-on-surface truncate">
                      {stationName}
                    </h2>
                    <div className="flex items-center gap-1 mt-0.5 text-secondary text-[12px]">
                      <span className="material-symbols-outlined text-[16px] text-primary">electric_bolt</span>
                      <span>{chargerSpec}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-primary">
                    <span className="material-symbols-outlined text-[20px]">ev_charger</span>
                  </div>
                </div>
              </div>

              {/* Radial Battery Dial & State of Charge */}
              <div className="flex flex-col items-center justify-center w-full bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>

                <div className="relative w-52 h-52 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background track */}
                    <circle
                      className="stroke-surface-container-high"
                      cx="100"
                      cy="100"
                      fill="transparent"
                      r="82"
                      strokeWidth="14"
                    />
                    {/* Target limit ghost ring (80%) */}
                    <circle
                      className="stroke-primary-fixed-dim/40"
                      cx="100"
                      cy="100"
                      fill="transparent"
                      r="82"
                      strokeDasharray="515.22"
                      strokeDashoffset={circumference - (chargeLimit / 100) * circumference}
                      strokeLinecap="round"
                      strokeWidth="14"
                    />
                    {/* Active charge ring */}
                    <circle
                      className="stroke-primary transition-all duration-1000 ease-out"
                      cx="100"
                      cy="100"
                      fill="transparent"
                      r="82"
                      strokeDasharray="515.22"
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      strokeWidth="14"
                    />
                  </svg>

                  {/* Center Telemetry Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <span className={`material-symbols-outlined text-[18px] ${isCharging ? 'animate-bounce' : ''}`}>
                        bolt
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        {isCharging ? 'Charging' : 'Finished'}
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-[36px] text-on-surface font-extrabold tracking-tight font-mono">
                        {soc}
                      </span>
                      <span className="text-[18px] text-secondary ml-0.5 font-bold">%</span>
                    </div>
                    <span className="text-[11px] text-secondary">SoC (Current)</span>
                  </div>
                </div>

                {/* Time Estimates */}
                <div className="flex items-center justify-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full mt-1 border border-outline-variant/20">
                  <div className="flex items-center gap-1 text-on-surface text-[12px]">
                    <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                    <span>
                      <strong className="text-primary font-bold">18 min</strong> to 80%
                    </span>
                  </div>
                  <span className="text-outline-variant text-[11px]">•</span>
                  <span className="text-secondary text-[11px]">34m to 100%</span>
                </div>

                {/* Charge Limit Target Slider */}
                <div className="w-full mt-4 pt-2 border-t border-outline-variant/15 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-secondary font-medium">Charge Limit Target</span>
                    <span className="text-primary font-bold font-mono">
                      {chargeLimit}% {chargeLimit === 80 ? '(Recommended)' : ''}
                    </span>
                  </div>
                  <div className="relative flex items-center py-1">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={chargeLimit}
                      onChange={(e) => setChargeLimit(Number(e.target.value))}
                      className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-secondary font-medium">
                    <span>50%</span>
                    <span>80% (Battery Care)</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Primary Live Metrics Grid (2x2) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="text-[11px] font-medium">Live Speed</span>
                    <span className="material-symbols-outlined text-[17px] text-primary">speed</span>
                  </div>
                  <div className="my-1">
                    <span className="text-[22px] font-bold text-on-surface font-mono">
                      {isCharging ? '118.4' : '0.0'}
                    </span>
                    <span className="text-[11px] text-secondary ml-0.5">kW</span>
                  </div>
                  <div className="text-[11px] text-primary font-bold">Peak 142.0 kW</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="text-[11px] font-medium">Delivered</span>
                    <span className="material-symbols-outlined text-[17px] text-primary">
                      battery_charging_full
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="text-[22px] font-bold text-on-surface font-mono">14.82</span>
                    <span className="text-[11px] text-secondary ml-0.5">kWh</span>
                  </div>
                  <div className="text-[11px] text-secondary">+104 km added</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="text-[11px] font-medium">Accrued Cost</span>
                    <span className="material-symbols-outlined text-[17px] text-primary">currency_rupee</span>
                  </div>
                  <div className="my-1">
                    <span className="text-[22px] font-bold text-on-surface font-mono">₹266.76</span>
                  </div>
                  <div className="text-[11px] text-secondary">₹18.00/kWh base</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary">
                    <span className="text-[11px] font-medium">Elapsed Time</span>
                    <span className="material-symbols-outlined text-[17px] text-primary">timelapse</span>
                  </div>
                  <div className="my-1">
                    <span className="text-[22px] font-bold text-on-surface font-mono">
                      {formatElapsed(elapsedSeconds)}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary">Started 14:14</div>
                </div>
              </div>

              {/* Real-time Power & Charging Profile Curve Chart */}
              <div className="flex flex-col bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-on-surface">Charging Profile Curve</span>
                    <span className="text-[11px] text-secondary">Power step-down over current session</span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-bold text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span>118 kW Now</span>
                  </div>
                </div>
                <div className="w-full h-28 relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 120">
                    <defs>
                      <linearGradient id="mobilePowerGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#006948" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#006948" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line className="stroke-surface-container-high" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="20" y2="20" />
                    <line className="stroke-surface-container-high" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="60" y2="60" />
                    <line className="stroke-surface-container-high" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="100" y2="100" />
                    <path d="M 0,25 C 70,22 130,28 180,48 C 230,68 280,72 320,74 L 320,120 L 0,120 Z" fill="url(#mobilePowerGrad)" />
                    <path d="M 0,25 C 70,22 130,28 180,48 C 230,68 280,72 320,74" fill="none" stroke="#006948" strokeLinecap="round" strokeWidth="3" />
                    <circle cx="320" cy="74" fill="#006948" r="4" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="320" cy="74" fill="none" r="7" stroke="#006948" strokeWidth="1.5" className="animate-ping" />
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[10px] text-secondary mt-1 font-mono">
                  <span>145 kW (Peak @ 20%)</span>
                  <span>Tapering BMS Threshold</span>
                  <span>118 kW (@ 72%)</span>
                </div>
              </div>

              {/* Interactive Telemetry Toggle Drawer */}
              <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden">
                <button
                  onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">analytics</span>
                    <span className="text-[13px] font-bold text-on-surface">High-Voltage Telemetry</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-primary font-bold font-mono">782V • 151A</span>
                    <span
                      className={`material-symbols-outlined text-[18px] text-secondary transition-transform ${
                        isTelemetryOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {isTelemetryOpen && (
                  <div className="px-3.5 pb-3.5 pt-0 animate-fadeIn">
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/15 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-secondary">Pack Voltage</span>
                        <span className="text-[13px] font-bold text-on-surface font-mono mt-0.5">782V DC</span>
                        <span className="text-[9px] text-primary font-bold">800V Arch</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-secondary">Current Flow</span>
                        <span className="text-[13px] font-bold text-on-surface font-mono mt-0.5">151.4A</span>
                        <span className="text-[9px] text-secondary font-medium">Nominal</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-secondary">Battery Temp</span>
                        <span className="text-[13px] font-bold text-on-surface font-mono mt-0.5">31.2°C</span>
                        <span className="text-[9px] text-primary font-bold">Optimal Window</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Charging Lifecycle Milestone Step Tracker */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-outline-variant/20">
                <span className="text-[14px] font-bold text-on-surface block mb-3">Session Milestones</span>
                <div className="flex flex-col gap-3 relative">
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-surface-container-high"></div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-on-surface">Vehicle Plugged &amp; Handshake</span>
                        <span className="text-[10px] text-secondary font-mono">14:12</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-tight">CCS2 DIN 70121 protocol verified</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-on-surface">Payment Pre-Authorization</span>
                        <span className="text-[10px] text-secondary font-mono">14:13</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-tight">
                        UPI AutoPay hold ₹500 confirmed via Roaming
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                      <span className="w-2 h-2 rounded-full bg-on-primary-container animate-ping"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-on-surface">OCPP Energy Dispatch Active</span>
                        <span className="text-[10px] text-primary font-bold font-mono">14:14 - Now</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-tight">OCPP 2.0.1 smart load balancing active</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2.5 relative z-10 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
                      <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-on-surface">Session Completion &amp; Settlement</span>
                        <span className="text-[10px] text-secondary">Pending</span>
                      </div>
                      <p className="text-[11px] text-secondary leading-tight">Auto invoice &amp; unlock connector</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Slide-to-Stop & Unlock Cable */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div
                  ref={sliderContainerRef}
                  className="relative w-full h-14 bg-error-container/40 rounded-xl overflow-hidden p-1 flex items-center border border-error/20"
                  onMouseMove={(e) => handleTouchMove(e.clientX)}
                  onMouseUp={handleTouchEnd}
                  onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-error pointer-events-none">
                    {isCharging ? 'Slide to Stop & Unlock Cable' : 'Session Stopped • Solenoid Open'}
                  </div>
                  <div
                    style={{ transform: `translateX(${sliderPos}px)` }}
                    onMouseDown={(e) => handleTouchStart(e.clientX)}
                    onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
                    className={`w-12 h-12 rounded-lg bg-error text-on-error flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md transition-transform ${
                      !isCharging ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">power_settings_new</span>
                  </div>
                </div>

                {!isCharging && (
                  <button
                    onClick={() => {
                      setActiveTab('explore');
                    }}
                    className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 mt-1 shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Find Next Charging Hub</span>
                  </button>
                )}

                <div className="flex items-center justify-between px-1 text-[11px] text-secondary">
                  <button
                    onClick={() => onShowToast('Calling 24/7 MegaHub Station Support: 1800-419-EV-HELP', 'info')}
                    className="flex items-center gap-1 hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[15px]">call</span>
                    <span>MegaHub Support</span>
                  </button>
                  <button
                    onClick={() => onShowToast('Issue report filed with CPO operations console.', 'info')}
                    className="flex items-center gap-1 hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[15px]">report</span>
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY (History of charging) */}
          {activeTab === 'activity' && (
            <div className="flex flex-col gap-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">Past Charging Sessions</span>
                <span className="text-[11px] text-secondary font-medium">Last 30 Days</span>
              </div>
              {[
                {
                  hub: 'Tata Power MegaHub - Indiranagar',
                  bay: 'Bay 02 • CCS2',
                  date: 'Yesterday, 18:42',
                  energy: '42.50 kWh',
                  amount: '₹765.00',
                  status: 'Settled',
                },
                {
                  hub: 'Shell Recharge Whitefield Express',
                  bay: 'Bay 01 • CCS2',
                  date: 'Sep 24, 11:20',
                  energy: '28.14 kWh',
                  amount: '₹548.73',
                  status: 'Settled',
                },
                {
                  hub: 'BKC Mumbai Hypercharge Express',
                  bay: 'Bay 01 • CCS2',
                  date: 'Sep 21, 09:15',
                  energy: '54.80 kWh',
                  amount: '₹986.40',
                  status: 'Settled',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[13px] font-bold text-on-surface">{item.hub}</h4>
                      <span className="text-[11px] text-secondary">{item.bay}</span>
                    </div>
                    <span className="text-[14px] font-bold text-on-surface font-mono">{item.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary pt-1.5 border-t border-outline-variant/10">
                    <span>{item.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary font-bold">{item.energy}</span>
                      <button
                        onClick={() => onShowToast(`Downloaded GST Tax Invoice for ${item.hub}`, 'success')}
                        className="text-primary hover:underline font-bold"
                      >
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: WALLET */}
          {activeTab === 'wallet' && (
            <div className="flex flex-col gap-3 animate-fadeIn">
              {/* Balance Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#004f35] to-[#00311f] p-4 rounded-2xl shadow-lg border border-emerald-500/20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">ChargeOne Balance</span>
                    <button
                      onClick={() => {
                        setAutoTopupEnabled(p => !p);
                        onShowToast(autoTopupEnabled ? 'Auto-Topup disabled' : 'Auto-Topup enabled (triggers when balance < ₹500)', 'info');
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                        autoTopupEnabled
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-white/10 text-white/60 border border-white/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${autoTopupEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} />
                      Auto-Topup {autoTopupEnabled ? 'Active' : 'Off'}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[32px] font-extrabold text-white font-mono tracking-tight">
                      ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {walletBalance < 500 && (
                    <div className="flex items-center gap-1 text-amber-300 text-[11px] font-bold mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      <span>Low balance – consider adding funds</span>
                    </div>
                  )}
                </div>

                {/* Topup Buttons */}
                <div className="flex gap-2 mt-3 relative z-10">
                  <button
                    onClick={() => handleOpenPaymentGateway(500)}
                    className="flex-1 py-2 bg-white text-[#004f35] rounded-xl text-[12px] font-bold hover:bg-emerald-50 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    + Add ₹500
                  </button>
                  <button
                    onClick={() => handleOpenPaymentGateway(1000)}
                    className="flex-1 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[12px] font-bold active:scale-95 transition-all border border-white/20 cursor-pointer"
                  >
                    + Add ₹1,000
                  </button>
                  <button
                    onClick={() => handleOpenPaymentGateway('custom')}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl text-[12px] font-bold active:scale-95 transition-all border border-white/15 cursor-pointer"
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Linked Payment Methods */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-bold text-on-surface">Payment Methods</span>
                  <button
                    onClick={() => onShowToast('Opening payment method manager...', 'info')}
                    className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
                  >
                    + Add New
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-blue-600">account_balance</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-bold text-on-surface block">HDFC Bank •••• 9104</span>
                        <span className="text-[10px] text-secondary">UPI AutoPay Mandate Active</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">Default</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-purple-600">credit_card</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-bold text-on-surface block">Visa •••• 4721</span>
                        <span className="text-[10px] text-secondary">Expires 08/27</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-secondary font-bold px-2 py-0.5 rounded border border-outline-variant/30">Saved</span>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-bold text-on-surface">Transaction History</span>
                  <span className="text-[10px] text-secondary">Last 30 days</span>
                </div>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto no-scrollbar">
                  {walletTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          txn.type === 'credit' ? 'bg-emerald-500/15' : 'bg-red-500/10'
                        }`}>
                          <span className={`material-symbols-outlined text-[15px] ${
                            txn.type === 'credit' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {txn.type === 'credit' ? 'add_circle' : 'remove_circle'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[12px] font-semibold text-on-surface block leading-tight">{txn.description}</span>
                          <span className="text-[10px] text-secondary">{txn.timestamp} • {txn.method}</span>
                        </div>
                      </div>
                      <span className={`text-[13px] font-bold font-mono ${
                        txn.type === 'credit' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT GATEWAY MODAL */}
          {isPaymentGatewayOpen && (
            <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end animate-fadeIn">
              <div className="bg-surface rounded-t-3xl shadow-2xl border-t border-outline-variant/30 flex flex-col max-h-[90%] animate-scaleUp overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-on-surface">Add Money to Wallet</h3>
                      <p className="text-[10px] text-secondary">Secured by 256-bit SSL encryption</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsPaymentGatewayOpen(false); setPaymentSuccess(false); }}
                    className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="overflow-y-auto no-scrollbar">
                  {paymentSuccess ? (
                    /* Success State */
                    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-emerald-600">check_circle</span>
                      </div>
                      <h3 className="text-[18px] font-bold text-on-surface">Payment Successful!</h3>
                      <p className="text-[13px] text-secondary text-center">
                        ₹{getFinalPaymentAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been added to your ChargeOne Wallet.
                      </p>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-[12px] text-emerald-700 font-bold">
                        New Balance: ₹{(walletBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex flex-col gap-4">
                      {/* Amount Selector */}
                      <div>
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-2">Select Amount</label>
                        <div className="grid grid-cols-4 gap-2">
                          {([500, 1000, 2000, 'custom'] as const).map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setPaymentAmount(amt)}
                              className={`py-2.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border ${
                                paymentAmount === amt
                                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                                  : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'
                              }`}
                            >
                              {amt === 'custom' ? 'Custom' : `₹${(amt as number).toLocaleString('en-IN')}`}
                            </button>
                          ))}
                        </div>
                        {paymentAmount === 'custom' && (
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface font-bold text-[14px]">₹</span>
                            <input
                              type="number"
                              min="50"
                              max="50000"
                              placeholder="Enter amount (min ₹50)"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[14px] font-bold text-on-surface focus:outline-none focus:border-primary font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {/* Payment Method Tabs */}
                      <div>
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-2">Payment Method</label>
                        <div className="flex gap-2">
                          {([['upi', 'phone_iphone', 'UPI'], ['card', 'credit_card', 'Card'], ['netbanking', 'account_balance', 'Net Banking']] as const).map(([id, icon, label]) => (
                            <button
                              key={id}
                              onClick={() => setPaymentMethod(id)}
                              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                                paymentMethod === id
                                  ? 'bg-primary/10 text-primary border-primary/40'
                                  : 'bg-surface-container-low text-secondary border-outline-variant/30 hover:bg-surface-container'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">{icon}</span>
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* UPI Details */}
                      {paymentMethod === 'upi' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">UPI ID</label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary">phone_iphone</span>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@bankname"
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {['arvind@hdfcbank', 'arvind@oksbi', 'arvind@paytm'].map((id) => (
                              <button
                                key={id}
                                onClick={() => setUpiId(id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
                                  upiId === id ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface-container text-secondary border-outline-variant/30 hover:bg-surface-container-high'
                                }`}
                              >
                                {id}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 mt-1">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            <span>Secured by UPI 2.0 – instant transfer, zero fees</span>
                          </div>
                        </div>
                      )}

                      {/* Card Details */}
                      {paymentMethod === 'card' && (
                        <div className="flex flex-col gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-secondary mb-1 block">Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
                                setCardNumber(formatted);
                              }}
                              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] text-on-surface focus:outline-none focus:border-primary font-mono tracking-widest"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] font-bold text-secondary mb-1 block">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                                  setCardExpiry(v);
                                }}
                                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] text-on-surface focus:outline-none focus:border-primary font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-secondary mb-1 block">CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="•••"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] text-on-surface focus:outline-none focus:border-primary font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-secondary mb-1 block">Name on Card</label>
                            <input
                              type="text"
                              placeholder="As on card"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] text-on-surface focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-700">
                            <span className="material-symbols-outlined text-[16px]">lock</span>
                            <span>3D Secure verified • PCI DSS compliant</span>
                          </div>
                        </div>
                      )}

                      {/* Net Banking */}
                      {paymentMethod === 'netbanking' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Select Bank</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'PNB'].map((bank) => (
                              <button
                                key={bank}
                                onClick={() => setSelectedBank(bank)}
                                className={`py-2.5 px-3 rounded-xl text-[12px] font-semibold text-left transition-all cursor-pointer border ${
                                  selectedBank === bank
                                    ? 'bg-primary/10 text-primary border-primary/40'
                                    : 'bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container'
                                }`}
                              >
                                {bank}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-700 mt-1">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            <span>You'll be redirected to your bank's secure portal</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                {!paymentSuccess && (
                  <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low">
                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessingPayment || (paymentAmount === 'custom' && (!customAmount || parseFloat(customAmount) < 50))}
                      className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.98] transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <>
                          <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                          <span>
                            Pay ₹{getFinalPaymentAmount() > 0
                              ? getFinalPaymentAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })
                              : '---'
                            } Securely
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-secondary mt-2">
                      🔒 Powered by RazorpayX Gateway • PCI DSS Level 1 Certified
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-3 animate-fadeIn">
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[18px]">
                  AS
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-on-surface">Arvind S.</h4>
                  <span className="text-[11px] text-secondary">Porsche Taycan 4S (KA-01-EV-4091)</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-2">
                <span className="text-[12px] font-bold text-on-surface">Registered EV Specs</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-surface-container-low rounded-lg">
                    <span className="text-secondary block">Battery Pack</span>
                    <strong className="text-on-surface font-mono">93.4 kWh (800V)</strong>
                  </div>
                  <div className="p-2 bg-surface-container-low rounded-lg">
                    <span className="text-secondary block">Max DC Charge</span>
                    <strong className="text-on-surface font-mono">270 kW Peak</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* QR Code Scanner Viewfinder Modal Overlay */}
        {isQrScannerOpen && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col animate-fadeIn select-none">
            {/* Scanner Top Bar */}
            <div className="p-3.5 flex items-center justify-between text-white border-b border-white/10 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">qr_code_scanner</span>
                <span className="text-[13px] font-bold">Scan Station QR Code</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQrHelpModal(true)}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer border border-white/10"
                  title="How to align QR code with sticker"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#85f8c4]">help</span>
                  <span>Guide</span>
                </button>

                {/* Flip Camera (Back / Front) */}
                <button
                  onClick={handleToggleFacingMode}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title={`Switch to ${facingMode === 'environment' ? 'Front' : 'Back'} Camera`}
                >
                  <span className="material-symbols-outlined text-[18px]">cameraswitch</span>
                </button>

                {/* Flashlight Torch Toggle */}
                <button
                  onClick={handleToggleTorch}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    flashlightOn ? 'bg-[#85f8c4] text-[#002114]' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  title={hasTorchCapability ? 'Toggle Camera Flashlight' : 'Toggle Flashlight'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {flashlightOn ? 'flash_on' : 'flash_off'}
                  </span>
                </button>

                {/* Close Scanner */}
                <button
                  onClick={() => {
                    stopCamera();
                    setIsQrScannerOpen(false);
                    setIsScanningSimulation(false);
                    setShowQrHelpModal(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Close Scanner"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              {/* First-time Guide Tooltip / Hint */}
              {!hasSeenQrGuide && !showQrHelpModal && (
                <div className="mb-3 px-3 py-1.5 rounded-full bg-black/85 border border-[#85f8c4]/50 backdrop-blur-md flex items-center justify-between gap-2 shadow-lg animate-fadeIn text-white text-[11px] max-w-[280px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[15px] text-[#85f8c4]">lightbulb</span>
                    <span className="truncate">First time? Center sticker in corners</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setShowQrHelpModal(true)}
                      className="text-[10px] font-bold text-[#85f8c4] underline hover:text-white"
                    >
                      Tips
                    </button>
                    <button
                      onClick={() => setHasSeenQrGuide(true)}
                      className="text-white/40 hover:text-white"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Viewfinder Frame with Camera Feed */}
              <div
                onClick={() => {
                  if (cameraState === 'active' && !isScanningSimulation) {
                    handleInitiateChargingFromQr(nearbyStations[0]);
                  }
                }}
                className="relative w-64 h-64 border-2 border-white/20 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl bg-black group cursor-pointer"
                title={cameraState === 'active' ? 'Point at QR code or tap frame to lock & connect' : undefined}
              >
                {/* Live Camera Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    cameraState === 'active' ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Camera Requesting / Loading State */}
                {cameraState === 'requesting' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 text-white z-10 animate-fadeIn p-4 text-center">
                    <span className="material-symbols-outlined text-[34px] text-[#85f8c4] animate-spin">
                      progress_activity
                    </span>
                    <span className="text-[12px] font-bold text-white">Opening Device Camera...</span>
                    <span className="text-[10px] text-white/60">Allow camera permission if prompted by browser</span>
                  </div>
                )}

                {/* Camera Denied / Unsupported State */}
                {(cameraState === 'denied' || cameraState === 'unsupported') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/90 text-white p-4 text-center z-10">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                      <span className="material-symbols-outlined text-[24px]">videocam_off</span>
                    </div>
                    <span className="text-[12px] font-bold text-white">Camera Access</span>
                    <p className="text-[10px] text-white/70 leading-tight max-w-[210px]">
                      {cameraErrorMessage || 'Allow camera permission to scan physical QR code.'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera(facingMode);
                      }}
                      className="mt-1 px-3 py-1.5 bg-[#006948] hover:bg-[#00855d] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">refresh</span>
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}

                {/* Target Corner Accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#85f8c4] rounded-tl-lg z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#85f8c4] rounded-tr-lg z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#85f8c4] rounded-bl-lg z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#85f8c4] rounded-br-lg z-20 pointer-events-none"></div>

                {/* Animated Laser Scanning Line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#85f8c4] to-transparent shadow-[0_0_12px_#85f8c4] animate-laser-scan pointer-events-none z-20"></div>

                {/* Reticle in center */}
                <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center pointer-events-none z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#85f8c4]"></div>
                </div>

                {/* Camera Live Status Badge */}
                {cameraState === 'active' && (
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] text-[#85f8c4] font-medium border border-white/10 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85f8c4] animate-pulse"></span>
                    <span>Camera Live ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                  </div>
                )}

                {/* Scanner feedback overlay */}
                {isScanningSimulation && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4 text-center z-30 animate-fadeIn">
                    <span className="material-symbols-outlined text-[36px] text-[#85f8c4] animate-spin">sync</span>
                    <span className="text-[13px] font-bold text-white">Connecting to Charger...</span>
                    <span className="text-[10px] text-[#85f8c4] font-mono">OCPP 2.0.1 Handshake In Progress</span>
                  </div>
                )}
              </div>

              <p className="text-white/80 text-[11px] text-center mt-2.5 max-w-[240px]">
                {cameraState === 'active'
                  ? 'Point camera at charger sticker or tap frame to lock & connect.'
                  : 'Align charger QR sticker inside frame to lock solenoid & start charging.'}
              </p>

              {/* Interactive Alignment Help Trigger Button */}
              <button
                onClick={() => setShowQrHelpModal(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-[0.98] text-[#85f8c4] text-[11px] font-semibold transition-all cursor-pointer border border-[#85f8c4]/30 shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">help_center</span>
                <span>Sticker Alignment Guide &amp; Tips</span>
              </button>
            </div>

            {/* Simulated Demo QR codes for quick test */}
            <div className="p-3.5 bg-zinc-950 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between text-white/70 text-[11px]">
                <span className="font-bold uppercase tracking-wider text-[#85f8c4]">Simulate Station Scan</span>
                <span className="text-[10px]">Tap to test instant scan:</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {nearbyStations.slice(0, 3).map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleInitiateChargingFromQr(station)}
                    disabled={isScanningSimulation}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all text-left text-white border border-white/10 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#006948] flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-[16px]">qr_code</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold truncate block">{station.name}</span>
                        <span className="text-[9px] text-white/70">{station.bay} • {station.speed}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#85f8c4] shrink-0">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>

              {/* Manual Input Fallback */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Or enter Charger ID (e.g. CH-BLR-089-B)"
                  value={manualChargerId}
                  onChange={(e) => setManualChargerId(e.target.value)}
                  className="flex-1 bg-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:border-[#85f8c4] font-mono"
                />
                <button
                  onClick={() => {
                    const match = nearbyStations.find(
                      (s) => s.chargerId.toLowerCase() === manualChargerId.trim().toLowerCase()
                    ) || nearbyStations[0];
                    handleInitiateChargingFromQr(match);
                  }}
                  className="px-3 py-1.5 bg-[#006948] hover:bg-[#00855d] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Start
                </button>
              </div>
            </div>

            {/* QR Scanner Alignment Help Modal */}
            {showQrHelpModal && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center p-3 animate-fadeIn">
                <div className="bg-surface-container-lowest text-on-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden flex flex-col max-h-[92%] animate-scaleUp">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[24px]">center_focus_strong</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">
                            First-Time Guide
                          </span>
                          <span className="text-[10px] text-secondary">• 4 Simple Tips</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-on-surface mt-0.5 leading-snug">
                          How to Align Charger QR Sticker
                        </h3>
                        <p className="text-[11px] text-secondary">
                          Position your camera squarely over the sticker to start charging instantly.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowQrHelpModal(false);
                        setHasSeenQrGuide(true);
                      }}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer shrink-0"
                      title="Close Guide"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  {/* Tabs: Visual Guide vs Troubleshooting */}
                  <div className="flex items-center border-b border-outline-variant/20 px-4 pt-2 bg-surface-container-lowest">
                    <button
                      onClick={() => setQrHelpTab('visual')}
                      className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        qrHelpTab === 'visual'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-secondary hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Visual Alignment</span>
                    </button>
                    <button
                      onClick={() => setQrHelpTab('troubleshoot')}
                      className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        qrHelpTab === 'troubleshoot'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-secondary hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">build</span>
                      <span>Troubleshooting</span>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 overflow-y-auto no-scrollbar flex flex-col gap-4 text-[12px]">
                    {qrHelpTab === 'visual' ? (
                      <>
                        {/* Visual Mockup Diagram */}
                        <div className="bg-zinc-900 text-white rounded-xl p-3.5 border border-zinc-700/50 flex flex-col gap-3 relative overflow-hidden shadow-inner">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#85f8c4] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              <span>Target Alignment Diagram</span>
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">Distance: 15–20 cm</span>
                          </div>

                          {/* Dispenser & Sticker Diagram Graphic */}
                          <div className="relative h-44 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-3 overflow-hidden">
                            {/* Dispenser faceplate mockup */}
                            <div className="w-56 h-36 bg-zinc-800/90 rounded-lg border border-zinc-700 p-2.5 flex flex-col items-center justify-between relative shadow-lg">
                              <div className="flex items-center justify-between w-full px-1 text-[9px] text-zinc-400">
                                <span className="font-bold text-white tracking-wider">CHARGER BAY 02</span>
                                <span className="text-[#85f8c4] font-mono">GUN A • CCS2</span>
                              </div>

                              {/* Target QR Sticker on Dispenser */}
                              <div className="w-24 h-24 bg-white rounded-lg p-1.5 border-2 border-[#006948] flex flex-col items-center justify-between shadow-md relative">
                                <div className="text-[7px] text-[#006948] font-bold tracking-tighter uppercase">
                                  ChargeOne Connect
                                </div>
                                {/* Simulated QR matrix */}
                                <div className="w-14 h-14 bg-zinc-900 rounded p-1 flex flex-col justify-between">
                                  <div className="flex justify-between">
                                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                                    <div className="w-2 h-2 bg-white rounded-xs"></div>
                                  </div>
                                </div>
                                <div className="text-[6px] text-zinc-700 font-mono font-bold">
                                  ID: CH-BLR-089-B
                                </div>
                              </div>

                              <div className="text-[8px] text-zinc-400">Hold phone flat &amp; parallel to surface</div>
                            </div>

                            {/* Camera Viewfinder Reticle Overlay */}
                            <div className="absolute w-32 h-32 border-2 border-dashed border-[#85f8c4]/60 rounded-xl pointer-events-none flex items-center justify-center animate-pulse">
                              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#85f8c4]"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#85f8c4]"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#85f8c4]"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#85f8c4]"></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-emerald-400 text-[16px] shrink-0">check</span>
                              <span><strong>DO:</strong> Fill 70% of frame squarely</span>
                            </div>
                            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-rose-400 text-[16px] shrink-0">close</span>
                              <span><strong>DON'T:</strong> Tilt phone at steep 45°</span>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Tips */}
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                            <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[11px] shrink-0">
                              1
                            </span>
                            <div>
                              <strong className="text-on-surface font-semibold block">Locate the Specific Gun Sticker</strong>
                              <span className="text-secondary text-[11px] leading-tight">
                                Dual-gun chargers feature separate stickers for Gun A and Gun B. Look right next to or beneath the holster of the plug you attached to your car.
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                            <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[11px] shrink-0">
                              2
                            </span>
                            <div>
                              <strong className="text-on-surface font-semibold block">Maintain 15–20 cm (6–8 in) Distance</strong>
                              <span className="text-secondary text-[11px] leading-tight">
                                Don't hold the camera too close or too far away. The square sticker should occupy most of the green viewfinder reticle.
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                            <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[11px] shrink-0">
                              3
                            </span>
                            <div>
                              <strong className="text-on-surface font-semibold block">Mitigate Glare &amp; Shadows</strong>
                              <span className="text-secondary text-[11px] leading-tight">
                                In bright daylight, sunlight can cause harsh reflection on the glossy laminate. Use your hand to cast a quick shadow over the sticker if needed.
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                            <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[11px] shrink-0">
                              4
                            </span>
                            <div>
                              <strong className="text-on-surface font-semibold block">Use Built-in Flashlight in Dark Bays</strong>
                              <span className="text-secondary text-[11px] leading-tight">
                                Charging at night or in underground basements? Tap the flashlight icon in the top right of the scanner to illuminate the sticker clearly.
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Troubleshooting Tab */
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-amber-600">warning</span>
                            <span>Sticker is Weathered or Scratched?</span>
                          </div>
                          <p className="text-[11px] text-secondary">
                            Every dispenser has a human-readable 6-character Charger ID printed directly beneath the QR code (e.g., <code className="font-mono bg-surface-container px-1 rounded text-on-surface">CH-BLR-089-B</code>). You can enter this into the manual input box at the bottom of the scanner.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-primary">blur_on</span>
                            <span>Camera Won't Focus?</span>
                          </div>
                          <p className="text-[11px] text-secondary">
                            Gently pull back about 5 cm to let your phone lens autofocus. Ensure your camera lens is free of smudges or moisture.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-bold text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-primary">power</span>
                            <span>Already Plugged In?</span>
                          </div>
                          <p className="text-[11px] text-secondary">
                            You can plug in before or after scanning. Scanning locks the connector solenoid and starts current delivery within 3 seconds.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="p-3.5 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between gap-2.5">
                    <button
                      onClick={() => {
                        setShowQrHelpModal(false);
                        setHasSeenQrGuide(true);
                        // Trigger demo scan
                        handleInitiateChargingFromQr(nearbyStations[0]);
                      }}
                      className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
                      <span>Test Demo Scan</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowQrHelpModal(false);
                        setHasSeenQrGuide(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[12px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                      <span>Got It, Back to Camera</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Tab Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl shadow-lg border-t border-outline-variant/20 flex items-center justify-around h-16">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors cursor-pointer ${
              activeTab === 'explore' ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">ev_station</span>
            <span className="text-[10px]">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors cursor-pointer ${
              activeTab === 'live' ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span className="text-[10px]">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors cursor-pointer ${
              activeTab === 'activity' ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            <span className="text-[10px]">Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors cursor-pointer ${
              activeTab === 'wallet' ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            <span className="text-[10px]">Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'text-primary font-bold' : 'text-secondary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
