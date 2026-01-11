import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@/types';

// Connect to Flask backend
// Use env var for production, fallback to localhost for dev
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true
});

socket.on('connect', () => {
    console.log('[Socket] Connected to backend:', socket.id);
});

socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
});

socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err);
});

// We keep the export name `mockSocket` compatibility for now to minimize refactor churn in AppContext
export const mockSocket = socket;
