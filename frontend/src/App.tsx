import { useState, useEffect } from 'react';
import { ScreenId, ActiveSession, ChatbotRole } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/screens/OverviewDashboard';
import { IntegrationCenter } from './components/screens/IntegrationCenter';
import { LiveTelemetryHealth } from './components/screens/LiveTelemetryHealth';
import { FinancialSettlements } from './components/screens/FinancialSettlements';
import { SessionAuditDossier } from './components/screens/SessionAuditDossier';
import { DriverMobileApp } from './components/screens/DriverMobileApp';
import { StationsChargersList } from './components/screens/StationsChargersList';
import { ChargingSessionsList } from './components/screens/ChargingSessionsList';
import { TariffsPricingView } from './components/screens/TariffsPricingView';
import { RevenueFinancialsView } from './components/screens/RevenueFinancialsView';
import { FleetMonitoringView } from './components/screens/FleetMonitoringView';
import { AuditLogsView } from './components/screens/AuditLogsView';
import { MapsIntelligenceView } from './components/screens/MapsIntelligenceView';
import { ProvisionStationModal } from './components/modals/ProvisionStationModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { ToastNotification } from './components/modals/ToastNotification';
import { AiMapsAssistantDrawer } from './components/modals/AiMapsAssistantDrawer';
import { INITIAL_SESSIONS } from './data/mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview-dashboard');
  const [selectedSession, setSelectedSession] = useState<ActiveSession>(INITIAL_SESSIONS[0]);
  const [selectedCpo, setSelectedCpo] = useState('CPO Portal (Starlight Energy)');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modals & Feedback
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerInitialQuery, setAiDrawerInitialQuery] = useState('');
  const [aiDrawerRole, setAiDrawerRole] = useState<ChatbotRole>('maps');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const openAiDrawer = (initialQuery?: string, role: ChatbotRole = 'maps') => {
    if (initialQuery) setAiDrawerInitialQuery(initialQuery);
    setAiDrawerRole(role);
    setIsAiDrawerOpen(true);
  };

  // Keyboard shortcut: Command/Ctrl + K (Command Palette), Command/Ctrl + J (Maps AI Copilot)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAiDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProvisionSuccess = (data: { name: string; vendor: string; powerKw: number; hub: string }) => {
    showToast(`Provisioned ${data.name} (${data.vendor} ${data.powerKw} kW DC) at ${data.hub}! Handshake active.`, 'success');
  };

  const isMobileView = currentScreen === 'driver-mobile-view';

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col antialiased">
      {/* Toast Notification Container */}
      <ToastNotification
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />

      {/* Provision Station Modal */}
      <ProvisionStationModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={handleProvisionSuccess}
      />

      {/* ⌘K Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenAiDrawer={openAiDrawer}
        onSelectSession={(sess) => {
          setSelectedSession(sess);
          handleNavigate('session-audit-dossier');
        }}
      />

      {/* Google Maps Grounding & AI Assistant Drawer (⌘J) */}
      <AiMapsAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        initialQuery={aiDrawerInitialQuery}
        initialRole={aiDrawerRole}
      />

      {isMobileView ? (
        // Dedicated Driver Mobile App Experience (Image 9)
        <div className="w-full flex-1 flex flex-col items-center justify-center p-4 bg-surface-container-low">
          <DriverMobileApp
            onShowToast={showToast}
            onExitMobileView={() => handleNavigate('overview-dashboard')}
          />
        </div>
      ) : (
        // Full Enterprise CPO Command Center Workspace
        <>
          {/* Persistent Sidebar */}
          <Sidebar
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            onOpenMobileView={() => handleNavigate('driver-mobile-view')}
            onOpenAiDrawer={openAiDrawer}
            isMobileViewActive={isMobileView}
            isOpenMobileDrawer={isMobileDrawerOpen}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
          />

          {/* Persistent Header */}
          <Header
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
            onToggleMobileView={() => handleNavigate('driver-mobile-view')}
            onOpenAiDrawer={openAiDrawer}
            isMobileViewActive={isMobileView}
            selectedCpo={selectedCpo}
            onSelectCpo={setSelectedCpo}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
          />

          {/* Main Viewport Content */}
          <main className="pl-0 xl:pl-72 pt-16 min-h-screen w-full flex-1 bg-surface">
            <div className="w-full px-4 sm:px-6 xl:px-8 py-6">
              {currentScreen === 'overview-dashboard' && (
                <OverviewDashboard
                  onNavigate={handleNavigate}
                  onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
                  onOpenAiDrawer={openAiDrawer}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    handleNavigate('session-audit-dossier');
                  }}
                  onShowToast={showToast}
                />
              )}

              {currentScreen === 'stations-chargers' && (
                <StationsChargersList
                  onNavigate={handleNavigate}
                  onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
                  onOpenAiDrawer={openAiDrawer}
                  onShowToast={showToast}
                />
              )}

              {currentScreen === 'maps-intelligence' && (
                <MapsIntelligenceView
                  onShowToast={showToast}
                  onOpenAiDrawer={openAiDrawer}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'live-telemetry-health' && (
                <LiveTelemetryHealth onShowToast={showToast} />
              )}

              {currentScreen === 'charging-sessions' && (
                <ChargingSessionsList
                  onNavigate={handleNavigate}
                  onSelectSession={(sess) => {
                    setSelectedSession(sess);
                    handleNavigate('session-audit-dossier');
                  }}
                  onShowToast={showToast}
                />
              )}

              {currentScreen === 'session-audit-dossier' && (
                <SessionAuditDossier
                  session={selectedSession}
                  onShowToast={showToast}
                  onBack={() => handleNavigate('charging-sessions')}
                />
              )}

              {currentScreen === 'tariffs-pricing-engines' && (
                <TariffsPricingView onShowToast={showToast} />
              )}

              {currentScreen === 'revenue-financials' && (
                <RevenueFinancialsView onShowToast={showToast} />
              )}

              {currentScreen === 'settlements-reconciliation' && (
                <FinancialSettlements onShowToast={showToast} />
              )}

              {(currentScreen === 'integration-center' ||
                currentScreen === 'ocpi-network-roaming' ||
                currentScreen === 'ocpp-charger-gateway') && (
                <IntegrationCenter
                  currentScreen={currentScreen}
                  onNavigate={handleNavigate}
                  onShowToast={showToast}
                />
              )}

              {currentScreen === 'fleet-monitoring-policies' && (
                <FleetMonitoringView onShowToast={showToast} />
              )}

              {currentScreen === 'audit-logs-security' && (
                <AuditLogsView onShowToast={showToast} />
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
