import React, { useState } from 'react';

interface FleetMonitoringViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FleetMonitoringView: React.FC<FleetMonitoringViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'fleets' | 'policies' | 'vehicles'>('fleets');
  const [searchQuery, setSearchQuery] = useState('');

  const rfidTokens = [
    { id: 'RFID-BLU-0891', vehicle: 'Tata Tigor EV (DL-01-EV-4122)', fleet: 'BluSmart Mobility', driver: 'Ramesh Kumar', cap: '80% (Max 30 kW)', status: 'Authorized' },
    { id: 'RFID-AMZ-2041', vehicle: 'Mahindra Zor Grand (KA-03-EV-9011)', fleet: 'Amazon Logistics', driver: 'Sanjay Verma', cap: 'Depot Window (14 kW)', status: 'Authorized' },
    { id: 'RFID-UBR-1102', vehicle: 'MG ZS EV (MH-02-EV-7822)', fleet: 'Uber Electric', driver: 'Farhan Shaikh', cap: 'Bay 01 Reserved (60 kW)', status: 'Authorized' },
    { id: 'RFID-BLU-0892', vehicle: 'Tata Tigor EV (DL-01-EV-4123)', fleet: 'BluSmart Mobility', driver: 'Vikas Sharma', cap: '80% (Max 30 kW)', status: 'Authorized' },
    { id: 'RFID-AMZ-2042', vehicle: 'Euler Motors HiLoad (KA-03-EV-9012)', fleet: 'Amazon Logistics', driver: 'Prakash Rao', cap: 'Depot Window (14 kW)', status: 'Authorized' },
  ];

  const policies = [
    { name: 'Depot Off-Peak Window Cap', fleet: 'Amazon Logistics', condition: 'Time: 01:00 - 05:30', action: 'Fixed tariff ₹14.00/kWh, 14 kW slow AC rate', status: 'Enforced' },
    { name: 'Commercial Fast-Charge 80% Threshold', fleet: 'BluSmart Mobility', condition: 'SoC >= 80%', action: 'Step down current to 15A to protect battery life', status: 'Enforced' },
    { name: 'Priority Hub Airport Bay Reservation', fleet: 'Uber Electric', condition: 'Terminal Hubs', action: 'Dedicated access to Bay 01 CCS2 dispensers', status: 'Active' },
    { name: 'Peak Grid Commute Dynamic Throttle', fleet: 'All Commercial B2B', condition: 'Time: 18:00 - 22:00', action: 'Dynamic 25% load shed if grid freq < 49.95 Hz', status: 'Standby' },
    { name: 'Geofenced Depot Authorization Lock', fleet: 'Amazon Logistics', condition: 'Outside designated hub', action: 'Reject remote start request (OCPP 403 Forbidden)', status: 'Enforced' },
  ];

  const filteredTokens = rfidTokens.filter(
    (t) =>
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fleet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              B2B Commercial Accounts
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium font-mono">1,240 Enrolled Fleet Vehicles</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Fleet Monitoring &amp; Policies
          </h1>
          <p className="text-[13px] text-secondary">
            Enforce geofenced charging windows, power caps, RFID token whitelisting, and monthly invoice consolidation.
          </p>
        </div>

        <button
          onClick={() => onShowToast('New B2B fleet policy rule committed to gateway.', 'success')}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold shadow-xs transition-all cursor-pointer"
        >
          + Add Fleet Policy
        </button>
      </div>

      {/* Tab Navigation Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('fleets')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fleets'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">directions_car</span>
            <span>Corporate Fleet Accounts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              3
            </span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'policies'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
            <span>Charging Policies &amp; Power Caps</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[10px] font-bold">
              5 Rules
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">badge</span>
            <span>Whitelisted RFID Tokens &amp; EVs</span>
            <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold font-mono">
              1,240
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-[12px] text-secondary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>B2B Direct Clearing Active</span>
        </div>
      </div>

      {/* TAB 1: CORPORATE FLEET ACCOUNTS */}
      {activeTab === 'fleets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">BluSmart Mobility Corp</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  API Linked
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1">Delhi NCR &amp; Bengaluru Fleet Hubs</p>
              <div className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Vehicles:</span>
                  <span className="font-bold text-on-surface font-mono">680 EVs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Charge Cap:</span>
                  <span className="font-bold text-primary font-mono">80% Fast-Charge Limit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Discounts:</span>
                  <span className="font-bold text-on-surface font-mono">12% B2B Volume Rebate</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Configuring BluSmart fleet policies...', 'info')}
              className="w-full mt-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold transition-colors cursor-pointer"
            >
              Manage Fleet Policy
            </button>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">Amazon Delivery Logistics</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                  Contracted
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1">Commercial 3-Wheeler &amp; 4-Wheeler Vans</p>
              <div className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Vehicles:</span>
                  <span className="font-bold text-on-surface font-mono">320 EVs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Charge Window:</span>
                  <span className="font-bold text-primary font-mono">01:00 - 05:30 (Depot)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Tariff:</span>
                  <span className="font-bold text-on-surface font-mono">Fixed ₹14.00/kWh</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Configuring Amazon logistics policy...', 'info')}
              className="w-full mt-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold transition-colors cursor-pointer"
            >
              Manage Fleet Policy
            </button>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-on-surface">Uber Electric Pilot</span>
                <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                  Trial Phase
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1">Mumbai BKC &amp; Airport Clusters</p>
              <div className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Vehicles:</span>
                  <span className="font-bold text-on-surface font-mono">240 EVs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Priority Lane:</span>
                  <span className="font-bold text-primary font-mono">Bay 01 Reserved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">AutoPay:</span>
                  <span className="font-bold text-on-surface font-mono">Adyen Corporate Token</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Configuring Uber pilot rules...', 'info')}
              className="w-full mt-4 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold transition-colors cursor-pointer"
            >
              Manage Fleet Policy
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CHARGING POLICIES & POWER CAPS */}
      {activeTab === 'policies' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col animate-fadeIn">
          <div className="p-4 border-b border-surface-container flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">Active Smart Charging Policy Rules</h3>
              <p className="text-[12px] text-secondary">Propagated automatically to OCPP 2.0.1 smart load balancing nodes.</p>
            </div>
            <button
              onClick={() => onShowToast('Re-evaluated all 5 fleet policy invariants.', 'success')}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold rounded-lg border border-outline-variant/20 cursor-pointer"
            >
              Re-evaluate All Rules
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-[13px]">
              <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">Policy Rule Name</th>
                  <th className="py-3 px-4">Target Fleet</th>
                  <th className="py-3 px-4">Trigger / Condition</th>
                  <th className="py-3 px-4">Throttle / Dispatch Action</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {policies.map((p, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{p.name}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{p.fleet}</td>
                    <td className="py-3 px-4 font-mono text-[12px] text-secondary">{p.condition}</td>
                    <td className="py-3 px-4 text-on-surface text-[12px]">{p.action}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WHITELISTED RFID TOKENS & VEHICLES */}
      {activeTab === 'vehicles' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col animate-fadeIn">
          <div className="p-4 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-[18px] text-secondary absolute left-3 top-2.5">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 text-on-surface"
                placeholder="Search RFID token, vehicle, fleet or driver..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onShowToast('Imported 120 new RFID token authorizations via CSV.', 'success')}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold rounded-lg border border-outline-variant/20 cursor-pointer"
              >
                + Import RFID List (CSV)
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-[13px]">
              <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">RFID UID Token</th>
                  <th className="py-3 px-4">Enrolled Vehicle &amp; Plate</th>
                  <th className="py-3 px-4">Fleet Account</th>
                  <th className="py-3 px-4">Authorized Driver</th>
                  <th className="py-3 px-4">Active Power Cap</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredTokens.map((t, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{t.id}</td>
                    <td className="py-3 px-4 font-semibold text-on-surface">{t.vehicle}</td>
                    <td className="py-3 px-4 text-secondary">{t.fleet}</td>
                    <td className="py-3 px-4 text-on-surface">{t.driver}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-primary">{t.cap}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
