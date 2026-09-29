import React, { useState } from 'react';

interface AuditLogsViewProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'security' | 'tariffs' | 'financial' | 'throttle'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const auditEntries = [
    {
      id: 'AUD-89210',
      time: '16:41:42 IST',
      user: 'Alex Chen (Chief of Infra Ops)',
      action: 'ApplySmartThrottle',
      target: 'Whitefield Hub (Max 150A / 80%)',
      result: 'Success',
      category: 'throttle',
      hash: '0x9921..44fa',
    },
    {
      id: 'AUD-89209',
      time: '16:20:10 IST',
      user: 'Automated Clearinghouse Worker',
      action: 'ReconcileBatch',
      target: 'Shell Recharge #SET-92830 (₹19,72,584)',
      result: 'Zero Variance',
      category: 'financial',
      hash: '0x8812..11bc',
    },
    {
      id: 'AUD-89208',
      time: '15:58:34 IST',
      user: 'System Ingestion Service',
      action: 'RotateTLSClientCert',
      target: 'ABB Terra CH-BLR-089-B (mTLS Prof 3)',
      result: 'Verified',
      category: 'security',
      hash: '0x4421..a901',
    },
    {
      id: 'AUD-89207',
      time: '15:12:02 IST',
      user: 'Priya Sharma (CPO Admin)',
      action: 'UpdateTariffMatrix',
      target: 'Indiranagar Hub (Peak multiplier 1.35x)',
      result: 'Broadcasted',
      category: 'tariffs',
      hash: '0x1290..bb34',
    },
    {
      id: 'AUD-89206',
      time: '14:48:19 IST',
      user: 'Automated Clearinghouse Worker',
      action: 'ACHDirectDebitTransmit',
      target: 'Tata Power EZ #SET-92829 (₹38.15L)',
      result: 'Success',
      category: 'financial',
      hash: '0x3310..fe91',
    },
    {
      id: 'AUD-89205',
      time: '14:15:02 IST',
      user: 'SecOps Gateway Daemon',
      action: 'RevokeCompromisedToken',
      target: 'RFID-STALE-0091 (Blacklisted)',
      result: 'Enforced',
      category: 'security',
      hash: '0x7721..ba88',
    },
  ];

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesSearch =
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.target.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab !== 'all' && entry.category !== activeTab) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-primary uppercase tracking-wider font-bold">
              Compliance &amp; Governance
            </span>
            <span className="text-secondary text-[11px]">•</span>
            <span className="text-secondary text-[11px] font-medium font-mono">SOC2 Type II • ISO 27001 Certified</span>
          </div>
          <h1 className="text-[26px] font-bold text-on-surface tracking-tight mt-1">
            Audit Logs &amp; Security Console
          </h1>
          <p className="text-[13px] text-secondary">
            Immutable, cryptographically verifiable action trail for all operator commands, tariff adjustments, and mTLS certificates.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Exported signed security audit ledger (Merkle verified).', 'success')}
          className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-semibold border border-outline-variant/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Verify Merkle Proofs</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              mTLS Certificate Health
            </span>
            <div className="text-[24px] font-bold text-primary font-mono mt-1">100% Valid</div>
            <span className="text-[11px] text-secondary">0 expiring in next 30 days</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">vpn_key</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              RBAC Role Enforcements
            </span>
            <div className="text-[24px] font-bold text-on-surface font-mono mt-1">Strict mTLS</div>
            <span className="text-[11px] text-secondary">Profile 3 default on all DC Fast</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
        </div>

        <div className="p-4 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
              Cryptographic Invariants
            </span>
            <div className="text-[24px] font-bold text-primary font-mono mt-1">0 Drift</div>
            <span className="text-[11px] text-secondary">All journal records balanced</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">fingerprint</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table with Tab Switcher */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Filter bar & Tabs */}
        <div className="p-4 border-b border-surface-container flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              All Events ({auditEntries.length})
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              mTLS &amp; Security (2)
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'financial'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Financial Recon (2)
            </button>
            <button
              onClick={() => setActiveTab('tariffs')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tariffs'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Tariff Updates (1)
            </button>
            <button
              onClick={() => setActiveTab('throttle')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'throttle'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              Load Shedding (1)
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-secondary">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container text-[12px] font-medium text-on-surface placeholder:text-secondary focus:outline-none border border-outline-variant/20"
              placeholder="Search ID, operator, action..."
              type="text"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-[13px]">
            <thead className="bg-surface-container-low text-secondary text-[11px] uppercase tracking-wider font-bold border-b border-surface-container">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator / Principal</th>
                <th className="py-3 px-4">Action Triggered</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Cryptographic Hash</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-secondary text-[13px]">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">{a.id}</td>
                    <td className="py-3 px-4 font-mono text-[12px] text-secondary">{a.time}</td>
                    <td className="py-3 px-4 font-semibold text-on-surface">{a.user}</td>
                    <td className="py-3 px-4 font-mono text-[12px] text-primary">{a.action}</td>
                    <td className="py-3 px-4 text-secondary text-[12px]">{a.target}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-secondary">{a.hash}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold">
                        {a.result}
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
