import { Metadata } from 'next';
import Link from 'next/link';
import { CenteredLayout } from '@/components/ui/centered-layout';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Page Not Found',
    description: "We couldn't find the page you're looking for",
};

export default function NotFound() {
    return (
        <body className="bg-background">
            <CenteredLayout maxWidth="sm">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Page not found</h1>
                    <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

                    <Link href="/">
                        <Button variant="outline" className="m-4">
                            Go home
                        </Button>
                    </Link>
                </div>
            </CenteredLayout>
        </body>
    );
}
