'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CenteredLayout } from './ui/centered-layout';

export default function NotFoundInline() {
    return (
        <CenteredLayout maxWidth="sm">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

                <Link href="/home">
                    <Button variant="outline" className="m-4">
                        Go home
                    </Button>
                </Link>
            </div>
        </CenteredLayout>
    );
}
