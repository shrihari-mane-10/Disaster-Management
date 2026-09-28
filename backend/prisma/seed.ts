import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Disaster Response Coordination App...');

  // Clean existing tables in dependency order
  await prisma.media.deleteMany();
  await prisma.task.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date();

  // 1. Seed Demo Users for all roles
  const citizen1 = await prisma.user.create({
    data: {
      name: 'John Citizen',
      email: 'citizen@example.com',
      phone: '+919876543210',
      passwordHash,
      role: 'citizen',
      lat: 12.9716,
      lng: 77.5946,
      available: true,
      lastSeenAt: now,
    },
  });

  const citizen2 = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      email: 'citizen2@example.com',
      phone: '+919876543215',
      passwordHash,
      role: 'citizen',
      lat: 12.9740,
      lng: 77.5980,
      available: true,
      lastSeenAt: now,
    },
  });

  const volunteer1 = await prisma.user.create({
    data: {
      name: 'Jane Volunteer (First Responder)',
      email: 'volunteer@example.com',
      phone: '+919876543211',
      passwordHash,
      role: 'volunteer',
      lat: 12.9730,
      lng: 77.5955,
      available: true,
      lastSeenAt: now,
    },
  });

  const volunteer2 = await prisma.user.create({
    data: {
      name: 'David Responder (Medic)',
      email: 'volunteer2@example.com',
      phone: '+919876543212',
      passwordHash,
      role: 'volunteer',
      lat: 12.9780,
      lng: 77.6010,
      available: true,
      lastSeenAt: now,
    },
  });

  const volunteer3 = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Boat Rescue)',
      email: 'volunteer3@example.com',
      phone: '+919876543216',
      passwordHash,
      role: 'volunteer',
      lat: 12.9690,
      lng: 77.5910,
      available: true,
      lastSeenAt: now,
    },
  });

  const authority = await prisma.user.create({
    data: {
      name: 'Officer Davis (Disaster Command)',
      email: 'authority@example.com',
      phone: '+919876543213',
      passwordHash,
      role: 'authority',
      lat: 12.9720,
      lng: 77.5950,
      available: true,
      lastSeenAt: now,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@example.com',
      phone: '+919876543214',
      passwordHash,
      role: 'admin',
      available: true,
      lastSeenAt: now,
    },
  });

  console.log('✅ Demo Users seeded: Citizens, Active Volunteers, Authority, Admin');

  // 2. Seed Realistic Incidents across Central Bengaluru
  await prisma.incident.create({
    data: {
      reporterId: citizen1.id,
      type: 'SOS Emergency',
      description: 'EMERGENCY: Elderly citizen trapped on 1st floor due to rapid water inundation near Cubbon Park metro station.',
      severity: 'critical',
      status: 'pending',
      lat: 12.9728,
      lng: 77.5962,
      verified: true,
    },
  });

  await prisma.incident.create({
    data: {
      reporterId: citizen2.id,
      type: 'Building Collapse',
      description: 'Partial structural collapse of old brick warehouse on Commercial Street. Possible injuries.',
      severity: 'high',
      status: 'pending',
      lat: 12.9810,
      lng: 77.6050,
      verified: true,
    },
  });

  await prisma.incident.create({
    data: {
      reporterId: citizen1.id,
      type: 'Road Blockage',
      description: 'Uprooted banyan tree blocking both lanes on MG Road. Traffic completely halted.',
      severity: 'medium',
      status: 'pending',
      lat: 12.9750,
      lng: 77.6090,
      verified: false,
    },
  });

  await prisma.incident.create({
    data: {
      reporterId: citizen2.id,
      type: 'Water Logging',
      description: 'Storm drain overflow on Residency Road. Water level approx 1.5 feet, slow moving vehicles.',
      severity: 'low',
      status: 'resolved',
      lat: 12.9680,
      lng: 77.6000,
      verified: true,
    },
  });

  console.log('✅ Sample Incidents seeded (SOS, Building Collapse, Road Blockage, Water Logging)');

  // 3. Seed Shelters
  await prisma.shelter.createMany({
    data: [
      {
        name: 'Kanteerava Stadium Indoor Relief Camp',
        lat: 12.9698,
        lng: 77.5928,
        capacity: 600,
        occupancy: 140,
      },
      {
        name: 'Central High School Emergency Shelter',
        lat: 12.9830,
        lng: 77.6020,
        capacity: 350,
        occupancy: 85,
      },
      {
        name: 'Cubbon Community Hall Evacuation Base',
        lat: 12.9760,
        lng: 77.5900,
        capacity: 200,
        occupancy: 180, // Near full
      },
    ],
  });
  console.log('✅ Relief Shelters seeded');

  // 4. Seed Emergency Resources
  await prisma.resource.createMany({
    data: [
      {
        type: 'Drinking Water Packs (20L Jerrycans)',
        quantity: 500,
        lat: 12.9720,
        lng: 77.5930,
        status: 'available',
      },
      {
        type: 'Emergency Medical Trauma Kits',
        quantity: 150,
        lat: 12.9720,
        lng: 77.5930,
        status: 'available',
      },
      {
        type: 'Inflatable Motorized Rescue Boats',
        quantity: 8,
        lat: 12.9800,
        lng: 77.5990,
        status: 'available',
      },
      {
        type: 'High-Calorie Ready-to-Eat Food Rations',
        quantity: 1200,
        lat: 12.9698,
        lng: 77.5928,
        status: 'available',
      },
      {
        type: 'Thermal Blankets & Tarpaulins',
        quantity: 800,
        lat: 12.9830,
        lng: 77.6020,
        status: 'available',
      },
    ],
  });
  console.log('✅ Emergency Resources seeded');

  // 5. Seed Initial Broadcast Alerts
  await prisma.alert.createMany({
    data: [
      {
        message: 'FLASH FLOOD ADVISORY: High-intensity precipitation expected across Central District. Low-lying zones should prepare for evacuation.',
        region: 'Central District',
        severity: 'high',
        channel: 'socket',
        createdBy: authority.id,
      },
      {
        message: 'RELIEF NOTICE: Kanteerava Stadium and Central High School shelters are active with medical staff and dry food rations.',
        region: 'All Zones',
        severity: 'medium',
        channel: 'sms_mock',
        createdBy: authority.id,
      },
    ],
  });
  console.log('✅ Sample Multi-Channel Alerts seeded');

  console.log('================================================================');
  console.log('🎉 Database seeding completed successfully!');
  console.log('================================================================');
  console.log('📋 DEMO ACCOUNTS (Password: password123)');
  console.log('  👤 Citizen:   citizen@example.com');
  console.log('  🦺 Volunteer: volunteer@example.com (Jane Volunteer - 1st Responder)');
  console.log('  🦺 Volunteer: volunteer2@example.com (David Responder - Medic)');
  console.log('  🏛️ Authority: authority@example.com (Officer Davis)');
  console.log('  ⚙️ Admin:     admin@example.com');
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
