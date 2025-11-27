'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createBlockApi } from '@/lib/api/block';
import { usePage } from '@/contexts/PageContext';
import { BlockTypeEnum } from '@/shared/types/block';
import { showToast } from '@/lib/toast';

export function CreatePageDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { fetchPages, setCurrentPageId, pages } = usePage();
    const [pageName, setPageName] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);
    const [error, setError] = React.useState('');

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setPageName('');
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
            // Set nextId to the first page's ID if pages exist, otherwise null
            const firstPageId = pages.length > 0 ? pages[0].id : null;

            const result = await createBlockApi({
                type: BlockTypeEnum.PAGE,
                parentId: null,
                prevId: null,
                nextId: firstPageId,
                content: {
                    title: pageName.trim(), // TODO: zod schema and validation needed here and for backend as well
                },
            });

            if (result.success) {
                // Refresh pages list
                await fetchPages();
                // Set the newly created page as current
                setCurrentPageId(result.data.block.id);
                // Show success message
                showToast('Page created successfully', 'success');
                // Close dialog
                onOpenChange(false);
            } else {
                setError(result.error?.message || 'Failed to create page');
                showToast('Failed to create page', 'error');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('Error creating page:', err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Page</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pageName">Page Name</Label>
                        <Input
                            id="pageName"
                            value={pageName}
                            onChange={e => setPageName(e.target.value)}
                            placeholder="Enter page name"
                            autoFocus
                            disabled={isCreating}
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating || !pageName.trim()}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isCreating ? 'Creating...' : 'Create Page'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
