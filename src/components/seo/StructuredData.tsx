import Script from 'next/script';

export default function StructuredData() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://www.diran.app/#website',
                url: 'https://www.diran.app/',
                name: 'Diran AI',
                description:
                    'AI that watches your life patterns, predicts burnout, and helps you make better decisions before you crash.',
                publisher: {
                    '@id': 'https://www.diran.app/#organization',
                },
                potentialAction: [
                    {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate:
                                'https://www.diran.app/?s={search_term_string}',
                        },
                        'query-input': 'required name=search_term_string',
                    },
                ],
                inLanguage: 'en-US',
            },
            {
                '@type': 'Organization',
                '@id': 'https://www.diran.app/#organization',
                name: 'Diran AI',
                url: 'https://www.diran.app/',
                logo: {
                    '@type': 'ImageObject',
                    inLanguage: 'en-US',
                    '@id': 'https://www.diran.app/#/schema/logo/image/',
                    url: 'https://www.diran.app/identity/logo-1080.png',
                    contentUrl: 'https://www.diran.app/identity/logo-1080.png',
                    width: 1080,
                    height: 1080,
                    caption: 'Diran AI',
                },
                image: {
                    '@id': 'https://www.diran.app/#/schema/logo/image/',
                },
                sameAs: ['https://twitter.com/diran_ai'],
            },
            {
                '@type': 'WebPage',
                '@id': 'https://www.diran.app/#webpage',
                url: 'https://www.diran.app/',
                name: 'Diran AI - One Button. Better Decisions.',
                isPartOf: {
                    '@id': 'https://www.diran.app/#website',
                },
                about: {
                    '@id': 'https://www.diran.app/#organization',
                },
                description:
                    'Diran AI watches your life patterns, predicts burnout, and helps you make better decisions before you crash. Connect your tools, get smart warnings, and fix things fast.',
                breadcrumb: {
                    '@id': 'https://www.diran.app/#breadcrumb',
                },
                inLanguage: 'en-US',
                potentialAction: [
                    {
                        '@type': 'ReadAction',
                        target: ['https://www.diran.app/'],
                    },
                ],
            },
            {
                '@type': 'SoftwareApplication',
                name: 'Diran AI',
                description:
                    'AI assistant that prevents burnout by monitoring life patterns and providing smart decision-making support',
                url: 'https://www.diran.app/',
                applicationCategory: 'ProductivityApplication',
                operatingSystem: 'Web, iOS, Android',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    availability: 'https://schema.org/ComingSoon',
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '100',
                },
            },
        ],
    };

    return (
        <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
            }}
        />
    );
}
