import type { Metadata } from 'next';

import './marketing.css';
import Footer from '@/components/features/footer/Footer';
import { SITE_NAME, SITE_URL, MARKETING_DESCRIPTION, MARKETING_KEYWORDS, PUBLISHER_NAME, TWITTER_HANDLE } from '@/lib/site-info';

export const metadata: Metadata = {
    title: {
        default: `${SITE_NAME} | Better Decisions.`,
        template: `${SITE_NAME} | %s`,
    },
    description: MARKETING_DESCRIPTION,
    keywords: MARKETING_KEYWORDS,
    authors: [{ name: PUBLISHER_NAME }],
    creator: PUBLISHER_NAME,
    publisher: PUBLISHER_NAME,
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: `${SITE_NAME} - Better Decisions.`,
        description: MARKETING_DESCRIPTION,
        url: SITE_URL,
        siteName: SITE_NAME,
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: '/identity/logo-1080.png',
                width: 1080,
                height: 1080,
                alt: 'Diran AI - Better Decisions.',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${SITE_NAME} - Better Decisions.`,
        description: MARKETING_DESCRIPTION,
        images: ['/identity/logo-1080.png'],
        creator: TWITTER_HANDLE,
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
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/identity/favicon-32x32.png" sizes="32x32" />
                <link rel="icon" href="/identity/favicon-16x16.png" sizes="16x16" />
                <link rel="apple-touch-icon" href="/identity/apple-touch-icon.png" />
                <meta name="theme-color" content="#f97316" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Diran AI" />
            </head>
            <body className="light flex min-h-screen flex-col">
                <div className="light">
                    {children}
                    <Footer />
                </div>
            </body>
        </>
    );
}
