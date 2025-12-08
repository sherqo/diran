'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { createBlockApi } from '@/lib/api/block';
import { createTeamPageApi } from '@/lib/api/team';
import { usePage } from '@/contexts/PageContext';
import { BlockTypeEnum } from '@/shared/types/block';
import { showToast } from '@/lib/toast';

interface CreatePageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamId?: string;
    teamName?: string;
    onPageCreated?: (pageId: string) => void;
}

export function CreatePageDialog({ open, onOpenChange, teamId, teamName, onPageCreated }: CreatePageDialogProps) {
    const router = useRouter();
    const { fetchPages, pages } = usePage();
    const [pageName, setPageName] = React.useState('');
    const [pageIcon, setPageIcon] = React.useState<string | undefined>(undefined);
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState('');

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setPageName('');
            setPageIcon(undefined);
            setError('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pageName.trim()) {
            setError('Page name is required');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            let pageId: string;

            if (teamId) {
                // Create team page
                const result = await createTeamPageApi(teamId, pageName.trim(), pageIcon);
                if (result.success) {
                    pageId = result.data.page.id;
                } else {
                    setError(result.error?.message || 'Failed to create page');
                    showToast('Failed to create page', 'error');
                    return;
                }
            } else {
                // Create personal page
                const firstPageId = pages.length > 0 ? pages[0].id : null;
                const result = await createBlockApi({
                    type: BlockTypeEnum.PAGE,
                    parentId: null,
                    prevId: null,
                    nextId: firstPageId,
                    content: {
                        title: pageName.trim(),
                        ...(pageIcon && { icon: pageIcon }),
                    },
                });

                if (result.success) {
                    pageId = result.data.block.id;
                    await fetchPages();
                } else {
                    setError(result.error?.message || 'Failed to create page');
                    showToast('Failed to create page', 'error');
                    return;
                }
            }

            // Navigate to the newly created page
            router.push(`/page/${pageId}`);
            // Show success message
            showToast('Page created successfully', 'success');
            // Callback for parent to update state
            onPageCreated?.(pageId);
            // Close dialog
            onOpenChange(false);
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error creating page:', err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
                <DialogHeader>
                    <DialogTitle>{teamId ? `New Page in ${teamName || 'Team'}` : 'Create New Page'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <EmojiPicker value={pageIcon} onChange={setPageIcon} disabled={isCreating} />
                            <Input
                                id="pageName"
                                value={pageName}
                                onChange={e => setPageName(e.target.value)}
                                placeholder="Page name"
                                autoFocus
                                disabled={isCreating}
                                className="flex-1"
                            />
                        </div>
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isCreating}
                            className="flex-1 sm:flex-initial">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || !pageName.trim()} className="flex-1 sm:flex-initial">
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isCreating ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
