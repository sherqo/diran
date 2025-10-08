import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found',
    description: "We couldn't find the page you're looking for",
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">404</h1>
                <p className="text-muted-foreground mt-2 text-sm">Page not found.</p>
            </div>
        </div>
    );
}
