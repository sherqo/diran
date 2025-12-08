import { Metadata } from 'next';
import NotFoundInline from '@/components/not-found-inline';

export const metadata: Metadata = {
    title: 'Page Not Found',
    description: "We couldn't find the page you're looking for",
};

export default function NotFound() {
    return (
        <body className="bg-background">
            <NotFoundInline />
        </body>
    );
}
