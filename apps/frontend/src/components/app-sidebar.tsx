'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavPages } from '@/components/nav-pages';
import { NavTeams } from '@/components/nav-teams';

import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { useAuth } from '@/contexts/AuthContext';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading, logout } = useAuth();

    const handleSearchClick = () => {
        // custom event
        const event = new CustomEvent('openCommandPalette');
        window.dispatchEvent(event);
    };

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar" className="border-r-0" {...props}>
            <SidebarHeader>
                <NavUser user={user} loading={loading} logout={logout} />
                <NavMain onSearchClick={handleSearchClick} />
            </SidebarHeader>
            <SidebarContent>
                <NavPages />
                <NavTeams />
            </SidebarContent>
        </Sidebar>
    );
}
