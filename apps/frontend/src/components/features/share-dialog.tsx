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
import { getPublishApi, createPublishApi, updatePublishApi, deletePublishApi } from '@/lib/api/publish';
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
        const result = await createPublishApi(pageId, { slug: slug.trim() });

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
        const result = await deletePublishApi(pageId);

        if (result.success) {
            setPublish(null);
            setSlug('');
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="sr-only">Share & Publish</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'share' | 'publish')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="share">Share</TabsTrigger>
                        <TabsTrigger value="publish">Publish</TabsTrigger>
                    </TabsList>

                    {/* Share Tab */}
                    <TabsContent value="share" className="mt-4">
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

                        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                            {isLoadingPermissions ? (
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
                    </TabsContent>

                    {/* Publish Tab */}
                    <TabsContent value="publish" className="mt-4">
                        {isLoadingPublish ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="text-muted-foreground size-6 animate-spin" />
                            </div>
                        ) : publish ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                                    <Globe className="size-5 text-green-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">This page is live</p>
                                        <p className="text-muted-foreground text-xs">Anyone with the link can view</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Public URL</Label>
                                    <div className="flex gap-2">
                                        <div className="bg-muted flex flex-1 items-center rounded-md border px-3">
                                            <span className="text-muted-foreground text-sm">/s/</span>
                                            <Input
                                                id="slug"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                className="border-0 bg-transparent px-0 focus-visible:ring-0"
                                                disabled={isUpdating}
                                            />
                                        </div>
                                        {slug !== publish.slug && (
                                            <Button onClick={handleUpdateSlug} disabled={isUpdating || !slug.trim()}>
                                                {isUpdating ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                                        {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
                                        {copied ? 'Copied!' : 'Copy link'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a href={`/s/${publish.slug}`} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="mr-2 size-4" />
                                            Open
                                        </a>
                                    </Button>
                                </div>

                                <Button variant="destructive" className="w-full" onClick={handleUnpublish} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                                    Unpublish
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handlePublish} className="space-y-4">
                                <div className="text-muted-foreground flex flex-col items-center gap-2 py-4 text-center">
                                    <Globe className="size-10 opacity-50" />
                                    <p className="text-sm">Publish this page to share it with anyone</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-slug">Choose a URL slug</Label>
                                    <div className="flex gap-2">
                                        <div className="bg-muted flex flex-1 items-center rounded-md border px-3">
                                            <span className="text-muted-foreground text-sm">/s/</span>
                                            <Input
                                                id="new-slug"
                                                placeholder="my-page"
                                                value={slug}
                                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                className="border-0 bg-transparent px-0 focus-visible:ring-0"
                                                disabled={isPublishing}
                                            />
                                        </div>
                                        <Button type="button" variant="outline" onClick={generateSlug}>
                                            Generate
                                        </Button>
                                    </div>
                                    <p className="text-muted-foreground text-xs">Only lowercase letters, numbers, and hyphens</p>
                                </div>

                                <Button type="submit" className="w-full" disabled={isPublishing || !slug.trim()}>
                                    {isPublishing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Globe className="mr-2 size-4" />}
                                    Publish to web
                                </Button>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
