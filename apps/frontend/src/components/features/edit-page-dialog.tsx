'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { updateBlockApi } from '@/lib/api/block';
import { usePage, type Page } from '@/contexts/PageContext';
import { showToast } from '@/lib/toast';

interface EditPageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    page: Page | null;
}

export function EditPageDialog({ open, onOpenChange, page }: EditPageDialogProps) {
    const { setPages } = usePage();
    const [pageName, setPageName] = React.useState('');
    const [pageIcon, setPageIcon] = React.useState<string | undefined>(undefined);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    // Populate form when page changes or dialog opens
    React.useEffect(() => {
        if (open && page) {
            const content = page.content as { title?: string; icon?: string };
            setPageName(content.title || '');
            setPageIcon(content.icon);
            setError('');
        }
    }, [open, page]);

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setError('');
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!page) return;

        if (!pageName.trim()) {
            setError('Page name is required');
            return;
        }

        setIsSaving(true);
        setError('');

        // Optimistic update
        const previousContent = page.content;
        const newContent = {
            ...previousContent,
            title: pageName.trim(),
            ...(pageIcon ? { icon: pageIcon } : { icon: undefined }),
        };

        setPages(prev => prev.map(p => (p.id === page.id ? { ...p, content: newContent } : p)));

        try {
            const result = await updateBlockApi(page.id, {
                content: newContent,
            });

            if (result.success) {
                showToast('Page updated successfully', 'success');
                onOpenChange(false);
            } else {
                // Rollback
                setPages(prev => prev.map(p => (p.id === page.id ? { ...p, content: previousContent } : p)));
                setError(result.error?.message || 'Failed to update page');
                showToast('Failed to update page', 'error');
            }
        } catch (err) {
            // Rollback
            setPages(prev => prev.map(p => (p.id === page.id ? { ...p, content: previousContent } : p)));
            setError('An unexpected error occurred');
            console.error('Error updating page:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Page</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <EmojiPicker value={pageIcon} onChange={setPageIcon} disabled={isSaving} />
                            <Input
                                id="pageName"
                                value={pageName}
                                onChange={e => setPageName(e.target.value)}
                                placeholder="Enter page name"
                                autoFocus
                                disabled={isSaving}
                                className="flex-1"
                            />
                        </div>
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving || !pageName.trim()}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
