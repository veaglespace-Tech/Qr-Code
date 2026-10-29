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
