'use client';

import * as React from 'react';
import { Users } from 'lucide-react';

import { NavActions } from '@/components/nav-actions';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareDialog } from '@/components/features/share-dialog';
import SyncStatusIndicator from './features/editor/SyncStatusIndicator';

interface PageHeaderProps {
    title: string;
    icon?: string;
    pageId?: string;
    role?: string | null;
    loading?: boolean;
}

export function PageHeader({ title, icon, pageId, role, loading }: PageHeaderProps) {
    const [shareOpen, setShareOpen] = React.useState(false);
    const isOwner = role === 'OWNER';
    const canShare = isOwner && pageId;

    return (
        <header className="bg-sidebar sticky top-0 z-40 flex h-12 w-full shrink-0 items-center gap-2 border-b backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                {loading ? (
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="line-clamp-1 flex items-center gap-1.5">
                                    {icon && <span>{icon}</span>}
                                    {title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
                {!loading && <SyncStatusIndicator />}
            </div>
            <div className="ml-auto flex items-center gap-1 px-3">
                {loading ? (
                    <Skeleton className="h-8 w-16 rounded-md" />
                ) : pageId ? (
                    <>
                        {canShare ? (
                            <>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)} className="gap-1.5">
                                            <Users className="size-4" />
                                            <span className="hidden sm:inline">Share</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share this page</TooltipContent>
                                </Tooltip>
                                <ShareDialog open={shareOpen} onOpenChange={setShareOpen} pageId={pageId} />
                            </>
                        ) : role ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-muted-foreground flex items-center gap-1.5 rounded-md px-2 py-1 text-xs">
                                        <Users className="size-3.5" />
                                        <span>{role === 'EDITOR' ? 'Editor' : 'Viewer'}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>You have {role === 'EDITOR' ? 'edit' : 'view'} access</TooltipContent>
                            </Tooltip>
                        ) : null}
                    </>
                ) : null}
                <NavActions />
            </div>
        </header>
    );
}
