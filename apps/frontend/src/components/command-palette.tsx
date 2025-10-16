'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Settings, Smile, User } from 'lucide-react';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(open => !open);
            }
        };

        const handleOpenCommandPalette = () => {
            setOpen(true);
        };

        document.addEventListener('keydown', down);
        window.addEventListener('openCommandPalette', handleOpenCommandPalette);

        return () => {
            document.removeEventListener('keydown', down);
            window.removeEventListener('openCommandPalette', handleOpenCommandPalette);
        };
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Go to Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/editor'))}>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Go to Editor</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/profile'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Go to Profile</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem
                            onSelect={() =>
                                runCommand(() => {
                                    // This will be handled by the parent component
                                    const event = new CustomEvent('openSettings');
                                    window.dispatchEvent(event);
                                })
                            }>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
