'use client';

import * as React from 'react';
import { ChevronRight, FileText, Loader2, MoreHorizontal, Plus, Settings, Users } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { CreatePageDialog } from '@/components/features/create-page-dialog';
import { TeamSettingsDialog } from '@/components/features/team-settings-dialog';
import { EditPageDialog } from '@/components/features/edit-page-dialog';

import { listTeamsApi, createTeamApi, getTeamPagesApi, getTeamApi, TeamPage } from '@/lib/api/team';
import type { TeamResponse } from '@/shared/types/team';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { SortableTeamPageItem } from './nav-teams/team-page-item';
import { useTeamPageActions } from './nav-teams/use-team-page-actions';
import { usePathname } from 'next/navigation';

export function NavTeams() {
    const { user } = useAuth();
    const { isMobile } = useSidebar();
    const [teams, setTeams] = React.useState<TeamResponse[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [teamPages, setTeamPages] = React.useState<Record<string, TeamPage[]>>({});
    const [teamDetails, setTeamDetails] = React.useState<Record<string, { isOwner: boolean; isAdmin: boolean }>>({});
    const [loadingTeamId, setLoadingTeamId] = React.useState<string | null>(null);
    const [expandedTeams, setExpandedTeams] = React.useState<Set<string>>(new Set());

    // Create team dialog
    const [createTeamDialogOpen, setCreateTeamDialogOpen] = React.useState(false);
    const [newTeamName, setNewTeamName] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    // Team settings dialog
    const [teamSettingsOpen, setTeamSettingsOpen] = React.useState(false);
    const [settingsTeam, setSettingsTeam] = React.useState<TeamResponse | null>(null);

    // Create page dialog (reusable)
    const [createPageDialogOpen, setCreatePageDialogOpen] = React.useState(false);
    const [selectedTeam, setSelectedTeam] = React.useState<TeamResponse | null>(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchTeams = React.useCallback(async () => {
        setLoading(true);
        const result = await listTeamsApi();
        if (result.success) {
            setTeams(result.data.teams);
        } else {
            showToast(result.error.message, 'error');
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const fetchTeamPages = async (teamId: string) => {
        if (teamPages[teamId]) return; // Already loaded

        setLoadingTeamId(teamId);
        const [pagesResult, teamResult] = await Promise.all([getTeamPagesApi(teamId), getTeamApi(teamId)]);

        if (pagesResult.success) {
            setTeamPages(prev => ({ ...prev, [teamId]: pagesResult.data.pages }));
        } else {
            showToast(pagesResult.error.message, 'error');
        }

        if (teamResult.success) {
            const team = teamResult.data.team;
            const isOwner = team.owner.id === user?.id;
            const currentMember = team.members.find(m => m.user.id === user?.id);
            const isAdmin = currentMember?.role === 'ADMIN';
            setTeamDetails(prev => ({
                ...prev,
                [teamId]: { isOwner, isAdmin },
            }));
        }

        setLoadingTeamId(null);
    };

    const handleOpenCreatePageDialog = (team: TeamResponse) => {
        setSelectedTeam(team);
        setCreatePageDialogOpen(true);
    };

    const handlePageCreated = async () => {
        // Refresh the pages for the selected team
        if (selectedTeam) {
            const result = await getTeamPagesApi(selectedTeam.id);
            if (result.success) {
                setTeamPages(prev => ({ ...prev, [selectedTeam.id]: result.data.pages }));
            }
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;

        setSubmitting(true);
        const result = await createTeamApi({ name: newTeamName.trim() });
        if (result.success) {
            setTeams(prev => [result.data.team, ...prev]);
            setCreateTeamDialogOpen(false);
            setNewTeamName('');
            showToast('Team created', 'success');
        } else {
            showToast(result.error.message, 'error');
        }
        setSubmitting(false);
    };

    const handleOpenTeamSettings = (team: TeamResponse) => {
        setSettingsTeam(team);
        setTeamSettingsOpen(true);
    };

    if (loading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Teams</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {[1, 2].map(i => (
                            <SidebarMenuItem key={i}>
                                <SidebarMenuButton>
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-24" />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>
                    <div className="flex w-full items-center justify-between">
                        <span>Teams</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setCreateTeamDialogOpen(true)}
                            title="Create new team">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {teams.map(team => (
                            <Collapsible
                                key={team.id}
                                open={expandedTeams.has(team.id)}
                                onOpenChange={open => {
                                    if (open) {
                                        setExpandedTeams(prev => new Set(prev).add(team.id));
                                        fetchTeamPages(team.id);
                                    } else {
                                        setExpandedTeams(prev => {
                                            const next = new Set(prev);
                                            next.delete(team.id);
                                            return next;
                                        });
                                    }
                                }}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction
                                            className="bg-sidebar-accent text-sidebar-accent-foreground left-1.5 data-[state=open]:rotate-90"
                                            showOnHover>
                                            <ChevronRight />
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton asChild>
                                            <button className="flex w-full items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span className="truncate">{team.name}</span>
                                            </button>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction showOnHover>
                                                <MoreHorizontal />
                                                <span className="sr-only">More</span>
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-56 rounded-lg"
                                            side={isMobile ? 'bottom' : 'right'}
                                            align={isMobile ? 'end' : 'start'}>
                                            <DropdownMenuItem onClick={() => handleOpenTeamSettings(team)}>
                                                <Settings className="text-muted-foreground" />
                                                <span>Team settings</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenCreatePageDialog(team)}>
                                                <Plus className="text-muted-foreground" />
                                                <span>New page</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <CollapsibleContent>
                                        {loadingTeamId === team.id ? (
                                            <SidebarMenu className="ml-2 border-l pl-1.5">
                                                {[1, 2, 3].map(i => (
                                                    <SidebarMenuItem key={i}>
                                                        <SidebarMenuButton size="sm">
                                                            <Skeleton className="h-4 w-4" />
                                                            <Skeleton className="h-3.5 w-20" />
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        ) : teamPages[team.id] ? (
                                            <TeamPagesList
                                                teamId={team.id}
                                                pages={teamPages[team.id]}
                                                setPages={pages => setTeamPages(prev => ({ ...prev, [team.id]: pages }))}
                                                canEdit={teamDetails[team.id]?.isOwner || teamDetails[team.id]?.isAdmin || false}
                                                isMobile={isMobile}
                                                sensors={sensors}
                                                onCreatePage={() => handleOpenCreatePageDialog(team)}
                                            />
                                        ) : null}
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                        {teams.length === 0 && <div className="text-muted-foreground px-2 py-4 text-sm">No teams yet</div>}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Create Team Dialog */}
            <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
                <DialogContent className="gap-2">
                    <DialogHeader>
                        <DialogTitle>Create Team</DialogTitle>
                        <DialogDescription>Create a new team to collaborate with others.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="team-name">Team name</Label>
                            <Input
                                id="team-name"
                                placeholder="My Team"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !submitting && handleCreateTeam()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateTeamDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateTeam} disabled={submitting || !newTeamName.trim()}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Team Settings Dialog */}
            <TeamSettingsDialog
                open={teamSettingsOpen}
                onOpenChange={setTeamSettingsOpen}
                teamId={settingsTeam?.id || null}
                onTeamUpdated={fetchTeams}
                onTeamDeleted={() => {
                    setTeams(prev => prev.filter(t => t.id !== settingsTeam?.id));
                    setTeamSettingsOpen(false);
                }}
            />

            {/* Create Page Dialog (reusable) */}
            <CreatePageDialog
                open={createPageDialogOpen}
                onOpenChange={setCreatePageDialogOpen}
                teamId={selectedTeam?.id}
                teamName={selectedTeam?.name}
                onPageCreated={handlePageCreated}
            />
        </>
    );
}

interface TeamPagesListProps {
    teamId: string;
    pages: TeamPage[];
    setPages: (pages: TeamPage[]) => void;
    canEdit: boolean;
    isMobile: boolean;
    sensors: ReturnType<typeof useSensors>;
    onCreatePage: () => void;
}

function TeamPagesList({ teamId, pages, setPages, canEdit, isMobile, sensors, onCreatePage }: TeamPagesListProps) {
    const pathname = usePathname();
    const currentPageId = pathname?.replace('/page/', '');

    const {
        pageIds,
        activePage,
        deletingPageId,
        pageToDelete,
        pageToEdit,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
        handleCopyLink,
        handleOpenInNewTab,
        handleEditClick,
        handleDeleteClick,
        handleDeleteConfirm,
        handleCloseDeleteDialog,
        handleCloseEditDialog,
    } = useTeamPageActions({ teamId, teamPages: pages, setTeamPages: setPages, canEdit });

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}>
                <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
                    <SidebarMenu className="ml-3.5 border-l pl-2">
                        {pages.map(page => (
                            <SortableTeamPageItem
                                className="w-54"
                                key={page.id}
                                page={page}
                                isActive={currentPageId === page.id}
                                isDeleting={deletingPageId === page.id}
                                isMobile={isMobile}
                                canEdit={canEdit}
                                onCopyLink={handleCopyLink}
                                onOpenInNewTab={handleOpenInNewTab}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))}
                        {canEdit && (
                            <SidebarMenuItem>
                                <SidebarMenuButton size="sm" onClick={onCreatePage} className="text-muted-foreground">
                                    <Plus className="h-4 w-4" />
                                    <span>Add page</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SortableContext>
                <DragOverlay>
                    {activePage ? (
                        <div className="bg-sidebar rounded-md border px-2 py-1.5 shadow-lg">
                            <div className="flex items-center gap-2">
                                {activePage.content.icon ? (
                                    <span className="text-base">{activePage.content.icon}</span>
                                ) : (
                                    <FileText className="h-4 w-4" />
                                )}
                                <span>{activePage.content.title || 'Untitled'}</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Edit Page Dialog - need to convert TeamPage to Page format */}
            {pageToEdit && (
                <EditPageDialog
                    open={!!pageToEdit}
                    onOpenChange={handleCloseEditDialog}
                    page={{
                        id: pageToEdit.id,
                        type: pageToEdit.type,
                        content: pageToEdit.content,
                        role: 'OWNER', // Team pages are always owned by team
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!pageToDelete} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{pageToDelete?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction destructive onClick={handleDeleteConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
