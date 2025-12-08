'use client';

import * as React from 'react';
import { Loader2, Trash2, UserPlus, Globe, Link as LinkIcon, Check, Copy } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { listPermissionsApi, addPermissionApi, updatePermissionApi, removePermissionApi } from '@/lib/api/permission';
import { getPublishApi, createPublishApi, updatePublishApi } from '@/lib/api/publish';
import type { UpdatePublishBodyInput } from '@/shared/validation/publish';
import { showToast } from '@/lib/toast';
import type { PermissionResponse } from '@/shared/types/permission';
import type { PublishResponse } from '@/shared/types/publish';
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
    const [activeTab, setActiveTab] = React.useState<'share' | 'publish'>('share');

    // Share state
    const [permissions, setPermissions] = React.useState<PermissionResponse[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [selectedRole, setSelectedRole] = React.useState<ShareableRole>('VIEWER');
    const [isAdding, setIsAdding] = React.useState(false);
    const [updatingId, setUpdatingId] = React.useState<string | null>(null);

    // Publish state
    const [publish, setPublish] = React.useState<PublishResponse | null>(null);
    const [isLoadingPublish, setIsLoadingPublish] = React.useState(false);
    const [slug, setSlug] = React.useState('');
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const fetchPermissions = React.useCallback(async () => {
        setIsLoadingPermissions(true);
        const result = await listPermissionsApi(pageId);
        if (result.success) {
            setPermissions(result.data.permissions);
        } else {
            showToast(result.error?.message || 'Failed to load permissions', 'error');
        }
        setIsLoadingPermissions(false);
    }, [pageId]);

    const fetchPublish = React.useCallback(async () => {
        setIsLoadingPublish(true);
        const result = await getPublishApi(pageId);
        if (result.success) {
            setPublish(result.data.publish);
            if (result.data.publish) {
                setSlug(result.data.publish.slug);
            }
        }
        setIsLoadingPublish(false);
    }, [pageId]);

    // Fetch data when dialog opens
    React.useEffect(() => {
        if (open && pageId) {
            fetchPermissions();
            fetchPublish();
        }
    }, [open, pageId, fetchPermissions, fetchPublish]);

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setEmail('');
            setSelectedRole('VIEWER');
            setSlug('');
            setCopied(false);
        }
    }, [open]);

    // Share handlers
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

    // Publish handlers
    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug.trim()) return;

        setIsPublishing(true);
        // If a publish exists (active or inactive), update it (reactivate + update slug) instead of creating a new one
        const payload: UpdatePublishBodyInput = { slug: slug.trim(), isActive: true };
        const result = publish ? await updatePublishApi(pageId, payload) : await createPublishApi(pageId, { slug: slug.trim() });

        if (result.success) {
            setPublish(result.data.publish);
            showToast('Published successfully', 'success');
        } else {
            showToast(result.error?.message || 'Failed to publish', 'error');
        }
        setIsPublishing(false);
    };

    const handleUnpublish = async () => {
        setIsUpdating(true);
        // Soft-unpublish: mark the publish record as inactive
        const result = await updatePublishApi(pageId, { isActive: false });

        if (result.success) {
            setPublish(result.data.publish);
            setSlug(result.data.publish.slug || '');
            showToast('Unpublished successfully', 'success');
        } else {
            showToast(result.error?.message || 'Failed to unpublish', 'error');
        }
        setIsUpdating(false);
    };

    const handleUpdateSlug = async () => {
        if (!slug.trim() || slug === publish?.slug) return;

        setIsUpdating(true);
        const result = await updatePublishApi(pageId, { slug: slug.trim() });

        if (result.success) {
            setPublish(result.data.publish);
            showToast('Slug updated', 'success');
        } else {
            showToast(result.error?.message || 'Failed to update slug', 'error');
        }
        setIsUpdating(false);
    };

    const handleCopyLink = () => {
        if (!publish) return;
        const url = `${window.location.origin}/s/${publish.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const generateSlug = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setSlug(result);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
                <DialogHeader>
                    <DialogTitle>Share & Publish</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'share' | 'publish')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="share">Share</TabsTrigger>
                        <TabsTrigger value="publish">Publish</TabsTrigger>
                    </TabsList>

                    {/* Share Tab */}
                    <TabsContent value="share" className="mt-6 space-y-4">
                        <form onSubmit={handleAddPermission} className="flex flex-col gap-2 sm:flex-row">
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

                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                            {isLoadingPermissions ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="text-muted-foreground size-5 animate-spin" />
                                </div>
                            ) : permissions.length === 0 ? (
                                <p className="text-muted-foreground py-8 text-center text-sm">No one has access yet</p>
                            ) : (
                                permissions.map(permission => (
                                    <div
                                        key={permission.id}
                                        className="hover:bg-accent/50 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors">
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
                    </TabsContent>

                    {/* Publish Tab */}
                    <TabsContent value="publish" className="mt-6 space-y-4">
                        {isLoadingPublish ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="text-muted-foreground size-5 animate-spin" />
                            </div>
                        ) : publish && publish.isActive ? (
                            <div className="space-y-5">
                                <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                                    <Globe className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-500" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">Page is live</p>
                                        <p className="text-muted-foreground text-xs">Anyone with the link can view</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="slug" className="text-sm font-medium">
                                        Public URL
                                    </Label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <div className="bg-muted flex flex-1 items-center rounded-md border px-3">
                                            <span className="text-muted-foreground text-sm">s/</span>
                                            <Input
                                                id="slug"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                className="border-0 bg-transparent px-0 focus-visible:ring-0"
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        {slug !== publish.slug && (
                                            <Button
                                                onClick={handleUpdateSlug}
                                                disabled={isUpdating || !slug.trim()}
                                                className="w-full sm:w-auto">
                                                {isUpdating ? <Loader2 className="size-4 animate-spin" /> : 'Update'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                                        {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                    <Button variant="outline" className="flex-1" asChild>
                                        <a href={`/s/${publish.slug}`} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="mr-2 size-4" />
                                            Open
                                        </a>
                                    </Button>
                                </div>

                                <Button variant="destructive" size="sm" className="w-full" onClick={handleUnpublish} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                                    Unpublish
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handlePublish} className="space-y-5">
                                <div className="text-muted-foreground flex flex-col items-center gap-3 py-6 text-center">
                                    <Globe className="size-12 opacity-40" />
                                    <p className="text-sm">Publish to share with anyone</p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="new-slug" className="text-sm font-medium">
                                        URL Slug
                                    </Label>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <div className="bg-muted flex flex-1 items-center rounded-md border px-3">
                                            <span className="text-muted-foreground text-sm">s/</span>
                                            <Input
                                                id="new-slug"
                                                placeholder="my-page"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                className="border-0 bg-transparent px-1 focus-visible:ring-0"
                                                disabled={isPublishing}
                                            />
                                        </div>
                                        <Button type="button" variant="outline" onClick={generateSlug} className="w-full sm:w-auto">
                                            Generate
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground text-xs">Lowercase letters, numbers, and hyphens only</p>
                                </div>

                                <Button type="submit" className="w-full" disabled={isPublishing || !slug.trim()}>
                                    {isPublishing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Globe className="mr-2 size-4" />}
                                    Publish
                                </Button>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
