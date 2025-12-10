import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    ClientMessage,
    ServerMessage,
    CollaboratorInfo,
    BlockOperation,
    CursorPosition,
    ConnectionState,
} from '@/shared/types/collaboration';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4003/v1/ws/collab';

// Generate a random color for this user (stable per session)
const generateUserColor = (): string => {
    const colors = [
        '#ef4444',
        '#f97316',
        '#f59e0b',
        '#eab308',
        '#84cc16',
        '#22c55e',
        '#14b8a6',
        '#06b6d4',
        '#0ea5e9',
        '#3b82f6',
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
        '#d946ef',
        '#ec4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

const USER_COLOR = generateUserColor();

interface UseCollaborationOptions {
    pageId: string;
    userId: string;
    userName: string;
    enabled?: boolean;
    onOperation?: (operation: BlockOperation, senderId: string) => void;
    onCursorUpdate?: (senderId: string, cursor: CursorPosition | null, userInfo: { userName: string; userColor: string }) => void;
    onTypingUpdate?: (senderId: string, blockId: string | null, userInfo: { userName: string; userColor: string }) => void;
}

// Typing info for UI display
export interface TypingInfo {
    oderId: string;
    userName: string;
    userColor: string;
    blockId: string | null;
}

interface UseCollaborationReturn {
    // State
    connectionState: ConnectionState;
    collaborators: Map<string, CollaboratorInfo>;
    typingUsers: Map<string, TypingInfo>;
    version: number;

    // Actions
    sendOperation: (operation: BlockOperation) => void;
    sendCursor: (cursor: CursorPosition | null) => void;
    sendTyping: (blockId: string | null) => void;
    connect: () => void;
    disconnect: () => void;
}

export function useCollaboration({
    pageId,
    userId,
    userName,
    enabled = true,
    onOperation,
    onCursorUpdate,
    onTypingUpdate,
}: UseCollaborationOptions): UseCollaborationReturn {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [collaborators, setCollaborators] = useState<Map<string, CollaboratorInfo>>(new Map());
    const [typingUsers, setTypingUsers] = useState<Map<string, TypingInfo>>(new Map());
    const [version, setVersion] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // Send a message to the server
    const sendMessage = useCallback((message: ClientMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    // Handle incoming messages
    const handleMessage = useCallback(
        (event: MessageEvent) => {
            try {
                const message: ServerMessage = JSON.parse(event.data);

                switch (message.type) {
                    case 'joined':
                        // Successfully joined - set initial collaborators
                        const initialCollabs = new Map<string, CollaboratorInfo>();
                        message.clients.forEach(client => {
                            initialCollabs.set(client.oderId, client);
                        });
                        setCollaborators(initialCollabs);
                        setVersion(message.version);
                        console.log(`[Collab] Joined room ${message.pageId} with ${message.clients.length} others`);
                        break;

                    case 'user-joined':
                        setCollaborators(prev => {
                            const next = new Map(prev);
                            next.set(message.user.oderId, message.user);
                            return next;
                        });
                        console.log(`[Collab] ${message.user.userName} joined`);
                        break;

                    case 'user-left':
                        setCollaborators(prev => {
                            const next = new Map(prev);
                            next.delete(message.oderId);
                            return next;
                        });
                        console.log(`[Collab] User left: ${message.oderId}`);
                        break;

                    case 'operation':
                        setVersion(message.version);
                        onOperation?.(message.operation, message.oderId);
                        break;

                    case 'cursor':
                        // Update collaborator's cursor
                        setCollaborators(prev => {
                            const next = new Map(prev);
                            const existing = next.get(message.oderId);
                            if (existing) {
                                next.set(message.oderId, { ...existing, cursor: message.cursor });
                            }
                            return next;
                        });
                        onCursorUpdate?.(message.oderId, message.cursor, {
                            userName: message.userName,
                            userColor: message.userColor,
                        });
                        break;

                    case 'error':
                        console.error(`[Collab] Server error: ${message.message}`);
                        break;

                    case 'typing':
                        // Update typing users
                        setTypingUsers(prev => {
                            const next = new Map(prev);
                            if (message.blockId === null) {
                                // User stopped typing
                                next.delete(message.oderId);
                            } else {
                                // User is typing
                                next.set(message.oderId, {
                                    oderId: message.oderId,
                                    userName: message.userName,
                                    userColor: message.userColor,
                                    blockId: message.blockId,
                                });
                            }
                            return next;
                        });
                        onTypingUpdate?.(message.oderId, message.blockId, {
                            userName: message.userName,
                            userColor: message.userColor,
                        });
                        break;
                }
            } catch (error) {
                console.error('[Collab] Failed to parse message:', error);
            }
        },
        [onOperation, onCursorUpdate, onTypingUpdate]
    );

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionState('connecting');

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnectionState('connected');
            reconnectAttemptsRef.current = 0;

            // Join the room
            sendMessage({
                type: 'join',
                pageId,
                userId,
                userName,
                userColor: USER_COLOR,
            });
        };

        ws.onmessage = handleMessage;

        ws.onclose = () => {
            setConnectionState('disconnected');
            wsRef.current = null;

            // Attempt reconnection (handled in useEffect)
        };

        ws.onerror = error => {
            console.error('[Collab] WebSocket error:', error);
            setConnectionState('error');
        };
    }, [pageId, userId, userName, sendMessage, handleMessage]);

    // Handle reconnection
    useEffect(() => {
        if (connectionState === 'disconnected' && enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(`[Collab] Reconnecting in ${delay}ms...`);
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current++;
                connect();
            }, delay);

            return () => {
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
            };
        }
    }, [connectionState, enabled, connect]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            sendMessage({ type: 'leave' });
            wsRef.current.close();
            wsRef.current = null;
        }

        setConnectionState('disconnected');
        setCollaborators(new Map());
    }, [sendMessage]);

    // Send a block operation
    const sendOperation = useCallback(
        (operation: BlockOperation) => {
            sendMessage({ type: 'operation', operation });
        },
        [sendMessage]
    );

    // Send cursor position
    const sendCursor = useCallback(
        (cursor: CursorPosition | null) => {
            sendMessage({ type: 'cursor', cursor });
        },
        [sendMessage]
    );

    // Send typing indicator
    const sendTyping = useCallback(
        (blockId: string | null) => {
            sendMessage({ type: 'typing', blockId });
        },
        [sendMessage]
    );

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        if (enabled && pageId) {
            // Use setTimeout to avoid direct setState in effect body
            const timeoutId = setTimeout(() => {
                connect();
            }, 0);

            return () => {
                clearTimeout(timeoutId);
                disconnect();
            };
        }

        return () => {
            disconnect();
        };
    }, [enabled, pageId, connect, disconnect]);

    return {
        connectionState,
        collaborators,
        typingUsers,
        version,
        sendOperation,
        sendCursor,
        sendTyping,
        connect,
        disconnect,
    };
}
