'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundInline() {
    return (
        <div className="flex flex-1 items-center justify-center p-10">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

                <Link href="/home">
                    <Button variant="outline" className="mt-4">
                        Go home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
