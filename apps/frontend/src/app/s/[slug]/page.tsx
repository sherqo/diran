import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublishedPageContent } from './content';

interface PublishedPageProps {
    params: Promise<{ slug: string }>;
}

// Fetch page data from API
async function getPublishedPage(slug: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    try {
        const res = await fetch(`${apiUrl}/page/s/${slug}`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data.data?.page || null;
    } catch (error) {
        console.error('Error fetching published page:', error);
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PublishedPageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPublishedPage(slug);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return {
        title: `${page.title} | Diran`,
        description: `${page.title} - Published on Diran`,
        openGraph: {
            title: page.title,
            type: 'article',
            publishedTime: page.publishedAt,
        },
    };
}

export default async function PublishedPage({ params }: PublishedPageProps) {
    const { slug } = await params;
    const page = await getPublishedPage(slug);

    if (!page) {
        notFound();
    }

    return <PublishedPageContent page={page} />;
}
