'use client';

import * as React from 'react';
import {
    Home,
    Search,
    // Inbox,
    // Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Kbd, KbdGroup } from './ui/kbd';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from './ui/alert-dialog';

export function NavMain({ onSearchClick }: { onSearchClick?: () => void }) {
    const pathname = usePathname();
    const isHomeActive = pathname === '/home';
    const [askOpen, setAskOpen] = React.useState(false);

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={onSearchClick}>
                        <Search />
                        <span>Search</span>
                        <KbdGroup className="ml-auto">
                            <Kbd>⌘</Kbd>
                            <Kbd>K</Kbd>
                        </KbdGroup>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                {/* <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setAskOpen(true)}>
                        <Sparkles />
                        <span>Ask AI</span>
                        <KbdGroup className="ml-auto">
                            <Kbd>⌘</Kbd>
                            <Kbd>A</Kbd>
                        </KbdGroup>
                    </SidebarMenuButton>
                </SidebarMenuItem> */}

                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isHomeActive}>
                        <Link scroll={false} href="/home">
                            <Home />
                            <span>Home</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>

            {/* Ask AI Alert */}
            <AlertDialog open={askOpen} onOpenChange={setAskOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ask AI</AlertDialogTitle>
                        <AlertDialogDescription>The Ask AI feature is coming soon. Stay tuned!</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setAskOpen(false)}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Inbox remains as a Link to /inbox (no alert) */}
        </>
    );
}
