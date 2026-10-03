import React, { useState, useEffect } from 'react';
import { ScreenId, ActiveSession } from '../../types';
import { BENGALURU_MAP_URL, INITIAL_SESSIONS } from '../../data/mockData';

interface OverviewDashboardProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenProvisionModal: () => void;
  onSelectSession?: (session: ActiveSession) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAiDrawer?: (query?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenProvisionModal,
  onSelectSession,
  onShowToast,
  onOpenAiDrawer,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | 'yesterday'>('24h');
  const [selectedHub, setSelectedHub] = useState('All 42 Hubs (National)');
  const [sessionSearch, setSessionSearch] = useState('');
  const [isSmartThrottleActive, setIsSmartThrottleActive] = useState(false);
  const [activePin, setActivePin] = useState<'blr' | 'mum' | 'del' | 'pun' | 'hyd'>('blr');

  // Real-time telemetry log items
  const [logs, setLogs] = useState([
    { time: '16:42:01', tag: 'ACK', type: 'primary', msg: 'Heartbeat: CHG-BLR-012 (Roundtrip: 14ms)' },
    { time: '16:41:58', tag: 'OCPI', type: 'secondary', msg: 'v2.2.1 CDR Pushed to Shell (SES #89192 - Success)' },
    { time: '16:41:42', tag: 'SMART', type: 'primary', msg: 'Profile applied: Shedding at Whitefield Hub (Max 150A)' },
    { time: '16:40:15', tag: 'ALERT', type: 'error', msg: 'LockRetryFailed: CH-049 Gun 2 (Connector solenoid stuck)' },
    { time: '16:39:50', tag: 'METER', type: 'primary', msg: 'PeriodicTx: CH-014 energy.active.import.register: 489.1 kWh' },
  ]);

  // Push periodic log event
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomEvents = [
        { tag: 'ACK', type: 'primary', msg: `Heartbeat: CHG-DEL-00${Math.floor(Math.random() * 9 + 1)} (Roundtrip: 16ms)` },
        { tag: 'OCPI', type: 'secondary', msg: `MeterValues pushed to TataPower (SoC: ${Math.floor(Math.random() * 30 + 60)}%)` },
        { tag: 'METER', type: 'primary', msg: `TransactionEvent(Updated): Bus 782V @ 310A (Power: 242.4 kW)` },
        { tag: 'GRID', type: 'primary', msg: `Frequency locked: 50.02 Hz (Phase delta: +0.01)` },
      ];
      const ev = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      setLogs((prev) => [{ time: timeStr, tag: ev.tag, type: ev.type, msg: ev.msg }, ...prev.slice(0, 7)]);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const filteredSessions = INITIAL_SESSIONS.filter(
    (s) =>
      s.id.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.vehicleModel.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.stationName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.driverName.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const handleSimulateLoadBalancer = () => {
    onShowToast('Simulating dynamic load dispatch across 42 national hubs...', 'info');
    setTimeout(() => {
      onShowToast('Load balancer simulated: Peak shed 1,420 kW rerouted successfully.', 'success');
    }, 1200);
  };

  const handleExportCdrs = () => {
    onShowToast('Exporting 84,200 validated CDRs (CSV & JSON)... Download started.', 'success');
  };

  const handleEmergencyStop = (sessionId: string) => {
    onShowToast(`Emergency stop dispatched to ${sessionId}. Solenoid disengaged.`, 'error');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header Banner & Operational Control Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] uppercase tracking-wider font-bold">
              Live Grid Synced
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium whitespace-nowrap">
              OCPP 2.0.1 Ingestion Active (120 Hz)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl xl:text-[26px] font-bold text-on-surface tracking-tight">
            CPO Operations Command Center
          </h1>
          <p className="text-[12px] sm:text-[13px] text-secondary">
            Real-time infrastructure health, roaming sessions, and energy dispatch across 42 hubs.
          </p>
        </div>

        {/* Filters & High-Level Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="flex items-center bg-surface-container rounded-lg p-1 text-on-surface">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[12px] sm:text-[13px] font-semibold transition-all flex items-center gap-1 ${
                timeRange === '24h'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Live (24h)</span>
            </button>
            <button
              onClick={() => setTimeRange('yesterday')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[12px] sm:text-[13px] transition-all ${
                timeRange === 'yesterday'
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="relative">
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="appearance-none bg-surface-container-lowest text-[12px] sm:text-[13px] font-medium text-on-surface px-3 py-2 pr-7 rounded-lg shadow-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option>All 42 Hubs (National)</option>
              <option>Metro West Hub (Mumbai/Pune)</option>
              <option>Highway Express Corridor (BLR-CHE)</option>
              <option>Delhi NCR Hypercharge Cluster</option>
            </select>
            <span className="material-symbols-outlined text-[18px] text-secondary absolute right-2 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="h-6 w-px bg-surface-container-high hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleExportCdrs}
              className="px-2.5 sm:px-3 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-[12px] sm:text-[13px] font-medium transition-colors flex items-center gap-1 border border-outline-variant/20"
              title="Export Charge Detail Records"
            >
              <span className="material-symbols-outlined text-[17px] text-secondary">download</span>
              <span>Export CDRs</span>
            </button>
            <button
              onClick={handleSimulateLoadBalancer}
              className="px-2.5 sm:px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container hover:bg-surface-container-high text-[12px] sm:text-[13px] font-medium transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[17px]">tune</span>
              <span className="hidden sm:inline">Simulate Balancer</span>
            </button>
            <button
              onClick={onOpenProvisionModal}
              className="px-3 sm:px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[12px] sm:text-[13px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              <span>Provision Station</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Metric KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Total Fleet Hubs
            </span>
            <span className="p-1 rounded bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[18px]">ev_station</span>
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-on-surface font-mono">42</span>
              <span className="text-[13px] text-secondary font-medium">/ 318 Guns</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="text-primary font-bold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+4 this wk
              </span>
              <span className="text-secondary font-medium">• 99.4% uptime</span>
            </div>
          </div>
          <div className="w-full h-7 mt-1 text-primary">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
              <path
                d="M0,18 L15,16 L30,19 L45,12 L60,14 L75,8 L90,10 L100,4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M0,18 L15,16 L30,19 L45,12 L60,14 L75,8 L90,10 L100,4 L100,24 L0,24 Z"
                fill="currentColor"
                fillOpacity="0.12"
              />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Online &amp; Available
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              77.4%
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-on-surface font-mono">246</span>
              <span className="text-[13px] text-secondary font-medium">Guns Ready</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-secondary font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span> 58 Busy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim"></span> 11 Prep
              </span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-2 mt-2 overflow-hidden flex">
            <div className="bg-primary h-full" style={{ width: '77.4%' }}></div>
            <div className="bg-primary-container h-full" style={{ width: '18.2%' }}></div>
            <div className="bg-secondary-fixed-dim h-full" style={{ width: '4.4%' }}></div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Active Sessions
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Live
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-on-surface font-mono">58</span>
              <span className="text-[13px] text-secondary font-medium">Vehicles</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="font-bold text-on-surface font-mono">6,840 kW</span>
              <span className="text-secondary font-medium">Instantaneous Load</span>
            </div>
          </div>
          <div className="w-full h-7 mt-1 text-primary-container">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
              <path
                d="M0,20 L15,17 L30,12 L45,15 L60,8 L75,10 L90,5 L100,7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M0,20 L15,17 L30,12 L45,15 L60,8 L75,10 L90,5 L100,7 L100,24 L0,24 Z"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Today's Dispensed
            </span>
            <span className="p-1 rounded bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-on-surface font-mono">48.6</span>
              <span className="text-[13px] text-secondary font-medium">MWh</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-primary text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>+14.2% vs prev Thu</span>
            </div>
          </div>
          <div className="w-full h-7 mt-1 text-primary">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
              <path
                d="M0,22 L18,18 L36,19 L54,11 L72,9 L90,5 L100,2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M0,22 L18,18 L36,19 L54,11 L72,9 L90,5 L100,2 L100,24 L0,24 Z"
                fill="currentColor"
                fillOpacity="0.12"
              />
            </svg>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Gross Revenue
            </span>
            <span className="p-1 rounded bg-surface-container text-secondary">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-on-surface font-mono">₹8.74L</span>
              <span className="text-[11px] text-secondary">($10,540)</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-secondary text-[11px] font-medium">
              <span>Avg Tariff:</span>
              <span className="font-bold text-on-surface font-mono">₹18.00 / kWh</span>
            </div>
          </div>
          <div className="w-full h-7 mt-1 text-tertiary">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
              <path
                d="M0,19 L20,16 L40,14 L60,11 L80,6 L100,3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <path
                d="M0,19 L20,16 L40,14 L60,11 L80,6 L100,3 L100,24 L0,24 Z"
                fill="currentColor"
                fillOpacity="0.12"
              />
            </svg>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-error uppercase font-bold tracking-wider">
              Critical Alerts
            </span>
            <span className="p-1 rounded bg-error-container text-on-error-container">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-bold text-error font-mono">3</span>
              <span className="text-[13px] text-secondary font-medium">Warnings</span>
            </div>
            <div className="flex flex-col mt-1 text-[11px] text-secondary truncate">
              <span className="truncate text-error font-semibold">1x Lock Cable (CH-049)</span>
              <span className="truncate">2x Ground Fault Retries</span>
            </div>
          </div>
          <div className="pt-1">
            <button
              onClick={() => onNavigate('live-telemetry-health')}
              className="text-[11px] font-bold text-error hover:underline flex items-center gap-1"
            >
              <span>Resolve in Hub Monitor</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Operations Workspace: 8 Col + 4 Col Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT & CENTER: 8 COLUMNS */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Map & Network Topology Canvas */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col">
            {/* Card Bar */}
            <div className="p-3.5 sm:p-4 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-surface-container">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0"></span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] sm:text-[16px] text-on-surface font-bold truncate">
                    Live Geospatial Distribution &amp; Hub Load
                  </span>
                  <span className="text-[11px] sm:text-[12px] text-secondary font-medium">
                    Real-time status of 42 high-voltage DC Fast Charger sites across India
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAiDrawer?.('Locate 360kW DC fast charging stations near Indiranagar Bengaluru')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
                  title="Explore live EV charging nodes on Google Maps"
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">pin_drop</span>
                  <span>Google Maps Grounding</span>
                </button>
                <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] sm:text-[11px] text-on-surface font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> 38 Nominal
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] sm:text-[11px] text-on-surface font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 3 High Load
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] sm:text-[11px] text-error font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span> 1 Faulted
                </span>
              </div>
            </div>

            {/* Simulated Map Canvas Container */}
            <div className="relative w-full h-[380px] sm:h-[420px] md:h-[450px] bg-surface-container-low overflow-hidden select-none">
              {/* Dynamic Visual Location Map Asset */}
              <div
                className="w-full h-full bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url('${BENGALURU_MAP_URL}')` }}
              ></div>

              {/* Darkened Geospatial Grid Scrim for Data Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/85 via-on-background/35 to-on-background/45 pointer-events-none"></div>

              {/* Pulsing Map Node Markers */}
              {/* Bengaluru Central Hub (16) */}
              <div
                onClick={() => setActivePin('blr')}
                className="absolute top-[42%] left-[48%] group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <span className="absolute -inset-2.5 rounded-full bg-primary/40 animate-ping"></span>
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-lg ring-2 ring-surface transition-transform ${
                    activePin === 'blr' ? 'bg-primary text-on-primary scale-110' : 'bg-primary/90 text-on-primary'
                  }`}
                >
                  16
                </div>
                {/* Node Tooltip / Inspection Hover Preview */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-surface-container-lowest text-on-surface p-3 rounded-lg shadow-xl w-60 z-30 pointer-events-none border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary">HUB-BLR-04</span>
                    <span className="text-[11px] text-secondary font-medium">Indiranagar</span>
                  </div>
                  <span className="text-[12px] font-semibold mt-1">12 / 16 Connectors Occupied</span>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-[11px] text-secondary font-mono mt-1">
                    Total Draw: 1,440 kW (360 kW DC)
                  </span>
                </div>
              </div>

              {/* Mumbai Metro Hub (24) */}
              <div
                onClick={() => setActivePin('mum')}
                className="absolute top-[32%] left-[30%] group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <span className="absolute -inset-2 rounded-full bg-primary-fixed/40 animate-ping"></span>
                <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-primary-container text-on-primary font-bold text-xs shadow-lg ring-2 ring-surface">
                  24
                </div>
              </div>

              {/* Delhi Hyper Hub (32) */}
              <div
                onClick={() => setActivePin('del')}
                className="absolute top-[18%] left-[42%] group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <span className="absolute -inset-2 rounded-full bg-secondary-fixed/50 animate-ping"></span>
                <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-on-secondary font-bold text-xs shadow-lg ring-2 ring-surface">
                  32
                </div>
              </div>

              {/* Pune Express Hub (!) */}
              <div
                onClick={() => setActivePin('pun')}
                className="absolute top-[38%] left-[35%] group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-error text-on-error font-bold text-[11px] shadow-lg ring-2 ring-surface animate-bounce">
                  !
                </div>
              </div>

              {/* Hyderabad Tech Hub (18) */}
              <div
                onClick={() => setActivePin('hyd')}
                className="absolute top-[48%] left-[54%] group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[10px] shadow-lg ring-2 ring-surface">
                  18
                </div>
              </div>

              {/* Top-Left Floating Map Telemetry Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2 z-20 max-w-[calc(100%-1.5rem)]">
                <div className="bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md flex items-center gap-2.5 sm:gap-4 border border-outline-variant/30">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase text-secondary font-bold tracking-wider block">
                      Aggregated Load
                    </span>
                    <span className="text-[15px] sm:text-[18px] text-on-surface font-extrabold font-mono leading-tight">
                      6,840 kW
                    </span>
                  </div>
                  <div className="h-6 sm:h-7 w-px bg-surface-container"></div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase text-secondary font-bold tracking-wider block">
                      Channel Split
                    </span>
                    <span className="text-[11px] sm:text-[13px] font-bold text-primary leading-tight">
                      59% Direct <span className="text-secondary font-normal hidden sm:inline">/ 41% Roaming</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Floating Hub Spotlight Card */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto md:w-96 bg-surface-container-lowest/95 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-xl z-20 border border-outline-variant/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> High Throughput Hub
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-secondary font-mono">
                    {activePin === 'blr' ? 'ID: HUB-042-BLR' : `ID: HUB-0${activePin.toUpperCase()}`}
                  </span>
                </div>
                <h2 className="text-[14px] sm:text-[16px] text-on-surface font-bold truncate">
                  {activePin === 'blr'
                    ? 'Bengaluru Tech Corridor Hub 04'
                    : activePin === 'mum'
                    ? 'BKC Express Hypercharge Hub'
                    : activePin === 'del'
                    ? 'Aerocity Airport MegaHub 01'
                    : 'Pune Expressway Superhub'}
                </h2>
                <div className="flex items-center justify-between text-[11px] sm:text-[12px] text-secondary my-1.5 sm:my-2">
                  <span>
                    Capacity: <strong>12 / 16 In Use</strong>
                  </span>
                  <span>
                    Spec: <strong>360 kW DC Ultra-Fast</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('live-telemetry-health')}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-on-primary text-[11px] sm:text-[12px] font-semibold hover:bg-primary-container transition-colors text-center shadow-xs cursor-pointer"
                  >
                    Launch Remote Diagnostics
                  </button>
                  <button
                    onClick={() => onShowToast('Hub configuration profile synced with local gateway.', 'info')}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container text-secondary hover:text-on-surface transition-colors cursor-pointer"
                    title="Settings"
                  >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Energy Dispatch & Dynamic Revenue Dual Chart */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] sm:text-[16px] text-on-surface font-bold">
                  24-Hour Energy Dispatch &amp; Live Revenue Profile
                </h2>
                <p className="text-[11px] sm:text-[12px] text-secondary font-medium">
                  Hourly generation curve demonstrating peak evening commute surge and tariff yield.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
                  <span className="text-on-surface font-medium whitespace-nowrap">Direct Fleet (MWh)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-secondary"></span>
                  <span className="text-on-surface font-medium whitespace-nowrap">OCPI Roaming (MWh)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-primary rounded-full"></span>
                  <span className="text-on-surface font-medium whitespace-nowrap">Revenue (₹ Lakhs)</span>
                </div>
              </div>
            </div>

            {/* Vector Multi-Axis Chart Visualization */}
            <div className="relative w-full h-60 flex flex-col justify-end pt-4 pb-2">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-secondary text-[10px] font-mono">
                <div className="flex justify-between border-b border-surface-container/70 pb-1">
                  <span>4.0 MWh</span>
                  <span>₹1.2L</span>
                </div>
                <div className="flex justify-between border-b border-surface-container/70 pb-1">
                  <span>3.0 MWh</span>
                  <span>₹0.9L</span>
                </div>
                <div className="flex justify-between border-b border-surface-container/70 pb-1">
                  <span>2.0 MWh</span>
                  <span>₹0.6L</span>
                </div>
                <div className="flex justify-between border-b border-surface-container/70 pb-1">
                  <span>1.0 MWh</span>
                  <span>₹0.3L</span>
                </div>
                <div className="flex justify-between">
                  <span>0.0 MWh</span>
                  <span>₹0.0L</span>
                </div>
              </div>

              {/* Visual Bar & Line Overlay */}
              <div className="relative w-full h-44 flex items-end justify-between px-2 sm:px-6 z-10">
                {[
                  { time: '00:00', height: '18%', direct: '60%', roaming: '40%' },
                  { time: '03:00', height: '12%', direct: '65%', roaming: '35%' },
                  { time: '06:00', height: '28%', direct: '55%', roaming: '45%' },
                  { time: '09:00', height: '62%', direct: '50%', roaming: '50%' },
                  { time: '12:00', height: '54%', direct: '60%', roaming: '40%' },
                  { time: '15:00', height: '48%', direct: '65%', roaming: '35%' },
                  { time: '18:00', height: '95%', direct: '55%', roaming: '45%', highlight: true },
                  { time: '21:00', height: '74%', direct: '60%', roaming: '40%' },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div
                      className="w-3.5 sm:w-6 md:w-8 bg-surface-container rounded-t flex flex-col justify-end overflow-hidden transition-all duration-300 group-hover:scale-105"
                      style={{ height: bar.height }}
                    >
                      <div className="w-full bg-secondary" style={{ height: bar.roaming }}></div>
                      <div className="w-full bg-primary" style={{ height: bar.direct }}></div>
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-mono ${
                        bar.highlight ? 'text-primary font-bold' : 'text-secondary'
                      }`}
                    >
                      {bar.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trend Overlay Line SVG */}
              <svg
                className="absolute inset-x-2 sm:inset-x-6 top-8 h-36 w-[calc(100%-1rem)] sm:w-[calc(100%-3rem)] pointer-events-none z-20"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 700 120"
              >
                <path
                  d="M 20,95 Q 110,105 200,80 T 380,45 T 520,12 T 680,35"
                  fill="none"
                  stroke="#006948"
                  strokeWidth="3.5"
                />
                <circle cx="520" cy="12" fill="#006948" r="5" stroke="#ffffff" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* Live Active Charging Sessions Feed (Rich Table) */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col">
            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0"></div>
                <h2 className="text-[14px] sm:text-[16px] text-on-surface font-bold truncate">
                  Live Active Charging Sessions Feed
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                  58 Live
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    className="h-8 pl-7 pr-3 rounded-lg bg-surface-container text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-48 border border-outline-variant/20"
                    placeholder="Filter session..."
                    type="text"
                  />
                  <span className="material-symbols-outlined text-[16px] text-secondary absolute left-2 top-2">
                    search
                  </span>
                </div>
                <button
                  onClick={() => setSessionSearch('')}
                  className="p-1.5 rounded-lg bg-surface-container text-secondary hover:text-on-surface transition-colors shrink-0"
                  title="Clear filter"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[820px] text-left border-collapse font-body-sm text-[13px]">
                <thead>
                  <tr className="bg-surface-container-low text-[11px] text-secondary uppercase font-bold tracking-wider border-b border-surface-container">
                    <th className="py-2.5 px-4">Session ID</th>
                    <th className="py-2.5 px-4">Station &amp; Charger</th>
                    <th className="py-2.5 px-4">Vehicle / Driver</th>
                    <th className="py-2.5 px-4 text-right">Current SoC &amp; Power</th>
                    <th className="py-2.5 px-4 text-right">Delivered (Cost)</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-secondary text-[13px]">
                        No charging sessions match "{sessionSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="hover:bg-surface-container/40 transition-colors group cursor-pointer"
                        onClick={() => {
                          onSelectSession?.(session);
                          onNavigate('session-audit-dossier');
                        }}
                      >
                        <td className="py-3 px-4 font-bold text-on-surface">
                          <span className="font-mono text-primary group-hover:underline">
                            {session.id}
                          </span>
                          <span className="block text-[10px] text-secondary font-mono font-normal">
                            {session.protocol} • {session.operator}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-on-surface">{session.stationName}</div>
                          <div className="text-secondary text-[11px]">{session.connectorType}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-on-surface">{session.vehicleModel}</div>
                          <div className="text-secondary text-[11px]">
                            {session.driverName} ({session.driverId})
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-primary font-mono">{session.currentSoc}% SoC</div>
                          <div className="text-secondary text-[11px] font-mono">
                            {session.activePowerKw} kW {session.powerStatus}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-on-surface font-mono">
                            {session.deliveredKwh} kWh
                          </div>
                          <div className="text-primary text-[11px] font-bold font-mono">
                            ₹{session.costInr.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-secondary text-[12px]">
                          {session.duration}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              session.status === 'Charging'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : 'bg-secondary-container text-on-secondary-container'
                            }`}
                          >
                            {session.status === 'Charging' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                            )}
                            {session.status === 'Charging' ? '⚡ Charging' : 'Finishing (96%)'}
                          </span>
                        </td>
                        <td
                          className="py-3 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                onSelectSession?.(session);
                                onNavigate('session-audit-dossier');
                              }}
                              className="p-1 rounded-md hover:bg-surface-container text-secondary hover:text-primary transition-colors"
                              title="Inspect Telemetry & Handshake Trace"
                            >
                              <span className="material-symbols-outlined text-[18px]">query_stats</span>
                            </button>
                            <button
                              onClick={() => handleEmergencyStop(session.id)}
                              className="p-1 rounded-md hover:bg-error-container text-error transition-colors"
                              title="Emergency Stop Session"
                            >
                              <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-surface-container-low flex items-center justify-between text-secondary text-[12px] border-t border-surface-container">
              <span>Showing {filteredSessions.length} of 58 live active vehicle streams</span>
              <button
                onClick={() => onNavigate('charging-sessions')}
                className="font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Active Sessions Console</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: 4 COLUMNS (Live Diagnostics & Financial Settlements) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Charger Health Donut & Detailed Status Breakdown */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] text-on-surface font-bold">Charger Health Breakdown</h2>
              <span className="text-[12px] text-secondary font-mono font-medium">318 Connectors</span>
            </div>

            {/* Donut Vector + Stat Row */}
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Ring */}
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.8"
                  />
                  {/* Available (77.4%) */}
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="77.4, 100"
                    strokeLinecap="round"
                    strokeWidth="3.8"
                  />
                  {/* Charging (18.2%) */}
                  <path
                    className="text-primary-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="18.2, 100"
                    strokeDashoffset="-77.4"
                    strokeLinecap="round"
                    strokeWidth="3.8"
                  />
                  {/* Faulted (1%) */}
                  <path
                    className="text-error"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="2, 100"
                    strokeDashoffset="-96"
                    strokeLinecap="round"
                    strokeWidth="3.8"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[20px] font-bold text-on-surface leading-tight font-mono">
                    99%
                  </span>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                    Healthy
                  </span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="flex flex-col gap-1.5 flex-1 text-[12px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="text-on-surface">Available</span>
                  </div>
                  <span className="font-bold text-on-surface font-mono">246 (77.4%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                    <span className="text-on-surface">Charging</span>
                  </div>
                  <span className="font-bold text-on-surface font-mono">58 (18.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim"></span>
                    <span className="text-on-surface">Reserved / Prep</span>
                  </div>
                  <span className="font-bold text-on-surface font-mono">11 (3.5%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span className="text-error font-medium">Faulted / Maint</span>
                  </div>
                  <span className="font-bold text-error font-mono">3 (0.9%)</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center justify-between border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">power</span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-on-surface">Grid Peak Shaving Status</span>
                  <span className="text-[11px] text-secondary">
                    Active limit: 9,200 kW (Currently 74.3% cap)
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                Optimal
              </span>
            </div>
          </div>

          {/* Live OCPP 2.0.1 Telemetry Stream */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">terminal</span>
                <h2 className="text-[15px] text-on-surface font-bold">OCPP 2.0.1 Live Telemetry</h2>
              </div>
              <span className="text-[11px] text-primary font-bold flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span> Stream Open
              </span>
            </div>

            {/* Terminal-like stream logs */}
            <div className="bg-surface-container font-mono text-[11px] p-2.5 rounded-lg flex flex-col gap-1.5 max-h-56 overflow-y-auto no-scrollbar border border-outline-variant/20">
              {logs.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-on-surface animate-fadeIn">
                  <span className="text-secondary select-none">{item.time}</span>
                  <span
                    className={`font-bold ${
                      item.type === 'error'
                        ? 'text-error'
                        : item.type === 'primary'
                        ? 'text-primary'
                        : 'text-secondary'
                    }`}
                  >
                    {item.tag}
                  </span>
                  <span className="truncate">{item.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Financial Settlements Widget */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">account_balance</span>
                <h2 className="text-[15px] text-on-surface font-bold">Pending Settlements</h2>
              </div>
              <span className="text-[11px] text-secondary font-mono font-medium">T+2 Cycle</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-outline-variant/20">
                <span className="text-[10px] uppercase text-secondary font-bold tracking-wider">
                  Net OCPI Receivable
                </span>
                <span className="text-[18px] font-bold text-primary mt-1 font-mono">₹3,42,100</span>
                <span className="text-[10px] text-secondary mt-0.5 font-medium">Due in 48h from 3 eMSPs</span>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-outline-variant/20">
                <span className="text-[10px] uppercase text-secondary font-bold tracking-wider">
                  Payable to Host Sites
                </span>
                <span className="text-[18px] font-bold text-on-surface mt-1 font-mono">₹1,88,500</span>
                <span className="text-[10px] text-secondary mt-0.5 font-medium">Lease &amp; Rev Share</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[12px] text-secondary">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span>Automated Reconciliation Active</span>
              </div>
              <button
                onClick={() => onNavigate('settlements-reconciliation')}
                className="text-[12px] font-bold text-primary hover:underline"
              >
                View Ledger
              </button>
            </div>
          </div>

          {/* Quick Emergency Operations Action Panel */}
          <div className="bg-gradient-to-br from-surface-container-high to-surface-container p-4 rounded-xl shadow-xs flex flex-col gap-2 border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-on-surface">tune</span>
              <span className="text-[15px] font-bold text-on-surface">Hub Dynamic Load Dispatch</span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Instant override policy to throttle high draw stations during utility peak-tariff window (18:00 - 21:00).
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
              <button
                onClick={() => {
                  setIsSmartThrottleActive(!isSmartThrottleActive);
                  onShowToast(
                    isSmartThrottleActive
                      ? 'Smart throttle policy deactivated across stations.'
                      : 'Smart throttle (80%) policy activated! Power capped to 80% grid headroom.',
                    isSmartThrottleActive ? 'info' : 'success'
                  );
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-[12px] font-bold transition-all shadow-xs cursor-pointer ${
                  isSmartThrottleActive
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
              >
                {isSmartThrottleActive ? 'Deactivate Smart Throttle' : 'Activate Smart Throttle (80%)'}
              </button>
              <button
                onClick={() => onShowToast('Configuring peak shaving parameters...', 'info')}
                className="py-2 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-[12px] font-medium hover:bg-surface-container transition-colors border border-outline-variant/30 cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
