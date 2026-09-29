import React, { useState } from 'react';

interface ProvisionStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (stationData: { name: string; vendor: string; powerKw: number; hub: string }) => void;
}

export const ProvisionStationModal: React.FC<ProvisionStationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [stationName, setStationName] = useState('');
  const [vendor, setVendor] = useState('ABB Terra');
  const [powerKw, setPowerKw] = useState(360);
  const [hubLocation, setHubLocation] = useState('Bengaluru Tech Corridor Hub 04');
  const [ocppVersion, setOcppVersion] = useState('OCPP 2.0.1');
  const [securityProfile, setSecurityProfile] = useState('Profile 3 (Client Cert / mTLS)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName) return;
    onSuccess({
      name: stationName,
      vendor,
      powerKw,
      hub: hubLocation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-lg w-full p-6 animate-scaleUp">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">ev_station</span>
            <h3 className="text-[18px] font-bold text-on-surface">Provision New Station / Node</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
              Station Name / Identifier
            </label>
            <input
              required
              placeholder="e.g. Indiranagar Superhub CH-05"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                Hardware Vendor
              </label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
              >
                <option>ABB Terra</option>
                <option>Tritium PK350</option>
                <option>Delta UltraFast</option>
                <option>Schneider EVlink</option>
                <option>Alpitronic HYC300</option>
                <option>Kempower Movable</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                Nameplate Power Rating
              </label>
              <select
                value={powerKw}
                onChange={(e) => setPowerKw(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface font-mono"
              >
                <option value={360}>360 kW DC (Ultra-Fast)</option>
                <option value={240}>240 kW DC</option>
                <option value={180}>180 kW DC</option>
                <option value={120}>120 kW DC</option>
                <option value={60}>60 kW DC</option>
                <option value={22}>22 kW AC (Type 2)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
              Hub Geolocation Cluster
            </label>
            <select
              value={hubLocation}
              onChange={(e) => setHubLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
            >
              <option>Bengaluru Tech Corridor Hub 04</option>
              <option>BKC Mumbai Hypercharge Cluster</option>
              <option>Delhi NCR Aerocity MegaHub</option>
              <option>NH48 Express Corridor Hub</option>
              <option>Hyderabad Hitec City Superhub</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                OCPP Protocol
              </label>
              <select
                value={ocppVersion}
                onChange={(e) => setOcppVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface font-mono"
              >
                <option>OCPP 2.0.1</option>
                <option>OCPP 1.6-J</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-secondary uppercase block mb-1">
                Security Profile
              </label>
              <select
                value={securityProfile}
                onChange={(e) => setSecurityProfile(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-[13px] text-on-surface"
              >
                <option>Profile 3 (Client Cert / mTLS)</option>
                <option>Profile 2 (Basic Auth + TLS)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-bold hover:bg-primary-container transition-colors shadow-xs"
            >
              Authorize &amp; Provision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
