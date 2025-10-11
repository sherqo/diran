import { ThemeToggle } from '@/components/theme-toggle';
import Tiptap from '@/components/tiptap/Tiptap';
export const metadata = {
    title: 'Editor',
};

export default function Home() {
    return <Tiptap />;
    return (
        <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
        </div>
    );
}
