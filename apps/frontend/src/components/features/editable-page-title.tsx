'use client';

import { useRef, useEffect } from 'react';
import { updateBlockApi } from '@/lib/api/block';
import { usePage } from '@/contexts/PageContext';

interface EditablePageTitleProps {
    pageId: string;
    initialTitle: string;
    initialIcon?: string;
    editable?: boolean;
}

export function EditablePageTitle({ pageId, initialTitle, initialIcon, editable = true }: EditablePageTitleProps) {
    const inputRef = useRef<HTMLHeadingElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { setPages, setCurrentPage, currentPage } = usePage();

    // Set initial content only once on mount
    useEffect(() => {
        if (inputRef.current && inputRef.current.textContent !== initialTitle) {
            inputRef.current.textContent = initialTitle;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInput = () => {
        if (!editable) return;

        const newTitle = inputRef.current?.textContent || 'Untitled';

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce: save after 500ms
        timeoutRef.current = setTimeout(() => {
            // Update sidebar pages list optimistically
            setPages((prevPages) =>
                prevPages.map((page) =>
                    page.id === pageId ? { ...page, content: { ...page.content, title: newTitle } } : page
                )
            );

            // Update current page if it's the same page
            if (currentPage && currentPage.id === pageId) {
                setCurrentPage({ ...currentPage, content: { ...currentPage.content, title: newTitle } });
            }

            // Save to server
            updateBlockApi(pageId, {
                content: {
                    title: newTitle,
                    ...(initialIcon && { icon: initialIcon }),
                },
            });
        }, 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    return (
        <div className="mb-4">
            {initialIcon && <span className="mb-2 block text-5xl">{initialIcon}</span>}
            <h1
                ref={inputRef}
                contentEditable={editable}
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="text-4xl font-bold outline-none empty:before:text-gray-400 empty:before:content-['Untitled']"
                spellCheck={false}
            />
        </div>
    );
}
