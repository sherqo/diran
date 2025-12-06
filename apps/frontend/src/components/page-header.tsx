'use client';

import * as React from 'react';
import { Share2 } from 'lucide-react';

import { NavActions } from '@/components/nav-actions';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/features/share-dialog';
import SyncStatusIndicator from './features/editor/SyncStatusIndicator';

interface PageHeaderProps {
    title: string;
    icon?: string;
    pageId?: string;
    isOwner?: boolean;
}

export function PageHeader({ title, icon, pageId, isOwner }: PageHeaderProps) {
    const [shareOpen, setShareOpen] = React.useState(false);

    return (
        <header className="bg-sidebar sticky top-0 z-40 flex h-12 w-full shrink-0 items-center gap-2 border-b backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
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
                <SyncStatusIndicator />
            </div>
            <div className="ml-auto flex items-center gap-2 px-3">
                {isOwner && pageId && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                            <Share2 className="mr-1.5 size-4" />
                            Share
                        </Button>
                        <ShareDialog open={shareOpen} onOpenChange={setShareOpen} pageId={pageId} pageName={title} />
                    </>
                )}
                <NavActions />
            </div>
        </header>
    );
}
