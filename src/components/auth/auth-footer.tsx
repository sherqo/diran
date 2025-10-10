import Link from 'next/link';
import { FieldDescription } from '@/components/ui/field';

export default function AuthFooter() {
    return (
        <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
        </FieldDescription>
    );
}
