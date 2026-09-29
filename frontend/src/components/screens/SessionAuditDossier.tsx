import React, { useState } from 'react';
import { ActiveSession } from '../../types';

interface SessionAuditDossierProps {
  session?: ActiveSession;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onBack?: () => void;
}

export const SessionAuditDossier: React.FC<SessionAuditDossierProps> = ({
  session,
  onShowToast,
  onBack,
}) => {
  const [traceFilter, setTraceFilter] = useState<'all' | 'protocols' | 'financial'>('all');
  const [protocolInspectorTab, setProtocolInspectorTab] = useState<'ocpi' | 'ocpp'>('ocpp');
  const [isCopied, setIsCopied] = useState(false);

  const sessionId = session ? session.id : 'SES-928183';
  const stationTitle = session ? session.stationName : 'Tata Power Hub • Indiranagar #02';

  const ocpiJsonPayload = `{
  "status_code": 1000,
  "status_message": "Success",
  "timestamp": "2025-05-15T14:11:22Z",
  "data": {
    "result": "ACCEPTED",
    "timeout": 30,
    "session_id": "cpo-ses-41094",
    "token": {
      "uid": "9A8F33C148001",
      "type": "RFID",
      "auth_id": "auth_9921b",
      "visual_number": "KA-03-EV-8901",
      "issuer": "Tata.ev"
    },
    "location_id": "LOC-BLR-04",
    "evse_uid": "IN*TPE*E089B*1",
    "authorization_reference": "auth_ref_99201"
  }
}`;

  const ocppJsonPayload = `// Frame #89201 • TLS WebSocket Raw Ingress
{
  "messageTypeId": 2,
  "messageId": "req-889102-tpe",
  "action": "RequestStartTransaction",
  "payload": {
    "evseId": 1,
    "remoteStartId": 928183,
    "idToken": {
      "idToken": "9A8F33C148001",
      "type": "Central"
    },
    "chargingProfile": {
      "chargingProfilePurpose": "TxProfile",
      "stackLevel": 1,
      "chargingSchedule": {
        "chargingRateUnit": "W",
        "limit": 150000.0
      }
    }
  }
}

// Response Frame (22ms later)
[3, "req-889102-tpe", { "status": "Accepted", "transactionId": "tx-ind-0092" }]`;

  const copyFrames = () => {
    const payload = protocolInspectorTab === 'ocpp' ? ocppJsonPayload : ocpiJsonPayload;
    navigator.clipboard?.writeText(payload);
    setIsCopied(true);
    onShowToast('Protocol frames copied to clipboard.', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Context Bar: Search, Entity Context & Global Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20">
        <div className="flex flex-wrap items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              title="Return to Charging Sessions list"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          )}

          <div className="relative min-w-[280px] sm:min-w-[340px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              manage_search
            </span>
            <input
              readOnly
              className="w-full h-10 pl-10 pr-24 rounded-lg bg-surface-container-low text-on-surface text-[13px] font-bold focus:outline-none shadow-inner border border-outline-variant/20"
              type="text"
              value={`${sessionId} (${stationTitle})`}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold tracking-wider font-mono">
              L5 Audit
            </span>
          </div>

          <div className="h-6 w-px bg-surface-container-highest hidden md:block"></div>

          {/* High-Density Telemetry Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Completed &amp; Settled
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium font-mono">
              <span className="material-symbols-outlined text-[15px] text-secondary">schedule</span>
              38m 12s
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold font-mono">
              <span className="material-symbols-outlined text-[15px] text-primary">bolt</span>
              24.8 kWh
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-on-surface text-[11px] font-bold font-mono">
              ₹446.40
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              SLA 100%
            </span>
          </div>
        </div>

        {/* Contextual Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onShowToast(`Reprocessing CDR for ${sessionId} through settlement engine...`, 'info')}
            className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold flex items-center gap-1 transition-colors border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">refresh</span>
            <span>Reprocess CDR</span>
          </button>
          <button
            onClick={() => onShowToast(`Opening raw byte stream for WebSocket frame #89201...`, 'info')}
            className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-semibold flex items-center gap-1 transition-colors border border-outline-variant/20"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] text-secondary">terminal</span>
            <span>Raw Stream</span>
          </button>
          <button
            onClick={() => onShowToast(`Partial refund workflow initiated for ${sessionId}.`, 'error')}
            className="h-9 px-3 rounded-lg bg-error-container hover:bg-surface-variant text-on-error-container text-[12px] font-semibold flex items-center gap-1 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">replay</span>
            <span>Partial Refund</span>
          </button>
          <button
            onClick={() => onShowToast(`Compiled immutable Audit Dossier for ${sessionId}. PDF ready.`, 'success')}
            className="h-9 px-3.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px]">assignment_turned_in</span>
            <span>Audit Dossier</span>
          </button>
        </div>
      </div>

      {/* 4 Architectural Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Pillar 1: Driver UX */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary/5 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Layer 1 • Driver UX
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                BluSmart Corp
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold truncate text-on-surface">
                  {session?.driverName || 'Arvind Swaminathan'}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  ID: #DRV-88219 • {session?.vehicleModel || 'Tata Nexon EV Max'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] border border-outline-variant/10">
            <span className="text-on-surface-variant">Auth Token Hash:</span>
            <span className="text-on-surface font-mono font-medium">9a8f…33c1 (RFID/App)</span>
          </div>
        </div>

        {/* Pillar 2: Hardware Node */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-secondary-container/20 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Layer 3/4 • Hardware Node
              </span>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold font-mono">
                CCS2 • 360 kW
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary text-[20px]">ev_station</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold truncate text-on-surface">ABB Terra 360 kW</span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  {session?.chargerId || 'CH-BLR-089-B'} • Port #1
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] border border-outline-variant/10">
            <span className="text-on-surface-variant">EVSE ID:</span>
            <span className="text-on-surface font-mono font-medium truncate ml-1">IN*TPE*E089B*1</span>
          </div>
        </div>

        {/* Pillar 3: OCPI Roaming */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-surface-variant/30 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                Layer 2 • OCPI Roaming
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold font-mono">
                v2.2.1 Sync
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold truncate text-on-surface">Tata Power EZ Charge</span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  CPO Code: IN*TPE • Bilateral Direct
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] border border-outline-variant/10">
            <span className="text-on-surface-variant">Gateway Route:</span>
            <span className="text-on-surface font-mono font-medium truncate">ocpi.gateway.chargeone.in</span>
          </div>
        </div>

        {/* Pillar 4: Dynamic Tariff */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-tertiary-container/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Layer 5 • Dynamic Tariff
              </span>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                Peak Active
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold truncate text-on-surface font-mono">
                  ₹18.00 / kWh Base
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  + ₹10 Session • ₹2/min Idle Waived
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] border border-outline-variant/10">
            <span className="text-on-surface-variant">Clearing Split:</span>
            <span className="text-primary font-bold">85% CPO • 10% Roaming • 5% Tax</span>
          </div>
        </div>
      </div>

      {/* Protocol Sequence Map: Visual 9-Step Architectural E2E Pipeline */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">account_tree</span>
            </div>
            <div>
              <span className="text-[16px] font-bold text-on-surface">
                End-to-End Handshake &amp; Settlement Trace
              </span>
              <p className="text-[12px] text-on-surface-variant">
                Deterministic timeline across 5 platform boundaries • Total Latency to Power Flow: 24.2 seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-on-surface-variant font-medium">Trace Filter:</span>
            <div className="inline-flex rounded-lg bg-surface-container p-0.5 text-[11px]">
              <button
                onClick={() => setTraceFilter('all')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  traceFilter === 'all'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All 9 Steps
              </button>
              <button
                onClick={() => setTraceFilter('protocols')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  traceFilter === 'protocols'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Protocols Only
              </button>
              <button
                onClick={() => setTraceFilter('financial')}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  traceFilter === 'financial'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Financial Ledger
              </button>
            </div>
          </div>
        </div>

        {/* 9 Steps Visual Timeline Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[1100px] flex flex-col gap-3">
            {/* Row 1: Steps 1 to 5 */}
            <div className="grid grid-cols-5 gap-3">
              {/* Step 1 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    Driver App QR
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:11:02.102</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">Geofence Validated</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    12m radial accuracy. Bluetooth Low Energy + QR handshake authenticated.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Token: #TK-882</span>
                  <span className="text-primary font-bold">200 OK</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      2
                    </span>
                    UPI Pre-Hold
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:11:15.340</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">Razorpay ₹500 Hold</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Auth ID: auth_9921b. ML Fraud Score: 0.02 (Safe). Fleet pre-approved.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Latency: 1.2s</span>
                  <span className="text-primary font-bold">Authorized</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      3
                    </span>
                    OCPI 2.2.1 Start
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:11:22.018</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">POST /commands/START</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Roaming relay to Tata Power. CPO Session ID: cpo-ses-41094.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Trace: #ocpi-8891</span>
                  <span className="text-primary font-bold">200 Accepted</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      4
                    </span>
                    OCPP 2.0.1 Broker
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:11:26.491</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">RemoteStartTransaction</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    WebSocket Frame #89201. Connector #1 locked via TLS broker.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>WSS RTT: 18ms</span>
                  <span className="text-primary font-bold">Accepted</span>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-surface-container-high p-3.5 rounded-xl flex flex-col gap-2 shadow-xs border border-primary/40 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      5
                    </span>
                    Active Power Loop
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">14:11 — 14:49</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">38 Telemetry Pulses</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Isolation: 4.8 MΩ. Mean: 118.2 kW. Peak: 142 kW @ 42°C. 0 thermal throttle.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-on-surface font-mono font-bold border-t border-primary/20">
                  <span>Energy: 24.8 kWh</span>
                  <span className="text-primary">100% Uptime</span>
                </div>
              </div>
            </div>

            {/* Row 2: Steps 6 to 9 */}
            <div className="grid grid-cols-4 gap-3">
              {/* Step 6 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold">
                      6
                    </span>
                    Driver Unplug Event
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:49:14.210</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">RequestStopTransaction</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    App trigger -&gt; RemoteStop -&gt; Solenoid unlocked in 320ms.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Reason: RemoteUser</span>
                  <span className="text-on-surface font-bold">Unlocked</span>
                </div>
              </div>

              {/* Step 7 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold">
                      7
                    </span>
                    CDR Ingestion Engine
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:49:18.892</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">Tariff Recalculation Match</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Meter: 24.800 kWh. Matched against signed telemetry registers with 0 delta.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Hash: verified</span>
                  <span className="text-primary font-bold">₹446.40 Exact</span>
                </div>
              </div>

              {/* Step 8 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold">
                      8
                    </span>
                    Payment &amp; Invoicing
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:49:21.050</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">UPI AutoPay Capture</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Captured ₹446.40. Auto-released ₹53.60 excess hold. GST Invoice #INV-2025-0982 issued.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Razorpay Txn</span>
                  <span className="text-primary font-bold">Settled</span>
                </div>
              </div>

              {/* Step 9 */}
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2 border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">
                      9
                    </span>
                    Clearing &amp; Reconciliation
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">14:49:23.180</span>
                </div>
                <div className="flex flex-col gap-1 text-on-surface">
                  <span className="text-[12px] font-bold">Batch #SET-92831 Dispatched</span>
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Double-entry ledger recorded: CPO (₹379.44), Platform (₹44.64), Tax (₹17.86), Gateway (₹4.46).
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-secondary font-mono border-t border-outline-variant/10">
                  <span>Ledger Balanced</span>
                  <span className="text-primary font-bold">Archived</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Lower Inspector: Telemetry Curve vs Dual Protocol Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Telemetry Curve */}
        <div className="xl:col-span-7 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-on-surface">Session Telemetry Curve</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[10px] font-bold font-mono">
                  38 Samples
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Instantaneous kW, SoC curve and EVSE connector pin temperatures
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-3 h-1 bg-primary rounded-full"></span>
                <span>kW Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-3 h-1 bg-secondary rounded-full"></span>
                <span>SoC %</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-3 h-1 bg-error rounded-full"></span>
                <span>Temp (°C)</span>
              </div>
            </div>
          </div>

          {/* SVG Telemetry Visualization */}
          <div className="relative w-full h-64 bg-surface-container-low rounded-xl p-3 flex flex-col justify-end overflow-hidden border border-outline-variant/20">
            {/* Background Grid */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-30 text-[10px] text-secondary font-mono">
              <div className="w-full border-b border-secondary/20 flex justify-between">
                <span>150 kW / 100%</span>
                <span>14:45</span>
              </div>
              <div className="w-full border-b border-secondary/20 flex justify-between">
                <span>100 kW / 66%</span>
                <span>14:35</span>
              </div>
              <div className="w-full border-b border-secondary/20 flex justify-between">
                <span>50 kW / 33%</span>
                <span>14:25</span>
              </div>
              <div className="w-full flex justify-between">
                <span>0 kW / 0%</span>
                <span>14:11</span>
              </div>
            </div>

            {/* SVG Line Curves */}
            <svg
              className="w-full h-48 overflow-visible relative z-10"
              preserveAspectRatio="none"
              viewBox="0 0 600 200"
            >
              <defs>
                <linearGradient id="powerDossierGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#006948" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#006948" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area for Power */}
              <polygon
                fill="url(#powerDossierGrad)"
                points="20,180 30,120 70,60 120,42 180,44 260,48 340,65 420,95 490,135 550,165 570,180"
              />
              {/* kW Line */}
              <polyline
                fill="none"
                points="20,180 30,120 70,60 120,42 180,44 260,48 340,65 420,95 490,135 550,165 570,180"
                stroke="#006948"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
              {/* Battery SoC Curve */}
              <polyline
                fill="none"
                points="20,160 80,145 160,125 240,105 320,80 400,60 480,42 550,28 570,25"
                stroke="#565e74"
                strokeDasharray="4,4"
                strokeLinecap="round"
                strokeWidth="2"
              />
              {/* Connector Pin Thermal Curve */}
              <polyline
                fill="none"
                points="20,165 80,158 160,150 240,144 320,140 400,138 480,136 550,142 570,150"
                stroke="#ba1a1a"
                strokeLinecap="round"
                strokeWidth="2"
              />
              {/* Marker at Peak */}
              <circle cx="120" cy="42" fill="#00855d" r="5" className="animate-pulse" />
              <line stroke="#006948" strokeDasharray="2,2" strokeWidth="1" x1="120" x2="120" y1="42" y2="190" />
            </svg>

            {/* Peak Telemetry Tag */}
            <div className="absolute left-28 top-8 bg-surface-container-lowest px-2.5 py-1.5 rounded-md shadow-md z-20 pointer-events-none flex flex-col border border-outline-variant/30">
              <span className="text-[11px] text-primary font-bold font-mono">
                Peak Delivery: 142.1 kW
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono">
                SoC: 44% • Pin: 42°C
              </span>
            </div>
          </div>

          {/* Metric Readout Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Initial Battery SoC
              </span>
              <span className="text-[15px] text-on-surface font-bold font-mono">
                18% <span className="text-secondary font-normal text-[11px]">(3.2 kWh)</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Final Disconnect SoC
              </span>
              <span className="text-[15px] text-primary font-bold font-mono">
                82% <span className="text-on-surface-variant font-normal text-[11px]">(+64% Net)</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Voltage / Max Amps
              </span>
              <span className="text-[15px] text-on-surface font-bold font-mono">
                410 V <span className="text-secondary font-normal text-[11px]">/ 346 A</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                Max Connector Pin Temp
              </span>
              <span className="text-[15px] text-on-surface font-bold font-mono">
                42.4°C <span className="text-primary font-normal text-[11px]">(Normal)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dual Protocol Inspector */}
        <div className="xl:col-span-5 bg-surface-container-lowest p-5 rounded-xl shadow-xs border border-outline-variant/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
                <span className="text-[16px] font-bold text-on-surface">Dual Protocol Inspector</span>
              </div>
              <button
                onClick={copyFrames}
                className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors flex items-center gap-1 border border-outline-variant/20"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isCopied ? 'check' : 'content_copy'}
                </span>
                <span>{isCopied ? 'Copied!' : 'Copy Frames'}</span>
              </button>
            </div>

            {/* Protocol Tabs */}
            <div className="flex rounded-lg bg-surface-container p-1 text-[11px] mb-3 border border-outline-variant/20">
              <button
                onClick={() => setProtocolInspectorTab('ocpi')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  protocolInspectorTab === 'ocpi'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                OCPI 2.2.1 Command Response
              </button>
              <button
                onClick={() => setProtocolInspectorTab('ocpp')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  protocolInspectorTab === 'ocpp'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                OCPP 2.0.1 WebSocket Frame
              </button>
            </div>

            {/* Monospace Code Viewer */}
            <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto h-72 flex flex-col justify-between shadow-inner border border-outline/30">
              <pre className="text-secondary-fixed-dim whitespace-pre overflow-x-auto select-all">
                {protocolInspectorTab === 'ocpp' ? ocppJsonPayload : ocpiJsonPayload}
              </pre>
              <div className="mt-2 pt-2 border-t border-outline/30 flex items-center justify-between text-[10px] text-surface-variant font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                  Strict Schema Validation: 0 Errors
                </span>
                <span>Checksum: SHA-256 #8f90..a1</span>
              </div>
            </div>
          </div>

          {/* Settlement Ledger Allocation Footnote */}
          <div className="mt-4 p-3 bg-surface-container rounded-lg flex flex-col gap-1 border border-outline-variant/20 text-[12px]">
            <div className="flex items-center justify-between font-bold text-on-surface text-[11px]">
              <span>Settlement Ledger Allocation:</span>
              <span className="font-mono">Batch #SET-92831</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
              <span>CPO Revenue (85%)</span>
              <span className="font-mono text-on-surface font-bold">₹379.44</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
              <span>ChargeOne OCPI Roaming (10%)</span>
              <span className="font-mono text-primary font-bold">₹44.64</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
              <span>GST (5%) + PG Gateway Fee</span>
              <span className="font-mono text-on-surface font-medium">₹17.86 + ₹4.46</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
