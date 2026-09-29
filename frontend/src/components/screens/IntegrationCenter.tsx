import React, { useState, useEffect } from 'react';
import { RoamingPartner, TraceLog, ScreenId } from '../../types';
import { INITIAL_ROAMING_PARTNERS, INITIAL_TRACER_LOGS } from '../../data/mockData';

interface IntegrationCenterProps {
  currentScreen?: ScreenId;
  onNavigate?: (screen: ScreenId) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const IntegrationCenter: React.FC<IntegrationCenterProps> = ({
  currentScreen = 'integration-center',
  onNavigate,
  onShowToast,
}) => {
  const getInitialTab = (): 'all' | 'ocpi' | 'ocpp' | 'payments' | 'packets' => {
    if (currentScreen === 'ocpi-network-roaming') return 'ocpi';
    if (currentScreen === 'ocpp-charger-gateway') return 'ocpp';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'ocpi' | 'ocpp' | 'payments' | 'packets'>(getInitialTab);

  useEffect(() => {
    if (currentScreen === 'ocpi-network-roaming') {
      setActiveTab('ocpi');
    } else if (currentScreen === 'ocpp-charger-gateway') {
      setActiveTab('ocpp');
    } else if (currentScreen === 'integration-center') {
      setActiveTab('all');
    }
  }, [currentScreen]);

  const [partnerFilter, setPartnerFilter] = useState<'all' | 'emsp' | 'hubs'>('all');
  const [searchPartner, setSearchPartner] = useState('');
  const [tracerFilter, setTracerFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [logs, setLogs] = useState<TraceLog[]>(INITIAL_TRACER_LOGS);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showRegisterEndpointModal, setShowRegisterEndpointModal] = useState(false);

  // New partner form state
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCountry, setNewPartnerCountry] = useState('India (IN)');
  const [newPartnerRole, setNewPartnerRole] = useState('Bilateral Peer (CPO + eMSP)');
  const [newPartnerProtocol, setNewPartnerProtocol] = useState('OCPI 2.2.1-FULL');

  // Streaming packet simulator
  useEffect(() => {
    if (isStreamPaused) return;

    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().substring(11, 23);
      const randomTrace = 'trace_' + Math.random().toString(36).substring(2, 8);

      const events: Omit<TraceLog, 'id' | 'time' | 'traceId'>[] = [
        {
          proto: 'OCPI 2.2.1',
          method: 'GET /ocpi/cpo/2.2.1/locations',
          status: '200 OK',
          body: 'IonityEU pulled delta incremental (4 locations updated, 16 EVSEs synced)',
        },
        {
          proto: 'OCPP 2.0.1',
          method: 'INBOUND <-- NotifyEvent',
          status: 'Accepted',
          body: 'Station BLR-FAST-09: CablePluggedIn triggered on EVSE 1 (Session #89209 ready)',
        },
        {
          proto: 'OCPI 2.2.1',
          method: 'POST /ocpi/emsp/2.2.1/sessions',
          status: '200 OK',
          body: 'ShellRecharge: Roaming session sync updated (SoC: 74%, delivered: 36.4 kWh)',
        },
        {
          proto: 'OCPP 1.6-J',
          method: 'INBOUND <-- MeterValues',
          status: '200 OK',
          body: 'Station HYD-TPE-02: Energy.Active.Import.Register=518290 Wh (Power: 114 kW)',
        },
        {
          proto: 'OCPI 2.2.1',
          method: 'POST /ocpi/sender/commands/START_SESSION',
          status: '200 OK',
          body: 'TataPower → Dispatch RemoteStart [session_token: TP_89210, response_url: /cb/902]',
        },
      ];

      const chosen = events[Math.floor(Math.random() * events.length)];
      setLogs((prev) => [
        {
          id: Math.random().toString(),
          time: timeStr,
          proto: chosen.proto,
          method: chosen.method,
          status: chosen.status,
          body: chosen.body,
          traceId: randomTrace,
        },
        ...prev.slice(0, 30),
      ]);
    }, 3800);

    return () => clearInterval(timer);
  }, [isStreamPaused]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedEndpoint(true);
    onShowToast('WebSocket endpoint copied to clipboard.', 'success');
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const handleHandshake = (partnerName: string) => {
    onShowToast(`Executing OCPI 2.2.1 handshake with ${partnerName}...`, 'info');
    setTimeout(() => {
      onShowToast(`Handshake verified: ${partnerName} endpoints responded in 42ms (200 OK).`, 'success');
    }, 1000);
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName) return;
    onShowToast(`Roaming Partner "${newPartnerName}" credentials registered. Initiating initial OCPI handshake.`, 'success');
    setShowAddPartnerModal(false);
    setNewPartnerName('');
  };

  const filteredPartners = INITIAL_ROAMING_PARTNERS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchPartner.toLowerCase()) ||
      p.cpoId.toLowerCase().includes(searchPartner.toLowerCase());
    if (!matchesSearch) return false;
    if (partnerFilter === 'emsp') return p.role.includes('eMSP');
    if (partnerFilter === 'hubs') return p.role.includes('Hub') || p.role.includes('Clearing');
    return true;
  });

  const filteredLogs = logs.filter((l) => {
    if (tracerFilter && !l.traceId.toLowerCase().includes(tracerFilter.toLowerCase()) && !l.body.toLowerCase().includes(tracerFilter.toLowerCase())) {
      return false;
    }
    if (moduleFilter === 'commands' && !l.method.includes('command') && !l.body.includes('RemoteStart')) {
      return false;
    }
    if (moduleFilter === 'cdrs' && !l.method.includes('cdrs') && !l.body.includes('CDR')) {
      return false;
    }
    if (moduleFilter === 'ocpp' && !l.proto.includes('OCPP')) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
              Protocols &amp; Ecosystem
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-[11px] text-secondary font-medium">Interoperability v4.8</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight">
            EV Network Integration &amp; Roaming Gateway
          </h1>
          <p className="text-[13px] text-secondary max-w-3xl">
            Standardized OCPI 2.2.1 peer-to-peer roaming, eMSP clearing house, OCPP 1.6J/2.0.1 charger broker, and payment rails.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onShowToast('Downloaded OpenCDR v2.2.1 Specification bundle (JSON Schema & OpenAPI 3.0)', 'success')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium transition-colors shadow-xs border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
            <span>Download OpenCDR Spec</span>
          </button>
          <button
            onClick={() => setShowRegisterEndpointModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium transition-colors shadow-xs border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">router</span>
            <span>+ Register OCPP Broker Endpoint</span>
          </button>
          <button
            onClick={() => setShowAddPartnerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] font-semibold transition-colors shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span>+ Add Roaming Partner (OCPI)</span>
          </button>
        </div>
      </div>

      {/* Protocol & Gateway Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex items-center flex-wrap gap-1 bg-surface-container p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary">dashboard</span>
            <span>All Protocols &amp; Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('ocpi')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ocpi'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary">hub</span>
            <span>OCPI Network Roaming (v2.2.1)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              14 Peers
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ocpp')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ocpp'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary">router</span>
            <span>OCPP Charger Broker</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              TLS 1.3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary">payments</span>
            <span>Clearing &amp; Payment Rails</span>
          </button>

          <button
            onClick={() => setActiveTab('packets')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'packets'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] text-primary">terminal</span>
            <span>Live Packet Tracer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-[12px] text-secondary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-semibold text-on-surface font-mono">14,820 Sockets Connected</span>
        </div>
      </div>

      {/* Top Integration Architecture Status Matrix (4 Cards) */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fadeIn">
        {/* Card 1: OCPI Hub */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">hub</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Roaming Hub
                </span>
                <h4 className="text-[16px] font-bold text-on-surface">OCPI 2.2.1 Hub</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              99.99% SLA
            </span>
          </div>
          <div className="mt-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-on-surface font-mono">14</span>
              <span className="text-[13px] text-secondary font-medium">Connected Partners</span>
            </div>
            <p className="text-[12px] text-secondary truncate mt-1">
              Shell Recharge, Tata Power EZ, Hubject, Enel X
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-[11px]">
            <span>Handshake Latency</span>
            <span className="text-primary font-bold font-mono">~42ms avg</span>
          </div>
        </div>

        {/* Card 2: OCPP Charger Broker */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary-container/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">router</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Charger Broker
                </span>
                <h4 className="text-[16px] font-bold text-on-surface">OCPP Gateways</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
              2 Clusters
            </span>
          </div>
          <div className="mt-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-on-surface font-mono">14,820</span>
              <span className="text-[13px] text-secondary font-medium">Sockets Online</span>
            </div>
            <p className="text-[12px] text-secondary truncate mt-1">
              Europe West (AWS) &amp; India South (GCP)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-[11px]">
            <span>WebSockets Ping</span>
            <span className="text-primary font-bold font-mono">18ms stable</span>
          </div>
        </div>

        {/* Card 3: CDR Clearinghouse */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Settlement Engine
                </span>
                <h4 className="text-[16px] font-bold text-on-surface">Clearing &amp; CDRs</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              100% Match
            </span>
          </div>
          <div className="mt-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-on-surface font-mono">84,200</span>
              <span className="text-[13px] text-secondary font-medium">CDRs Cleared / mo</span>
            </div>
            <p className="text-[12px] text-secondary truncate mt-1">
              ₹0.00 Balance Discrepancy (Reconciled)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-[11px]">
            <span>Automated Invoicing</span>
            <span className="text-on-surface font-semibold font-mono">Daily 00:00 UTC</span>
          </div>
        </div>

        {/* Card 4: OpenADR Grid */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary-container/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[20px]">energy_savings_leaf</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Smart Grid Link
                </span>
                <h4 className="text-[16px] font-bold text-on-surface">OpenADR 2.0b</h4>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-bold">
              Active Demand
            </span>
          </div>
          <div className="mt-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-bold text-on-surface font-mono">4</span>
              <span className="text-[13px] text-secondary font-medium">Municipal Utilities</span>
            </div>
            <p className="text-[12px] text-secondary truncate mt-1">
              Dynamic Tariff Shedding Enabled
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-secondary text-[11px]">
            <span>Curtailment Ready</span>
            <span className="text-primary font-bold font-mono">3.8 MW Dynamic Flex</span>
          </div>
        </div>
        </div>
      )}

      {/* Main Section 1: OCPI Roaming Connections Table & Module Health */}
      {(activeTab === 'all' || activeTab === 'ocpi') && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col animate-fadeIn">
        {/* Header with controls */}
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-on-surface">
                OCPI Roaming Peers &amp; Module Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold font-mono">
                v2.2.1 Protocol
              </span>
            </div>
            <p className="text-[12px] text-secondary font-medium">
              Live bidirectional synchronization status across eMSPs, CPOs, and roaming clearinghouses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[18px] text-secondary">
                search
              </span>
              <input
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                className="h-9 pl-8 pr-4 bg-surface-container text-on-surface placeholder:text-secondary rounded-lg text-[12px] focus:outline-none focus:ring-1 focus:ring-primary w-48 xl:w-64 border border-outline-variant/20"
                placeholder="Filter partner or role..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
              <button
                onClick={() => setPartnerFilter('all')}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                  partnerFilter === 'all'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                All Partners (14)
              </button>
              <button
                onClick={() => setPartnerFilter('emsp')}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                  partnerFilter === 'emsp'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                eMSPs Only (9)
              </button>
              <button
                onClick={() => setPartnerFilter('hubs')}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                  partnerFilter === 'hubs'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                Hubs &amp; Clearing (5)
              </button>
            </div>
            <button
              onClick={() => onShowToast('Synchronized all 14 active OCPI modules in 48ms.', 'success')}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
              title="Sync All Now"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-[13px]">
            <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
              <tr>
                <th className="py-3 px-5">Partner &amp; Topology</th>
                <th className="py-3 px-4">Role &amp; Protocol</th>
                <th className="py-3 px-4">Module Health &amp; Sync Matrix</th>
                <th className="py-3 px-4">Live Throughput</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-[13px] font-bold text-primary shadow-xs border border-outline-variant/30">
                        {partner.initials}
                      </div>
                      <div>
                        <div className="text-[14px] text-on-surface font-semibold flex items-center gap-1.5">
                          {partner.name}
                          {partner.verified && (
                            <span
                              className="material-symbols-outlined text-primary text-[16px]"
                              title="Direct Peer-to-Peer Verified"
                            >
                              verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-secondary">
                          Country: {partner.country} • CPO/eMSP ID:{' '}
                          <span className="font-mono">{partner.cpoId}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-on-surface">
                        {partner.role}
                      </span>
                      <span className="font-mono text-[11px] text-secondary">
                        {partner.protocol}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1 max-w-md text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                        LOC: {partner.moduleHealth.locations}{' '}
                        <span className="text-primary font-bold">✓</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                        TAR: {partner.moduleHealth.tariffs}{' '}
                        <span className="text-primary font-bold">✓</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold font-mono">
                        SESS: {partner.moduleHealth.sessions}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                        CDR: {partner.moduleHealth.cdrs}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono">
                        TOK: {partner.moduleHealth.tokens}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px]">
                        CMD: {partner.moduleHealth.cmdLatency}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-on-surface font-mono">
                        {partner.throughputReqSec} req/s
                      </span>
                      <span className="text-[11px] text-secondary">{partner.errorStats}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        partner.status === 'Live / Healthy'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          partner.status === 'Live / Healthy' ? 'bg-primary' : 'bg-secondary animate-pulse'
                        }`}
                      ></span>
                      {partner.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onShowToast(`Inspecting OCPI 2.2.1 registered endpoints for ${partner.name}.`, 'info')}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors"
                      >
                        Endpoints
                      </button>
                      <button
                        onClick={() => handleHandshake(partner.name)}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary text-[11px] font-semibold transition-colors"
                      >
                        Handshake
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 bg-surface-container-lowest flex items-center justify-between text-[11px] text-secondary border-t border-surface-container">
          <span>Showing {filteredPartners.length} of 14 peer connections</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded bg-surface-container text-on-surface disabled:opacity-50" disabled>
              Previous
            </button>
            <span className="px-2 py-1 bg-primary text-on-primary rounded font-bold font-mono">
              1
            </span>
            <button className="px-2 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high">
              2
            </button>
            <button className="px-2 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high">
              3
            </button>
            <button className="px-2 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high">
              Next
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Bento Grid: OCPP Gateway Config + Payment Rails */}
      {(activeTab === 'all' || activeTab === 'ocpp' || activeTab === 'payments') && (
        <div className={activeTab === 'all' ? "grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn" : "flex flex-col gap-5 animate-fadeIn"}>
          {/* OCPP Gateway & Broker Panel */}
          {(activeTab === 'all' || activeTab === 'ocpp') && (
            <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'w-full'} bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between gap-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">router</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-on-surface">OCPP Charger Broker Central</h3>
                <span className="text-[11px] text-secondary">WebSocket Central System Core</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Cluster Nominal
            </span>
          </div>

          {/* Endpoint Box */}
          <div className="bg-surface-container rounded-xl p-3.5 flex flex-col gap-1.5 border border-outline-variant/20">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-secondary uppercase tracking-wider">
                Production WebSocket URI
              </span>
              <span className="text-primary font-semibold font-mono">TLS 1.3 Strict Mutual Auth</span>
            </div>
            <div className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-2.5 border border-outline-variant/20">
              <code className="font-mono text-[12px] text-on-surface select-all truncate">
                wss://ocpp.gateway.chargeone.energy/v201/central
              </code>
              <button
                onClick={() => copyToClipboard('wss://ocpp.gateway.chargeone.energy/v201/central')}
                className="p-1 rounded hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
                title="Copy URI"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {copiedEndpoint ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Protocol Distribution + Live Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col justify-between border border-outline-variant/20">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                Live Load
              </span>
              <div className="mt-2">
                <span className="text-[22px] font-bold text-on-surface font-mono">1,420</span>
                <span className="text-[11px] text-secondary block">JSON-RPC / sec</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col justify-between border border-outline-variant/20">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                OCPP 2.0.1 (Next Gen)
              </span>
              <div className="mt-2">
                <span className="text-[22px] font-bold text-primary font-mono">68%</span>
                <span className="text-[11px] text-secondary block font-mono">10,078 Chargers</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col justify-between border border-outline-variant/20">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                OCPP 1.6 JSON
              </span>
              <div className="mt-2">
                <span className="text-[22px] font-bold text-secondary font-mono">32%</span>
                <span className="text-[11px] text-secondary block font-mono">4,742 Legacy HW</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
          </div>

          {/* Security Profiles Active */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
              Active Broker Security Profiles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified_user
                  </span>
                  <span className="text-[12px] text-on-surface font-medium">
                    Profile 3 (Client Cert / mTLS)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-primary font-mono">Enforced (84%)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
                  <span className="text-[12px] text-on-surface font-medium">
                    Profile 2 (Basic Auth + TLS)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-secondary font-mono">Allowed (16%)</span>
              </div>
            </div>
            </div>
            </div>
          )}

          {/* Payment Gateway & Roaming Clearing Rail Integrations */}
          {(activeTab === 'all' || activeTab === 'payments') && (
            <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'w-full'} bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between gap-4`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-on-surface">Clearing &amp; Payment Rails</h3>
                  <span className="text-[11px] text-secondary">eMSP Financial Orchestration</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-primary font-mono">0.01% Err Rate</span>
            </div>
            <p className="text-[12px] text-secondary mt-1">
              Direct API settlement pipelines for cross-network charging sessions.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Rail 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-on-surface text-[12px]">
                  ₹
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-on-surface block leading-tight">
                    Razorpay UPI AutoPay
                  </span>
                  <span className="text-[11px] text-secondary">Instant Mandate Clearing (India)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  Active · 99.98%
                </span>
                <span className="text-[11px] text-secondary block mt-0.5 font-mono">38ms hook</span>
              </div>
            </div>

            {/* Rail 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-on-surface text-[12px]">
                  €
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-on-surface block leading-tight">
                    Stripe Global SEPA / Card
                  </span>
                  <span className="text-[11px] text-secondary">Eurozone Direct Debit &amp; Cards</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  Active · 99.99%
                </span>
                <span className="text-[11px] text-secondary block mt-0.5 font-mono">52ms hook</span>
              </div>
            </div>

            {/* Rail 3 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-on-surface text-[12px]">
                  AD
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-on-surface block leading-tight">
                    Adyen Corporate Fleet
                  </span>
                  <span className="text-[11px] text-secondary">Commercial B2B Tokenized Cards</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  Active · 99.95%
                </span>
                <span className="text-[11px] text-secondary block mt-0.5 font-mono">44ms hook</span>
              </div>
            </div>

            {/* Rail 4 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                </div>
                <div>
                  <span className="text-[13px] font-semibold text-on-surface block leading-tight">
                    Unified Settlement API
                  </span>
                  <span className="text-[11px] text-secondary">Hubject OpenCDR Direct Clearing</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  Active · Reconciled
                </span>
                <span className="text-[11px] text-secondary block mt-0.5 font-mono">Automated</span>
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-secondary border-t border-outline-variant/20">
            <span>Webhook delivery retry window: 3 attempts</span>
            <button
              onClick={() => onShowToast('Pinged 4 payment webhooks. All returned 200 OK.', 'success')}
              className="text-primary font-bold hover:underline"
            >
              Re-test Webhook Pings →
            </button>
            </div>
            </div>
          )}
        </div>
      )}

      {/* Live OCPI Handshake & Message Tracer Terminal */}
      {(activeTab === 'all' || activeTab === 'packets') && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col animate-fadeIn">
        {/* Terminal Header Bar */}
        <div className="p-4 bg-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-error"></span>
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span className="w-3 h-3 rounded-full bg-primary"></span>
            </div>
            <div className="flex items-center gap-2 ml-1">
              <span className="material-symbols-outlined text-[18px] text-secondary">terminal</span>
              <span className="text-[13px] font-bold text-on-surface">
                Live OCPI &amp; OCPP Message Tracer
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-mono text-[10px] font-bold">
                STREAMING
              </span>
            </div>
          </div>

          {/* Tracer Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-secondary">
                filter_list
              </span>
              <input
                value={tracerFilter}
                onChange={(e) => setTracerFilter(e.target.value)}
                className="h-8 pl-7 pr-3 bg-surface-container-lowest text-on-surface placeholder:text-secondary rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-56 border border-outline-variant/20"
                placeholder="Trace ID or Partner..."
                type="text"
              />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="h-8 px-2 bg-surface-container-lowest text-on-surface rounded text-[11px] font-medium focus:outline-none border border-outline-variant/20"
            >
              <option value="all">All Modules (Locations, CDR, Commands)</option>
              <option value="commands">Commands Only (Start/Stop)</option>
              <option value="cdrs">CDRs Only</option>
              <option value="ocpp">OCPP JSON-RPC Central</option>
            </select>
            <button
              onClick={() => setIsStreamPaused(!isStreamPaused)}
              className="flex items-center gap-1 h-8 px-3 rounded bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-[12px] font-medium transition-colors border border-outline-variant/20"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isStreamPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{isStreamPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={() => {
                setLogs([]);
                onShowToast('Tracer console cleared.', 'info');
              }}
              className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container-lowest"
              title="Clear Console"
            >
              <span className="material-symbols-outlined text-[18px]">clear_all</span>
            </button>
          </div>
        </div>

        {/* Terminal Body / Stream Feed */}
        <div className="p-4 bg-inverse-surface text-inverse-on-surface font-mono text-[12px] max-h-96 overflow-y-auto flex flex-col gap-2 select-text no-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-secondary-fixed-dim">
              No messages match filter. Stream listening for inbound JSON-RPC frames...
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-baseline gap-2 hover:bg-white/5 p-1 rounded transition-colors animate-fadeIn"
              >
                <span className="text-tertiary-fixed-dim shrink-0">{log.time}</span>
                <span
                  className={`px-1.5 py-0.5 rounded shrink-0 text-[10px] font-bold ${
                    log.proto.includes('OCPI')
                      ? 'bg-primary/30 text-primary-fixed'
                      : 'bg-secondary/30 text-secondary-fixed-dim'
                  }`}
                >
                  {log.proto}
                </span>
                <span className="text-secondary-fixed shrink-0 font-medium">{log.method}</span>
                <span className="text-primary-fixed shrink-0 font-bold">[{log.status}]</span>
                <span className="text-on-secondary truncate">{log.body}</span>
                <span className="text-secondary-fixed-dim shrink-0 text-[10px] ml-auto">
                  {log.traceId}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Terminal Footer Status */}
        <div className="px-4 py-2 bg-surface-container flex items-center justify-between text-secondary text-[11px] border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-on-surface font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Ingestion Queue: 0 backed up
            </span>
            <span>•</span>
            <span>Filter: {tracerFilter || moduleFilter !== 'all' ? 'Active' : 'None'}</span>
          </div>
          <span className="font-mono text-on-surface font-medium">
            Central WSS Socket: 14,820 live handshakes
          </span>
        </div>
      </div>
      )}

      {/* Add Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-lg w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">hub</span>
                <h3 className="text-[18px] font-bold text-on-surface">Add OCPI Roaming Partner</h3>
              </div>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-secondary block mb-1">
                  Partner Brand Name
                </label>
                <input
                  required
                  placeholder="e.g. Enel X Way, Fastned, Electrify America"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-secondary block mb-1">Country</label>
                  <select
                    value={newPartnerCountry}
                    onChange={(e) => setNewPartnerCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
                  >
                    <option>India (IN)</option>
                    <option>Global (GLOBAL)</option>
                    <option>European Union (EU)</option>
                    <option>United States (US)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-secondary block mb-1">Protocol</label>
                  <select
                    value={newPartnerProtocol}
                    onChange={(e) => setNewPartnerProtocol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
                  >
                    <option>OCPI 2.2.1-FULL</option>
                    <option>OCPI 2.2.1-BROKER</option>
                    <option>OCPI 2.1.1 Legacy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-secondary block mb-1">Integration Role</label>
                <select
                  value={newPartnerRole}
                  onChange={(e) => setNewPartnerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
                >
                  <option>Bilateral Peer (CPO + eMSP)</option>
                  <option>Bilateral Peer (eMSP Only)</option>
                  <option>Inbound CPO Peer</option>
                  <option>Clearinghouse Hub</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-semibold hover:bg-primary-container transition-colors shadow-xs"
                >
                  Register &amp; Handshake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Endpoint Modal */}
      {showRegisterEndpointModal && (
        <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-lg w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">router</span>
                <h3 className="text-[18px] font-bold text-on-surface">Register OCPP Broker Cluster Endpoint</h3>
              </div>
              <button
                onClick={() => setShowRegisterEndpointModal(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-secondary mb-4">
              Add a new regional WebSocket gateway for ingestion of OCPP 2.0.1 / 1.6-J charger connections.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-secondary block mb-1">
                  Cluster Region / Provider
                </label>
                <input
                  defaultValue="ap-south-1 (Mumbai, India GCP)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-secondary block mb-1">
                  Public WebSocket FQDN
                </label>
                <input
                  defaultValue="wss://ocpp-mumbai.gateway.chargeone.energy/v201"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
                <button
                  onClick={() => setShowRegisterEndpointModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRegisterEndpointModal(false);
                    onShowToast('New OCPP broker endpoint registered and health-checked.', 'success');
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-semibold hover:bg-primary-container transition-colors shadow-xs"
                >
                  Provision Cluster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
