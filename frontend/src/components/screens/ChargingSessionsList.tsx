import React, { useState } from 'react';
import { ActiveSession, ScreenId } from '../../types';
import { INITIAL_SESSIONS } from '../../data/mockData';

interface ChargingSessionsListProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectSession: (session: ActiveSession) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ChargingSessionsList: React.FC<ChargingSessionsListProps> = ({
  onNavigate,
  onSelectSession,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'ocpi' | 'direct' | 'active'>('all');
  const [sessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.stationName.toLowerCase().includes(search.toLowerCase()) ||
      s.driverName.toLowerCase().includes(search.toLowerCase()) ||
      s.vehicleModel.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (protocolFilter === 'ocpi') return s.protocol.toLowerCase() === 'ocpi';
    if (protocolFilter === 'direct') return s.protocol.toLowerCase() === 'direct';
    if (protocolFilter === 'active') return s.status.toLowerCase() === 'charging';
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              OCPP / OCPI Transaction Core
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium font-mono">58 Active Streams</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Active &amp; Historical Charging Sessions
          </h1>
          <p className="text-[13px] text-secondary">
            Continuous energy flow telemetry, cryptographic CDR ledger, and driver authorization handshake records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Exported signed CDR dataset for accounting audit.', 'success')}
            className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CDRs</span>
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-surface-container">
          <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-lg">
            <button
              onClick={() => setProtocolFilter('all')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                protocolFilter === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              All Sessions ({sessions.length})
            </button>
            <button
              onClick={() => setProtocolFilter('active')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                protocolFilter === 'active'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Active Charging</span>
            </button>
            <button
              onClick={() => setProtocolFilter('ocpi')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                protocolFilter === 'ocpi'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              OCPI Roaming
            </button>
            <button
              onClick={() => setProtocolFilter('direct')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                protocolFilter === 'direct'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Direct App
            </button>
          </div>

          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20"
              placeholder="Filter session ID, driver, vehicle..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[840px] text-left font-body-sm text-[13px]">
            <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Station &amp; Charger</th>
                <th className="py-3 px-4">Driver &amp; Vehicle</th>
                <th className="py-3 px-4 text-right">Current SoC &amp; Power</th>
                <th className="py-3 px-4 text-right">Energy &amp; Cost</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-secondary text-[13px]">
                    No charging sessions match "{search}".
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      onSelectSession(s);
                      onNavigate('session-audit-dossier');
                    }}
                    className="hover:bg-surface-container/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-primary group-hover:underline">
                        {s.id}
                      </span>
                      <span className="block text-[10px] text-secondary font-mono">
                        {s.protocol} • {s.operator}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{s.stationName}</div>
                      <div className="text-[11px] text-secondary">{s.connectorType}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{s.vehicleModel}</div>
                      <div className="text-[11px] text-secondary">
                        {s.driverName} ({s.driverId})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-primary">{s.currentSoc}% SoC</div>
                      <div className="text-[11px] text-secondary">
                        {s.activePowerKw} kW {s.powerStatus}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-on-surface">{s.deliveredKwh} kWh</div>
                      <div className="text-[11px] text-primary font-bold">
                        ₹{s.costInr.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-secondary text-[12px]">{s.duration}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          s.status === 'Charging'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {s.status === 'Charging' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                        )}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[12px] font-bold text-primary group-hover:underline flex items-center justify-end gap-1">
                        <span>Inspect Dossier</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
