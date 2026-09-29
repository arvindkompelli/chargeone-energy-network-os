import React, { useState } from 'react';
import { ChargerNode } from '../../types';
import { INITIAL_CHARGERS, FIELD_TECH_IMAGE_URL, BENGALURU_MAP_URL } from '../../data/mockData';

interface LiveTelemetryHealthProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const LiveTelemetryHealth: React.FC<LiveTelemetryHealthProps> = ({ onShowToast }) => {
  const [chargers, setChargers] = useState<ChargerNode[]>(INITIAL_CHARGERS);
  const [selectedChargerId, setSelectedChargerId] = useState<string>('CH-BLR-089-B');
  const [protocolFilter, setProtocolFilter] = useState<'All' | 'OCPP 2.0.1' | 'OCPP 1.6J'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Charging' | 'Faulted' | 'Thermal Alert'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCharger =
    chargers.find((c) => c.id === selectedChargerId) || chargers[0];

  const handleRemoteCommand = (cmd: 'start' | 'stop' | 'unlock' | 'reboot' | 'dump') => {
    switch (cmd) {
      case 'start':
        onShowToast(`Dispatched OCPP 2.0.1 RequestStartTransaction to ${selectedCharger.id} (EVSE 1).`, 'success');
        break;
      case 'stop':
        onShowToast(`Emergency RemoteStopTransaction dispatched to ${selectedCharger.id}. Solenoid disengaged.`, 'error');
        setChargers((prev) =>
          prev.map((c) => (c.id === selectedCharger.id ? { ...c, status: 'Finishing', activePowerKw: 0 } : c))
        );
        break;
      case 'unlock':
        onShowToast(`Connector unlock solenoid pulse executed for ${selectedCharger.id} Gun 1.`, 'info');
        break;
      case 'reboot':
        onShowToast(`Soft reboot sequence initialized for ${selectedCharger.id}. Re-attaching TLS WebSocket...`, 'info');
        break;
      case 'dump':
        onShowToast(`Initiated diagnostic memory core dump upload via Secure FTP / HTTPS.`, 'success');
        break;
    }
  };

