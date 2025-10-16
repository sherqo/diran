'use client';

import { type LucideIcon } from 'lucide-react';

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { CommandShortcut } from './ui/command';
import { Kbd, KbdGroup } from './ui/kbd';

export function NavMain({
    items,
    onSearchClick,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        kbd?: string;
    }[];
    onSearchClick?: () => void;
}) {
    return (
        <SidebarMenu>
            {items.map(item => (
                <SidebarMenuItem key={item.title}>
                    {item.title === 'Search' ? (
                        <SidebarMenuButton onClick={onSearchClick}>
                            <item.icon />
                            <span>{item.title}</span>
                            {item.kbd && (
                                <KbdGroup className="ml-auto">
                                    <Kbd>⌘</Kbd>
                                    <Kbd>{item.kbd}</Kbd>
                                </KbdGroup>
                            )}
                        </SidebarMenuButton>
                    ) : (
                        <SidebarMenuButton asChild isActive={item.isActive}>
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                                {item.kbd && (
                                    <KbdGroup className="ml-auto">
                                        <Kbd>⌘</Kbd>
                                        <Kbd>{item.kbd}</Kbd>
                                    </KbdGroup>
                                )}
                            </a>
                        </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
