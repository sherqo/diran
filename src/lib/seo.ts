import { Metadata } from 'next';

interface SEOConfig {
    title?: string;
    description?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    noIndex?: boolean;
}

const defaultConfig = {
    siteName: 'Diran AI',
    siteUrl: 'https://www.diran.app',
    defaultTitle: 'Diran AI - One Button. Better Decisions.',
    defaultDescription:
        'AI that watches your life patterns, predicts burnout, and helps you make better decisions before you crash. No fluff, just action.',
    defaultKeywords: [
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
    twitterHandle: '@diran_ai',
};

export function generateSEO(config: SEOConfig): Metadata {
    const {
        title = defaultConfig.defaultTitle,
        description = defaultConfig.defaultDescription,
        keywords = defaultConfig.defaultKeywords,
        canonical = '/',
        ogImage = '/identity/logo-1080.png',
        noIndex = false,
    } = config;

    const fullTitle = title.includes(defaultConfig.siteName) ? title : `${title} | ${defaultConfig.siteName}`;

    const canonicalUrl = canonical.startsWith('http') ? canonical : `${defaultConfig.siteUrl}${canonical}`;

    const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${defaultConfig.siteUrl}${ogImage}`;

    return {
        title: fullTitle,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl,
            siteName: defaultConfig.siteName,
            type: 'website',
            locale: 'en_US',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [ogImageUrl],
            creator: defaultConfig.twitterHandle,
        },
        robots: noIndex
            ? {
                  index: false,
                  follow: false,
              }
            : {
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
}

// Common SEO configurations for different pages
export const seoConfigs = {
    home: {
        title: 'Diran AI - One Button. Better Decisions.',
        description:
            'Stop burning out. Diran AI watches your life patterns, predicts stress, and gives you smart fixes before you crash. Connect your tools and get personalized warnings.',
        keywords: [
            'burnout prevention',
            'AI productivity assistant',
            'stress management',
            'calendar optimization',
            'decision making AI',
            'work-life balance',
            'mental health tech',
            'pattern recognition',
            'smart notifications',
            'productivity app',
        ],
    },
    features: {
        title: 'Features - AI Burnout Prevention',
        description:
            'Discover how Diran AI prevents burnout by monitoring your calendar, sleep, and habits. Get smart warnings and personalized actions before you crash.',
        canonical: '/#features',
    },
    faq: {
        title: 'FAQ - Frequently Asked Questions',
        description:
            "Get answers about how Diran AI works, who it's for, and how it helps prevent burnout through smart pattern recognition and decision support.",
        canonical: '/#faq',
    },
};
