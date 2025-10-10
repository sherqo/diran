import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import AuthFooter from './auth-footer';
import GoogleBtn from './google-btn';

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl font-medium">
                            Welcome to <span className="font-clash">Diran AI</span>
                        </h1>
                        <FieldDescription>
                            Already have an account? <Link href="/login">Log in</Link>
                        </FieldDescription>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input id="name" type="text" placeholder="John Doe" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" type="email" placeholder="xx@example.com" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" type="password" placeholder="••••••••" required />
                    </Field>
                    <Field>
                        <Button type="submit">Login</Button>
                    </Field>
                    <FieldSeparator>Or</FieldSeparator>

                    <GoogleBtn />
                </FieldGroup>
            </form>
            <AuthFooter />
        </div>
    );
}
