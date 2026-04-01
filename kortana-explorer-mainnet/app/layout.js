import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://explorer.mainnet.kortana.xyz';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Kortana Mainnet Explorer | High Performance Blockchain',
  description: 'Explore blocks, transactions, and addresses on the Kortana Mainnet - the most advanced high-performance blockchain powered by DINAR DNR.',
  keywords: ['Kortana', 'blockchain', 'explorer', 'mainnet', 'DNR', 'DINAR', 'cryptocurrency', 'transactions', 'blocks'],
  authors: [{ name: 'Kortana Network' }],
  creator: 'Kortana Network',
  publisher: 'Kortana Network',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Kortana Mainnet Explorer',
    title: 'Kortana Mainnet Explorer | High Performance Blockchain',
    description: 'Explore blocks, transactions, and addresses on the Kortana Mainnet - the most advanced high-performance blockchain powered by DINAR DNR.',
    images: [
      {
        url: `${siteUrl}/webcover.png`,
        width: 1200,
        height: 630,
        alt: 'Kortana Mainnet Blockchain Explorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kortana Mainnet Explorer | High Performance Blockchain',
    description: 'Explore blocks, transactions, and addresses on the Kortana Mainnet - the most advanced high-performance blockchain powered by DINAR DNR.',
    images: [`${siteUrl}/webcover.png`],
    creator: '@KortanaNetwork',
    site: '@KortanaNetwork',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 300px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
