'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Settings, User, Home, Search, FileSearch, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { searchBlocksApi } from '@/lib/api/block';
import type { SearchResult } from '@/shared/types/block';

// Static menu items that should be searchable
type StaticItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    keywords: string[];
};

function SearchResultSkeleton() {
    return (
        <div className="flex items-center gap-2 px-2 py-3">
            <Skeleton className="h-5 w-5 shrink-0 animate-pulse rounded" />
            <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-32 animate-pulse" />
                <Skeleton className="h-3 w-48 animate-pulse" />
            </div>
        </div>
    );
}

function NoResultsFound({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-muted/50 mb-3 rounded-full p-3">
                <FileSearch className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-medium">No results found</p>
            <p className="text-muted-foreground mt-1 text-xs">No matches for &quot;{query}&quot;</p>
        </div>
    );
}

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    const toggleTheme = React.useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    // Define static items
    const staticItems: StaticItem[] = React.useMemo(
        () => [
            {
                id: 'home',
                label: 'Home',
                icon: <Home className="h-4 w-4" />,
                action: () => router.push('/home'),
                keywords: ['home', 'dashboard', 'main', 'start'],
            },
            {
                id: 'profile',
                label: 'Profile',
                icon: <User className="h-4 w-4" />,
                action: () => router.push('/profile'),
                keywords: ['profile', 'account', 'user', 'me'],
            },
            {
                id: 'settings',
                label: 'Settings',
                icon: <Settings className="h-4 w-4" />,
                action: () => window.dispatchEvent(new CustomEvent('openSettings')),
                keywords: ['settings', 'preferences', 'options', 'config', 'configuration'],
            },
            {
                id: 'toggle-theme',
                label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
                action: toggleTheme,
                keywords: ['theme', 'dark', 'light', 'mode', 'toggle', 'appearance'],
            },
        ],
        [router, theme, toggleTheme]
    );

    // Filter static items based on query
    const filteredStaticItems = React.useMemo(() => {
        if (!query.trim()) return staticItems;
        const lowerQuery = query.toLowerCase();
        return staticItems.filter(
            item => item.label.toLowerCase().includes(lowerQuery) || item.keywords.some(kw => kw.includes(lowerQuery))
        );
    }, [query, staticItems]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(open => !open);
            }
        };

        const handleOpenCommandPalette = () => {
            setOpen(true);
        };

        document.addEventListener('keydown', down);
        window.addEventListener('openCommandPalette', handleOpenCommandPalette);

        return () => {
            document.removeEventListener('keydown', down);
            window.removeEventListener('openCommandPalette', handleOpenCommandPalette);
        };
    }, []);

    // Debounced search
    React.useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            const result = await searchBlocksApi(query.trim());
            if (result.success) {
                setSearchResults(result.data.results);
            } else {
                setSearchResults([]);
            }
            setIsSearching(false);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // Reset on close
    React.useEffect(() => {
        if (!open) {
            setQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
    }, [open]);

    const hasSearchResults = searchResults.length > 0;
    const showSearchSection = query.trim().length > 0;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search..." value={query} onValueChange={setQuery} />
            <CommandList className="max-h-[400px]">
                {/* When searching, show combined results */}
                {showSearchSection && (
                    <>
                        {/* Show filtered static items immediately while searching */}
                        {filteredStaticItems.length > 0 && (
                            <CommandGroup heading="Commands">
                                {filteredStaticItems.map(item => (
                                    <CommandItem
                                        key={item.id}
                                        value={`static-${item.id}-${item.label}`}
                                        onSelect={() => runCommand(item.action)}>
                                        <span className="text-muted-foreground mr-2">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {isSearching ? (
                            <CommandGroup heading="Searching...">
                                <div className="space-y-1">
                                    <SearchResultSkeleton />
                                    <SearchResultSkeleton />
                                    <SearchResultSkeleton />
                                </div>
                            </CommandGroup>
                        ) : hasSearchResults ? (
                            <>
                                {filteredStaticItems.length > 0 && <CommandSeparator />}
                                <CommandGroup heading="Pages">
                                    {searchResults.map(result => {
                                        const isPage = result.type === 'page';
                                        const targetPageId = isPage ? result.id : result.rootPageId;

                                        return (
                                            <CommandItem
                                                key={result.id}
                                                value={`search-${result.id}-${result.title}-${result.snippet || ''}`}
                                                onSelect={() => runCommand(() => router.push(`/page/${targetPageId}`))}>
                                                <div className="bg-muted/50 mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded">
                                                    {result.icon ? (
                                                        <span className="text-sm">{result.icon}</span>
                                                    ) : (
                                                        <FileText className="text-muted-foreground h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <div className="flex min-w-0 flex-1 flex-col">
                                                    <span className="truncate text-sm">{result.title}</span>
                                                    {result.snippet && (
                                                        <span className="text-muted-foreground truncate text-xs">{result.snippet}</span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        ) : filteredStaticItems.length === 0 ? (
                            <NoResultsFound query={query} />
                        ) : null}
                    </>
                )}

                {/* Default state when not searching */}
                {!showSearchSection && (
                    <>
                        <CommandEmpty>
                            <div className="flex flex-col items-center py-6">
                                <Search className="text-muted-foreground mb-2 h-8 w-8" />
                                <p className="text-muted-foreground text-sm">Start typing to search...</p>
                            </div>
                        </CommandEmpty>

                        <CommandGroup heading="Quick Actions">
                            {staticItems.map(item => (
                                <CommandItem
                                    key={item.id}
                                    value={`static-${item.id}-${item.label}`}
                                    onSelect={() => runCommand(item.action)}>
                                    <span className="text-muted-foreground mr-2">{item.icon}</span>
                                    <span>{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
}
