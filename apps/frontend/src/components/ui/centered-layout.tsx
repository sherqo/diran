import { LogoButton } from '@/components/ui/logo-button';

interface CenteredLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
};

export function CenteredLayout({ children, maxWidth = 'sm' }: CenteredLayoutProps) {
    return (
        <div className="bg-background container mx-auto flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <LogoButton className="absolute top-2 left-4 rounded-lg px-2" />
            <div className={`w-full ${maxWidthClasses[maxWidth]}`}>{children}</div>
        </div>
    );
}
