'use client';

import * as React from 'react';
import { FileText, Loader2, MoreHorizontal, Trash2, Link as LinkIcon, ArrowUpRight, Pencil } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

import { SidebarMenuButton, SidebarMenuItem, SidebarMenuAction } from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TeamPage } from '@/lib/api/team';

interface TeamPageItemProps {
    className?: string;
    page: TeamPage;
    isActive: boolean;
    isDeleting: boolean;
    isMobile: boolean;
    canEdit: boolean; // Owner or Admin can edit/delete
    onCopyLink: (pageId: string) => void;
    onOpenInNewTab: (pageId: string) => void;
    onEditClick: (page: TeamPage) => void;
    onDeleteClick: (pageId: string, pageName: string) => void;
}

export function SortableTeamPageItem({
    className,
    page,
    isActive,
    isDeleting,
    isMobile,
    canEdit,
    onCopyLink,
    onOpenInNewTab,
    onEditClick,
    onDeleteClick,
}: TeamPageItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: page.id,
        disabled: !canEdit,
    });
    const wasDraggingRef = React.useRef(false);

    // Track if we were dragging to prevent click navigation after drag
    React.useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        } else if (wasDraggingRef.current) {
            const timeout = setTimeout(() => {
                wasDraggingRef.current = false;
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [isDragging]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const pageName = page.content.title || 'Untitled';
    const pageIcon = page.content.icon;

    const handleClick = (e: React.MouseEvent) => {
        if (wasDraggingRef.current) {
            e.preventDefault();
        }
    };

    return (
        <SidebarMenuItem ref={setNodeRef} className={className} style={style} {...attributes} {...listeners}>
            <SidebarMenuButton asChild isActive={isActive} size="sm">
                <Link scroll={false} href={`/page/${page.id}`} onClick={handleClick}>
                    {pageIcon ? <span className="text-base">{pageIcon}</span> : <FileText className="h-4 w-4" />}
                    <span>{pageName}</span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal />}
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align={isMobile ? 'end' : 'start'}>
                    {canEdit && (
                        <DropdownMenuItem onClick={() => onEditClick(page)}>
                            <Pencil className="text-muted-foreground" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onCopyLink(page.id)}>
                        <LinkIcon className="text-muted-foreground" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenInNewTab(page.id)}>
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open in New Tab</span>
                    </DropdownMenuItem>
                    {canEdit && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDeleteClick(page.id, pageName)}
                                disabled={isDeleting}
                                className="text-destructive focus:text-destructive">
                                <Trash2 className="text-muted-foreground" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}
