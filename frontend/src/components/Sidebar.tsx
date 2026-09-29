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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenMobileView,
  onOpenAiDrawer,
  isMobileViewActive = false,
  isOpenMobileDrawer = false,
  onCloseMobileDrawer,
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
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low z-40 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/20 transition-transform duration-300 ${
          isOpenMobileDrawer ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-[calc(100%-145px)]">
          {/* Brand Logo Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <button
              onClick={() => handleLinkClick('overview-dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <ChargeOneLogo className="h-8 w-8 transition-transform group-hover:scale-105 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[18px] font-bold tracking-tight text-on-surface leading-tight">
                  Charge<span className="text-primary">One</span>
                </span>
                <span className="text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase">
                  ENERGY NETWORK OS
                </span>
              </div>
            </button>

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
        <nav className="flex-1 overflow-y-auto px-3.5 py-2 flex flex-col gap-4 no-scrollbar">
          {/* CPO Operations */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-[11px] uppercase tracking-wider text-secondary font-bold">
              CPO Operations
            </span>
            <button
              onClick={() => handleLinkClick('overview-dashboard')}
              className={`flex items-center justify-between px-3 py-2 transition-all rounded-lg text-left ${
                isSelected('overview-dashboard')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span className="text-[13px]">Overview / Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('stations-chargers')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('stations-chargers')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">ev_station</span>
                <span className="text-[13px]">Stations &amp; Chargers</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                1,420
              </span>
            </button>

            <button
              onClick={() => handleLinkClick('maps-intelligence')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('maps-intelligence')
                  ? 'bg-emerald-500/20 text-emerald-900 font-bold border border-emerald-500/40 shadow-xs'
                  : 'text-emerald-800 hover:bg-emerald-500/10 border border-emerald-500/20'
              } group cursor-pointer`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-emerald-600 group-hover:scale-110 transition-transform">
                  pin_drop
                </span>
                <span className="text-[13px] font-bold">Maps AI Grounding</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                LIVE
              </span>
            </button>

            <button
              onClick={() => handleLinkClick('live-telemetry-health')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('live-telemetry-health')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
                <span className="text-[13px]">Live Telemetry &amp; Health</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('charging-sessions')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('charging-sessions')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                <span className="text-[13px]">Charging Sessions</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('tariffs-pricing-engines')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('tariffs-pricing-engines')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">price_change</span>
                <span className="text-[13px]">Tariffs &amp; Pricing Engines</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('revenue-financials')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('revenue-financials')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span className="text-[13px]">Revenue &amp; Financials</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('settlements-reconciliation')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('settlements-reconciliation')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                <span className="text-[13px]">Settlements &amp; Reconciliation</span>
              </div>
            </button>
          </div>

          {/* Roaming & Standards */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-[11px] uppercase tracking-wider text-secondary font-bold">
              Roaming &amp; Standards
            </span>
            <button
              onClick={() => handleLinkClick('ocpi-network-roaming')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('ocpi-network-roaming')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">hub</span>
                <span className="text-[13px]">OCPI Network Roaming</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('ocpp-charger-gateway')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('ocpp-charger-gateway')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">router</span>
                <span className="text-[13px]">OCPP Charger Gateway</span>
              </div>
            </button>
          </div>

          {/* Enterprise Fleet */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-[11px] uppercase tracking-wider text-secondary font-bold">
              Enterprise Fleet
            </span>
            <button
              onClick={() => handleLinkClick('fleet-monitoring-policies')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('fleet-monitoring-policies')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
                <span className="text-[13px]">Fleet Monitoring &amp; Policies</span>
              </div>
            </button>
          </div>

          {/* Platform Admin */}
          <div className="flex flex-col gap-1">
            <span className="px-2 text-[11px] uppercase tracking-wider text-secondary font-bold">
              Platform Admin
            </span>
            <button
              onClick={() => handleLinkClick('integration-center')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('integration-center')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">extension</span>
                <span className="text-[13px]">Integration Center</span>
              </div>
            </button>

            <button
              onClick={() => handleLinkClick('audit-logs-security')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected('audit-logs-security')
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">security</span>
                <span className="text-[13px]">Audit Logs &amp; Security</span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Driver Mobile App Companion Switcher & Roaming Sync Status Footer */}
      <div className="p-3 mx-3 mb-3 bg-surface-container rounded-xl flex flex-col gap-2 border border-outline-variant/30">
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
    </aside>
    </>
  );
};
