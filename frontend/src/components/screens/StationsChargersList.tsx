import React, { useState } from 'react';
import { ChargerNode, ScreenId } from '../../types';
import { INITIAL_CHARGERS } from '../../data/mockData';

interface StationsChargersListProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenProvisionModal: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAiDrawer?: (query?: string) => void;
}

export const StationsChargersList: React.FC<StationsChargersListProps> = ({
  onNavigate,
  onOpenProvisionModal,
  onShowToast,
  onOpenAiDrawer,
}) => {
  const [filter, setFilter] = useState<'all' | 'dc' | 'ac'>('all');
  const [search, setSearch] = useState('');
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [groundingSearch, setGroundingSearch] = useState('Indiranagar Bangalore EV ultra-fast charging stations');
  const [groundedPlaces, setGroundedPlaces] = useState<Array<{ title: string; uri: string; reviewSnippets?: string[] }>>([]);
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);

  const handleRunGrounding = async (qText?: string) => {
    const q = (qText || groundingSearch).trim();
    if (!q) return;
    setIsGroundingLoading(true);
    onShowToast(`Grounding '${q}' with live Google Maps...`, 'info');
    try {
      const res = await fetch('/api/stations/ground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
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

  const chargers = INITIAL_CHARGERS;

  const filteredChargers = chargers.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.vendor.toLowerCase().includes(search.toLowerCase()) ||
      c.model.toLowerCase().includes(search.toLowerCase()) ||
      c.ip.toLowerCase().includes(search.toLowerCase()) ||
      c.connectors.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'dc' && !c.connectors.toLowerCase().includes('ccs') && !c.architecture.includes('800V')) return false;
    if (filter === 'ac' && !c.connectors.toLowerCase().includes('type 2') && !c.connectors.toLowerCase().includes('ac') && c.maxPowerKw > 44) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              Infrastructure Asset Catalog
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium font-mono">1,420 Active Sockets</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Stations &amp; Chargers Fleet
          </h1>
          <p className="text-[13px] text-secondary">
            Manage deployed EVSE dispensers, OCPP protocol gateways, and high-voltage power electronics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsGroundingOpen(!isGroundingOpen)}
            className="px-3 sm:px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
            title="Explore Live Google Maps EV charging hubs"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">pin_drop</span>
            <span>Google Maps Grounding</span>
          </button>
          <button
            onClick={() => onShowToast('Exported fleet hardware specification manifest (JSON/CSV).', 'success')}
            className="px-3 sm:px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Inventory</span>
          </button>
          <button
            onClick={onOpenProvisionModal}
            className="px-3.5 sm:px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Provision Charger</span>
          </button>
        </div>
      </div>

      {/* Expandable Google Maps Grounding Explorer */}
      {isGroundingOpen && (
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-emerald-500/40 flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-on-surface">
                  Google Maps Grounding • Live EV Station Intelligence
                </h3>
                <span className="text-[11px] text-secondary font-mono">
                  Powered by gemini-3.5-flash with googleMaps tool
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAiDrawer?.(groundingSearch)}
                className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span>Open in AI Chat</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>
              <button
                onClick={() => setIsGroundingOpen(false)}
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={groundingSearch}
                onChange={(e) => setGroundingSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunGrounding()}
                placeholder="Search real EV charging hubs or highway corridors on Google Maps..."
                className="w-full h-10 px-3.5 bg-surface-container rounded-lg text-[13px] text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => handleRunGrounding()}
              disabled={isGroundingLoading}
              className="w-full sm:w-auto px-4 h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isGroundingLoading ? 'sync' : 'near_me'}
              </span>
              <span>{isGroundingLoading ? 'Searching...' : 'Ground on Maps'}</span>
            </button>
          </div>

          {/* Quick Grounded results */}
          {groundedPlaces.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-outline-variant/20">
              {groundedPlaces.map((place, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[12px] font-bold text-on-surface line-clamp-2">
                        {place.title}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                    </div>
                    {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                      <p className="text-[10px] text-secondary italic mt-1 line-clamp-2">
                        &ldquo;{place.reviewSnippets[0]}&rdquo;
                      </p>
                    )}
                  </div>
                  {place.uri && (
                    <a
                      href={place.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-start inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[13px]">navigation</span>
                      <span>Open in Google Maps</span>
                      <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
            Total Nameplate Capacity
          </span>
          <div className="text-[26px] font-bold text-on-surface font-mono mt-2">124.6 MW</div>
          <span className="text-[11px] text-primary font-bold mt-1">High-voltage DC Ultra-Fast</span>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
            Online Availability
          </span>
          <div className="text-[26px] font-bold text-primary font-mono mt-2">99.4%</div>
          <span className="text-[11px] text-secondary font-medium mt-1">318 of 318 connected</span>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
            Average Power Delivery
          </span>
          <div className="text-[26px] font-bold text-on-surface font-mono mt-2">184.2 kW</div>
          <span className="text-[11px] text-secondary font-medium mt-1">800V Architecture</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20"
              placeholder="Search station name, vendor, IP or model..."
              type="text"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-surface-container p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                filter === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              All Hardware (318)
            </button>
            <button
              onClick={() => setFilter('dc')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                filter === 'dc'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              DC Fast Only
            </button>
            <button
              onClick={() => setFilter('ac')}
              className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                filter === 'ac'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              AC Type 2
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left font-body-sm text-[13px]">
            <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">Node ID &amp; Location</th>
                <th className="py-3 px-4">Vendor &amp; Model</th>
                <th className="py-3 px-4">Power Rating</th>
                <th className="py-3 px-4">Protocol &amp; IP</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filteredChargers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary text-[13px]">
                    No charging nodes match "{search}" for {filter === 'all' ? 'All Hardware' : filter.toUpperCase()}.
                  </td>
                </tr>
              ) : (
                filteredChargers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onNavigate('live-telemetry-health')}
                    className="hover:bg-surface-container/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-primary font-mono">{c.id}</span>
                      <span className="block text-[11px] text-secondary">
                        Indiranagar Hub • Bay 02
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{c.name}</div>
                      <div className="text-[11px] text-secondary">{c.connectors}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-on-surface">{c.maxPowerKw} kW DC</div>
                      <div className="text-[11px] text-primary font-semibold">{c.architecture}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px]">
                      <span className="font-bold text-on-surface">{c.ocppVersion}</span>
                      <span className="block text-secondary text-[11px]">{c.ip}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.status === 'Charging'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : c.status === 'Thermal Warn'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-primary-fixed text-on-primary-fixed'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onNavigate('live-telemetry-health')}
                        className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Inspect Node →
                      </button>
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
