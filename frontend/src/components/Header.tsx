import React, { useState } from 'react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenProvisionModal?: () => void;
  onToggleMobileView: () => void;
  onOpenAiDrawer?: (initialQuery?: string) => void;
  isMobileViewActive?: boolean;
  selectedCpo: string;
  onSelectCpo: (cpo: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenProvisionModal,
  onToggleMobileView,
  onOpenAiDrawer,
  isMobileViewActive,
  selectedCpo,
  onSelectCpo,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  isSidebarCollapsed = false,
}) => {
  const [isCpoDropdownOpen, setIsCpoDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const cpos = [
    'CPO Portal (Starlight Energy)',
    'CPO Portal (Tata Power EZ)',
    'CPO Portal (Shell Recharge)',
    'CPO Portal (Zeon Fast-DC)',
  ];

  const notifications = [
    {
      id: 1,
      title: 'Connector Solenoid Alert',
      desc: 'Lock cable retry failed on CH-049 Gun 2 (Whitefield Hub)',
      time: '3m ago',
      critical: true,
    },
    {
      id: 2,
      title: 'OCPI Batch Reconciled',
      desc: 'Shell Recharge settlement #SET-92830 cleared ₹19.72L',
      time: '18m ago',
      critical: false,
    },
    {
      id: 3,
      title: 'Peak Shaving Profile Applied',
      desc: 'Smart load shed active across Indiranagar & BKC hubs',
      time: '42m ago',
      critical: false,
    },
  ];

  return (
    <header className={`fixed top-0 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 px-2.5 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 border-b border-outline-variant/20 left-0 will-change-[left] transition-[left] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isSidebarCollapsed ? 'xl:left-[72px]' : 'xl:left-72'}`}>
      {/* Left zone: Mobile hamburger & extended search bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0 max-w-2xl">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="xl:hidden p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        )}

        <div className="relative flex-1 min-w-[130px] sm:min-w-[180px] md:min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-secondary text-[18px]">search</span>
          </div>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClick={onOpenCommandPalette}
            className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-3 sm:pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-secondary text-[12px] sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-primary shadow-xs border border-outline-variant/30 transition-all"
            placeholder="Search stations, chargers, sessions..."
            type="text"
          />
        </div>
      </div>

      {/* Right zone: CPO dropdown, Action buttons, Alerts, User profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* CPO Portal Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCpoDropdownOpen(!isCpoDropdownOpen)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] sm:text-[13px] font-medium transition-colors border border-outline-variant/20"
            title={selectedCpo}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">domain</span>
            <span className="hidden lg:inline truncate max-w-[130px] xl:max-w-[160px]">
              {selectedCpo.replace('CPO Portal (', '').replace(')', '')}
            </span>
            <span className="material-symbols-outlined text-[16px] text-secondary">
              arrow_drop_down
            </span>
          </button>

          {isCpoDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[11px] font-bold text-secondary uppercase tracking-wider">
                Select Active Operator Tenant
              </div>
              {cpos.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onSelectCpo(c);
                    setIsCpoDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between hover:bg-surface-container transition-colors ${
                    selectedCpo === c ? 'text-primary font-semibold bg-surface-container-low' : 'text-on-surface'
                  }`}
                >
                  <span className="truncate">{c.replace('CPO Portal (', '').replace(')', '')}</span>
                  {selectedCpo === c && (
                    <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Maps Grounding Copilot Button */}
        <button
          onClick={() => onOpenAiDrawer?.()}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 text-[12px] sm:text-[13px] font-bold transition-all border border-emerald-500/30 shadow-2xs group cursor-pointer"
          title="Open Google Maps Grounding & AI Assistant"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-600 group-hover:scale-110 transition-transform">
            pin_drop
          </span>
          <span className="hidden xl:inline whitespace-nowrap">Maps AI</span>
        </button>

        {/* Driver App toggle preview */}
        <button
          onClick={onToggleMobileView}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-2 rounded-lg text-[12px] sm:text-[13px] font-medium transition-all ${
            isMobileViewActive
              ? 'bg-primary-fixed text-on-primary-fixed font-bold'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
          title="Toggle Driver Mobile App View"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
          <span className="hidden 2xl:inline whitespace-nowrap">{isMobileViewActive ? 'Return to Console' : 'Driver App'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
            title="Live Network Alerts"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-fadeIn">
              <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-outline-variant/20">
                <span className="text-[12px] font-bold text-on-surface">Live Network Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                  3 New
                </span>
              </div>
              <div className="divide-y divide-outline-variant/10 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-semibold ${n.critical ? 'text-error' : 'text-on-surface'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-secondary">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-outline-variant/20">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[12px] shadow-xs shrink-0" title="Alex Chen - Chief of Infra Ops">
            AC
          </div>
          <div className="hidden 2xl:flex flex-col text-left">
            <span className="text-[13px] font-semibold text-on-surface leading-tight whitespace-nowrap">Alex Chen</span>
            <span className="text-[11px] text-on-surface-variant leading-tight whitespace-nowrap">Chief of Infra Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
};
