# 🚀 Review Express — Smart NFC & QR Google Review E-Commerce Platform

A production-ready Full-Stack E-Commerce web platform built specifically for **Review Express** smart hardware products (Google Review NFC Acrylic Stands, PVC Tap Cards, Metal Counter Plates, and Weatherproof Stickers).

---

## 📁 Project Folder Structure

```
Qr-Code/
├── client/                     # 🌐 Frontend Application (Next.js 14, Redux Toolkit, Tailwind CSS)
│   ├── src/
│   │   ├── app/                # App Router Pages (/shop, /product/[slug], /cart, /checkout, dashboards)
│   │   ├── components/         # Reusable Components (Navbar, Footer, LiveNfcStandDemo, TaxInvoiceModal)
│   │   └── redux/              # Redux Store, RTK Query API, & Slices (authSlice, cartSlice, settingsSlice)
│   ├── public/
│   ├── tailwind.config.js
│   ├── jsconfig.json
│   └── package.json
│
├── server/                     # ⚙️ Backend Application (Node.js, Express.js, Prisma ORM, MySQL)
│   ├── prisma/
│   │   ├── schema.prisma       # MySQL Schema (Users, Products, Orders, Settings, Payouts)
│   │   └── seed.js             # Initial platform database seed
│   ├── src/
│   │   ├── controllers/        # Business Logic Controllers
│   │   ├── middleware/         # Auth & Role-Based Authorization
│   │   ├── routes/             # Express API Routes
│   │   ├── lib/                # Prisma client & PayU Helper
│   │   └── server.js           # Express Server Entry with Helmet Security
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── .gitignore                  # Git ignore rules for node_modules, build artifacts & secrets
├── package.json                # Root package.json with unified run scripts
└── README.md                   # Complete Platform Guide
```

---

## 🛠️ Tech Stack

- **Frontend (`/client`)**: `Next.js 14` (App Router), `Redux Toolkit` (`@reduxjs/toolkit` + `react-redux`), `JavaScript`, `Tailwind CSS`, `Lucide React`, `QRCode`, `Canvas Confetti`.
- **Backend (`/server`)**: `Node.js`, `Express.js`, `Prisma ORM`, `MySQL 8.0` (`review_express` database).
- **Security & Auth**: Role-Based Authorization, JWT (`jsonwebtoken`), `bcryptjs`, **`helmet`** (Secure HTTP headers against XSS & clickjacking), `cookie-parser`, `cors`.
- **Payment Gateway**: **PayU Payment Gateway** integration with dynamic SHA512 hash generation and Cash on Delivery (COD) support.

---

## 👥 Major Roles & Capabilities

### 1. 👑 Superadmin (Company & Website Owner)
- **Master Control Center** (`/superadmin/dashboard`):
  - **Dynamic Website Settings**: Change Site Name, Announcement Banner, Contact details, WhatsApp number, Address.
  - **GST & Tax Configuration**: Enable/Disable GST toggle, custom GST Rate % (e.g. 18.0%), HSN Code (852352), Company GSTIN.
  - **PayU Configuration**: Switch environment between `test` and `live`, configure PayU Merchant Key and Merchant Salt dynamically.
  - **Hardware Products CRUD**: Add new products, update prices, discounts, stock, features, upload images, delete products.
  - **Partner Organizations / Admins Management**: View all registered partner orgs, view total sales generated, adjust individual partner commission percentage (e.g., 15% to 25%), toggle active/inactive status.
  - **Orders & Live Courier Tracking Manager**: View all orders, update status (`pending` -> `customizing` -> `shipped` -> `delivered`), enter Blue Dart / Delhivery courier name, AWB tracking ID & tracking URL.
  - **Partner Payouts Approval**: Approve/Reject partner withdrawal requests with transaction UTR / bank reference numbers.
  - **Platform Revenue Analytics**: Gross sales, GST collected, partner payouts, and net platform margins.

### 2. 🏢 Admin (Organization / Partner / Affiliate)
- **Partner Portal** (`/admin/dashboard`):
  - **Organization Registration** (`/partner/register`): Business Name, contact details, bank account & UPI ID.
  - **Unique Referral Link & QR Code**: Auto-generated affiliate link with 1-click copy & instant WhatsApp share.
  - **Refer & Earn Analytics**: Live tracking of referred orders, total sales volume, earned commission %, and available wallet balance.
  - **Withdrawal Requests**: Request payout directly to UPI or Bank once minimum threshold (₹500) is reached.
  - **Customer Bonus**: Customers using the partner link automatically receive an instant discount!

### 3. 🛒 User (Customer / Buyer)
- **Customer Experience & Portal** (`/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/user/orders`):
  - **Product Customizer**: Input Business Name and Google Maps Review Link before buying, with real-time live preview.
  - **Cart & Checkout**: Real-time GST calculation, partner discount deduction, address validation, PayU & COD payment options.
  - **Customer Orders & Tracking** (`/user/orders`):
    - Live 4-step Courier Tracking Timeline with Courier Partner name & Airway Bill (AWB) number.
    - **Laser Stands & QR Codes**: High-resolution interactive QR code previews with instant PNG download.
    - **Official GST Tax Invoices**: Downloadable certified A4 tax invoices with HSN Code (852352), 9% CGST + 9% SGST breakdown, and company authorized details.

---

## 🏃 How to Run

### 1. Backend Server (`/server`):
```bash
cd server
npm install
npx prisma db push
npm run dev
# Runs on: http://localhost:5000
```

### 2. Frontend Client (`/client`):
```bash
cd client
npm install
npm run dev
# Runs on: http://localhost:3000
```
