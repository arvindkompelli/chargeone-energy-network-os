import React, { useState } from 'react';

interface TariffsPricingViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TariffsPricingView: React.FC<TariffsPricingViewProps> = ({ onShowToast }) => {
  const [baseTariff, setBaseTariff] = useState(18.0);
  const [peakMultiplier, setPeakMultiplier] = useState(1.35);
  const [idleFeePerMin, setIdleFeePerMin] = useState(2.0);
  const [roamingMarkupPercent, setRoamingMarkupPercent] = useState(8.5);

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`Dynamic tariff schema updated and broadcast via OCPI 2.2.1 to roaming clearinghouses.`, 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              Dynamic Yield Engine
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium">OCPI Tariffs Module v2.2.1</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Tariffs &amp; Pricing Engines
          </h1>
          <p className="text-[13px] text-secondary">
            Configure time-of-day tariffs, spot utility grid index matching, idle penalty fees, and roaming markup splits.
          </p>
        </div>

        <button
          onClick={handleSaveTariff}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold shadow-xs transition-all"
        >
          Publish Tariff Matrix
        </button>
      </div>

      {/* Grid of pricing structures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Active Tariff Schedule */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
              Time-of-Day Rates
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              Peak Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <div className="flex justify-between items-center text-[13px] font-bold text-on-surface">
                <span>Off-Peak (23:00 - 07:00)</span>
                <span className="text-primary font-mono">₹14.50 / kWh</span>
              </div>
              <span className="text-[11px] text-secondary">Solar &amp; Wind curtailment window</span>
            </div>

            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
              <div className="flex justify-between items-center text-[13px] font-bold text-on-surface">
                <span>Standard (07:00 - 18:00)</span>
                <span className="text-on-surface font-mono">₹18.00 / kWh</span>
              </div>
              <span className="text-[11px] text-secondary">Base commercial utility rate</span>
            </div>

            <div className="p-3 bg-surface-container rounded-lg border border-primary/30">
              <div className="flex justify-between items-center text-[13px] font-bold text-on-surface">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Peak Commute (18:00 - 23:00)
                </span>
                <span className="text-primary font-mono font-bold">₹24.30 / kWh</span>
              </div>
              <span className="text-[11px] text-secondary">Dynamic demand response active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive Tariff Form */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-4">
          <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
            Tariff Parameter Tuning
          </span>

          <div className="flex flex-col gap-3 text-[13px]">
            <div>
              <label className="text-[11px] font-bold text-secondary block mb-1">
                Base Energy Tariff (₹ / kWh)
              </label>
              <input
                type="number"
                step="0.5"
                value={baseTariff}
                onChange={(e) => setBaseTariff(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary block mb-1">
                Evening Peak Multiplier
              </label>
              <input
                type="number"
                step="0.05"
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary block mb-1">
                Idle Penalty Grace &amp; Fee (₹ / min after 15m)
              </label>
              <input
                type="number"
                step="0.5"
                value={idleFeePerMin}
                onChange={(e) => setIdleFeePerMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary block mb-1">
                OCPI Roaming Inbound Markup (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={roamingMarkupPercent}
                onChange={(e) => setRoamingMarkupPercent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Roaming Clearing Split Matrix */}
        <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-secondary tracking-wider block mb-3">
              Automated Revenue Settlement Split
            </span>
            <div className="space-y-3 text-[12px]">
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <span className="font-semibold text-on-surface">CPO Host Revenue</span>
                <span className="font-mono font-bold text-primary">85.0%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <span className="font-semibold text-on-surface">ChargeOne Platform Take</span>
                <span className="font-mono font-bold text-on-surface">10.0%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <span className="font-semibold text-on-surface">Interchange &amp; Switch Cost</span>
                <span className="font-mono font-bold text-secondary">2.6%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                <span className="font-semibold text-on-surface">TDS Withholding</span>
                <span className="font-mono font-bold text-secondary">1.0%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-container rounded-lg text-[11px] text-secondary mt-4">
            <span className="font-bold text-on-surface block mb-0.5">Automated Tariff Sync:</span>
            Pushed instantly to Shell Recharge, Hubject, Tata Power &amp; Zeon upon save.
          </div>
        </div>
      </div>
    </div>
  );
};
