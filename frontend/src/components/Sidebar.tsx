import React from 'react';
import { ScreenId } from '../types';
import { ChargeOneLogo } from './ChargeOneLogo';

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenMobileView?: () => void;
  onOpenAiDrawer?: (initialQuery?: string) => void;
  isMobileViewActive?: boolean;
  isOpenMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Reusable nav item component with smooth interpolation (no unmounting)
const NavItem: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
  isCollapsed: boolean;
  variant?: 'default' | 'maps';
}> = ({ icon, label, isActive, onClick, badge, isCollapsed, variant = 'default' }) => {
  let stateClasses: string;
  if (variant === 'maps') {
    stateClasses = isActive
      ? 'bg-emerald-500/20 text-emerald-900 font-bold border border-emerald-500/40 shadow-xs'
      : 'text-emerald-800 hover:bg-emerald-500/10 border border-emerald-500/20';
  } else {
    stateClasses = isActive
      ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full h-10 px-2.5 rounded-lg text-left transition-colors duration-200 relative group/navitem ${stateClasses}`}
      title={isCollapsed ? label : undefined}
    >
      {/* Icon: always centered in a 24px box */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        <span
          className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
            variant === 'maps' ? 'text-emerald-600 group-hover/navitem:scale-110' : ''
          }`}
        >
          {icon}
        </span>
      </div>

      {/* Label and Badge: gracefully animated max-width and opacity */}
      <div
        className="flex-1 min-w-0 flex items-center justify-between overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{
          maxWidth: isCollapsed ? '0px' : '220px',
          opacity: isCollapsed ? 0 : 1,
          transform: isCollapsed ? 'translateX(-6px)' : 'translateX(0)',
          marginLeft: isCollapsed ? '0px' : '10px',
        }}
      >
        <span className={`text-[13px] truncate ${variant === 'maps' ? 'font-bold' : ''}`}>
          {label}
        </span>
        {badge && (
          <span
            className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              variant === 'maps'
                ? 'bg-emerald-100 text-emerald-800 font-extrabold uppercase'
                : 'bg-primary-fixed text-on-primary-fixed'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Tooltip on hover when collapsed */}
      {isCollapsed && (
        <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface text-[12px] font-medium whitespace-nowrap opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-150 pointer-events-none z-50 shadow-md">
          {label}
          {badge && <span className="ml-1.5 text-[10px] opacity-80">({badge})</span>}
        </div>
      )}
    </button>
  );
};

