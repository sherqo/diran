import type {
    WebSocket,
    CollaborationClient,
    CollaborationRoom,
    ClientMessage,
    ServerMessage,
    ClientInfo,
    BlockOperation,
    CursorPosition,
} from '@diran/shared/types/collaboration.js';
import { verifyAccessToken } from '../../lib/utils/auth.js';
import type { AuthUser } from '@diran/shared/types/auth.js';

// In-memory room storage (for production, use Redis)
const rooms = new Map<string, CollaborationRoom>();

// Generate unique connection ID
let connectionCounter = 0;
function generateConnectionId(): string {
    return `conn_${Date.now()}_${++connectionCounter}`;
}

// Get or create a room for a page
function getOrCreateRoom(pageId: string): CollaborationRoom {
    let room = rooms.get(pageId);
    if (!room) {
        room = {
            pageId,
            clients: new Map(),
            version: 0,
        };
        rooms.set(pageId, room);
    }
    return room;
}

// Send message to a single client
function sendToClient(client: CollaborationClient, message: ServerMessage): void {
    if (client.socket.readyState === 1) {
        // WebSocket.OPEN
        client.socket.send(JSON.stringify(message));
    }
}

// Broadcast to all clients in a room except the sender
function broadcastToRoom(room: CollaborationRoom, message: ServerMessage, excludeConnectionId?: string): void {
    for (const [connId, client] of room.clients) {
        if (connId !== excludeConnectionId) {
            sendToClient(client, message);
        }
    }
}

// Broadcast to ALL clients in a room (including sender)
function broadcastToAll(room: CollaborationRoom, message: ServerMessage): void {
    for (const client of room.clients.values()) {
        sendToClient(client, message);
    }
}

// Get client info for broadcasting
function getClientInfo(client: CollaborationClient, connectionId: string): ClientInfo {
    return {
        oderId: connectionId,
        userId: client.userId,
        userName: client.userName,
        userColor: client.userColor,
        cursor: client.cursor,
    };
}

