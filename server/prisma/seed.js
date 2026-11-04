const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ReviewXpress database seeding...');

  // 1. Platform Settings
  const existingSettings = await prisma.setting.findFirst();
  if (!existingSettings) {
    await prisma.setting.create({
      data: {
        id: 1,
        siteName: "ReviewXpress",
        tagline: "India's #1 Smart NFC & QR Google Review Hardware Platform",
        supportEmail: "info@veaglespace.com",
        supportPhone: "+91 8237999101",
        whatsappNumber: "918237999101",
        address: "'Kudale Patil Tower', Office No. 207, 2nd Floor, Jadhav Nagar, Near Shiv Temple, Vadgaon Budruk, Pune, Maharashtra 411041",
        gstEnabled: true,
        gstPercent: 18.0,
        gstNumber: "27AABCR1234F1Z8",
        hsnCode: "852352",
        defaultCommissionPercent: 15.0,
        minPayoutAmount: 500.0,
        payuMode: "live",
        payuMerchantKey: "sV29rC",
        payuMerchantSalt: "tkhRPTPLZtQRHlnuruaKzB9OSbvdS2sA",
        announcementBanner: "🔥 Special Launch Offer: Get Extra 10% Off on Bulk Orders! Free Express Courier across India 🇮🇳",
        heroHeading: "Get 10X More 5-Star Google Reviews on Autopilot",
        heroSubheading: "Turn walk-in retail customers into verified 5-star Google reviews with just 1 Tap (NFC) or 1 Scan (QR). Zero app required, 100% lifetime validity.",
        freeShippingAbove: 999.0,
        standardShippingFee: 60.0
      }
    });
    console.log('✅ Default platform settings initialized');
  }

  // 2. Superadmin Account (veaglespace@gmail.com)
  const hashedUserAdminPassword = await bcrypt.hash('Veagle@123', 10);

  // If previous superadmin with abhijeetambhore4@gmail.com exists, update email to veaglespace@gmail.com
  const prevAdmin = await prisma.user.findUnique({
    where: { email: 'abhijeetambhore4@gmail.com' }
  });
  if (prevAdmin) {
    await prisma.user.update({
      where: { id: prevAdmin.id },
      data: {
        email: 'veaglespace@gmail.com',
        name: 'Veagle Space Admin',
        role: 'SUPERADMIN'
      }
    });
    console.log('🔄 Migrated previous superadmin email to veaglespace@gmail.com');
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'veaglespace@gmail.com' },
    update: {
      name: "Veagle Space Admin",
      role: "SUPERADMIN"
    },
    create: {
      name: "Veagle Space Admin",
      email: "veaglespace@gmail.com",
      password: hashedUserAdminPassword,
      phone: "+91 8237999101",
      role: "SUPERADMIN",
      orgName: "ReviewXpress Corporate HQ",
      referralCode: "ADMIN100"
    }
  });
  console.log('✅ Superadmin initialized:', adminUser.email);

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
