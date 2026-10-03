import React, { useState, useEffect } from 'react';
import { ScreenId, ActiveSession } from '../../types';
import { INITIAL_CHARGERS, INITIAL_SESSIONS, INITIAL_SETTLEMENTS } from '../../data/mockData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectSession?: (session: ActiveSession) => void;
  onOpenAiDrawer?: (query?: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectSession,
  onOpenAiDrawer,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Overview / Operations Command Center', icon: 'dashboard', screen: 'overview-dashboard' as ScreenId },
    { label: 'Stations & Chargers Inventory', icon: 'ev_station', screen: 'stations-chargers' as ScreenId },
    { label: 'Geospatial Maps Intelligence & Live Hubs', icon: 'pin_drop', screen: 'maps-intelligence' as ScreenId },
    { label: 'Live Telemetry & Hardware Health', icon: 'monitoring', screen: 'live-telemetry-health' as ScreenId },
    { label: 'Charging Sessions Console', icon: 'electric_bolt', screen: 'charging-sessions' as ScreenId },
    { label: 'Tariffs & Pricing Engines', icon: 'price_change', screen: 'tariffs-pricing-engines' as ScreenId },
    { label: 'Revenue & Financials', icon: 'payments', screen: 'revenue-financials' as ScreenId },
    { label: 'Financial Settlement & Clearinghouse Ledger', icon: 'account_balance_wallet', screen: 'settlements-reconciliation' as ScreenId },
    { label: 'OCPI Network Roaming (v2.2.1)', icon: 'hub', screen: 'ocpi-network-roaming' as ScreenId },
    { label: 'OCPP Charger Gateway (Broker)', icon: 'router', screen: 'ocpp-charger-gateway' as ScreenId },
    { label: 'Fleet Monitoring & Policies', icon: 'directions_car', screen: 'fleet-monitoring-policies' as ScreenId },
    { label: 'EV Network Integration Center', icon: 'extension', screen: 'integration-center' as ScreenId },
    { label: 'Audit Logs & Security Console', icon: 'security', screen: 'audit-logs-security' as ScreenId },
    { label: 'Driver Mobile App Companion', icon: 'phone_iphone', screen: 'driver-mobile-view' as ScreenId },
  ];

  const matchingChargers = INITIAL_CHARGERS.filter(
    (c) =>
      c.id.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const matchingSessions = INITIAL_SESSIONS.filter(
    (s) =>
      s.id.toLowerCase().includes(query.toLowerCase()) ||
      s.vehicleModel.toLowerCase().includes(query.toLowerCase()) ||
      s.driverName.toLowerCase().includes(query.toLowerCase())
  );

  const matchingBatches = INITIAL_SETTLEMENTS.filter(
    (b) =>
      b.id.toLowerCase().includes(query.toLowerCase()) ||
      b.cpoName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-xs flex items-start justify-center pt-8 sm:pt-20 p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-xl w-full max-h-[85vh] overflow-hidden animate-scaleUp flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 flex items-center gap-3 border-b border-surface-container bg-surface-container-low">
          <span className="material-symbols-outlined text-[22px] text-primary">search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stations, chargers, active sessions, CPO batches, or commands..."
            className="w-full bg-transparent text-[14px] text-on-surface placeholder:text-secondary focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-3">
          {/* Quick Navigation */}
          <div>
            <div className="px-2.5 py-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
              Quick Navigation
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenAiDrawer?.();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 transition-colors group border border-emerald-500/20 mb-1"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    pin_drop
                  </span>
                  <span className="font-bold">Google Maps Grounding &amp; AI Intelligence</span>
                </div>
              </button>

              {quickNav
                .filter((nav) => nav.label.toLowerCase().includes(query.toLowerCase()))
                .map((nav) => (
                  <button
                    key={nav.screen}
                    onClick={() => {
                      onNavigate(nav.screen);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] text-on-surface hover:bg-surface-container transition-colors group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary group-hover:text-primary">
                      {nav.icon}
                    </span>
                    <span className="font-medium">{nav.label}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Chargers */}
          {matchingChargers.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
                Hardware Chargers ({matchingChargers.length})
              </div>
              <div className="space-y-0.5">
                {matchingChargers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('live-telemetry-health');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{c.id}</span>
                      <span className="text-secondary">{c.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-secondary">{c.maxPowerKw} kW DC</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Sessions */}
          {matchingSessions.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
                Live Sessions ({matchingSessions.length})
              </div>
              <div className="space-y-0.5">
                {matchingSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSession?.(s);
                      onNavigate('session-audit-dossier');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{s.id}</span>
                      <span className="text-on-surface font-medium">{s.vehicleModel}</span>
                      <span className="text-secondary text-[11px]">({s.driverName})</span>
                    </div>
                    <span className="text-[11px] font-mono text-primary font-bold">{s.currentSoc}% SoC</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clearing Batches */}
          {matchingBatches.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-secondary uppercase tracking-wider">
                Settlement Batches ({matchingBatches.length})
              </div>
              <div className="space-y-0.5">
                {matchingBatches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onNavigate('settlements-reconciliation');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[13px] text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">{b.id}</span>
                      <span className="text-on-surface font-medium">{b.cpoName}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold">₹{b.netPayable.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
