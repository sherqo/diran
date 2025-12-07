'use client';

import { FileText, MoreHorizontal, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { SidebarMenuButton, SidebarMenuItem, SidebarMenuAction } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { SharedPageItemProps } from './types';

export function SharedPageItem({ page, isActive, isMobile, onCopyLink, onOpenInNewTab }: SharedPageItemProps) {
    const content = page.content as { title?: string; icon?: string };
    const pageName = content.title || 'Untitled';
    const pageIcon = content.icon;

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link scroll={false} href={`/page/${page.id}`}>
                    {pageIcon ? <span className="text-base">{pageIcon}</span> : <FileText className="h-4 w-4" />}
                    <span>{pageName}</span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align={isMobile ? 'end' : 'start'}>
                    <DropdownMenuItem onClick={() => onCopyLink(page.id)}>
                        <LinkIcon className="text-muted-foreground" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenInNewTab(page.id)}>
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open in New Tab</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
