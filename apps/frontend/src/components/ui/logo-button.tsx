import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SITE_NAME } from '@/lib/site-info';

interface LogoButtonProps {
    className?: string;
}

export function LogoButton({ className }: LogoButtonProps) {
    return (
        <Button variant="ghost" className={className} asChild>
            <Link href="/" className="flex items-center gap-2">
                <Image src="/identity/logo-192.png" alt={`${SITE_NAME} logo`} width={30} height={30} />
                <span className="font-clash text-lg">{SITE_NAME}</span>
            </Link>
        </Button>
    );
}
