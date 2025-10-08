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
    // Helpful debugging during development; remove or guard in production.
    // Note: middleware runs in an Edge-like environment; console output may
    // appear in the terminal running Next rather than the browser.
    // console.log({ NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV, NODE_ENV: process.env.NODE_ENV });

    // Exclude internals, API, static assets, and the 404 route itself.
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.endsWith('/favicon.ico') ||
        pathname === '/wait'
    ) {
        return NextResponse.next();
    }

    // Accept multiple environment values to determine production. Projects
    // sometimes use NEXT_PUBLIC_ENV, NEXT_PUBLIC_ENVIRONMENT or rely on
    // NODE_ENV.
    const publicEnv = process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENVIRONMENT;
    const isProduction = publicEnv === 'production' || process.env.NODE_ENV === 'production';

    if (isProduction) {
        // Redirect to the canonical 404 page and set a diagnostic header so
        // it's easy to confirm middleware ran from the browser network tab.
        const res = NextResponse.redirect(new URL('/wait', req.url));
        res.headers.set('x-middleware-run', 'true');
        return res;
    }

    // For non-production, attach a lightweight diagnostic header so you can
    // verify the middleware executed even when console logs aren't visible.
    const nextRes = NextResponse.next();
    nextRes.headers.set('x-middleware-run', 'true');
    nextRes.headers.set('x-middleware-env', publicEnv || process.env.NODE_ENV || 'development');
    return nextRes;
}

// Apply middleware to all routes; internal exclusions are handled above.
export const config = {
    matcher: '/:path*',
};
