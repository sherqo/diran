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

export function NavMain({ onSearchClick }: { onSearchClick?: () => void }) {
    const pathname = usePathname();
    const isHomeActive = pathname === '/home';

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

                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isHomeActive}>
                        <Link scroll={false} href="/home">
                            <Home />
                            <span>Home</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}
