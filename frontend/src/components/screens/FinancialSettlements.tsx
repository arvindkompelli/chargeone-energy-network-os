import React, { useState } from 'react';
import { SettlementBatch } from '../../types';
import { INITIAL_SETTLEMENTS } from '../../data/mockData';

interface FinancialSettlementsProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const FinancialSettlements: React.FC<FinancialSettlementsProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'ledger'>('batches');
  const [batches, setBatches] = useState<SettlementBatch[]>(INITIAL_SETTLEMENTS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'disputed' | 'processing'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedBatchForDrawer, setSelectedBatchForDrawer] = useState<SettlementBatch | null>(null);
  const [isRunningBatch, setIsRunningBatch] = useState(false);

  const handleRunBatch = () => {
    setIsRunningBatch(true);
    onShowToast('Executing T+2 Clearinghouse algorithm & NACH file generation...', 'info');
    setTimeout(() => {
      setIsRunningBatch(false);
      onShowToast('Batch executed: ₹94,76,211 queued for automated bank transmission.', 'success');
    }, 1500);
  };

  const handleApprovePayout = (batchId: string) => {
    onShowToast(`Batch ${batchId} approved. ISO 20022 pain.001 instruction transmitted to HDFC direct API.`, 'success');
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: 'Processing' } : b))
    );
    setSelectedBatchForDrawer(null);
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.cpoName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchFilter.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ready' && b.status !== 'Ready') return false;
    if (statusFilter === 'disputed' && b.status !== 'Disputed') return false;
    if (statusFilter === 'processing' && b.status !== 'Processing') return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Command Center Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] uppercase tracking-wider font-bold">
              Tier-1 Clearinghouse Engine
            </span>
            <span className="text-[11px] text-secondary font-bold">•</span>
            <span className="text-[11px] text-secondary font-medium">
              Batch Engine Cycle: <strong className="text-on-surface font-semibold font-mono">T+2 Rolling (Cutoff 23:59 IST)</strong>
            </span>
          </div>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight">
            Financial Settlement &amp; Clearinghouse Ledger
          </h1>
          <p className="text-[13px] text-on-surface-variant">
            Multi-party clearing between eMSPs, CPOs, Fleet accounts, and payment rails with immutable double-entry journal entries.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onShowToast('Exported GST & VAT tax ledger (April 2025).', 'success')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium transition-all shadow-xs border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
            <span>Export Tax Ledger</span>
          </button>
          <button
            onClick={() => onShowToast('Generated NACH / ISO 20022 XML direct clearing batch file.', 'success')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium transition-all shadow-xs border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
            <span>NACH / ISO20022 XML</span>
          </button>
          <button
            onClick={handleRunBatch}
            disabled={isRunningBatch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] font-semibold transition-all shadow-xs disabled:opacity-75"
            type="button"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRunningBatch ? 'animate-spin' : ''}`}>
              {isRunningBatch ? 'refresh' : 'sync_alt'}
            </span>
            <span>{isRunningBatch ? 'Executing Clearing...' : 'Run Clearing Batch'}</span>
          </button>
        </div>
      </div>

      {/* Executive Clearing Metrics Bar (5 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
              Gross Volume (30D)
            </span>
            <span className="p-1 rounded bg-primary-fixed text-on-primary-fixed">
              <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-bold text-on-surface font-mono">₹1.84 Cr</div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="material-symbols-outlined text-[15px] text-primary">trending_up</span>
              <span className="text-primary font-bold">+18.4%</span>
              <span className="text-secondary">vs prev 30 days</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
              CPO Net Payables
            </span>
            <span className="p-1 rounded bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-bold text-on-surface font-mono">₹1.51 Cr</div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="text-secondary font-medium">Pending payout to</span>
              <span className="font-bold text-on-surface">42 CPOs</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-primary-container h-1.5 rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
              Platform Take
            </span>
            <span className="p-1 rounded bg-tertiary-fixed text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[18px]">pie_chart</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-bold text-on-surface font-mono">₹18.2L</div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="text-primary font-bold font-mono">9.89%</span>
              <span className="text-secondary">net margin blend</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-tertiary h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
              Interchange Costs
            </span>
            <span className="p-1 rounded bg-surface-container-high text-secondary">
              <span className="material-symbols-outlined text-[18px]">credit_card</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-bold text-on-surface font-mono">₹4.8L</div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-secondary truncate">Stripe / UPI / Adyen</span>
              <span className="font-bold text-on-surface font-mono">2.6%</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-secondary h-1.5 rounded-full" style={{ width: '26%' }}></div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
              In-Flight Escrow
            </span>
            <span className="p-1 rounded bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[24px] font-bold text-on-surface font-mono">₹6.4L</div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-primary font-bold">T+2 Clearing window</span>
            </div>
          </div>
          <div className="w-full bg-surface-container rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: '44%' }}></div>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-1.5 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-primary">
              account_balance_wallet
            </span>
            <span>CPO Settlement Batches &amp; Reconciliation</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
              42
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">book</span>
            <span>Immutable Double-Entry General Ledger</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[10px] font-bold">
              Live Audit
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-[12px]">
          <span className="text-secondary font-medium">Bank Pipeline:</span>
          <span className="flex items-center gap-1 font-bold text-primary">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            HDFC Corporate Direct API Connected
          </span>
        </div>
      </div>

      {/* TAB 1: Batches & Reconciliation */}
      {activeTab === 'batches' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Filter Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[260px] flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
                </div>
                <input
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container text-on-surface placeholder:text-secondary text-[13px] focus:outline-none focus:ring-1 focus:ring-primary shadow-xs border border-outline-variant/20"
                  placeholder="Filter batch ID, CPO operator, GSTIN..."
                  type="text"
                />
              </div>

              {/* Status Chips */}
              <div className="flex items-center flex-wrap gap-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  All (42)
                </button>
                <button
                  onClick={() => setStatusFilter('ready')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    statusFilter === 'ready'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  Ready for Payout (36)
                </button>
                <button
                  onClick={() => setStatusFilter('disputed')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'disputed'
                      ? 'bg-error text-on-error'
                      : 'bg-surface-container hover:bg-surface-container-high text-error'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  Disputed / Mismatch (2)
                </button>
                <button
                  onClick={() => setStatusFilter('processing')}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    statusFilter === 'processing'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  Processing (4)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container text-on-surface text-[12px] font-medium border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
                <span>Apr 01 – Apr 28, 2025</span>
                <span className="material-symbols-outlined text-secondary text-[16px]">expand_more</span>
              </div>
              <button
                onClick={() => onShowToast('Filter settings saved.', 'info')}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[1050px] text-left font-body-sm text-[13px] border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
                    <th className="py-2.5 px-4">Batch ID</th>
                    <th className="py-2.5 px-4">CPO / Partner</th>
                    <th className="py-2.5 px-4">Cycle</th>
                    <th className="py-2.5 px-4 text-right">Sessions &amp; Vol</th>
                    <th className="py-2.5 px-4 text-right">Gross (₹)</th>
                    <th className="py-2.5 px-4 text-right">Fee (₹ / %)</th>
                    <th className="py-2.5 px-4 text-right">Gateway Deduct</th>
                    <th className="py-2.5 px-4 text-right">Adjustments</th>
                    <th className="py-2.5 px-4 text-right">Net Payable (₹)</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 text-on-surface">
                  {filteredBatches.map((batch) => (
                    <tr
                      key={batch.id}
                      onClick={() => setSelectedBatchForDrawer(batch)}
                      className={`transition-colors group cursor-pointer ${
                        batch.status === 'Disputed'
                          ? 'hover:bg-error-container/20 bg-error-container/10'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[13px] font-bold ${
                            batch.status === 'Disputed' ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {batch.id}
                        </span>
                        <span className="block text-[10px] text-secondary">{batch.autoGenNote}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                              batch.status === 'Disputed'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface-container text-primary'
                            }`}
                          >
                            {batch.cpoInitials}
                          </div>
                          <div>
                            <span className="text-[13px] font-semibold block text-on-surface">
                              {batch.cpoName}
                            </span>
                            <span className="text-[11px] text-secondary font-mono">{batch.cpoId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[13px] text-on-surface font-medium">{batch.cycle}</span>
                        <span className="block text-[11px] text-secondary font-mono">
                          {batch.cycleDates}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        <div className="font-mono">{batch.sessionsCount.toLocaleString()} sessions</div>
                        <div className="text-[11px] text-secondary font-mono">{batch.energyMwh} MWh</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[14px]">
                        ₹{batch.grossAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-semibold text-on-surface">
                          ₹{batch.platformFeeAmount.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-primary font-bold">
                          {batch.platformFeePercent.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-secondary font-medium font-mono">
                        -₹{batch.gatewayDeduct.toLocaleString()}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono ${
                          batch.adjustments < 0 ? 'text-error font-bold' : 'text-secondary font-medium'
                        }`}
                      >
                        {batch.adjustments < 0
                          ? `-₹${Math.abs(batch.adjustments).toLocaleString()}`
                          : '₹0.00'}
                        {batch.adjustmentNote && batch.adjustments !== 0 && (
                          <span className="block text-[10px] text-secondary font-normal font-sans">
                            {batch.adjustmentNote}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`text-[15px] font-bold font-mono ${
                            batch.status === 'Disputed' ? 'text-error' : 'text-primary'
                          }`}
                        >
                          ₹{batch.netPayable.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-secondary font-mono">
                          TDS deducted: ₹{batch.tdsDeducted.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            batch.status === 'Ready'
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : batch.status === 'Processing'
                              ? 'bg-secondary-container text-on-secondary-container'
                              : batch.status === 'Disputed'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-high text-secondary'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              batch.status === 'Ready'
                                ? 'bg-primary'
                                : batch.status === 'Disputed'
                                ? 'bg-error'
                                : 'bg-secondary'
                            }`}
                          ></span>
                          {batch.status}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBatchForDrawer(batch)}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                            title="Inspect Breakdown"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          {batch.status === 'Ready' && (
                            <button
                              onClick={() => handleApprovePayout(batch.id)}
                              className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[11px] font-bold transition-all shadow-xs"
                            >
                              Payout
                            </button>
                          )}
                          {batch.status === 'Disputed' && (
                            <button
                              onClick={() => setSelectedBatchForDrawer(batch)}
                              className="px-2.5 py-1 rounded-lg bg-error-container hover:opacity-90 text-on-error-container text-[11px] font-bold transition-all"
                            >
                              Resolve CDR
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-secondary border-t border-surface-container">
              <div>
                Showing <span className="font-bold text-on-surface">{filteredBatches.length}</span> of{' '}
                <span className="font-bold text-on-surface">42</span> CPO settlement batches • Total ready for ACH: <strong className="text-primary font-bold font-mono">₹94,76,211</strong>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onShowToast('Already at the first page of settlement batches.', 'info')}
                  className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => onShowToast('Showing Page 1 batches', 'info')}
                  className="px-2.5 py-1 rounded bg-primary text-on-primary font-bold cursor-pointer"
                >
                  1
                </button>
                <button
                  onClick={() => onShowToast('Showing Page 2 batches', 'info')}
                  className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  2
                </button>
                <button
                  onClick={() => onShowToast('Showing Page 3 batches', 'info')}
                  className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  3
                </button>
                <button
                  onClick={() => onShowToast('Loaded next batch of 10 settlements.', 'info')}
                  className="px-2.5 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Immutable Double-Entry Ledger & Recon Matrix */}
      {activeTab === 'ledger' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Protocol Banner */}
          <div className="bg-gradient-to-r from-primary-fixed/40 via-surface-container-low to-secondary-container/30 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>
              <div>
                <div className="text-[16px] font-bold text-on-surface">
                  Zero-Variance Distributed Clearing Protocol
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  Every completed session triggers an immutable 5-leg atomic journal entry balanced strictly to ₹0.00 with cryptographic hash anchoring.
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-[11px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 shrink-0 border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Zero Ledger Drift
            </div>
          </div>

          {/* 3-Way Reconciliation Matrix Mini Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
                  CDR to Gateway Match
                </span>
                <div className="text-[24px] font-bold text-primary font-mono mt-0.5">99.82%</div>
                <span className="text-[11px] text-secondary">142,801 of 143,058 sessions</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
                  T+2 Settlement Pending
                </span>
                <div className="text-[24px] font-bold text-secondary font-mono mt-0.5">0.14%</div>
                <span className="text-[11px] text-secondary">201 sessions awaiting bank webhook</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-secondary uppercase font-bold tracking-wider">
                  Discrepancy / Auto-Adjust
                </span>
                <div className="text-[24px] font-bold text-error font-mono mt-0.5">0.04%</div>
                <span className="text-[11px] text-secondary">56 CDR meter calibration deltas</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
          </div>

          {/* Sample Atomic Journal Entry Inspection Box */}
          <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-secondary">
                  <span className="font-mono">TXN: PAY-9182049</span>
                  <span>•</span>
                  <span className="font-mono">OCPP Session: #SES-89204</span>
                  <span>•</span>
                  <span>ISO 15118 Autocharge (eMSP: Tata.ev)</span>
                </div>
                <h2 className="text-[18px] font-bold text-on-surface mt-1">
                  5-Leg Atomic Journal Voucher #JRN-2025-0428-89204
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Balanced: ₹0.00 Variance
              </span>
            </div>

            {/* Double-Entry Ledger Table */}
            <div className="overflow-x-auto w-full bg-surface rounded-lg p-2 border border-outline-variant/20">
              <table className="w-full min-w-[700px] text-left font-body-sm text-[13px] border-collapse">
                <thead>
                  <tr className="text-secondary text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-2 px-3">Ledger Account &amp; Chart Code</th>
                    <th className="py-2 px-3">Party / Entity</th>
                    <th className="py-2 px-3">Classification</th>
                    <th className="py-2 px-3 text-right">Debit (DR)</th>
                    <th className="py-2 px-3 text-right">Credit (CR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
                  <tr className="font-mono text-[12px]">
                    <td className="py-2 px-3">
                      <span className="font-bold text-on-surface">1020-01 Gateway Escrow Inbound</span>
                      <span className="block text-secondary text-[10px] font-sans">
                        Payment Rail: UPI AutoPay (Adyen settlement gateway)
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium">Customer (EV Driver: DL-01-AX-9912)</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-bold">
                        Asset (Receivable)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-primary">₹1,000.00</td>
                    <td className="py-2 px-3 text-right text-secondary">—</td>
                  </tr>

                  <tr className="font-mono text-[12px]">
                    <td className="py-2 px-3">
                      <span className="font-bold text-on-surface">2010-44 CPO Clearing Accounts Payable</span>
                      <span className="block text-secondary text-[10px] font-sans">
                        EVSE #IN-SHL-012 (38.4 kWh @ ₹22.13/kWh)
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium">Shell Recharge India Pvt Ltd</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                        Liability (Vendor)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-secondary">—</td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface">₹850.00</td>
                  </tr>

                  <tr className="font-mono text-[12px]">
                    <td className="py-2 px-3">
                      <span className="font-bold text-on-surface">4010-00 ChargeOne Platform Network Take</span>
                      <span className="block text-secondary text-[10px] font-sans">
                        10.0% standard CPO SaaS platform commission
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium">ChargeOne Network Operating LLC</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                        Operating Revenue
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-secondary">—</td>
                    <td className="py-2 px-3 text-right font-bold text-primary">₹100.00</td>
                  </tr>

                  <tr className="font-mono text-[12px]">
                    <td className="py-2 px-3">
                      <span className="font-bold text-on-surface">5020-12 Payment Gateway Interchange Fee</span>
                      <span className="block text-secondary text-[10px] font-sans">
                        Pass-through interchange &amp; NPCI switch charge
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium">UPI / NPCI Rail Operator</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold">
                        Cost of Sales
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-secondary">—</td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface">₹30.00</td>
                  </tr>

                  <tr className="font-mono text-[12px]">
                    <td className="py-2 px-3">
                      <span className="font-bold text-on-surface">2050-02 Output GST (18% on platform take)</span>
                      <span className="block text-secondary text-[10px] font-sans">
                        SAC 998719 - Electronic charging mediation services
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans font-medium">State &amp; Central Tax Authority</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold">
                        Statutory Liability
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-secondary">—</td>
                    <td className="py-2 px-3 text-right font-bold text-on-surface">₹20.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-surface-container-high/60 font-mono text-[13px] font-bold border-t-2 border-primary/20">
                    <td className="py-2.5 px-3 text-on-surface font-sans" colSpan={3}>
                      TOTAL TRIAL BALANCE EQUATION (DR = CR)
                    </td>
                    <td className="py-2.5 px-3 text-right text-primary font-bold">₹1,000.00</td>
                    <td className="py-2.5 px-3 text-right text-primary font-bold">₹1,000.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Merkle Root Attestation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-lg bg-surface-container font-mono text-[11px] gap-2 text-secondary border border-outline-variant/20">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
                <span className="font-sans font-bold text-on-surface">Merkle Root Attestation:</span>
                <span className="truncate">0x8f2ac918b0128741e9821804bcfa102bca88921e491c4b9</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-sans">
                <span className="text-primary font-bold">Block Verified #18920194</span>
                <button
                  onClick={() => onShowToast('JSON-LD Cryptographic Proof copied to clipboard.', 'success')}
                  className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface font-bold hover:bg-surface-container-high border border-outline-variant/30 text-[11px]"
                >
                  Inspect JSON-LD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Out Breakdown Drawer / Modal (When Inspect clicked) */}
      {selectedBatchForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-on-background/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideLeft border-l border-outline-variant/20">
            {/* Drawer Header */}
            <div className="p-5 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-primary font-mono uppercase tracking-wider">
                  {selectedBatchForDrawer.id}
                </span>
                <h3 className="text-[20px] font-bold text-on-surface">
                  {selectedBatchForDrawer.cpoName}
                </h3>
                <span className="text-[11px] text-secondary font-mono">
                  {selectedBatchForDrawer.clearingAccount}
                </span>
              </div>
              <button
                onClick={() => setSelectedBatchForDrawer(null)}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex flex-col gap-4 flex-1">
              <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/20">
                <div>
                  <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                    Net Payout Scheduled
                  </span>
                  <div className="text-[26px] font-black text-primary font-mono mt-0.5">
                    ₹{selectedBatchForDrawer.netPayable.toLocaleString()}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                  {selectedBatchForDrawer.status === 'Ready' ? 'ACH Cycle Ready' : selectedBatchForDrawer.status}
                </span>
              </div>

              {/* Ledger Breakdown List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                  Ledger Reconciliation Breakdown
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-[13px] border border-outline-variant/20">
                    <span className="text-on-surface">Gross Charging Sessions Total</span>
                    <span className="font-bold font-mono">
                      ₹{selectedBatchForDrawer.grossAmount.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-[13px] text-secondary border border-outline-variant/20">
                    <span>ChargeOne Platform Mediation Take ({selectedBatchForDrawer.platformFeePercent}%)</span>
                    <span className="font-bold font-mono text-error">
                      - ₹{selectedBatchForDrawer.platformFeeAmount.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-[13px] text-secondary border border-outline-variant/20">
                    <span>Card / UPI Rail Interchange Fees (2.6%)</span>
                    <span className="font-bold font-mono text-error">
                      - ₹{selectedBatchForDrawer.gatewayDeduct.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-[13px] text-secondary border border-outline-variant/20">
                    <span>TDS Withholding (Section 194O @ 1%)</span>
                    <span className="font-bold font-mono text-secondary">
                      - ₹{selectedBatchForDrawer.tdsDeducted.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-[13px] text-secondary border border-outline-variant/20">
                    <span>SLA Penalties &amp; Session Mismatch Adjustments</span>
                    <span className="font-bold font-mono text-on-surface">
                      {selectedBatchForDrawer.adjustments < 0
                        ? `- ₹${Math.abs(selectedBatchForDrawer.adjustments).toLocaleString()}.00`
                        : '₹0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wire Coordinates */}
              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/20">
                <span className="text-[10px] uppercase tracking-wider text-secondary font-bold">
                  Beneficiary NACH Wire Coordinates
                </span>
                <div className="grid grid-cols-2 gap-3 text-[12px] mt-1">
                  <div>
                    <span className="text-secondary block text-[10px]">Beneficiary Name</span>
                    <span className="font-bold text-on-surface">{selectedBatchForDrawer.cpoName}</span>
                  </div>
                  <div>
                    <span className="text-secondary block text-[10px]">Bank &amp; Account</span>
                    <span className="font-bold text-on-surface font-mono">
                      {selectedBatchForDrawer.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block text-[10px]">GSTIN</span>
                    <span className="font-bold text-on-surface font-mono">
                      {selectedBatchForDrawer.gstin}
                    </span>
                  </div>
                  <div>
                    <span className="text-secondary block text-[10px]">Clearing Format</span>
                    <span className="font-bold text-on-surface font-mono">
                      ISO 20022 pain.001.001.09
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-surface-container flex items-center justify-between gap-3 border-t border-outline-variant/20">
              <button
                onClick={() => setSelectedBatchForDrawer(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-[13px] font-semibold border border-outline-variant/20"
              >
                Dismiss
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast(`Downloaded tax Annexure for ${selectedBatchForDrawer.id}.`, 'info')}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold flex items-center gap-1 border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Annexure</span>
                </button>
                <button
                  onClick={() => handleApprovePayout(selectedBatchForDrawer.id)}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Approve &amp; Send to Bank</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
