import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
    return (
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
                <h2 className="text-2xl font-bold">Hi, I am Diran AI</h2>
                <h3 className="text-lg">Still under development, stay tuned for updates!</h3>
                <span>
                    Contact us at{' '}
                    <a href="mailto:support@diran.app" className="text-primary hover:underline">
                        support@diran.app
                    </a>
                </span>
            </main>
            <footer className="row-start-3 flex flex-wrap items-center justify-center gap-[24px]"></footer>
        </div>
    );
}
