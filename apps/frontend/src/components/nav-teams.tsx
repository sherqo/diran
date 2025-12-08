'use client';

import * as React from 'react';
import { ChevronRight, FileText, Loader2, MoreHorizontal, Plus, Settings, Trash2, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { CreatePageDialog } from '@/components/features/create-page-dialog';
import { TeamSettingsDialog } from '@/components/features/team-settings-dialog';

import { listTeamsApi, createTeamApi, getTeamPagesApi, TeamPage } from '@/lib/api/team';
import type { TeamResponse } from '@/shared/types/team';
import { useAuth } from '@/contexts/AuthContext';

export function NavTeams() {
    const { user } = useAuth();
    const { isMobile } = useSidebar();
    const [teams, setTeams] = React.useState<TeamResponse[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [teamPages, setTeamPages] = React.useState<Record<string, TeamPage[]>>({});
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
        const result = await getTeamPagesApi(teamId);
        if (result.success) {
            setTeamPages(prev => ({ ...prev, [teamId]: result.data.pages }));
        } else {
            showToast(result.error.message, 'error');
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

    // Leave and delete handled in team settings modal

    const isTeamOwner = (team: TeamResponse) => team.owner.id === user?.id;

    if (loading) {
        return (
            <SidebarGroup>
                <SidebarGroupLabel>Teams</SidebarGroupLabel>
                <SidebarGroupContent>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
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
                                            className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90"
                                            showOnHover>
                                            <ChevronRight />
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>

                                    <SidebarMenuButton asChild>
                                        <button className="flex w-full items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span className="truncate">{team.name}</span>
                                        </button>
                                    </SidebarMenuButton>

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
                                            <DropdownMenuItem onClick={() => handleOpenCreatePageDialog(team)}>
                                                <Plus className="text-muted-foreground" />
                                                <span>New page</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenTeamSettings(team)}>
                                                <Settings className="text-muted-foreground" />
                                                <span>Team settings</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {isTeamOwner(team) ? (
                                                <DropdownMenuItem
                                                    onClick={() => handleOpenTeamSettings(team)}
                                                    className="text-destructive focus:text-destructive">
                                                    <Trash2 className="text-muted-foreground" />
                                                    <span>Delete team</span>
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => handleOpenTeamSettings(team)}
                                                    className="text-destructive focus:text-destructive">
                                                    <LogOut className="text-muted-foreground" />
                                                    <span>Leave team</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {loadingTeamId === team.id ? (
                                                <div className="flex items-center justify-center py-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                </div>
                                            ) : teamPages[team.id] ? (
                                                <>
                                                    {teamPages[team.id].map(page => (
                                                        <SidebarMenuSubItem key={page.id}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link scroll={false} href={`/page/${page.id}`}>
                                                                    {page.content.icon ? (
                                                                        <span className="text-base">{page.content.icon}</span>
                                                                    ) : (
                                                                        <FileText className="h-4 w-4" />
                                                                    )}
                                                                    <span>{page.content.title || 'Untitled'}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                    <SidebarMenuSubItem>
                                                        <button
                                                            className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 px-2 py-1.5 text-sm"
                                                            onClick={() => handleOpenCreatePageDialog(team)}>
                                                            <Plus className="h-4 w-4" />
                                                            <span>Add page</span>
                                                        </button>
                                                    </SidebarMenuSubItem>
                                                </>
                                            ) : null}
                                        </SidebarMenuSub>
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
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
