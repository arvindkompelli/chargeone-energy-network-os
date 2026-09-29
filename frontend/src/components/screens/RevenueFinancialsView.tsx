import React, { useState } from 'react';

interface RevenueFinancialsViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const RevenueFinancialsView: React.FC<RevenueFinancialsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'disbursements'>('overview');

  const disbursements = [
    { cpo: 'Starlight Energy Corp', bank: 'HDFC Corporate ••8912', amount: '₹42,80,910', status: 'Ready for ACH', date: 'T+2 (Apr 28, 2025)' },
    { cpo: 'Tata Power EZ EVSE', bank: 'SBI Commercial ••4021', amount: '₹38,15,440', status: 'Processed', date: 'Apr 26, 2025' },
    { cpo: 'Shell Recharge India', bank: 'Citibank NA ••1190', amount: '₹19,72,584', status: 'Processed', date: 'Apr 25, 2025' },
    { cpo: 'Zeon Fast Charging Network', bank: 'ICICI Bank ••7832', amount: '₹14,92,300', status: 'Ready for ACH', date: 'T+2 (Apr 28, 2025)' },
    { cpo: 'Jio-bp Pulse Mobility', bank: 'Axis Bank ••9011', amount: '₹35,42,966', status: 'In Review', date: 'Pending Audit' },
  ];

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              Treasury &amp; Yield Analytics
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium font-mono">Fiscal Month: April 2025</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Revenue &amp; Financials
          </h1>
          <p className="text-[13px] text-secondary">
            Gross transaction volume, CPO revenue share distribution, and utility margin optimization.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Exported fiscal statement (Excel / CSV)', 'success')}
          className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold border border-outline-variant/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download Financial P&amp;L</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
            <span>Treasury &amp; P&amp;L Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">pie_chart</span>
            <span>Channel Segmentation</span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              3 Channels
            </span>
          </button>

          <button
            onClick={() => setActiveTab('disbursements')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'disbursements'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">account_balance</span>
            <span>CPO Disbursements &amp; ACH</span>
            <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
              ₹1.51 Cr
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-[12px] text-secondary">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="font-semibold text-on-surface">Auto-Settled Daily 00:00 UTC</span>
        </div>
      </div>

      {/* Metric Cards (always available in overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
          <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
            Monthly Gross Volume
          </span>
          <div className="text-[26px] font-bold text-on-surface font-mono mt-2">₹1,84,20,450</div>
          <span className="text-[11px] text-primary font-bold mt-1 block">+18.4% vs Mar 2025</span>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
          <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
            Platform Net Take
          </span>
          <div className="text-[26px] font-bold text-primary font-mono mt-2">₹18,24,000</div>
          <span className="text-[11px] text-secondary font-medium mt-1 block">9.89% blended rate</span>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
          <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
            CPO Disbursements
          </span>
          <div className="text-[26px] font-bold text-on-surface font-mono mt-2">₹1,51,04,200</div>
          <span className="text-[11px] text-secondary font-medium mt-1 block">42 Active CPO accounts</span>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
          <span className="text-[11px] uppercase font-bold text-secondary tracking-wider">
            Total Energy Billed
          </span>
          <div className="text-[26px] font-bold text-on-surface font-mono mt-2">1,023 MWh</div>
          <span className="text-[11px] text-primary font-bold mt-1 block">₹18.00 / kWh avg</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">P&amp;L Financial Waterline</h3>
              <p className="text-[12px] text-secondary mt-0.5">Summary of charges, fees, interchange, and tax withholding</p>
              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-secondary">Gross Transaction Value (GMV):</span>
                  <span className="font-mono font-bold text-on-surface">₹1,84,20,450.00</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-secondary">Host CPO Net Share (82.0%):</span>
                  <span className="font-mono font-bold text-on-surface">₹1,51,04,200.00</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-primary/10">
                  <span className="text-primary font-bold">ChargeOne Platform Fee (9.9%):</span>
                  <span className="font-mono font-bold text-primary">₹18,24,000.00</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-secondary">Interchange &amp; Gateway Costs (3.2%):</span>
                  <span className="font-mono text-secondary">₹5,89,450.00</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-surface-container-low">
                  <span className="text-secondary">TDS Withheld (194C / 1%):</span>
                  <span className="font-mono text-secondary">₹1,84,200.00</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-[11px] text-secondary">
              <span>Audited by Deloitte Haskins &amp; Sells</span>
              <span className="text-primary font-bold">Zero Reconciliation Discrepancy</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">Treasury Liquidity &amp; Reserve Rails</h3>
              <p className="text-[12px] text-secondary mt-0.5">Real-time balances across settlement escrow accounts</p>
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">₹</div>
                    <div>
                      <span className="text-[13px] font-bold text-on-surface block">HDFC Nodal Escrow</span>
                      <span className="text-[11px] text-secondary">A/C •••• 9920 • Direct NACH Settlement</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[16px] font-mono font-bold text-on-surface">₹2.84 Cr</span>
                    <span className="block text-[10px] text-primary font-bold">Active</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-bold text-secondary">$</div>
                    <div>
                      <span className="text-[13px] font-bold text-on-surface block">Citibank Cross-Border Roaming</span>
                      <span className="text-[11px] text-secondary">Hubject Clearing House EUR/USD Pool</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[16px] font-mono font-bold text-on-surface">$420,000</span>
                    <span className="block text-[10px] text-primary font-bold">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Re-balanced treasury pools across escrow rails.', 'success')}
              className="w-full mt-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-bold rounded-lg border border-outline-variant/20 transition-colors cursor-pointer"
            >
              Audit Escrow Liquidity Reserves
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CHANNELS */}
      {(activeTab === 'overview' || activeTab === 'channels') && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-surface-container flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-on-surface">Revenue Channel Segmentation</h3>
            <span className="text-[11px] text-secondary font-mono">Real-time Ingestion</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-[13px]">
              <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">Channel Name</th>
                  <th className="py-3 px-4 font-mono">Sessions Count</th>
                  <th className="py-3 px-4 font-mono">Volume (MWh)</th>
                  <th className="py-3 px-4 font-mono text-right">Gross Billing</th>
                  <th className="py-3 px-4 font-mono text-right">Platform Fee</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                <tr>
                  <td className="py-3 px-4 font-bold text-on-surface">Direct Mobile App &amp; Web</td>
                  <td className="py-3 px-4 font-mono">34,120</td>
                  <td className="py-3 px-4 font-mono">482.4</td>
                  <td className="py-3 px-4 font-mono text-right font-bold">₹86,83,200</td>
                  <td className="py-3 px-4 font-mono text-right text-primary font-bold">₹8,68,320</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-on-surface">OCPI Roaming (Shell, Tata, Hubject)</td>
                  <td className="py-3 px-4 font-mono">29,800</td>
                  <td className="py-3 px-4 font-mono">392.1</td>
                  <td className="py-3 px-4 font-mono text-right font-bold">₹70,57,800</td>
                  <td className="py-3 px-4 font-mono text-right text-primary font-bold">₹7,05,780</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                      Synchronized
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-on-surface">Enterprise Fleet Contracts (BluSmart, Amazon)</td>
                  <td className="py-3 px-4 font-mono">20,280</td>
                  <td className="py-3 px-4 font-mono">148.5</td>
                  <td className="py-3 px-4 font-mono text-right font-bold">₹26,79,450</td>
                  <td className="py-3 px-4 font-mono text-right text-primary font-bold">₹2,49,900</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      Contracted
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISBURSEMENTS */}
      {activeTab === 'disbursements' && (
        <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col animate-fadeIn">
          <div className="p-4 border-b border-surface-container flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-on-surface">CPO Settlement Disbursement Schedule</h3>
              <p className="text-[12px] text-secondary">T+2 clearing batches transmitted via NACH and direct bank integration API.</p>
            </div>
            <button
              onClick={() => onShowToast('Approved all queued ACH payouts.', 'success')}
              className="px-3.5 py-1.5 bg-primary text-on-primary text-[12px] font-bold rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
            >
              Approve Queued Payouts
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-[13px]">
              <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
                <tr>
                  <th className="py-3 px-4">CPO Entity Name</th>
                  <th className="py-3 px-4">Beneficiary Bank Account</th>
                  <th className="py-3 px-4 font-mono text-right">Payout Amount</th>
                  <th className="py-3 px-4">Cycle / Execution</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {disbursements.map((d, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{d.cpo}</td>
                    <td className="py-3 px-4 text-secondary font-mono text-[12px]">{d.bank}</td>
                    <td className="py-3 px-4 text-right font-bold text-on-surface font-mono">{d.amount}</td>
                    <td className="py-3 px-4 text-secondary text-[12px]">{d.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status.includes('Ready')
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : d.status.includes('Processed')
                          ? 'bg-surface-container text-secondary'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {d.status}
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
