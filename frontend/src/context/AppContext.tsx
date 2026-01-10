'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockSocket } from '@/services/mockSocket';
import { Room, User } from '@/types';

interface AppContextType {
    user: User | null;
    room: Room | null;
    isLoading: boolean;
    error: string | null;
    joinRoom: (roomId: string, userName: string, teamId: string) => void;
    createRoom: (roomName: string, userName: string, totalTeams: number, budgetPerTeam: number, squadSize: number, playingSquadSize: number, resultMetric: string, userTeamId: string) => void;
    startAuction: () => void;
    clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [room, setRoom] = useState<Room | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Listen to socket events
        const onRoomJoined = (newRoom: Room) => {
            console.log('[AppContext] onRoomJoined triggered', newRoom);
            setRoom(newRoom);
            // Find self in room to update User state
            const self = newRoom.users.find(u => u.id === mockSocket.id);
            console.log('[AppContext] Self found:', self, 'My ID:', mockSocket.id);
            if (self) {
                setUser(self);
                // Save session on confirmed join
                sessionStorage.setItem('ipl_session', JSON.stringify({
                    roomId: newRoom.id,
                    userName: self.name,
                    teamId: self.teamId
                }));
            } else {
                console.error('[AppContext] CRITICAL: Could not find self in room users!', newRoom.users);
            }
            setIsLoading(false);
        };

        const onRoomUpdated = (updatedRoom: Room) => {
            setRoom(updatedRoom);
            // Also update user state if it changed (e.g. became host)
            const self = updatedRoom.users.find(u => u.id === mockSocket.id);
            if (self) {
                setUser(self);
            }
        };

        const onError = (msg: string) => {
            setError(msg);
            setIsLoading(false);
        };

        // Note: In a real socket.io setup, we'd use socket.on(...)
        mockSocket.on('room_joined', onRoomJoined);
        mockSocket.on('room_updated', onRoomUpdated);
        mockSocket.on('error', onError);

        // Initial load check? (Optional for persistence)

        return () => {
            mockSocket.off('room_joined', onRoomJoined);
            mockSocket.off('room_updated', onRoomUpdated);
            mockSocket.off('error', onError);
        };
    }, []);

    useEffect(() => {
        // Restore session if exists
        const storedSession = sessionStorage.getItem('ipl_session');
        if (storedSession) {
            const { roomId, userName, teamId } = JSON.parse(storedSession);
            console.log('[AppContext] Restoring session:', roomId, userName);
            mockSocket.emit('join_room', { roomId, userName, teamId });
        }
    }, []);

    const createRoom = (roomName: string, userName: string, totalTeams: number, budgetPerTeam: number, squadSize: number, playingSquadSize: number, resultMetric: string, userTeamId: string) => {
        setIsLoading(true);
        mockSocket.emit('create_room', { roomName, userName, totalTeams, budgetPerTeam, squadSize, playingSquadSize, resultMetric, userTeamId });
        // Save session (optimistic, or wait for success? Optimistic is fine for now as room_joined will confirm)
    };

    const joinRoom = (roomId: string, userName: string, teamId: string) => {
        setIsLoading(true);
        mockSocket.emit('join_room', { roomId, userName, teamId });
        // Save session
        sessionStorage.setItem('ipl_session', JSON.stringify({ roomId, userName, teamId }));
    };

    const startAuction = () => {
        if (room && user?.isHost) {
            mockSocket.emit('start_auction', room.id);
        }
    };

    const clearError = () => setError(null);

    return (
        <AppContext.Provider value={{
            user,
            room,
            isLoading,
            error,
            joinRoom,
            createRoom,
            startAuction,
            clearError
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
