import './globals.css';
import ReduxProvider from '@/redux/ReduxProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'ReviewXpress | India’s #1 NFC & QR Smart Google Review Stand',
  description: 'Boost your business Google Reviews 10X with contactless 1-Tap NFC and QR Code smart stands. Zero app required, 100% lifetime validity, GST Tax Invoice provided.',
  keywords: 'Google review stand, NFC card, ReviewXpress, Smart review card, tap to review, QR review plate, NFC business card',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <ReduxProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
