import { Loader } from '@/components/ui/loader';

export const metadata = {
    title: 'Be the first — Diran',
};

export default function WaitPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-8">
            <div className="max-w-md text-center">
                <h1 className="mb-4 text-2xl font-bold">Thanks for your interest!</h1>
                <p className="mb-6">Diran is launching soon. Meanwhile you can visit our site or join the waitlist.</p>

                <div className="flex justify-center gap-3">
                    <a
                        href="https://diran.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-primary-foreground rounded-md px-4 py-2">
                        Join waitlist
                    </a>
                    <Loader className="text-primary" />
                </div>
            </div>
        </div>
    );
}
