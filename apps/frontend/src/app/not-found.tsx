import { Metadata } from 'next';
import Link from 'next/link';
import { CenteredLayout } from '@/components/ui/centered-layout';

export const metadata: Metadata = {
    title: 'Page Not Found',
    description: "We couldn't find the page you're looking for",
};

export default function NotFound() {
    return (
        <body className="bg-background">
            <CenteredLayout maxWidth="md">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Page not found</h1>
                    <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

                    <div className="mt-8">
                        <Link
                            href="/"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors">
                            Go home
                        </Link>
                    </div>
                </div>
            </CenteredLayout>
        </body>
    );
}
