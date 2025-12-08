'use client';

import * as React from 'react';
import { Loader2, LogOut, MoreHorizontal, Shield, Trash2, User, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

import { getTeamApi, updateTeamApi, deleteTeamApi, addMemberApi, updateMemberApi, removeMemberApi, leaveTeamApi } from '@/lib/api/team';
import type { TeamDetailResponse, TeamMemberResponse } from '@/shared/types/team';

interface TeamSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId: string | null;
    onTeamUpdated?: () => void;
    onTeamDeleted?: () => void;
}

export function TeamSettingsDialog({ open, onOpenChange, teamId, onTeamUpdated, onTeamDeleted }: TeamSettingsDialogProps) {
    const { user } = useAuth();
    const [team, setTeam] = React.useState<TeamDetailResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    // Edit team name
    const [teamName, setTeamName] = React.useState('');

    // Add member dialog
    const [addMemberOpen, setAddMemberOpen] = React.useState(false);
    const [newMemberEmail, setNewMemberEmail] = React.useState('');
    const [newMemberRole, setNewMemberRole] = React.useState<'ADMIN' | 'MEMBER'>('MEMBER');
    const [addingMember, setAddingMember] = React.useState(false);

    // Delete team confirmation
    const [deleteTeamOpen, setDeleteTeamOpen] = React.useState(false);

    // Remove member confirmation
    const [removeMemberOpen, setRemoveMemberOpen] = React.useState(false);
    const [memberToRemove, setMemberToRemove] = React.useState<TeamMemberResponse | null>(null);
    // Leave team confirmation
    const [leaveTeamOpen, setLeaveTeamOpen] = React.useState(false);

    const isOwner = team?.owner.id === user?.id;
    const currentMember = team?.members.find(m => m.user.id === user?.id);
    const isAdmin = currentMember?.role === 'ADMIN';
    const canManageMembers = isOwner || isAdmin;

    const fetchTeam = React.useCallback(async () => {
        if (!teamId) return;

        setLoading(true);
        const result = await getTeamApi(teamId);
        if (result.success) {
            setTeam(result.data.team);
            setTeamName(result.data.team.name);
        } else {
            showToast(result.error.message, 'error');
            onOpenChange(false);
        }
        setLoading(false);
    }, [teamId, onOpenChange]);

    React.useEffect(() => {
        if (open && teamId) {
            fetchTeam();
        }
    }, [open, teamId, fetchTeam]);

    const handleUpdateTeamName = async () => {
        if (!teamId || !teamName.trim() || teamName === team?.name) return;

        setSaving(true);
        const result = await updateTeamApi(teamId, { name: teamName.trim() });
        if (result.success) {
            setTeam(prev => (prev ? { ...prev, name: teamName.trim() } : null));
            showToast('Team name updated', 'success');
            onTeamUpdated?.();
        } else {
            showToast(result.error.message, 'error');
        }
        setSaving(false);
    };

    const handleDeleteTeam = async () => {
        if (!teamId) return;

        const result = await deleteTeamApi(teamId);
        if (result.success) {
            showToast('Team deleted', 'success');
            onTeamDeleted?.();
            onOpenChange(false);
            setDeleteTeamOpen(false);
        } else {
            showToast(result.error.message, 'error');
        }
    };

    const handleLeaveTeam = async () => {
        if (!teamId) return;

        const result = await leaveTeamApi(teamId);
        if (result.success) {
            showToast('You left the team', 'success');
            onTeamUpdated?.();
            setLeaveTeamOpen(false);
            onOpenChange(false);
        } else {
            showToast(result.error.message, 'error');
        }
    };

    const handleAddMember = async () => {
        if (!teamId || !newMemberEmail.trim()) return;

        setAddingMember(true);
        const result = await addMemberApi(teamId, { email: newMemberEmail.trim(), role: newMemberRole });
        if (result.success) {
            await fetchTeam();
            setAddMemberOpen(false);
            setNewMemberEmail('');
            setNewMemberRole('MEMBER');
            showToast('Member added', 'success');
        } else {
            showToast(result.error.message, 'error');
        }
        setAddingMember(false);
    };

    const handleUpdateMemberRole = async (member: TeamMemberResponse, newRole: 'ADMIN' | 'MEMBER') => {
        if (!teamId) return;

        const result = await updateMemberApi(teamId, member.id, { role: newRole });
        if (result.success) {
            setTeam(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    members: prev.members.map(m => (m.id === member.id ? { ...m, role: newRole } : m)),
                };
            });
            showToast('Member role updated', 'success');
        } else {
            showToast(result.error.message, 'error');
        }
    };

    const handleRemoveMember = async () => {
        if (!teamId || !memberToRemove) return;

        const result = await removeMemberApi(teamId, memberToRemove.id);
        if (result.success) {
            setTeam(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    members: prev.members.filter(m => m.id !== memberToRemove.id),
                    memberCount: prev.memberCount - 1,
                };
            });
            showToast('Member removed', 'success');
            setRemoveMemberOpen(false);
            setMemberToRemove(null);
        } else {
            showToast(result.error.message, 'error');
        }
    };

    const getRoleBadge = (role: string, isMemberOwner: boolean) => {
        if (isMemberOwner)
            return (
                <Badge variant="default" className="px-1.5 py-0 text-xs">
                    Owner
                </Badge>
            );
        if (role === 'ADMIN')
            return (
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                    Admin
                </Badge>
            );
        return null;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{team?.name || 'Team Settings'}</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="space-y-6 py-2">
                            {/* Team name skeleton */}
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-9 flex-1" />
                                    <Skeleton className="h-9 w-16" />
                                </div>
                            </div>
                            {/* Members skeleton */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <div className="space-y-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-2.5 px-2 py-2">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1 space-y-1.5">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Danger zone skeleton */}
                            <div className="border-t pt-4">
                                <Skeleton className="h-8 w-28" />
                            </div>
                        </div>
                    ) : team ? (
                        <div className="space-y-6">
                            {/* Team Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="team-name" className="text-muted-foreground text-xs font-medium">
                                    Team name
                                </Label>
                                {isOwner ? (
                                    <div className="flex gap-2">
                                        <Input
                                            id="team-name"
                                            value={teamName}
                                            onChange={e => setTeamName(e.target.value)}
                                            placeholder="Team name"
                                            className="h-9"
                                            onKeyDown={e => e.key === 'Enter' && !saving && handleUpdateTeamName()}
                                        />
                                        <Button
                                            onClick={handleUpdateTeamName}
                                            disabled={saving || !teamName.trim() || teamName === team.name}
                                            size="sm"
                                            className="h-9">
                                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-sm">{team.name}</div>
                                )}
                            </div>

                            {/* Members */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-muted-foreground text-xs font-medium">Members ({team.memberCount + 1})</Label>
                                    {canManageMembers && (
                                        <Button size="sm" variant="ghost" onClick={() => setAddMemberOpen(true)} className="h-8 text-xs">
                                            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                            Add
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {/* Owner */}
                                    <div className="group hover:bg-muted/50 flex items-center justify-between rounded-md px-2 py-2">
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={team.owner.photo || undefined} />
                                                <AvatarFallback className="bg-muted text-xs">
                                                    {team.owner.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate text-sm">{team.owner.name}</span>
                                                    {getRoleBadge('OWNER', true)}
                                                </div>
                                                <span className="text-muted-foreground truncate text-xs">{team.owner.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Members */}
                                    {team.members.length > 0 ? (
                                        team.members.map(member => {
                                            const isCurrentUser = member.user.id === user?.id;
                                            const canManageThisMember =
                                                canManageMembers && !isCurrentUser && (isOwner || (isAdmin && member.role !== 'ADMIN'));

                                            return (
                                                <div
                                                    key={member.id}
                                                    className="group hover:bg-muted/50 flex items-center justify-between rounded-md px-2 py-2">
                                                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 shrink-0">
                                                            <AvatarImage src={member.user.photo || undefined} />
                                                            <AvatarFallback className="bg-muted text-xs">
                                                                {member.user.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="truncate text-sm">{member.user.name}</span>
                                                                {getRoleBadge(member.role, false)}
                                                            </div>
                                                            <span className="text-muted-foreground truncate text-xs">
                                                                {member.user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {canManageThisMember && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                {isOwner && (
                                                                    <>
                                                                        {member.role === 'MEMBER' ? (
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleUpdateMemberRole(member, 'ADMIN')}
                                                                                className="text-xs">
                                                                                <Shield className="mr-2 h-3.5 w-3.5" />
                                                                                Make Admin
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleUpdateMemberRole(member, 'MEMBER')}
                                                                                className="text-xs">
                                                                                <User className="mr-2 h-3.5 w-3.5" />
                                                                                Make Member
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuSeparator />
                                                                    </>
                                                                )}
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setMemberToRemove(member);
                                                                        setRemoveMemberOpen(true);
                                                                    }}
                                                                    className="text-destructive focus:text-destructive text-xs">
                                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                    Remove
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-muted-foreground py-6 text-center text-xs">No members yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="border-t pt-4">
                                {isOwner ? (
                                    <Button variant="destructive" size="sm" onClick={() => setDeleteTeamOpen(true)} className="h-8 text-xs">
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        Delete Team
                                    </Button>
                                ) : (
                                    <Button variant="destructive" size="sm" onClick={() => setLeaveTeamOpen(true)} className="h-8 text-xs">
                                        <LogOut className="mr-1.5 h-3.5 w-3.5" />
                                        Leave Team
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                <DialogContent className="gap-2">
                    <DialogHeader>
                        <DialogTitle>Add Member</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            handleAddMember();
                        }}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="member-email" className="text-muted-foreground text-xs font-medium">
                                    Email address
                                </Label>
                                <Input
                                    id="member-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={newMemberEmail}
                                    onChange={e => setNewMemberEmail(e.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                    className="h-9"
                                    onKeyDown={e => e.key === 'Enter' && !addingMember && handleAddMember()}
                                />
                            </div>
                            {isOwner && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="member-role" className="text-muted-foreground text-xs font-medium">
                                        Role
                                    </Label>
                                    <Select value={newMemberRole} onValueChange={(v: 'ADMIN' | 'MEMBER') => setNewMemberRole(v)}>
                                        <SelectTrigger id="member-role" className="h-9 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2">
                            <Button type="button" variant="ghost" onClick={() => setAddMemberOpen(false)} disabled={addingMember} size="sm">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addingMember || !newMemberEmail.trim()} size="sm">
                                {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Team Confirmation */}
            <AlertDialog open={deleteTeamOpen} onOpenChange={setDeleteTeamOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this team? This action cannot be undone. All team pages will be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTeam}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Team
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Leave Team Confirmation */}
            <AlertDialog open={leaveTeamOpen} onOpenChange={setLeaveTeamOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave Team</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave this team? You will lose access to all team pages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeaveTeam}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Leave Team
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Remove Member Confirmation */}
            <AlertDialog open={removeMemberOpen} onOpenChange={setRemoveMemberOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove {memberToRemove?.user.name} from the team? They will lose access to all team
                            pages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
