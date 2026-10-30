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
        payuMode: "test",
        payuMerchantKey: "GKJE3Z",
        payuMerchantSalt: "0zqiCnB4GslxAanSxjEAutWkWuggFiGs",
        announcementBanner: "🔥 Special Launch Offer: Get Extra 10% Off on Bulk Orders! Free Express Courier across India 🇮🇳",
        heroHeading: "Get 10X More 5-Star Google Reviews on Autopilot",
        heroSubheading: "Turn walk-in retail customers into verified 5-star Google reviews with just 1 Tap (NFC) or 1 Scan (QR). Zero app required, 100% lifetime validity.",
        freeShippingAbove: 999.0,
        standardShippingFee: 60.0
      }
    });
    console.log('✅ Default platform settings initialized');
  }

  // 2. Superadmin Account
  const hashedUserAdminPassword = await bcrypt.hash('Veagle@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'abhijeetambhore4@gmail.com' },
    update: {
      name: "Veagle Space Admin",
      role: "SUPERADMIN"
    },
    create: {
      name: "Veagle Space Admin",
      email: "abhijeetambhore4@gmail.com",
      password: hashedUserAdminPassword,
      phone: "+91 98765 43210",
      role: "SUPERADMIN",
      orgName: "ReviewXpress Corporate HQ",
      referralCode: "ADMIN100"
    }
  });
  console.log('✅ Superadmin initialized:', adminUser.email);

  // 3. Organization Partner (Affiliate)
  const hashedPartnerPassword = await bcrypt.hash('partner123', 10);
  const partnerAdmin = await prisma.user.upsert({
    where: { email: 'partner@techhub.com' },
    update: {},
    create: {
      name: "Vikram Deshmukh",
      email: "partner@techhub.com",
      password: hashedPartnerPassword,
      phone: "+91 98220 12345",
      role: "ADMIN",
      orgName: "TechHub Digital Marketing Agency",
      referralCode: "TECHHUB15",
      commissionPercent: 15.0,
      bankHolder: "TechHub Digital Solutions",
      bankAccount: "50200012345678",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      upiId: "techhub@okaxis"
    }
  });
  console.log('✅ Partner initialized:', partnerAdmin.email);

  // 4. Verified Customer Account
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'amit@cafeoasis.in' },
    update: {},
    create: {
      name: "Amit Sharma",
      email: "amit@cafeoasis.in",
      password: hashedUserPassword,
      phone: "+91 98111 22334",
      role: "USER",
      orgName: "Cafe Oasis Pune",
      referredById: partnerAdmin.id
    }
  });
  console.log('✅ Customer initialized:', customer.email);

  // 5. Official ReviewXpress Hardware Catalog Products
  const products = [
    {
      slug: "nfc-google-review-stand-premium-acrylic",
      title: "Smart NFC + QR Google Review Stand (Premium Acrylic)",
      subtitle: "Best-seller for billing counters, reception desks, cafes & retail checkouts",
      price: 1199,
      originalPrice: 1999,
      badge: "Best Seller",
      rating: 4.9,
      reviewsCount: 382,
      stock: 250,
      image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
      description: "Crafted with high-grade ultra-clear acrylic with built-in high-speed NTAG213/215 NFC chip and permanent laser-printed high-contrast QR code. Customers simply tap their iPhone or Android phone to instantly open your official Google Review page.",
      features: JSON.stringify([
        "Instant 1-Tap Tap-to-Review (NFC)",
        "Backup Dynamic QR Code (100% smartphone compatibility)",
        "Waterproof & Scratch-resistant Acrylic Stand (A6 size)",
        "No Battery, No App & No Subscription required",
        "Lifetime Validity with custom encoded review link"
      ]),
      specs: JSON.stringify({
        "Material": "3mm Cast Acrylic with Diamond Polished Edge",
        "Dimensions": "105mm x 148mm (A6 Table Stand)",
        "NFC Chip": "NXP NTAG213 / NTAG215 (Universal compatibility)",
        "Compatibility": "iOS (iPhone 7+) and all NFC-enabled Android phones"
      })
    },
    {
      slug: "smart-nfc-google-review-pocket-card",
      title: "Executive NFC + QR Review Card (Matte Black & Gold)",
      subtitle: "Carry in your wallet or keep with service staff, technicians & executives",
      price: 699,
      originalPrice: 1299,
      badge: "Trending",
      rating: 4.8,
      reviewsCount: 219,
      stock: 420,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      description: "Sleek premium PVC business card-sized smart NFC card with dual-sided UV print. Ideal for sales teams, home service technicians, doctors, consultants, and restaurant staff to collect reviews right on the spot.",
      features: JSON.stringify([
        "Pocket-sized (Standard Credit Card dimensions)",
        "Matte finish with premium gold foil accents",
        "Fast 0.5s NFC response time",
        "Direct Google Place review link programmed",
        "Washable & tamper-proof"
      ]),
      specs: JSON.stringify({
        "Material": "Premium Eco-PVC Matte",
        "Dimensions": "85.6mm x 54mm (Credit Card size)",
        "NFC Chip": "High-gain NTAG213 chip",
        "Weight": "5 grams"
      })
    },
    {
      slug: "smart-nfc-counter-badge-plate",
      title: "Metal-Touch Smart NFC Counter Plate (Brushed Silver)",
      subtitle: "Heavy-duty luxury plate for premium salons, boutique hotels & clinics",
      price: 1599,
      originalPrice: 2499,
      badge: "Luxury Edition",
      rating: 5.0,
      reviewsCount: 145,
      stock: 120,
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      description: "Elevate your business aesthetic with this brushed aluminium look composite smart plate with 3M VHB adhesive back or weighted desk base. Built to withstand high footfall retail environments.",
      features: JSON.stringify([
        "Heavy-duty brushed finish metal look",
        "Dual-core high range NFC sensor",
        "Anti-fade UV protected QR code",
        "Pre-applied 3M heavy duty desk adhesive included",
        "Free customization with your business name & logo"
      ]),
      specs: JSON.stringify({
        "Material": "Brushed Aluminium Composite + Acrylic Core",
        "Dimensions": "120mm x 80mm",
        "Mounting": "Desktop Stand or 3M Wall/Counter Mount",
        "NFC Range": "Up to 3.5 cm"
      })
    },
    {
      slug: "smart-nfc-google-review-window-stickers-pack",
      title: "Weatherproof Smart NFC + QR Window Stickers (Pack of 5)",
      subtitle: "Place on entry doors, exit counters, drive-thrus & delivery bags",
      price: 999,
      originalPrice: 1699,
      badge: "Value Pack",
      rating: 4.7,
      reviewsCount: 94,
      stock: 300,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
      description: "Pack of 5 heavy-duty outdoor-rated weatherproof smart stickers. Stick onto glass doors, mirrors, bill folders, or restaurant tables for convenient contactless review collection.",
      features: JSON.stringify([
        "Pack of 5 programmed smart stickers",
        "Anti-metal shielding layer (works even on metal surfaces)",
        "UV & rain resistant laminate coating",
        "1-second NFC recognition",
        "High-contrast QR code for all smartphones"
      ]),
      specs: JSON.stringify({
        "Quantity": "5 Stickers per pack",
        "Diameter": "75mm circular",
        "Shielding": "Ferrite anti-metal shielding layer",
        "Adhesive": "Non-residue strong acrylic adhesive"
      })
    },
    {
      slug: "smart-nfc-review-stand-teak-wood",
      title: "Handcrafted Teak Wood Smart NFC Review Stand (Artisan Series)",
      subtitle: "Premium natural wooden base with sleek vertical acrylic plate",
      price: 1499,
      originalPrice: 2299,
      badge: "Artisan Pick",
      rating: 4.9,
      reviewsCount: 88,
      stock: 160,
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      description: "Organic solid natural teak wood base paired with crystal-clear laser-engraved acrylic plate. Creates a warm, inviting presence on premium hotel lobbies, artisan bakeries, and doctor consulting tables.",
      features: JSON.stringify([
        "100% Solid Natural Teak Wood Base",
        "Scratch-proof Matte Acrylic Display Plate",
        "High-sensitivity NXP NFC Chip embedded inside base",
        "Permanent Anti-glare Laser Printed QR code",
        "Lifetime Guarantee on NFC chip performance"
      ]),
      specs: JSON.stringify({
        "Base Material": "Solid Teak Wood with Natural Oil Finish",
        "Plate Material": "High-durability Acrylic (A6 Form Factor)",
        "Dimensions": "110mm x 165mm x 40mm",
        "NFC Chip": "NXP NTAG215 High Memory"
      })
    },
    {
      slug: "smart-nfc-multi-counter-cube",
      title: "Smart Multi-Angle NFC & QR Review Cube (3-Sided Display)",
      subtitle: "3-sided visibility for bar counters, food courts & salon stations",
      price: 1899,
      originalPrice: 2999,
      badge: "Commercial Grade",
      rating: 5.0,
      reviewsCount: 62,
      stock: 90,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      description: "Designed for 360-degree customer engagement. Place in the center of restaurant dining tables, bar tops, or checkout queues so customers from every angle can effortlessly tap or scan to review.",
      features: JSON.stringify([
        "Triple-sided QR code for 360° visibility",
        "Dual top-mounted high-gain NFC sensors",
        "Weighted non-slip rubberized bottom base",
        "Commercial tamper-resistant construction",
        "Custom branded with your business identity"
      ]),
      specs: JSON.stringify({
        "Material": "Reinforced High-impact Polycarbonate",
        "Dimensions": "90mm x 90mm x 90mm Cube",
        "Sensors": "Dual NFC NTAG213 Chips (Top & Front)",
        "Weight": "280 grams (Anti-tip weighted)"
      })
    }
  ];

  console.log(`📦 Seeding ${products.length} hardware catalog products...`);

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        title: prod.title,
        subtitle: prod.subtitle,
        price: prod.price,
        originalPrice: prod.originalPrice,
        badge: prod.badge,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        stock: prod.stock,
        image: prod.image,
        description: prod.description,
        features: prod.features,
        specs: prod.specs
      },
      create: prod
    });
  }

  console.log(`✅ Successfully seeded & updated ${products.length} ReviewXpress hardware products!`);
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
