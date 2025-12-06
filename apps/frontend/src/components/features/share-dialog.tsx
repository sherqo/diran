'use client';

import * as React from 'react';
import { Loader2, Trash2, UserPlus } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { listPermissionsApi, addPermissionApi, updatePermissionApi, removePermissionApi } from '@/lib/api/permission';
import { showToast } from '@/lib/toast';
import type { PermissionResponse } from '@/shared/types/permission';
import type { ShareableRole } from '@/shared/validation/permission';

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pageId: string;
}

const ROLE_LABELS: Record<string, string> = {
    OWNER: 'Owner',
    EDITOR: 'Can edit',
    VIEWER: 'Can view',
};

export function ShareDialog({ open, onOpenChange, pageId }: ShareDialogProps) {
    const [permissions, setPermissions] = React.useState<PermissionResponse[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [selectedRole, setSelectedRole] = React.useState<ShareableRole>('VIEWER');
    const [isAdding, setIsAdding] = React.useState(false);
    const [updatingId, setUpdatingId] = React.useState<string | null>(null);

    const fetchPermissions = React.useCallback(async () => {
        setIsLoading(true);
        const result = await listPermissionsApi(pageId);
        if (result.success) {
            setPermissions(result.data.permissions);
        } else {
            showToast(result.error?.message || 'Failed to load permissions', 'error');
        }
        setIsLoading(false);
    }, [pageId]);

    // Fetch permissions when dialog opens
    React.useEffect(() => {
        if (open && pageId) {
            fetchPermissions();
        }
    }, [open, pageId, fetchPermissions]);

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setEmail('');
            setSelectedRole('VIEWER');
        }
    }, [open]);

    const handleAddPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsAdding(true);
        const result = await addPermissionApi(pageId, { email: email.trim(), role: selectedRole });

        if (result.success) {
            setPermissions(prev => [...prev, result.data.permission]);
            setEmail('');
            showToast('Shared successfully', 'success');
        } else {
            showToast(result.error?.message || 'Failed to share', 'error');
        }
        setIsAdding(false);
    };

    const handleUpdateRole = async (permissionId: string, newRole: ShareableRole) => {
        setUpdatingId(permissionId);
        const result = await updatePermissionApi(pageId, permissionId, { role: newRole });

        if (result.success) {
            setPermissions(prev => prev.map(p => (p.id === permissionId ? { ...p, role: newRole } : p)));
            showToast('Permission updated', 'success');
        } else {
            showToast(result.error?.message || 'Failed to update', 'error');
        }
        setUpdatingId(null);
    };

    const handleRemove = async (permissionId: string) => {
        setUpdatingId(permissionId);
        const result = await removePermissionApi(pageId, permissionId);

        if (result.success) {
            setPermissions(prev => prev.filter(p => p.id !== permissionId));
            showToast('Access removed', 'success');
        } else {
            showToast(result.error?.message || 'Failed to remove', 'error');
        }
        setUpdatingId(null);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="mb-6">
                    <DialogTitle className="sr-only">Share</DialogTitle>
                </DialogHeader>

                {/* Add person form */}
                <form onSubmit={handleAddPermission} className="flex gap-2">
                    <Input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={isAdding}
                        className="flex-1"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" type="button" disabled={isAdding}>
                                {ROLE_LABELS[selectedRole]}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRole('EDITOR')}>Can edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedRole('VIEWER')}>Can view</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="submit" disabled={isAdding || !email.trim()}>
                        {isAdding ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    </Button>
                </form>

                {/* Permissions list */}
                <div className="mt-4 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="text-muted-foreground size-6 animate-spin" />
                        </div>
                    ) : permissions.length === 0 ? (
                        <p className="text-muted-foreground py-4 text-center text-sm">No one else has access yet</p>
                    ) : (
                        permissions.map(permission => (
                            <div key={permission.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar className="size-8">
                                        <AvatarImage src={permission.user.photo || undefined} />
                                        <AvatarFallback className="text-xs">{getInitials(permission.user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{permission.user.name}</p>
                                        <p className="text-muted-foreground truncate text-xs">{permission.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {permission.role === 'OWNER' ? (
                                        <span className="text-muted-foreground px-2 text-xs">Owner</span>
                                    ) : (
                                        <>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={updatingId === permission.id}>
                                                        {updatingId === permission.id ? (
                                                            <Loader2 className="size-3 animate-spin" />
                                                        ) : (
                                                            ROLE_LABELS[permission.role]
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(permission.id, 'EDITOR')}>
                                                        Can edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(permission.id, 'VIEWER')}>
                                                        Can view
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleRemove(permission.id)}
                                                disabled={updatingId === permission.id}>
                                                <Trash2 className="text-destructive size-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
