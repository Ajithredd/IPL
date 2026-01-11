'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Coins, Trophy, Copy, Shield, Loader2 } from 'lucide-react';
import { IPL_TEAMS } from '@/constants/teams';

export default function LobbyPage() {
    const { roomId } = useParams(); // Note: This might be string or string[]
    const router = useRouter();
    const { user, room, startAuction, error } = useApp();

    const currentRoomId = Array.isArray(roomId) ? roomId[0] : roomId;

    useEffect(() => {
        // If no room or user state, likely refreshed or invalid. 
        // In a real app we would fetch room info by ID here if missing. 
        // Since we rely on simple local mock state, if it's gone we redirect.
        // However, our MockSocket persists to localStorage, so we *could* restore it if we implemented that logic in AppContext init.
        // For now, if room is null or id doesn't match, we warn or redirect.
        if (!room || room.id !== currentRoomId) {
            // Option: try to restore or redirect
            // For Phase 1 simple mock:
            // router.push('/join'); 
            // We defer this check slightly to avoid flicker if restore is happening? 
            // But AppContext doesn't auto-restore on mount yet. 
            // Let's just show a "Room not found locally" state.
        }
    }, [room, currentRoomId, router]);

    // Redirect when status becomes AUCTION
    useEffect(() => {
        if (room?.status === 'AUCTION') {
            router.push(`/auction/${room.id}`);
        }
    }, [room, router]);

    const handleStart = () => {
        if (roomId) {
            startAuction();
        }
    };

    if (!room || room.id !== currentRoomId) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Room not found (or lost state)</h2>
                <p className="text-slate-500 dark:text-slate-400">Since this is a mock without backend, refreshing loses context unless we reconnect.</p>
                <Button onClick={() => router.push('/join')}>Join Again</Button>
            </div>
        );
    }

    const copyCode = () => {
        navigator.clipboard.writeText(room.id);
        // Could add toast here
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto w-full">
            {/* Room Header Info */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            {room.status}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{room.name}</h1>
                    </div>
                    <div className="flex gap-4 text-slate-600 dark:text-slate-400 text-sm">
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {room.totalTeams} Max Teams
                        </div>
                        <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4" /> {room.budgetPerTeam} Cr. Budget
                        </div>
                    </div>
                </div>

                <Card className="flex items-center gap-4 bg-ipl-gold/10 border-ipl-gold/30 p-4 min-w-[200px]">
                    <div className="text-center w-full">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Room Code</p>
                        <div className="flex items-center justify-center gap-2 cursor-pointer hover:opacity-75" onClick={copyCode} title="Click to Copy">
                            <span className="text-3xl font-mono font-bold text-ipl-blue tracking-widest">{room.id}</span>
                            <Copy className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Player List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-ipl-blue" />
                            Joined Teams ({room.users.length})
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {room.users.map((u) => {
                            const teamInfo = IPL_TEAMS.find(t => t.id === u.teamId);
                            return (
                                <div key={u.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm`}
                                            style={{
                                                backgroundColor: teamInfo?.color || '#1D3557',
                                                color: teamInfo?.textColor || '#FFF'
                                            }}
                                        >
                                            {u.teamId || u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{u.name}</p>
                                            <div className="flex items-center gap-2">
                                                {u.isHost && <span className="text-xs bg-ipl-gold/20 text-yellow-700 px-1.5 py-0.5 rounded font-bold">HOST</span>}
                                                {teamInfo && <span className="text-xs text-slate-500">{teamInfo.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 text-xs text-right">
                                        <p>{u.id === user?.id ? '(You)' : 'Waiting...'}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, room.totalTeams - room.users.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                                <div className="flex items-center gap-3 opacity-50">
                                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                                    <p className="font-medium text-slate-400 dark:text-slate-500">Waiting for player...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar / Actions */}
                <div className="space-y-6">
                    <Card className="bg-slate-800 text-white border-none">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-ipl-gold" />
                            Host Controls
                        </h3>

                        {user?.isHost ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-300">
                                    You are the host. Once all teams have joined, you can start the auction.
                                </p>
                                <Button
                                    className="w-full bg-ipl-gold text-ipl-blue hover:bg-yellow-400"
                                    onClick={handleStart}
                                    data-testid="btn-start-auction"
                                // disabled={room.users.length < 2} // Strict rule? Maybe optional for testing
                                >
                                    Start Auction
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-300">
                                    Waiting for the host to start the auction...
                                </p>
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-ipl-gold w-8 h-8" />
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="text-sm text-slate-500 space-y-2">
                            <p><strong>Status:</strong> {room.status}</p>
                            <p><strong>Connected as:</strong> {user?.name}</p>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