// Reusable section header with smooth transition
const SectionHeader: React.FC<{ title: string; isCollapsed: boolean }> = ({ title, isCollapsed }) => (
  <div className="relative">
    <div
      className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
      style={{
        maxHeight: isCollapsed ? '0px' : '24px',
        opacity: isCollapsed ? 0 : 1,
        marginBottom: isCollapsed ? '0px' : '4px',
      }}
    >
      <span className="px-2 text-[11px] uppercase tracking-wider text-secondary font-bold whitespace-nowrap">
        {title}
      </span>
    </div>
    <div
      className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
      style={{
        maxHeight: isCollapsed ? '16px' : '0px',
        opacity: isCollapsed ? 1 : 0,
        margin: isCollapsed ? '4px 0' : '0',
      }}
    >
      <div className="w-6 mx-auto border-t border-outline-variant/30" />
    </div>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenMobileView,
  onOpenAiDrawer,
  isMobileViewActive = false,
  isOpenMobileDrawer = false,
  onCloseMobileDrawer,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isSelected = (id: ScreenId) => {
    if (isMobileViewActive) return id === 'driver-mobile-view';
    if (id === 'charging-sessions' && currentScreen === 'session-audit-dossier') {
      return true;
    }
    return currentScreen === id;
  };

  const handleLinkClick = (screen: ScreenId) => {
    onNavigate(screen);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobileDrawer && (
        <div
          onClick={onCloseMobileDrawer}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs xl:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/20 will-change-[width] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          isCollapsed ? 'w-[72px]' : 'w-72 max-w-[85vw]'
        } ${
          isOpenMobileDrawer ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        {/* ChatGPT-style Floating Edge Slide Button */}
        <div className="hidden xl:block absolute -right-3.5 top-[18px] z-50">
          <button
            onClick={onToggleCollapse}
            className="flex w-7 h-7 items-center justify-center rounded-full bg-surface-container-lowest text-secondary hover:text-primary hover:bg-surface-container-high border border-outline-variant/40 shadow-sm hover:shadow-md transition-all duration-200 active:scale-90 group/toggle cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span
              className="material-symbols-outlined text-[17px] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              chevron_right
            </span>
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-110px)] overflow-hidden">
          {/* Brand Logo Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/15 relative shrink-0">
            <button
              onClick={() => handleLinkClick('overview-dashboard')}
              className="flex items-center text-left group focus:outline-none overflow-hidden"
              title="ChargeOne Energy Network OS"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <ChargeOneLogo className="h-8 w-8 transition-transform group-hover:scale-105 shrink-0" />
              </div>
              <div
                className="flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                style={{
                  maxWidth: isCollapsed ? '0px' : '180px',
                  opacity: isCollapsed ? 0 : 1,
                  transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                  marginLeft: isCollapsed ? '0px' : '10px',
                }}
              >
                <span className="text-[17px] font-bold tracking-tight text-on-surface leading-tight">
                  Charge<span className="text-primary">One</span>
                </span>
                <span className="text-[9px] text-on-surface-variant font-semibold tracking-wider uppercase">
                  ENERGY NETWORK OS
                </span>
              </div>
            </button>

            {/* Mobile Close Button */}
            {onCloseMobileDrawer && (
              <button
                onClick={onCloseMobileDrawer}
                className="xl:hidden p-1.5 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Close Navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-2.5 px-3 flex flex-col gap-3.5 no-scrollbar">
            {/* CPO Operations */}
            <div className="flex flex-col gap-1">
              <SectionHeader title="CPO Operations" isCollapsed={isCollapsed} />
              <NavItem icon="dashboard" label="Overview / Dashboard" isActive={isSelected('overview-dashboard')} onClick={() => handleLinkClick('overview-dashboard')} isCollapsed={isCollapsed} />
              <NavItem icon="ev_station" label="Stations & Chargers" isActive={isSelected('stations-chargers')} onClick={() => handleLinkClick('stations-chargers')} badge="1,420" isCollapsed={isCollapsed} />
              <NavItem icon="pin_drop" label="Maps AI Grounding" isActive={isSelected('maps-intelligence')} onClick={() => handleLinkClick('maps-intelligence')} badge="LIVE" isCollapsed={isCollapsed} variant="maps" />
              <NavItem icon="monitoring" label="Live Telemetry & Health" isActive={isSelected('live-telemetry-health')} onClick={() => handleLinkClick('live-telemetry-health')} isCollapsed={isCollapsed} />
              <NavItem icon="electric_bolt" label="Charging Sessions" isActive={isSelected('charging-sessions')} onClick={() => handleLinkClick('charging-sessions')} isCollapsed={isCollapsed} />
              <NavItem icon="price_change" label="Tariffs & Pricing Engines" isActive={isSelected('tariffs-pricing-engines')} onClick={() => handleLinkClick('tariffs-pricing-engines')} isCollapsed={isCollapsed} />
              <NavItem icon="payments" label="Revenue & Financials" isActive={isSelected('revenue-financials')} onClick={() => handleLinkClick('revenue-financials')} isCollapsed={isCollapsed} />
              <NavItem icon="account_balance_wallet" label="Settlements & Reconciliation" isActive={isSelected('settlements-reconciliation')} onClick={() => handleLinkClick('settlements-reconciliation')} isCollapsed={isCollapsed} />
            </div>

            {/* Roaming & Standards */}
            <div className="flex flex-col gap-1">
              <SectionHeader title="Roaming & Standards" isCollapsed={isCollapsed} />
              <NavItem icon="hub" label="OCPI Network Roaming" isActive={isSelected('ocpi-network-roaming')} onClick={() => handleLinkClick('ocpi-network-roaming')} isCollapsed={isCollapsed} />
              <NavItem icon="router" label="OCPP Charger Gateway" isActive={isSelected('ocpp-charger-gateway')} onClick={() => handleLinkClick('ocpp-charger-gateway')} isCollapsed={isCollapsed} />
            </div>

            {/* Enterprise Fleet */}
            <div className="flex flex-col gap-1">
              <SectionHeader title="Enterprise Fleet" isCollapsed={isCollapsed} />
              <NavItem icon="directions_car" label="Fleet Monitoring & Policies" isActive={isSelected('fleet-monitoring-policies')} onClick={() => handleLinkClick('fleet-monitoring-policies')} isCollapsed={isCollapsed} />
            </div>

            {/* Platform Admin */}
            <div className="flex flex-col gap-1">
              <SectionHeader title="Platform Admin" isCollapsed={isCollapsed} />
              <NavItem icon="extension" label="Integration Center" isActive={isSelected('integration-center')} onClick={() => handleLinkClick('integration-center')} isCollapsed={isCollapsed} />
              <NavItem icon="security" label="Audit Logs & Security" isActive={isSelected('audit-logs-security')} onClick={() => handleLinkClick('audit-logs-security')} isCollapsed={isCollapsed} />
            </div>
          </nav>
        </div>

        {/* Driver Mobile App Companion Switcher & Roaming Sync Status Footer */}
        <div className="relative overflow-hidden shrink-0 border-t border-outline-variant/15">
          {/* Expanded Footer Card */}
          <div
            className="transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden"
            style={{
              maxHeight: isCollapsed ? '0px' : '160px',
              opacity: isCollapsed ? 0 : 1,
              padding: isCollapsed ? '0 12px' : '12px',
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="bg-surface-container rounded-xl p-2.5 flex flex-col gap-2 border border-outline-variant/30">
              <button
                onClick={onOpenMobileView}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-on-primary transition-all text-left shadow-xs group"
                title="Switch to Mobile App Preview (Image 9)"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary group-hover:text-on-primary">
                    phone_iphone
                  </span>
                  <span className="text-[12px] font-semibold">Driver Mobile View</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-bold group-hover:bg-white group-hover:text-primary">
                  LIVE APP
                </span>
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="text-secondary font-medium">Roaming Sync</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-primary font-semibold">Synchronized</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Gateway Latency</span>
                <span className="font-semibold text-on-surface font-mono">18ms</span>
              </div>
            </div>
          </div>

          {/* Collapsed Mini Footer Icon */}
          <div
            className="transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] overflow-hidden flex flex-col items-center justify-center"
            style={{
              maxHeight: isCollapsed ? '70px' : '0px',
              opacity: isCollapsed ? 1 : 0,
              padding: isCollapsed ? '10px 0' : '0',
              pointerEvents: isCollapsed ? 'auto' : 'none',
            }}
          >
            <button
              onClick={onOpenMobileView}
              className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center group/mobile relative"
              title="Driver Mobile View"
            >
              <span className="material-symbols-outlined text-[20px] text-primary group-hover/mobile:text-on-primary">
                phone_iphone
              </span>
              <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface text-[12px] font-medium whitespace-nowrap opacity-0 invisible group-hover/mobile:opacity-100 group-hover/mobile:visible transition-all duration-150 pointer-events-none z-50 shadow-md">
                Driver Mobile View
              </div>
            </button>
            <div className="flex items-center justify-center mt-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Roaming Sync: Synchronized"></span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
