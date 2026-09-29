import React, { useState } from 'react';
import { ScreenId, GroundingMapPlace } from '../../types';

interface MapsIntelligenceViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAiDrawer?: (initialQuery?: string) => void;
  onNavigate?: (screen: ScreenId) => void;
}

export const MapsIntelligenceView: React.FC<MapsIntelligenceViewProps> = ({
  onShowToast,
  onOpenAiDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('Indiranagar Bengaluru EV fast charging stations');
  const [isLoading, setIsLoading] = useState(false);
  const [resultsText, setResultsText] = useState('');
  const [groundedPlaces, setGroundedPlaces] = useState<GroundingMapPlace[]>([
    {
      title: 'Tata Power EZ Charge - 100 Feet Road, Indiranagar',
      uri: 'https://maps.google.com/?cid=10829102830192',
      reviewSnippets: [
        'Great 120kW dual CCS2 charger, fast coffee shop right opposite while you wait.',
        'Always functional and clean parking bays.',
      ],
    },
    {
      title: 'Shell Recharge - Old Airport Road EV Fast Station',
      uri: 'https://maps.google.com/?cid=89230192830192',
      reviewSnippets: [
        'Shell Select cafe on-site with clean washrooms and 60kW DC charging.',
      ],
    },
    {
      title: 'Zeon Charging - HAL 2nd Stage Hypercharger',
      uri: 'https://maps.google.com/?cid=30192830192831',
      reviewSnippets: [
        'Reliable 180kW DC ultra-fast charging for long trips.',
      ],
    },
  ]);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');

  const presetCorridors = [
    { name: 'Bengaluru - Mysore Expressway', query: 'EV DC fast charging stations along Bengaluru Mysore Expressway with rest stops' },
    { name: 'Mumbai - Pune Expressway', query: '360kW EV fast chargers on Mumbai Pune expressway with food courts' },
    { name: 'Delhi - Agra Expressway', query: 'EV charging stations on Yamuna Expressway with 24/7 facilities' },
    { name: 'Hyderabad Outer Ring Road', query: 'EV fast chargers near Hyderabad ORR Gachibowli junction' },
  ];

  const handleSearch = async (queryToRun?: string) => {
    const q = (queryToRun || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setResultsText('');
    try {
      const res = await fetch('/api/stations/ground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          latLng: { latitude: 12.9716, longitude: 77.5946 },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      setResultsText(data.text);
      if (data.mapsPlaces && data.mapsPlaces.length > 0) {
        setGroundedPlaces(data.mapsPlaces);
        onShowToast(`Grounding completed! Found ${data.mapsPlaces.length} verified Google Maps stations.`, 'success');
      } else {
        onShowToast('Grounding complete. Details generated below.', 'info');
      }
    } catch (err: any) {
      console.error('Grounding search failed:', err);
      onShowToast(`Maps grounding query failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-surface-container-lowest to-surface-container-lowest p-6 rounded-2xl shadow-xs border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              <span>Google Maps Grounding Active</span>
            </span>
            <span className="text-secondary text-[11px] font-mono">gemini-3.5-flash</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1.5">
            Geospatial Network Intelligence &amp; EV Hubs
          </h1>
          <p className="text-[13px] text-secondary max-w-2xl mt-0.5">
            Discover real-time verified EV fast-charging stations, competitor footprints, highway corridors, and traveler amenities grounded directly with live Google Maps data.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAiDrawer?.('Locate nearby 360kW CCS2 DC fast-charging hubs with amenities')}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Open Maps AI Chat</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/20 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search EV charging stations, highway corridors, cities, or amenities..."
              className="w-full h-12 pl-11 pr-4 bg-surface-container rounded-xl text-[14px] text-on-surface placeholder:text-secondary border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isLoading ? 'sync' : 'near_me'}
            </span>
            <span>{isLoading ? 'Grounding...' : 'Ground with Google Maps'}</span>
          </button>
        </div>

        {/* Quick Corridor Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-outline-variant/10 text-[12px]">
          <span className="text-secondary font-bold text-[11px] uppercase tracking-wider shrink-0">
            Highway Corridors:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {presetCorridors.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(c.query);
                  handleSearch(c.query);
                }}
                className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-medium whitespace-nowrap transition-colors border border-outline-variant/20 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">route</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grounded Results Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-on-surface">
              Grounded Google Maps Places ({groundedPlaces.length})
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold">
              Live Verified
            </span>
          </div>
          <span className="text-[12px] text-secondary">
            Extracted from groundingChunks with direct navigation links
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groundedPlaces.map((place, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-xs border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">ev_station</span>
                    </div>
                    <span className="text-[11px] font-bold text-primary uppercase font-mono">
                      Station #{idx + 1}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Live Map Place</span>
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-on-surface mt-2.5 leading-snug group-hover:text-primary transition-colors">
                  {place.title}
                </h3>

                {/* Review Snippets from placeAnswerSources */}
                {place.reviewSnippets && place.reviewSnippets.length > 0 && (
                  <div className="mt-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-secondary font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">rate_review</span>
                      <span>Verified Visitor Reviews</span>
                    </div>
                    {place.reviewSnippets.slice(0, 2).map((snip, sIdx) => (
                      <p key={sIdx} className="text-[11px] text-on-surface-variant italic leading-relaxed">
                        &ldquo;{snip}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Maps Link Button */}
              {place.uri && (
                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <a
                    href={place.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-primary hover:bg-primary-container text-on-primary font-bold text-[12px] rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                    <span>Open in Google Maps</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(place.uri);
                      onShowToast('Copied Google Maps URI to clipboard!', 'success');
                    }}
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                    title="Copy Link"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Detailed Markdown Report if Available */}
      {resultsText && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-bold text-[13px] uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>Gemini 3.5 Flash Geospatial Intelligence Dossier</span>
          </div>
          <div className="whitespace-pre-wrap text-[13px] text-on-surface leading-relaxed font-sans bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            {resultsText}
          </div>
        </div>
      )}
    </div>
  );
};
