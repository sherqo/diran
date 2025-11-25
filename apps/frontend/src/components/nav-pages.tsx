'use client';

import { FileText, Loader2 } from 'lucide-react';
import { usePage } from '@/contexts/PageContext';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavPages() {
    const { pages, loading, currentPageId, setCurrentPageId } = usePage();

    if (loading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Pages</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {pages.map(page => {
                        const pageName = (page.content as { title?: string }).title || 'Untitled';
                        return (
                            <SidebarMenuItem key={page.id}>
                                <SidebarMenuButton asChild isActive={currentPageId === page.id} onClick={() => setCurrentPageId(page.id)}>
                                    <a href="#">
                                        <FileText className="h-4 w-4" />
                                        <span>{pageName}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                    {pages.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No pages yet</div>}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