// Handle a new WebSocket connection
export function handleConnection(socket: WebSocket, authUser: AuthUser | null = null): void {
    const connectionId = generateConnectionId();
    let currentRoom: CollaborationRoom | null = null;
    let currentClient: CollaborationClient | null = null;

    // Store authenticated user ID (if any) for verification
    const authenticatedUserId = authUser?.id || null;

    console.log(`[Collab] New connection: ${connectionId}${authenticatedUserId ? ` (auth: ${authenticatedUserId})` : ' (anonymous)'}`);

    // Handle incoming messages
    socket.on('message', (data: Buffer) => {
        try {
            const message: ClientMessage = JSON.parse(data.toString());
            handleMessage(connectionId, socket, message);
        } catch (error) {
            console.error(`[Collab] Invalid message from ${connectionId}:`, error);
            sendError(socket, 'Invalid message format');
        }
    });

    // Handle disconnection
    socket.on('close', () => {
        console.log(`[Collab] Connection closed: ${connectionId}`);
        handleLeave(connectionId);
    });

    socket.on('error', (error: Error) => {
        console.error(`[Collab] Socket error for ${connectionId}:`, error);
        handleLeave(connectionId);
    });

    // Message handler
    function handleMessage(connId: string, sock: WebSocket, message: ClientMessage): void {
        switch (message.type) {
            case 'join':
                handleJoin(connId, sock, message);
                break;
            case 'leave':
                handleLeave(connId);
                break;
            case 'operation':
                handleOperation(connId, message.operation);
                break;
            case 'cursor':
                handleCursor(connId, message.cursor);
                break;
            case 'typing':
                handleTyping(connId, message.blockId);
                break;
            default:
                sendError(sock, 'Unknown message type');
        }
    }

    // Handle join request
    function handleJoin(connId: string, sock: WebSocket, message: Extract<ClientMessage, { type: 'join' }>): void {
        // Verify authentication: if we have an authenticated user, verify it matches
        if (authenticatedUserId && authenticatedUserId !== message.userId) {
            console.warn(`[Collab] User ID mismatch: auth=${authenticatedUserId}, message=${message.userId}`);
            sendError(sock, 'User ID does not match authenticated session', 'AUTH_MISMATCH');
            return;
        }

        // If no cookie auth, try token from message (for fallback)
        if (!authenticatedUserId && message.token) {
            try {
                const decoded = verifyAccessToken(message.token);
                if (!decoded?.id || decoded.id !== message.userId) {
                    sendError(sock, 'Invalid authentication token', 'AUTH_FAILED');
                    return;
                }
            } catch (error) {
                sendError(sock, 'Authentication failed', 'AUTH_FAILED');
                return;
            }
        }

        // Leave current room if in one
        if (currentRoom) {
            handleLeave(connId);
        }

        // Join new room
        const room = getOrCreateRoom(message.pageId);
        const client: CollaborationClient = {
            socket: sock,
            userId: message.userId,
            userName: message.userName,
            userColor: message.userColor,
            pageId: message.pageId,
            cursor: null,
        };

        room.clients.set(connId, client);
        currentRoom = room;
        currentClient = client;

        // Get list of other clients in room
        const otherClients: ClientInfo[] = [];
        for (const [cid, c] of room.clients) {
            if (cid !== connId) {
                otherClients.push(getClientInfo(c, cid));
            }
        }

        // Send joined confirmation to the new client
        sendToClient(client, {
            type: 'joined',
            pageId: message.pageId,
            clients: otherClients,
            version: room.version,
        });

        // Broadcast user-joined to others
        broadcastToRoom(
            room,
            {
                type: 'user-joined',
                user: getClientInfo(client, connId),
            },
            connId
        );

        console.log(`[Collab] ${message.userName} joined room ${message.pageId} (${room.clients.size} users)`);
    }

    // Handle leave
    function handleLeave(connId: string): void {
        if (!currentRoom) return;

        currentRoom.clients.delete(connId);

        // Broadcast user-left to remaining clients
        broadcastToRoom(currentRoom, {
            type: 'user-left',
            oderId: connId,
        });

        console.log(`[Collab] User left room ${currentRoom.pageId} (${currentRoom.clients.size} users remaining)`);
        // Clean up empty rooms
        if (currentRoom.clients.size === 0) {
            rooms.delete(currentRoom.pageId);
            console.log(`[Collab] Room ${currentRoom.pageId} closed (empty)`);
        }

        currentRoom = null;
        currentClient = null;
    }

    // Handle block operation
    function handleOperation(connId: string, operation: BlockOperation): void {
        if (!currentRoom || !currentClient) {
            sendError(socket, 'Not in a room');
            return;
        }

        // Increment version
        currentRoom.version++;

        // Broadcast operation to all OTHER clients
        broadcastToRoom(
            currentRoom,
            {
                type: 'operation',
                oderId: connId,
                operation,
                version: currentRoom.version,
            },
            connId
        );

        console.log(`[Collab] Operation ${operation.op} in room ${currentRoom.pageId} (v${currentRoom.version})`);
    }

    // Handle cursor update
    function handleCursor(connId: string, cursor: CursorPosition | null): void {
        if (!currentRoom || !currentClient) return;

        currentClient.cursor = cursor;

        // Broadcast cursor to all OTHER clients
        broadcastToRoom(
            currentRoom,
            {
                type: 'cursor',
                oderId: connId,
                userId: currentClient.userId,
                userName: currentClient.userName,
                userColor: currentClient.userColor,
                cursor,
            },
            connId
        );
    }

    // Handle typing indicator
    function handleTyping(connId: string, blockId: string | null): void {
        if (!currentRoom || !currentClient) return;

        // Broadcast typing status to all OTHER clients
        broadcastToRoom(
            currentRoom,
            {
                type: 'typing',
                oderId: connId,
                userName: currentClient.userName,
                userColor: currentClient.userColor,
                blockId,
            },
            connId
        );
    }

    // Send error message
    function sendError(sock: WebSocket, message: string, code?: string): void {
        if (sock.readyState === 1) {
            sock.send(JSON.stringify({ type: 'error', message, code }));
        }
    }
}
