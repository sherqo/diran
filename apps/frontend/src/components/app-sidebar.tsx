'use client';

import * as React from 'react';
import {
    // AudioWaveform,Blocks,Calendar,MessageCircleQuestion,Command,
    Home,
    Inbox,
    Search,
    Settings2,
    Sparkles,
    Trash2,
} from 'lucide-react';

import { NavFavorites } from '@/components/nav-favorites';
import { NavMain } from '@/components/nav-main';
// import { NavSecondary } from '@/components/nav-secondary';
import { NavWorkspaces } from '@/components/nav-workspaces';
import { NavPages } from '@/components/nav-pages';

import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { useAuth } from '@/contexts/AuthContext';

// This is sample data.
const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },

    navMain: [
        {
            title: 'Search',
            url: '#',
            icon: Search,
            kbd: 'K',
        },
        {
            title: 'Ask AI',
            url: '#',
            icon: Sparkles,
            kbd: 'A',
        },
        {
            title: 'Home',
            url: '#',
            icon: Home,
            isActive: true,
        },
        {
            title: 'Inbox',
            url: '#',
            icon: Inbox,
            badge: '10',
        },
    ],
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
    favorites: [
        {
            name: 'Project Management & Task Tracking',
            url: '#',
            emoji: '📊',
        },
        {
            name: 'Family Recipe Collection & Meal Planning',
            url: '#',
            emoji: '🍳',
        },
        {
            name: 'Fitness Tracker & Workout Routines',
            url: '#',
            emoji: '💪',
        },
        {
            name: 'Book Notes & Reading List',
            url: '#',
            emoji: '📚',
        },
        {
            name: 'Sustainable Gardening Tips & Plant Care',
            url: '#',
            emoji: '🌱',
        },
        {
            name: 'Language Learning Progress & Resources',
            url: '#',
            emoji: '🗣️',
        },
        {
            name: 'Home Renovation Ideas & Budget Tracker',
            url: '#',
            emoji: '🏠',
        },
        {
            name: 'Personal Finance & Investment Portfolio',
            url: '#',
            emoji: '💰',
        },
        {
            name: 'Movie & TV Show Watchlist with Reviews',
            url: '#',
            emoji: '🎬',
        },
        {
            name: 'Daily Habit Tracker & Goal Setting',
            url: '#',
            emoji: '✅',
        },
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
        <Sidebar collapsible="offcanvas" variant="sidebar" className="border-r-0" {...props}>
            <SidebarHeader>
                <NavUser user={user} loading={loading} logout={logout} />
                <NavMain items={data.navMain} onSearchClick={handleSearchClick} />
            </SidebarHeader>
            <SidebarContent>
                <NavPages />
                <NavFavorites favorites={data.favorites} />
                <NavWorkspaces workspaces={data.workspaces} />
                {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
        </Sidebar>
    );
}
