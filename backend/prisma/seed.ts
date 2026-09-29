import { prisma } from '../db';

async function seed() {
  console.log('🌱 Seeding ChargeOne database...');

  // 1. Stations
  const stationsData = [
    {
      name: 'ChargeOne Indiranagar Superhub',
      operator: 'ChargeOne Network',
      location: 'Bengaluru, Karnataka',
      address: '100 Feet Rd, Indiranagar, Bengaluru 560038',
      latitude: 12.9784,
      longitude: 77.6408,
      totalPorts: 8,
      availablePorts: 6,
      maxPowerKw: 360,
      status: 'Operational',
    },
    {
      name: 'Tata Power EZ Charge - Defence Colony',
      operator: 'Tata Power EZ',
      location: 'Bengaluru, Karnataka',
      address: '12th Main Rd, Indiranagar, Bengaluru 560008',
      latitude: 12.9719,
      longitude: 77.6412,
      totalPorts: 4,
      availablePorts: 2,
      maxPowerKw: 60,
      status: 'Operational',
    },
    {
      name: 'Shell Recharge Plaza - Old Airport Rd',
      operator: 'Shell Recharge',
      location: 'Bengaluru, Karnataka',
      address: 'Old Airport Rd, Kodihalli, Bengaluru 560008',
      latitude: 12.9601,
      longitude: 77.6485,
      totalPorts: 4,
      availablePorts: 3,
      maxPowerKw: 120,
      status: 'Operational',
    },
    {
      name: 'ChargeOne Aerocity Fleet Depot',
      operator: 'ChargeOne Network',
      location: 'New Delhi, NCR',
      address: 'Asset 8, Aerocity Hospitality District, New Delhi 110037',
      latitude: 28.5503,
      longitude: 77.1215,
      totalPorts: 12,
      availablePorts: 9,
      maxPowerKw: 350,
      status: 'Operational',
    },
  ];

  for (const st of stationsData) {
    const existing = await prisma.station.findFirst({ where: { name: st.name } });
    if (!existing) {
      await prisma.station.create({ data: st });
    }
  }

  // 2. Chargers
  const chargersData = [
    {
      id: 'CH-BLR-089-B',
      name: 'ABB Terra 360 kW Dual',
      vendor: 'ABB',
      model: 'Terra 360',
      ip: '10.240.12.89',
      evsePort: 'Port #1',
      connectors: 'Dual CCS2 (High Power)',
      ratingDesc: 'Max 500A Liquid Cooled',
      maxPowerKw: 360,
      activePowerKw: 242.4,
      powerTargetKw: 320.0,
      busVoltageV: 780.2,
      deliveryCurrentA: 310.8,
      bayTempC: 52,
      gunATempC: 42,
      gunBTempC: 31,
      powerModulesTempC: 52,
      status: 'Charging',
      ocppVersion: 'OCPP 2.0.1',
      activeSessionMinutes: 42,
      lastAckMs: 11,
      coolantPressureBar: 2.4,
      isolationResistanceMOhm: 4.8,
      pumpRpm: 3450,
      architecture: '800V ARCH',
    },
    {
      id: 'CH-HYD-041-A',
      name: 'Tritium PK350 Dual',
      vendor: 'Tritium',
      model: 'Veefil PK350',
      ip: '10.240.11.20',
      evsePort: 'Port #2',
      connectors: 'CCS2 + CHAdeMO',
      ratingDesc: 'Dual Liquid 350 kW',
      maxPowerKw: 350,
      activePowerKw: 14.2,
      powerTargetKw: 20.0,
      busVoltageV: 412.0,
      deliveryCurrentA: 34.4,
      bayTempC: 36,
      gunATempC: 38,
      gunBTempC: 29,
      powerModulesTempC: 40,
      status: 'Finishing',
      ocppVersion: 'OCPP 1.6J',
      activeSessionMinutes: 58,
      lastAckMs: 14,
      coolantPressureBar: 2.1,
      isolationResistanceMOhm: 5.2,
      pumpRpm: 2800,
      architecture: '400V ARCH',
    },
    {
      id: 'CH-MUM-104-A',
      name: 'Delta 180kW Ultra',
      vendor: 'Delta',
      model: 'City Charge Ultra',
      ip: '10.240.14.104',
      evsePort: 'Port #1',
      connectors: 'Dual CCS2 180kW',
      ratingDesc: 'Air-Cooled Dispenser',
      maxPowerKw: 180,
      activePowerKw: 118.0,
      powerTargetKw: 150.0,
      busVoltageV: 590.0,
      deliveryCurrentA: 200.0,
      bayTempC: 48,
      gunATempC: 64,
      gunBTempC: 32,
      powerModulesTempC: 64,
      status: 'Thermal Warn',
      ocppVersion: 'OCPP 2.0.1',
      activeSessionMinutes: 34,
      lastAckMs: 18,
      coolantPressureBar: 1.8,
      isolationResistanceMOhm: 3.9,
      pumpRpm: 4200,
      architecture: '800V ARCH',
    },
  ];

  for (const ch of chargersData) {
    await prisma.chargerNode.upsert({
      where: { id: ch.id },
      create: ch,
      update: ch,
    });
  }

  // 3. Active Sessions
  const sessionsData = [
    {
      id: '#SES-89201',
      operator: 'Shell Recharge MSP',
      protocol: 'OCPI 2.2.1',
      stationName: 'Indiranagar Hub Bay 01',
      chargerId: 'CH-BLR-089-B',
      connectorType: 'CCS2 (High Power)',
      maxPowerKw: 360,
      vehicleModel: 'Hyundai Ioniq 5',
      driverName: 'Rohit Sharma',
      driverId: 'KA-01-EQ',
      licensePlate: 'KA-01-MJ-4491',
      currentSoc: 74,
      activePowerKw: 242.4,
      powerStatus: 'Peak 800V',
      deliveredKwh: 48.2,
      costInr: 964.0,
      duration: '16m 42s',
      status: 'Charging',
    },
    {
      id: '#SES-89198',
      operator: 'BluSmart Fleet API',
      protocol: 'B2B Fleet',
      stationName: 'Aerocity Superhub CH-08',
      chargerId: 'CH-DEL-012-C',
      connectorType: 'Type 2 Gun A • 60 kW',
      maxPowerKw: 60,
      vehicleModel: 'MG ZS EV Fleet',
      driverName: 'Driver 1044',
      driverId: 'BLU-DL-02',
      licensePlate: 'DL-01-AX-9912',
      currentSoc: 44,
      activePowerKw: 58.4,
      powerStatus: 'Constant',
      deliveredKwh: 18.6,
      costInr: 316.2,
      duration: '18m 04s',
      status: 'Charging',
    },
  ];

  for (const ses of sessionsData) {
    await prisma.activeSession.upsert({
      where: { id: ses.id },
      create: ses,
      update: ses,
    });
  }

  // 4. Roaming Partners
  const partnersData = [
    {
      id: 'partner-1',
      name: 'Shell Recharge Solutions',
      initials: 'SR',
      verified: true,
      country: 'GLOBAL',
      cpoId: 'NL*SRS',
      role: 'Bilateral Peer (eMSP)',
      protocol: 'OCPI 2.2.1-FULL',
      throughputReqSec: 38.4,
      errorStats: '0 errors (24h)',
      status: 'Live / Healthy',
    },
    {
      id: 'partner-2',
      name: 'Hubject Intercharge Network',
      initials: 'HJ',
      verified: true,
      country: 'PAN-EU',
      cpoId: 'DE*HJC',
      role: 'Central Clearing Hub',
      protocol: 'OCPI 2.2.1-BROKER',
      throughputReqSec: 82.1,
      errorStats: '0.001% retry',
      status: 'Live / Healthy',
    },
    {
      id: 'partner-3',
      name: 'Tata Power EZ Charge',
      initials: 'TP',
      verified: true,
      country: 'IN',
      cpoId: 'IN*TPW',
      role: 'Bilateral Roaming',
      protocol: 'OCPI 2.2.1',
      throughputReqSec: 24.5,
      errorStats: '0.02% retry',
      status: 'Live / Healthy',
    },
  ];

  for (const p of partnersData) {
    await prisma.roamingPartner.upsert({
      where: { cpoId: p.cpoId },
      create: p,
      update: p,
    });
  }

  const stationCount = await prisma.station.count();
  const chargerCount = await prisma.chargerNode.count();
  const sessionCount = await prisma.activeSession.count();
  const partnerCount = await prisma.roamingPartner.count();

  console.log(`✅ Seed finished successfully!`);
  console.log(`   - Stations: ${stationCount}`);
  console.log(`   - Chargers: ${chargerCount}`);
  console.log(`   - Sessions: ${sessionCount}`);
  console.log(`   - Roaming Partners: ${partnerCount}`);

  await prisma.$disconnect();
}

seed().catch(async (e) => {
  console.error('Seed error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
