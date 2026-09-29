export type ScreenId =
  | 'overview-dashboard'
  | 'stations-chargers'
  | 'maps-intelligence'
  | 'live-telemetry-health'
  | 'charging-sessions'
  | 'session-audit-dossier'
  | 'tariffs-pricing-engines'
  | 'revenue-financials'
  | 'settlements-reconciliation'
  | 'ocpi-network-roaming'
  | 'ocpp-charger-gateway'
  | 'fleet-monitoring-policies'
  | 'integration-center'
  | 'audit-logs-security'
  | 'driver-mobile-view';

export type ChatbotRole = 'maps' | 'fast' | 'complex' | 'general';

export interface GroundingMapPlace {
  title: string;
  uri: string;
  reviewSnippets?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  timestamp: string;
  groundingChunks?: any[];
  mapsPlaces?: GroundingMapPlace[];
  error?: boolean;
}

export interface ChargerNode {
  id: string;
  name: string;
  vendor: string;
  model: string;
  ip: string;
  evsePort: string;
  connectors: string;
  ratingDesc: string;
  maxPowerKw: number;
  activePowerKw: number;
  powerTargetKw: number;
  busVoltageV: number;
  deliveryCurrentA: number;
  phaseVoltages: { l1: number; l2: number; l3: number };
  bayTempC: number;
  gunATempC: number;
  gunBTempC: number;
  powerModulesTempC: number;
  status: 'Charging' | 'Available' | 'Finishing' | 'Thermal Warn' | 'Faulted';
  ocppVersion: 'OCPP 2.0.1' | 'OCPP 1.6J';
  activeSessionMinutes?: number;
  lastAckMs: number;
  coolantPressureBar: number;
  isolationResistanceMOhm: number;
  pumpRpm: number;
  architecture: '800V ARCH' | '400V ARCH';
}

export interface ActiveSession {
  id: string;
  operator: string;
  protocol: string;
  stationName: string;
  chargerId: string;
  connectorType: string;
  maxPowerKw: number;
  vehicleModel: string;
  driverName: string;
  driverId: string;
  licensePlate: string;
  currentSoc: number;
  activePowerKw: number;
  powerStatus: string;
  deliveredKwh: number;
  costInr: number;
  duration: string;
  status: 'Charging' | 'Finishing' | 'Completed';
}

export interface RoamingPartner {
  id: string;
  name: string;
  initials: string;
  verified?: boolean;
  country: string;
  cpoId: string;
  role: string;
  protocol: string;
  moduleHealth: {
    locations: string;
    tariffs: string;
    sessions: string;
    cdrs: string;
    tokens: string;
    cmdLatency: string;
  };
  throughputReqSec: number;
  errorStats: string;
  status: 'Live / Healthy' | 'Syncing Delta' | 'Degraded';
}

export interface SettlementBatch {
  id: string;
  autoGenNote: string;
  cpoName: string;
  cpoInitials: string;
  cpoId: string;
  cycle: string;
  cycleDates: string;
  sessionsCount: number;
  energyMwh: number;
  grossAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  gatewayDeduct: number;
  adjustments: number;
  adjustmentNote: string;
  netPayable: number;
  tdsDeducted: number;
  status: 'Ready' | 'Processing' | 'Disputed' | 'Paid';
  clearingAccount: string;
  bankName: string;
  gstin: string;
}

export interface TraceLog {
  id: string;
  time: string;
  proto: string;
  method: string;
  status: string;
  body: string;
  traceId: string;
}
