'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { mockSocket } from '@/services/mockSocket';
import { Player, BidUpdate, SaleResult, UnsoldResult } from '@/types';
import { PlayerCard } from '@/components/auction/PlayerCard';
import { BidControls } from '@/components/auction/BidControls';
import { TeamStats } from '@/components/auction/TeamStats';
import { SoldOverlay } from '@/components/auction/SoldOverlay';
import { IPL_TEAMS } from '@/constants/teams';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

import { AllTeamsDashboard } from '@/components/auction/AllTeamsDashboard';
import PostAuctionDashboard from '@/components/post-auction/PostAuctionDashboard';

export default function AuctionPage() {
    const { roomId } = useParams();
    const router = useRouter();
    const { room, user } = useApp();

    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [currentBid, setCurrentBid] = useState(0);
    const [currentBidder, setCurrentBidder] = useState<string | null>(null); // Name
    const [lastBidTeamId, setLastBidTeamId] = useState<string | null>(null);

    // Phase 4 States
    const [timer, setTimer] = useState(15);
    const [logs, setLogs] = useState<string[]>([]);

    // Sale State
    const [saleStatus, setSaleStatus] = useState<'SOLD' | 'UNSOLD' | null>(null);
    const [lastSoldPlayer, setLastSoldPlayer] = useState<Player | null>(null);
    const [myStats, setMyStats] = useState<{ budget: number; squad: Player[] } | undefined>(undefined);

    // Phase 8: All Teams Stats
    const [allTeamsStats, setAllTeamsStats] = useState<Record<string, { budget: number; squad: Player[] }>>({});

    // Host Control States
    const [isPaused, setIsPaused] = useState(false);
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        if (!room) {
            // Ideally fetch room if refresh, but for now redirect
            // router.push('/');
        }

        // Listeners
        mockSocket.on('new_player', (player: Player) => {
            console.log('[Auction] New Player:', player);
            setCurrentPlayer(player);
            setCurrentBid(player.basePrice);
            setCurrentBidder(null);
            setLastBidTeamId(null);
            setTimer(15);
            setSaleStatus(null); // Clear overlay
            setLogs(prev => [`New player ${player.name} on the block!`, ...prev]);
        });

        mockSocket.on('bid_update', (data: BidUpdate) => {
            console.log('[Auction] Bid Update:', data);
            setCurrentBid(data.amount);
            setCurrentBidder(data.teamId); // Use Team ID
            setLastBidTeamId(data.teamId);
            setTimer(15); // Reset timer on bid (Standard auction rule)
            // Use Shortform for Log
            setLogs(prev => [`${data.teamId} bid ₹${data.amount}L`, ...prev]);
        });

        mockSocket.on('player_sold', (data: SaleResult) => {
            setSaleStatus('SOLD');
            setLastSoldPlayer(data.player);
            // Use Shortform for Log
            setLogs(prev => [`SOLD: ${data.player.name} to ${data.winner.teamId} for ₹${data.amount}L`, ...prev]);

            // Update my stats if I am in the game
            if (user?.teamId && data.teamStats[user.teamId]) {
                setMyStats(data.teamStats[user.teamId]);
            }
            // Update All Teams
            setAllTeamsStats(data.teamStats);
        });

        mockSocket.on('player_unsold', (data: UnsoldResult) => {
            setSaleStatus('UNSOLD');
            setLastSoldPlayer(data.player);
            setLogs(prev => [`UNSOLD: ${data.player.name}`, ...prev]);
        });

        mockSocket.on('auction_paused', () => {
            setIsPaused(true);
            setLogs(prev => ['Auction PAUSED by Host', ...prev]);
        });

        mockSocket.on('auction_resumed', () => {
            setIsPaused(false);
            setLogs(prev => ['Auction RESUMED', ...prev]);
        });

        mockSocket.on('auction_ended', () => {
            setIsEnded(true);
            setLogs(prev => ['Auction ENDED', ...prev]);
        });

        mockSocket.on('auction_state', (state: any) => {
            console.log('[Auction] State Sync:', state);
            if (state.currentPlayer) {
                setCurrentPlayer(state.currentPlayer);
                setCurrentBid(state.currentBid);
                setCurrentBidder(state.currentBidder?.teamId || null);
                setLastBidTeamId(state.currentBidder?.teamId || null);
            }
            if (state.teamStats) {
                setAllTeamsStats(state.teamStats);
                if (user?.teamId && state.teamStats[user.teamId]) {
                    setMyStats(state.teamStats[user.teamId]);
                }
            }

            // Sync Host Control States
            if (state.state === 'PAUSED') setIsPaused(true);
            if (state.state === 'ENDED') setIsEnded(true);
            if (state.state === 'ACTIVE') {
                setIsPaused(false);
                setIsEnded(false);
            }
        });

        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        if (rId) {
            mockSocket.emit('get_auction_state', { roomId: rId });
        }


        return () => {
            mockSocket.off('new_player');
            mockSocket.off('bid_update');
            mockSocket.off('player_sold');
            mockSocket.off('player_unsold');
            mockSocket.off('auction_state');
            mockSocket.off('auction_paused');
            mockSocket.off('auction_resumed');
            mockSocket.off('auction_ended');
        };
    }, [user?.teamId, roomId]);

    // Local Timer Effect (Should sync with server in real app, but local countdown for visual okay for now)
    useEffect(() => {
        if (!currentPlayer || saleStatus || isPaused || isEnded) return; // Stop if sold/paused/ended

        const interval = setInterval(() => {
            setTimer((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    // If Host, trigger server end
                    if (user?.isHost && roomId) {
                        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
                        console.log('Timer ended, emitting to server...');
                        mockSocket.emit('timer_ended', { roomId: rId });
                    }
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [currentPlayer, currentBid, saleStatus, user?.isHost, roomId, isPaused, isEnded]); // Reset if bid/player changes

    const handleBid = (amount: number) => {
        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        if (rId)
            mockSocket.emit('place_bid', { roomId: rId, amount });
    };

    const handleNextPlayer = () => {
        // Host triggers next
        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        if (rId) mockSocket.emit('start_auction', rId);
    };

    const handlePauseResume = () => {
        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        if (rId) {
            if (isPaused) mockSocket.emit('resume_auction', { roomId: rId });
            else mockSocket.emit('pause_auction', { roomId: rId });
        }
    };

    const handleEndAuction = () => {
        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        if (rId) {
            mockSocket.emit('end_auction', { roomId: rId });
        }
    };

    const isMyTurn = lastBidTeamId === user?.teamId;

    if (room?.status === 'POST_AUCTION') {
        return (
            <PostAuctionDashboard
                roomId={Array.isArray(roomId) ? roomId[0] : roomId!}
                teamId={user?.teamId || ''}
                squad={myStats?.squad || []}
                playingSquadSize={room?.playingSquadSize || 11}
            />
        );
    }

    if (!currentPlayer && !isEnded) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-ipl-blue mb-2">Waiting for next player...</h1>
                    <p className="text-slate-500">The auctioneer is shuffling the deck.</p>
                </div>
            </div>
        );
    }

    // Get team color for background
    const teamColor = IPL_TEAMS.find(t => t.id === lastBidTeamId)?.color || '#f1f5f9';

    if (isEnded) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4 text-yellow-400">AUCTION ENDED</h1>
                    <p className="text-slate-400 mb-8">The auction has concluded.</p>
                    <Link href={`/results/${roomId}`} className="bg-ipl-blue px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
                        View Results
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-20">
            <Link href={`/lobby/${roomId}`} className="flex items-center text-slate-500 hover:text-ipl-blue mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Lobby
            </Link>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-800">
                            Room: <span className="font-mono text-ipl-blue">{roomId}</span>
                        </h1>
                        {/* Host Controls */}
                        {user?.isHost && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePauseResume}
                                    className={`px-3 py-1 rounded text-sm font-bold ${isPaused ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                >
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    onClick={handleEndAuction}
                                    className="px-3 py-1 rounded text-sm font-bold bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                    End
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Action Area */}
                    <div className="relative isolate">
                        {/* Dynamic Background Flash */}
                        <div
                            className="absolute inset-0 rounded-2xl opacity-10 transition-colors duration-500 pointer-events-none -z-10"
                            style={{ backgroundColor: teamColor }}
                        />

                        <PlayerCard
                            player={currentPlayer!}
                            currentBid={currentBid}
                            currentBidder={currentBidder || 'Unsold'}
                            timer={timer}
                        />

                        {/* Sold Overlay */}
                        <SoldOverlay
                            status={saleStatus}
                            player={lastSoldPlayer}
                            winnerName={currentBidder || undefined}
                            winnerTeamId={lastBidTeamId || undefined}
                            amount={currentBid}
                            onNext={handleNextPlayer}
                            isHost={user?.isHost || false}
                        />

                        {/* Paused Overlay */}
                        {isPaused && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                                <div className="bg-white p-6 rounded-xl shadow-2xl text-center">
                                    <h2 className="text-2xl font-black text-slate-800 mb-2">AUCTION PAUSED</h2>
                                    <p className="text-slate-500">The host has paused the auction.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Place Your Bid</h3>
                        <BidControls
                            currentBid={currentBid}
                            onBid={handleBid}
                            isDisabled={isMyTurn || saleStatus !== null || isPaused}
                        />
                        {isMyTurn && (
                            <p className="text-center text-green-600 text-sm font-bold mt-3 animate-pulse">
                                You hold the highest bid!
                            </p>
                        )}
                    </div>

                    {/* Feed */}
                    <div className="bg-slate-100 p-4 rounded-xl h-48 overflow-y-auto">
                        <h3 className="flex items-center text-xs font-bold text-slate-500 uppercase mb-3 sticky top-0 bg-slate-100 py-1">
                            <History className="w-3 h-3 mr-1" /> Activity Log
                        </h3>
                        <ul className="space-y-2">
                            {logs.map((log, i) => (
                                <li key={i} className="text-sm text-slate-600 border-l-2 border-ipl-blue pl-2">
                                    {log}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Phase 8: All Teams Dashboard */}
                    <AllTeamsDashboard teamsStats={allTeamsStats} />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <TeamStats
                        teamId={user?.teamId || ''}
                        stats={myStats}
                    />
                </div>
            </div>
        </div>
    );
}