  const filteredChargers = chargers.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ip.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (protocolFilter !== 'All' && c.ocppVersion !== protocolFilter) return false;
    if (statusFilter === 'Charging' && c.status !== 'Charging') return false;
    if (statusFilter === 'Faulted' && c.status !== 'Faulted') return false;
    if (statusFilter === 'Thermal Alert' && c.status !== 'Thermal Warn') return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Banner & Batch Diagnostics */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              STREAMING TELEMETRY
            </span>
            <span className="text-[11px] text-secondary tracking-wider uppercase font-bold">
              Node Telemetry Mesh
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight">
            Charger Telemetry &amp; Hardware Health
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-3xl">
            Real-time OCPP 1.6J / 2.0.1 diagnostics, voltage/current telemetry, thermal curves, and remote command triggers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => onShowToast('Compiling diagnostic bundle across 318 active nodes (JSON logs + hardware registers)...', 'info')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-[13px] font-medium shadow-xs border border-outline-variant/20 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">download</span>
            <span>Diagnostic Bundle</span>
          </button>
          <button
            onClick={() => onShowToast('Mass heartbeat dispatched to 318 nodes. 100% replied in <22ms.', 'success')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-[13px] font-medium shadow-xs border border-outline-variant/20 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">network_ping</span>
            <span>Mass Heartbeat</span>
          </button>
          <button
            onClick={() => onShowToast('Rebooting 2 inactive/hung hardware controllers...', 'error')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error-container text-on-error-container hover:opacity-90 text-[13px] font-semibold shadow-xs transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reboot Inactive</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Protocol Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-secondary">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface text-on-surface text-[13px] placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-xs border border-outline-variant/20"
              placeholder="Search Charger ID, site, IP, EVSE..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-outline-variant/20">
            {(['All', 'OCPP 2.0.1', 'OCPP 1.6J'] as const).map((proto) => (
              <button
                key={proto}
                onClick={() => setProtocolFilter(proto)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                  protocolFilter === proto
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {proto === 'All' ? 'All Protocols' : proto}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-outline-variant/20">
            <span className="px-2 text-[11px] text-secondary font-medium">Status:</span>
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'All'
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              All (318)
            </button>
            <button
              onClick={() => setStatusFilter('Charging')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'Charging'
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Charging (194)
            </button>
            <button
              onClick={() => setStatusFilter('Faulted')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'Faulted'
                  ? 'bg-error-container text-on-error-container'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Faulted (3)
            </button>
            <button
              onClick={() => setStatusFilter('Thermal Alert')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'Thermal Alert'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Thermal Alert (2)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface text-on-surface-variant text-[11px] shadow-xs border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Live 1s interval • Pulse active</span>
          </div>
          <button
            onClick={() => onShowToast('Sensor sampling interval configured to 1000ms (120Hz bus ingestion).', 'info')}
            className="p-2 rounded-lg bg-surface hover:bg-surface-container text-secondary hover:text-on-surface shadow-xs transition-colors border border-outline-variant/20"
            title="Telemetry Configuration"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/20 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[10px] uppercase font-bold tracking-wider">Monitored Nodes</span>
            <span className="material-symbols-outlined text-[20px] text-primary">router</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface font-mono">318</span>
            <span className="text-[11px] text-primary font-bold">100% ONLINE</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-secondary text-[11px]">
            <span>Active EVSE Ports: 636</span>
            <span className="text-primary font-bold font-mono">99.98% SLA</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/20 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[10px] uppercase font-bold tracking-wider">Gateway Latency</span>
            <span className="material-symbols-outlined text-[20px] text-tertiary">speed</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface font-mono">16</span>
            <span className="text-[16px] text-secondary font-medium font-mono">ms</span>
            <span className="ml-auto inline-flex items-center text-primary text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span> -2ms
            </span>
          </div>
          <div className="mt-2 text-secondary text-[11px]">
            <span>WS Ack: 99.4% &lt; 25ms</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/20 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[10px] uppercase font-bold tracking-wider">Grid Frequency</span>
            <span className="material-symbols-outlined text-[20px] text-primary">waves</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface font-mono">50.02</span>
            <span className="text-[16px] text-secondary font-medium font-mono">Hz</span>
            <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              STABLE
            </span>
          </div>
          <div className="mt-2 text-secondary text-[11px]">
            <span>Delta: +0.02 Hz · 3-Phase Phase Lock</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant/20 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-[10px] uppercase font-bold tracking-wider">Power Factor</span>
            <span className="material-symbols-outlined text-[20px] text-primary">offline_bolt</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface font-mono">0.98</span>
            <span className="text-[13px] text-secondary font-medium font-mono">cos φ</span>
            <span className="ml-auto text-primary text-[11px] font-bold">Optimal</span>
          </div>
          <div className="mt-2 text-secondary text-[11px]">
            <span>Reactive load compensation: active</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-error-container text-on-error-container shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">Thermal Warnings</span>
            <span className="material-symbols-outlined text-[20px] text-error">thermostat</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[32px] font-bold font-mono">2</span>
            <span className="text-[13px] font-medium">units &gt; 62°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="truncate">CH-MUM-104-A / CH-BLR</span>
            <button
              onClick={() => onShowToast('Auto thermal de-rate (20%) enforced on CH-MUM-104-A & CH-BLR-089.', 'error')}
              className="font-bold underline cursor-pointer hover:opacity-80"
            >
              De-rate 20%
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Fleet Matrix + Live 800V Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Hardware Fleet Matrix Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold text-on-surface">Hardware Fleet Matrix</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-[11px] font-bold text-secondary font-mono">
                318 online nodes
              </span>
            </div>
            <div className="flex items-center gap-2 text-secondary text-[11px]">
              <span>Sort by:</span>
              <button className="font-bold text-on-surface underline">Criticality</button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-[13px]">
                <thead>
                  <tr className="bg-surface-container-low text-secondary text-[10px] font-bold uppercase tracking-wider border-b border-surface-container">
                    <th className="py-2.5 px-3">NODE &amp; HW MODEL</th>
                    <th className="py-2.5 px-3">CONNECTOR / RATING</th>
                    <th className="py-2.5 px-3">LIVE POWER &amp; 3-PHASE</th>
                    <th className="py-2.5 px-3">THERMAL MESH</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {filteredChargers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-secondary text-[13px]">
                        No charger nodes match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredChargers.map((node) => {
                      const isSelected = selectedChargerId === node.id;
                      return (
                        <tr
                          key={node.id}
                          onClick={() => setSelectedChargerId(node.id)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-surface-container-high/60 border-l-4 border-l-primary'
                              : 'hover:bg-surface-container/40'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-2">
                              <span
                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  node.status === 'Charging'
                                    ? 'bg-primary animate-pulse'
                                    : node.status === 'Thermal Warn'
                                    ? 'bg-amber-500 animate-ping'
                                    : 'bg-primary'
                                }`}
                              ></span>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-on-surface">
                                  {node.id}
                                </span>
                                <span className="text-secondary text-[11px]">{node.name}</span>
                                <span className="text-secondary text-[10px] font-mono">
                                  {node.ocppVersion} • {node.ip}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 font-semibold text-on-surface text-[12px]">
                                <span className="material-symbols-outlined text-[15px] text-primary">
                                  bolt
                                </span>{' '}
                                {node.connectors}
                              </span>
                              <span className="text-secondary text-[11px]">{node.ratingDesc}</span>
                              {node.activeSessionMinutes && (
                                <span className="text-primary text-[10px] font-bold font-mono">
                                  Active Session: {node.activeSessionMinutes}m
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="text-[16px] font-bold text-primary font-mono">
                                {node.activePowerKw.toFixed(1)} kW
                              </span>
                              <span className="text-secondary text-[10px] font-mono">
                                DC Bus: {node.busVoltageV}V @ {node.deliveryCurrentA}A
                              </span>
                              <span className="text-secondary text-[10px] font-mono">
                                L1: {node.phaseVoltages.l1}V | L2: {node.phaseVoltages.l2}V | L3:{' '}
                                {node.phaseVoltages.l3}V
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-0.5 text-[11px] font-mono">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-secondary">Bay:</span>
                                <span className="font-bold text-on-surface">{node.bayTempC}°C</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-secondary">Gun A:</span>
                                <span
                                  className={`font-bold ${
                                    node.gunATempC > 60 ? 'text-amber-700' : 'text-on-surface'
                                  }`}
                                >
                                  {node.gunATempC}°C {node.gunATempC > 60 ? '(High)' : ''}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-secondary">Gun B:</span>
                                <span className="font-bold text-on-surface">{node.gunBTempC}°C</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-max ${
                                  node.status === 'Charging'
                                    ? 'bg-primary-fixed text-on-primary-fixed'
                                    : node.status === 'Thermal Warn'
                                    ? 'bg-amber-100 text-amber-900'
                                    : node.status === 'Finishing'
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-primary-fixed text-on-primary-fixed'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    node.status === 'Charging' ? 'bg-primary' : 'bg-amber-500'
                                  }`}
                                ></span>
                                {node.status}
                              </span>
                              <span className="text-secondary text-[10px] font-mono">
                                Ack {node.lastAckMs}ms · 1s ago
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedChargerId(node.id)}
                                className={`p-1.5 rounded-lg shadow-xs transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface text-secondary hover:text-primary'
                                }`}
                                title="Inspect Live Hardware Telemetry"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                              <button
                                onClick={() => handleRemoteCommand('stop')}
                                className="p-1.5 rounded-lg bg-surface text-secondary hover:text-error hover:bg-surface-container shadow-xs"
                                title="Remote Stop Session"
                              >
                                <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-secondary border-t border-surface-container">
              <div className="flex items-center gap-3">
                <span>Showing {filteredChargers.length} of 318 Nodes</span>
                <span className="inline-block w-1 h-1 rounded-full bg-secondary"></span>
                <span>Packet drop rate: 0.001%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-xs font-semibold">
                  Previous
                </button>
                <span className="px-2.5 py-1 font-bold text-on-surface">Page 1 of 80</span>
                <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface shadow-xs font-semibold">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Sub-panels: 3-Phase Voltage Balance + Field Node Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">3-Phase Voltage Balance</span>
                <span className="text-[11px] text-primary font-bold">Sub-station Feed 4</span>
              </div>
              <div className="h-28 w-full flex items-end gap-3 pt-3">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-on-surface font-mono">232.4 V</span>
                  <div className="w-full bg-primary-container rounded-t h-20"></div>
                  <span className="text-[10px] text-secondary font-medium">Phase L1</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-on-surface font-mono">231.8 V</span>
                  <div className="w-full bg-primary-container rounded-t h-19"></div>
                  <span className="text-[10px] text-secondary font-medium">Phase L2</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-on-surface font-mono">230.9 V</span>
                  <div className="w-full bg-primary rounded-t h-18"></div>
                  <span className="text-[10px] text-secondary font-medium">Phase L3</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-tertiary font-mono">0.6%</span>
                  <div className="w-full bg-surface-container-high rounded-t h-6"></div>
                  <span className="text-[10px] text-secondary font-medium">Unbalance</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-bold text-on-surface">Field Node Operations</span>
                <span className="text-[11px] text-secondary font-medium">Active Dispatchers</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  className="w-14 h-14 rounded-xl object-cover shadow-xs border border-outline-variant/30"
                  alt="EV field maintenance engineer"
                  src={FIELD_TECH_IMAGE_URL}
                />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-on-surface">
                    Bengaluru Tech Corridor Hub
                  </span>
                  <span className="text-secondary text-[11px] leading-tight mt-0.5">
                    4 nodes undergoing load testing for 800V Porsche Taycan / Ioniq 5 fleets.
                  </span>
                  <span className="text-primary text-[11px] font-bold font-mono mt-1">
                    Technician ID: TECH-991 Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live 800V Node Inspector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 bg-inverse-surface text-inverse-on-surface rounded-2xl shadow-xl flex flex-col gap-4 border border-outline-variant/20">
            {/* Inspector Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary text-[10px] font-bold">
                    NODE INSPECTOR
                  </span>
                  <span className="text-[11px] text-tertiary-fixed font-mono font-medium">
                    {selectedCharger.ip}:9001
                  </span>
                </div>
                <h2 className="text-[20px] font-bold text-inverse-on-surface mt-1">
                  {selectedCharger.id}
                </h2>
                <span className="text-secondary-fixed-dim text-[12px]">
                  {selectedCharger.name} • FW: v4.8.2-r4
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-ping"></span>
                <span className="text-[11px] font-bold text-primary-fixed font-mono">
                  {selectedCharger.architecture}
                </span>
              </div>
            </div>

            {/* Instantaneous Output Power Gauge */}
            <div className="p-4 bg-inverse-surface/80 rounded-xl flex flex-col gap-2 border border-white/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-secondary-fixed-dim uppercase tracking-wider font-bold">
                  Active Instantaneous Output
                </span>
                <span className="text-primary-fixed font-semibold">Dispenser #1 (CCS2)</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[36px] font-black text-primary-fixed tracking-tight font-mono">
                    {selectedCharger.activePowerKw.toFixed(1)}
                  </span>
                  <span className="text-[18px] font-bold text-inverse-on-surface">kW</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-secondary-fixed-dim block">Power Target</span>
                  <span className="text-[13px] font-bold text-inverse-on-surface font-mono">
                    {selectedCharger.powerTargetKw.toFixed(1)} kW req
                  </span>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary-fixed h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedCharger.activePowerKw / selectedCharger.maxPowerKw) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-secondary-fixed-dim font-mono">
                <span>0 kW</span>
                <span>
                  Util:{' '}
                  {(
                    (selectedCharger.activePowerKw / selectedCharger.maxPowerKw) *
                    100
                  ).toFixed(1)}
                  %
                </span>
                <span>Cap: {selectedCharger.maxPowerKw} kW</span>
              </div>
            </div>

            {/* 4 Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-inverse-surface/60 flex flex-col border border-white/5">
                <span className="text-[11px] text-secondary-fixed-dim">Bus DC Voltage</span>
                <span className="text-[18px] font-bold text-inverse-on-surface font-mono mt-0.5">
                  {selectedCharger.busVoltageV}{' '}
                  <span className="text-[11px] font-normal text-secondary-fixed-dim">V DC</span>
                </span>
                <span className="text-[10px] text-primary-fixed mt-1">Target: 800V EV Reg</span>
              </div>

              <div className="p-3 rounded-lg bg-inverse-surface/60 flex flex-col border border-white/5">
                <span className="text-[11px] text-secondary-fixed-dim">DC Delivery Current</span>
                <span className="text-[18px] font-bold text-inverse-on-surface font-mono mt-0.5">
                  {selectedCharger.deliveryCurrentA}{' '}
                  <span className="text-[11px] font-normal text-secondary-fixed-dim">A</span>
                </span>
                <span className="text-[10px] text-secondary-fixed-dim mt-1">Limiter: Cable Temp</span>
              </div>

              <div className="p-3 rounded-lg bg-inverse-surface/60 flex flex-col border border-white/5">
                <span className="text-[11px] text-secondary-fixed-dim">Isolation Resistance</span>
                <span className="text-[18px] font-bold text-primary-fixed font-mono mt-0.5">
                  {selectedCharger.isolationResistanceMOhm}{' '}
                  <span className="text-[11px] font-normal text-secondary-fixed-dim">MΩ</span>
                </span>
                <span className="text-[10px] text-secondary-fixed-dim mt-1">Safe (Min: 1.0 MΩ)</span>
              </div>

              <div className="p-3 rounded-lg bg-inverse-surface/60 flex flex-col border border-white/5">
                <span className="text-[11px] text-secondary-fixed-dim">Coolant Loop Pressure</span>
                <span className="text-[18px] font-bold text-inverse-on-surface font-mono mt-0.5">
                  {selectedCharger.coolantPressureBar}{' '}
                  <span className="text-[11px] font-normal text-secondary-fixed-dim">bar</span>
                </span>
                <span className="text-[10px] text-primary-fixed mt-1 font-mono">
                  Pump RPM: {selectedCharger.pumpRpm}
                </span>
              </div>
            </div>

            {/* Thermal Sensors */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-secondary-fixed-dim uppercase tracking-wider font-bold">
                Thermal Sensors
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-inverse-surface/40 text-center border border-white/5">
                  <span className="text-[10px] text-secondary-fixed-dim block">Gun 1 Temp</span>
                  <span className="text-[16px] font-bold text-primary-fixed font-mono">
                    {selectedCharger.gunATempC}°C
                  </span>
                  <span className="text-[9px] text-secondary-fixed-dim block uppercase">Nominal</span>
                </div>
                <div className="p-2 rounded bg-inverse-surface/40 text-center border border-white/5">
                  <span className="text-[10px] text-secondary-fixed-dim block">Gun 2 Temp</span>
                  <span className="text-[16px] font-bold text-secondary-fixed-dim font-mono">
                    {selectedCharger.gunBTempC}°C
                  </span>
                  <span className="text-[9px] text-secondary-fixed-dim block uppercase">Ambient</span>
                </div>
                <div className="p-2 rounded bg-inverse-surface/40 text-center border border-white/5">
                  <span className="text-[10px] text-secondary-fixed-dim block">Power Modules</span>
                  <span
                    className={`text-[16px] font-bold font-mono ${
                      selectedCharger.powerModulesTempC > 60 ? 'text-amber-300' : 'text-primary-fixed'
                    }`}
                  >
                    {selectedCharger.powerModulesTempC}°C
                  </span>
                  <span className="text-[9px] text-amber-200 block uppercase">Cooling Stg 2</span>
                </div>
              </div>
            </div>

            {/* Telemetry & Anomaly Log */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-secondary-fixed-dim uppercase tracking-wider font-bold">
                Telemetry &amp; Anomaly Log
              </span>
              <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-surface-container-lowest/10 font-mono text-[11px] text-secondary-fixed-dim max-h-28 overflow-y-auto border border-white/5">
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-semibold">[WARN 14:22:04]</span>
                  <span className="text-inverse-on-surface">Grid voltage sag 224V L2 detected (Recovered in 180ms)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-primary-fixed font-semibold">[INFO 14:21:55]</span>
                  <span className="text-inverse-on-surface">Fan Stage 2 initiated for power bay module A-3</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-primary-fixed font-semibold">[INFO 14:18:12]</span>
                  <span className="text-inverse-on-surface">OCPP Authorization validated: RFID TAG #EA-991204</span>
                </div>
              </div>
            </div>

            {/* Remote Tele-Control Center Actions */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-secondary-fixed-dim uppercase tracking-wider font-bold">
                Remote Tele-Control Center
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRemoteCommand('start')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[12px] font-bold transition-colors shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Remote Start</span>
                </button>
                <button
                  onClick={() => handleRemoteCommand('stop')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-error hover:opacity-90 text-on-error text-[12px] font-bold transition-colors shadow-xs"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                  <span>Stop Session</span>
                </button>
                <button
                  onClick={() => handleRemoteCommand('unlock')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-inverse-surface/80 hover:bg-inverse-surface text-inverse-on-surface text-[12px] font-medium transition-colors border border-white/10"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-400">
                    lock_open
                  </span>
                  <span>Unlock Gun</span>
                </button>
                <button
                  onClick={() => handleRemoteCommand('reboot')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-inverse-surface/80 hover:bg-inverse-surface text-inverse-on-surface text-[12px] font-medium transition-colors border border-white/10"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
                    replay
                  </span>
                  <span>Soft Reboot</span>
                </button>
              </div>
              <button
                onClick={() => handleRemoteCommand('dump')}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-inverse-surface/90 hover:bg-inverse-surface text-secondary-fixed-dim hover:text-inverse-on-surface text-[11px] transition-colors border border-white/5"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Fetch Diagnostic Memory Dump via FTP/HTTPS</span>
              </button>
            </div>

            {/* OCPP JSON-RPC WebSocket Packet display */}
            <div className="flex flex-col gap-1 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-secondary-fixed-dim uppercase tracking-wider font-bold">
                  OCPP JSON-RPC WebSocket Packet
                </span>
                <span className="text-primary-fixed font-mono">Frame #8923</span>
              </div>
              <div className="p-2.5 rounded-lg bg-inverse-surface text-primary-fixed font-mono text-[10px] leading-relaxed break-all select-all shadow-inner overflow-x-auto border border-white/10">
                [2, "msg-8923", "MeterValues", &#123;"connectorId": 1, "transactionId": 40281, "meterValue": [&#123;"timestamp": "2025-05-15T14:32:00Z", "sampledValue": [&#123;"value": "{selectedCharger.activePowerKw.toFixed(1)}", "context": "Sample.Periodic", "measurand": "Power.Active.Import", "unit": "kW"&#125;, &#123;"value": "{selectedCharger.busVoltageV}", "measurand": "Voltage", "unit": "V"&#125;, &#123;"value": "{selectedCharger.deliveryCurrentA}", "measurand": "Current.Import", "unit": "A"&#125;]&#125;]&#125;]
              </div>
            </div>
          </div>

          {/* Substation Grid Node */}
          <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-on-surface">Substation Grid Node</span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-[11px] text-secondary font-bold font-mono">
                Transformer #4
              </span>
            </div>
            <div
              className="w-full h-32 bg-cover bg-center rounded-lg shadow-xs flex items-end p-2.5 border border-outline-variant/20"
              style={{ backgroundImage: `url('${BENGALURU_MAP_URL}')` }}
            >
              <div className="bg-surface/90 backdrop-blur-md px-3 py-1 rounded-md text-on-surface text-[11px] font-bold shadow-xs">
                Grid Ingestion: 11kV Step-down to 415V 3-Phase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
