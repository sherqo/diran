import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if user is authenticated by calling your backend
async function isAuthenticated(req: NextRequest): Promise<boolean> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/v1';
        const response = await fetch(`${apiUrl}/user/profile`, {
            method: 'GET',
            headers: {
                Cookie: req.headers.get('cookie') || '',
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.success && data.data?.user;
        }
        return false;
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Skip internal Next.js routes, API routes, static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.endsWith('/favicon.ico') ||
        pathname.includes('.png') ||
        pathname.includes('.jpg') ||
        pathname.includes('.svg') ||
        pathname.includes('fonts') ||
        pathname.includes('identity')
    ) {
        return NextResponse.next();
    }

    // Public routes - always accessible
    const publicRoutes = ['/', '/privacy', '/wait'];
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    const isUserAuthenticated = await isAuthenticated(req);

    // Auth routes - redirect to app if logged in
    const authRoutes = ['/login', '/signup', '/otp'];
    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (isUserAuthenticated) {
            return NextResponse.redirect(new URL('/profile', req.url));
        }
        return NextResponse.next();
    }

    // App routes - redirect to login if not logged in
    const appRoutes = ['/editor', '/profile'];
    if (appRoutes.some(route => pathname.startsWith(route))) {
        if (!isUserAuthenticated) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        return NextResponse.next();
    }

    // Default behavior for unknown routes
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
