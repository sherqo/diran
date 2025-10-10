import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect all requests to /404 when running in production.
 *
 * This middleware intentionally skips internal Next.js routes, API routes,
 * static assets and the /404 page itself to avoid redirect loops and breaking
 * static delivery.
 */
export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Exclude internals, API, static assets, and the 404 route itself.
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.endsWith('/favicon.ico') ||
        pathname === '/wait' ||
        pathname === '/' ||
        pathname === '/privacy' ||
        pathname.includes('.png') ||
        pathname.includes('.jpg') ||
        pathname.includes('.svg') ||
        pathname.includes('fonts') ||
        pathname.includes('identity')
    ) {
        return NextResponse.next();
    }

    const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';

    if (isDev) {
        console.log('Development mode - allowing all routes');
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/wait', req.url));
}

// Apply middleware to all routes; internal exclusions are handled above.
export const config = {
    matcher: '/:path*',
};
