'use client';

// import { IconDotsVertical, IconLogout, IconSettings } from '@tabler/icons-react';
import { Ellipsis, Settings2, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SettingsDialog } from './settings-dialog';
import { Skeleton } from './ui/skeleton';
import { User } from '@/shared/types/user';
import { useState } from 'react';

export function NavUser({ user, loading, logout }: { user: User | null; loading: boolean; logout: () => Promise<void> }) {
    const { isMobile } = useSidebar();
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    if (loading || !user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <Skeleton className="h-4 w-24 rounded-md" />
                            <Skeleton className="mt-1 h-3 w-32 rounded-md" />
                        </div>
                        <Ellipsis className="ml-auto size-4" />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const handleConfirmLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
        } finally {
            setIsLoggingOut(false);
            setIsLogoutDialogOpen(false);
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.photo} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                            </div>
                            <Ellipsis className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={'bottom'}
                        align="start"
                        sideOffset={4}>
                        <DropdownMenuItem
                            onClick={e => {
                                e.preventDefault();
                                setIsSettingsDialogOpen(true);
                            }}>
                            <Settings2 />
                            Settings
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            variant="destructive"
                            onClick={e => {
                                e.preventDefault();
                                setIsLogoutDialogOpen(true);
                            }}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings dialog */}
                <SettingsDialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />

                {/* Log out confirmation dialog */}
                <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Log out</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to log out? You will need to sign in again to access your account.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction destructive onClick={handleConfirmLogout} disabled={isLoggingOut}>
                                {isLoggingOut ? 'Logging out...' : 'Log out'}
                            </AlertDialogAction>
                            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
