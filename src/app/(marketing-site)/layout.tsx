import type { Metadata } from 'next';
import Footer from '@/components/features/footer/Footer';
import './landing.css';
import StructuredData from '@/components/seo/StructuredData';

export const metadata: Metadata = {
    title: {
        default: 'Diran AI - Better Decisions.',
        template: '%s | Diran AI',
    },
    description:
        'Diran AI watches your life patterns, predicts burnout, and helps you make better decisions before you crash. Connect your tools, get smart warnings, and fix things fast. No fluff, just action.',
    keywords: [
        'burnout prevention',
        'AI assistant',
        'productivity',
        'mental health',
        'stress management',
        'calendar optimization',
        'work-life balance',
        'decision making',
        'smart notifications',
        'pattern recognition',
    ],
    authors: [{ name: 'Diran AI' }],
    creator: 'Diran AI',
    publisher: 'Diran AI',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://www.diran.app'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Diran AI - Better Decisions.',
        description: 'AI that watches your life patterns, predicts burnout, and helps you make better decisions before you crash.',
        url: 'https://www.diran.app',
        siteName: 'Diran AI',
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
        title: 'Diran AI - Better Decisions.',
        description: 'AI that watches your life patterns, predicts burnout, and helps you make better decisions before you crash.',
        images: ['/identity/logo-1080.png'],
        creator: '@diran_ai',
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
                <StructuredData />
            </head>
            <body className="flex min-h-screen flex-col">
                {children}
                <Footer />
            </body>
        </>
    );
}
