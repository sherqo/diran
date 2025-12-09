'use client';

import { useCollaborationContext } from '@/lib/collaboration';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface CollaboratorsPresenceProps {
    className?: string;
    maxVisible?: number;
}

/**
 * Shows avatars of users currently editing the same page
 */
export function CollaboratorsPresence({ className, maxVisible = 5 }: CollaboratorsPresenceProps) {
    const collaboration = useCollaborationContext();

    if (!collaboration) {
        return null;
    }

    const { connectionState, collaborators } = collaboration;
    const collaboratorList = Array.from(collaborators.values());
    const visibleCollaborators = collaboratorList.slice(0, maxVisible);
    const hiddenCount = Math.max(0, collaboratorList.length - maxVisible);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Connection status indicator */}
            <ConnectionIndicator state={connectionState} />

            {/* Collaborator avatars */}
            {visibleCollaborators.length > 0 && (
                <div className="flex -space-x-2">
                    <TooltipProvider>
                        {visibleCollaborators.map(collaborator => (
                            <Tooltip key={collaborator.oderId}>
                                <TooltipTrigger asChild>
                                    <Avatar
                                        className="h-7 w-7 border-2"
                                        style={{
                                            borderColor: collaborator.userColor,
                                            boxShadow: `0 0 0 2px ${collaborator.userColor}`,
                                        }}>
                                        <AvatarFallback
                                            className="text-xs font-medium text-white"
                                            style={{ backgroundColor: collaborator.userColor }}>
                                            {getInitials(collaborator.userName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{collaborator.userName}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}

                        {/* Hidden count badge */}
                        {hiddenCount > 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Avatar className="border-background h-7 w-7 border-2">
                                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">+{hiddenCount}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {hiddenCount} more collaborator{hiddenCount > 1 ? 's' : ''}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
}

interface ConnectionIndicatorProps {
    state: 'disconnected' | 'connecting' | 'connected' | 'error';
}

function ConnectionIndicator({ state }: ConnectionIndicatorProps) {
    const config = {
        disconnected: {
            icon: WifiOff,
            color: 'text-muted-foreground',
            label: 'Offline',
        },
        connecting: {
            icon: Loader2,
            color: 'text-yellow-500',
            label: 'Connecting...',
            animate: true,
        },
        connected: {
            icon: Wifi,
            color: 'text-green-500',
            label: 'Live',
        },
        error: {
            icon: WifiOff,
            color: 'text-red-500',
            label: 'Connection error',
        },
    }[state];

    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn('flex items-center gap-1', config.color)}>
                        <Icon className={cn('h-4 w-4', config.animate && 'animate-spin')} />
                        {state === 'connected' && <span className="text-xs font-medium">Live</span>}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
