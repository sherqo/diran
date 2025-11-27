'use client';

import * as React from 'react';
import { Settings2, Trash2 } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
// import { NavSecondary } from '@/components/nav-secondary';
import { NavWorkspaces } from '@/components/nav-workspaces';
import { NavPages } from '@/components/nav-pages';

import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { useAuth } from '@/contexts/AuthContext';

// This is sample data.
const data = {
    // navMain removed - NavMain renders explicit items (Search, Ask AI, Home, Inbox)
    navSecondary: [
        // {title: 'Calendar',url: '#',icon: Calendar,},
        {
            title: 'Settings',
            url: '#',
            icon: Settings2,
        },
        // {title: "Templates",url: "#",icon: Blocks,},
        {
            title: 'Trash',
            url: '#',
            icon: Trash2,
        },
        // {title: 'Help',url: '#',icon: MessageCircleQuestion,},
    ],

    workspaces: [
        {
            name: 'Personal Life Management',
            emoji: '🏠',
            pages: [
                {
                    name: 'Daily Journal & Reflection',
                    url: '#',
                    emoji: '📔',
                },
                {
                    name: 'Health & Wellness Tracker',
                    url: '#',
                    emoji: '🍏',
                },
                {
                    name: 'Personal Growth & Learning Goals',
                    url: '#',
                    emoji: '🌟',
                },
            ],
        },
        {
            name: 'Professional Development',
            emoji: '💼',
            pages: [
                {
                    name: 'Career Objectives & Milestones',
                    url: '#',
                    emoji: '🎯',
                },
                {
                    name: 'Skill Acquisition & Training Log',
                    url: '#',
                    emoji: '🧠',
                },
                {
                    name: 'Networking Contacts & Events',
                    url: '#',
                    emoji: '🤝',
                },
            ],
        },
        {
            name: 'Creative Projects',
            emoji: '🎨',
            pages: [
                {
                    name: 'Writing Ideas & Story Outlines',
                    url: '#',
                    emoji: '✍️',
                },
                {
                    name: 'Art & Design Portfolio',
                    url: '#',
                    emoji: '🖼️',
                },
                {
                    name: 'Music Composition & Practice Log',
                    url: '#',
                    emoji: '🎵',
                },
            ],
        },
        {
            name: 'Home Management',
            emoji: '🏡',
            pages: [
                {
                    name: 'Household Budget & Expense Tracking',
                    url: '#',
                    emoji: '💰',
                },
                {
                    name: 'Home Maintenance Schedule & Tasks',
                    url: '#',
                    emoji: '🔧',
                },
                {
                    name: 'Family Calendar & Event Planning',
                    url: '#',
                    emoji: '📅',
                },
            ],
        },
        {
            name: 'Travel & Adventure',
            emoji: '🧳',
            pages: [
                {
                    name: 'Trip Planning & Itineraries',
                    url: '#',
                    emoji: '🗺️',
                },
                {
                    name: 'Travel Bucket List & Inspiration',
                    url: '#',
                    emoji: '🌎',
                },
                {
                    name: 'Travel Journal & Photo Gallery',
                    url: '#',
                    emoji: '📸',
                },
            ],
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, loading, logout } = useAuth();

    const handleSearchClick = () => {
        // Dispatch custom event to open command palette
        const event = new CustomEvent('openCommandPalette');
        window.dispatchEvent(event);
    };

    return (
        <>
            <Sidebar collapsible="offcanvas" variant="sidebar" className="border-r-0" {...props}>
                <SidebarHeader>
                    <NavUser user={user} loading={loading} logout={logout} />
                    <NavMain onSearchClick={handleSearchClick} />
                </SidebarHeader>
                <SidebarContent>
                    <NavPages />
                    {/* this workspace thing can be for tags later... */}
                    <NavWorkspaces workspaces={data.workspaces} />
                    {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
                </SidebarContent>
            </Sidebar>
            {/* CreatePageDialog removed — NavPages handles page-creation dialog itself */}
        </>
    );
}
