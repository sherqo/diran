import type { WebSocket } from 'ws';
import type {
    CollaborationClient,
    CollaborationRoom,
    ClientMessage,
    ServerMessage,
    ClientInfo,
    BlockOperation,
} from './types';

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
export function handleConnection(socket: WebSocket): void {
    const connectionId = generateConnectionId();
    let currentRoom: CollaborationRoom | null = null;
    let currentClient: CollaborationClient | null = null;

    console.log(`[Collab] New connection: ${connectionId}`);

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
            default:
                sendError(sock, 'Unknown message type');
        }
    }

    // Handle join request
    function handleJoin(
        connId: string,
        sock: WebSocket,
        message: Extract<ClientMessage, { type: 'join' }>
    ): void {
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

        console.log(
            `[Collab] ${message.userName} joined room ${message.pageId} (${room.clients.size} users)`
        );
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

        console.log(
            `[Collab] User left room ${currentRoom.pageId} (${currentRoom.clients.size} users remaining)`
        );

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

        console.log(
            `[Collab] Operation ${operation.op} in room ${currentRoom.pageId} (v${currentRoom.version})`
        );
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

    // Send error message
    function sendError(sock: WebSocket, message: string): void {
        if (sock.readyState === 1) {
            sock.send(JSON.stringify({ type: 'error', message }));
        }
    }
}

// Get room stats (for monitoring)
export function getRoomStats(): { rooms: number; connections: number } {
    let connections = 0;
    for (const room of rooms.values()) {
        connections += room.clients.size;
    }
    return { rooms: rooms.size, connections };
}
