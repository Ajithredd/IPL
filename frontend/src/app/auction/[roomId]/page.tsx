'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { mockSocket } from '@/services/mockSocket';
import { Player, BidUpdate, SaleResult, UnsoldResult } from '@/types';
import { PlayerCard } from '@/components/auction/PlayerCard';
import { BidControls } from '@/components/auction/BidControls';
import { TeamStats } from '@/components/auction/TeamStats';
import { SoldOverlay } from '@/components/auction/SoldOverlay';
import { IPL_TEAMS } from '@/constants/teams';
import { ArrowLeft, History, Send, Users, Settings, BarChart3, UserCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Tabs } from '@/components/ui/Tabs';
import { ChatMessage } from '@/types';

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

    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Stats State
    const [unsoldPlayers, setUnsoldPlayers] = useState<Player[]>([]);
    const [upcomingPlayers, setUpcomingPlayers] = useState<Player[]>([]);
    const [statsTab, setStatsTab] = useState<'upcoming' | 'sold' | 'unsold' | 'expensive'>('upcoming');

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
            setLogs(prev => [`SOLD: ${data.player.name} to ${data.winner?.teamId || 'Unknown'} for ₹${data.amount}L`, ...prev]);

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
            setUnsoldPlayers(prev => [...prev, data.player]);
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

        mockSocket.on('chat_message', (msg: ChatMessage) => {
            setChatMessages(prev => [...prev, msg]);
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

            if (state.upcomingPlayers) {
                setUpcomingPlayers(state.upcomingPlayers);
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
            mockSocket.off('chat_message');
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

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !roomId) return;

        const rId = Array.isArray(roomId) ? roomId[0] : roomId;
        mockSocket.emit('chat_message', {
            roomId: rId,
            message: newMessage,
            sender: user?.name || 'Unknown',
            teamId: user?.teamId
        });
        setNewMessage('');
    };

    const isSquadFull = myStats ? myStats.squad.length >= (room?.squadSize || 25) : false;

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
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-ipl-blue mb-2">Waiting for next player...</h1>
                    <p className="text-slate-500 dark:text-slate-400">The auctioneer is shuffling the deck.</p>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 pb-20">
            <Link href={`/lobby/${roomId}`} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-ipl-blue mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Lobby
            </Link>

            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6">

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
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
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">Place Your Bid</h3>
                        <BidControls
                            currentBid={currentBid}
                            onBid={handleBid}
                            isDisabled={isMyTurn || saleStatus !== null || isPaused}
                            budget={myStats?.budget}
                            currentBidder={currentBidder}
                            isSquadFull={isSquadFull}
                            squadCount={myStats?.squad.length}
                            totalSquadSize={room?.squadSize}
                        />
                        {isMyTurn && (
                            <p className="text-center text-green-600 text-sm font-bold mt-3 animate-pulse">
                                You hold the highest bid!
                            </p>
                        )}
                    </div>

                    {/* Tabs Section */}
                    <Tabs
                        tabs={[
                            {
                                id: 'activity',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Activity</span>
                                    </div>
                                ),
                                content: (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:h-[500px]">
                                        {/* Activity Log */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg overflow-y-auto h-[200px] md:h-full custom-scrollbar">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-50 dark:bg-slate-900/50">System Logs</h4>
                                            <ul className="space-y-1">
                                                {logs.map((log, i) => (
                                                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 border-l-2 border-slate-300 pl-2">
                                                        {log}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Chat */}
                                        <div className="flex flex-col h-[350px] md:h-full">
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-t-lg overflow-y-auto space-y-2 custom-scrollbar">
                                                {chatMessages.map((msg, i) => (
                                                    <div key={i} className={`flex flex-col ${msg.sender === user?.name ? 'items-end' : 'items-start'}`}>
                                                        <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.sender === user?.name ? 'bg-ipl-blue text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none shadow-sm'}`}>
                                                            <span className="block text-[10px] opacity-70 mb-0.5 font-bold">{msg.sender} {msg.teamId ? `(${msg.teamId})` : ''}</span>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={chatEndRef} />
                                            </div>
                                            <form onSubmit={handleSendMessage} className="flex gap-2 p-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-ipl-blue"
                                                />
                                                <button type="submit" className="p-2 bg-ipl-blue text-white rounded-md hover:bg-blue-600">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                id: 'mysquad',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="w-4 h-4" />
                                        <span>My Squad</span>
                                    </div>
                                ),
                                content: (
                                    <div className="space-y-2">
                                        {myStats?.squad.map((p) => (
                                            <div key={p.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                        <div className="text-xs text-slate-500">{p.role}</div>
                                                    </div>
                                                </div>
                                                <div className="font-mono font-bold text-green-600">₹{p.soldPrice || 0} L</div>
                                            </div>
                                        ))}
                                        {(!myStats?.squad || myStats.squad.length === 0) && (
                                            <div className="text-center text-slate-400 py-4">No players bought yet.</div>
                                        )}
                                    </div>
                                )
                            },
                            {
                                id: 'stats',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Stats</span>
                                    </div>
                                ),
                                content: (
                                    <div className="space-y-4">
                                        {/* Sub-tabs */}
                                        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
                                            {[
                                                { id: 'upcoming', label: 'Players Up' },
                                                { id: 'sold', label: 'Sold' },
                                                { id: 'unsold', label: 'Unsold' },
                                                { id: 'expensive', label: 'Most Expensive' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setStatsTab(tab.id as any)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${statsTab === tab.id
                                                        ? 'bg-ipl-blue text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Content */}
                                        <div className="h-64 overflow-y-auto pr-2">
                                            {statsTab === 'upcoming' && (
                                                <div className="space-y-2">
                                                    {(() => {
                                                        const filteredPlayers = upcomingPlayers
                                                            .filter(p =>
                                                                !unsoldPlayers.some(u => u.id === p.id) &&
                                                                !Object.values(allTeamsStats).some(t => t.squad.some(s => s.id === p.id)) &&
                                                                p.id !== currentPlayer?.id
                                                            );

                                                        if (filteredPlayers.length === 0) {
                                                            return <div className="text-center text-slate-400 py-8">No upcoming players.</div>;
                                                        }

                                                        // Group by Set
                                                        const playersBySet: Record<number, Player[]> = {};
                                                        filteredPlayers.forEach(p => {
                                                            const setNum = (p as any).set || 100; // Default to 100 if no set
                                                            if (!playersBySet[setNum]) playersBySet[setNum] = [];
                                                            playersBySet[setNum].push(p);
                                                        });

                                                        // Sort sets and render
                                                        return Object.keys(playersBySet)
                                                            .sort((a, b) => Number(a) - Number(b))
                                                            .map(setNum => (
                                                                <div key={setNum} className="mb-4">
                                                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 py-1">
                                                                        Set {setNum}
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {playersBySet[Number(setNum)]
                                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                                            .map(p => (
                                                                                <div key={p.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                                    <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                                                                    <div>
                                                                                        <div className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                                                        <div className="text-xs text-slate-500">{p.role} • Base: ₹{p.basePrice}L</div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                    </div>
                                                                </div>
                                                            ));
                                                    })()}
                                                </div>
                                            )}

                                            {statsTab === 'sold' && (
                                                <div className="space-y-2">
                                                    {Object.values(allTeamsStats).flatMap(t => t.squad.map(p => ({ ...p, teamId: Object.keys(allTeamsStats).find(key => allTeamsStats[key] === t) })))
                                                        .length === 0 ? (
                                                        <div className="text-center text-slate-400 py-8">No players sold yet.</div>
                                                    ) : (
                                                        Object.values(allTeamsStats).flatMap(t => t.squad.map(p => ({ ...p, teamId: Object.keys(allTeamsStats).find(key => allTeamsStats[key] === t) })))
                                                            .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
                                                            .map(p => (
                                                                <div key={p.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                                                        <div>
                                                                            <div className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                                            <div className="text-xs text-slate-500">Sold to <span className="font-bold text-ipl-blue">{p.teamId}</span></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="font-mono font-bold text-green-600 text-sm">₹{p.soldPrice}L</div>
                                                                </div>
                                                            ))
                                                    )}
                                                </div>
                                            )}

                                            {statsTab === 'unsold' && (
                                                <div className="space-y-2">
                                                    {unsoldPlayers.length === 0 ? (
                                                        <div className="text-center text-slate-400 py-8">No unsold players.</div>
                                                    ) : (
                                                        unsoldPlayers.map(p => (
                                                            <div key={p.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 opacity-75">
                                                                <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full object-cover grayscale" />
                                                                <div>
                                                                    <div className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                                    <div className="text-xs text-slate-500">{p.role}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {statsTab === 'expensive' && (
                                                <div className="space-y-2">
                                                    {Object.values(allTeamsStats).flatMap(t => t.squad.map(p => ({ ...p, teamId: Object.keys(allTeamsStats).find(key => allTeamsStats[key] === t) })))
                                                        .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
                                                        .slice(0, 10)
                                                        .map((p, i) => (
                                                            <div key={p.id} className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-800 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-xs font-black text-yellow-600 w-4">#{i + 1}</div>
                                                                    <img src={p.img} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-yellow-400" />
                                                                    <div>
                                                                        <div className="text-sm font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                                        <div className="text-xs text-slate-500">Sold to {p.teamId}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="font-mono font-black text-yellow-600 text-sm">₹{p.soldPrice}L</div>
                                                            </div>
                                                        ))}
                                                    {Object.values(allTeamsStats).every(t => t.squad.length === 0) && (
                                                        <div className="text-center text-slate-400 py-8">No sales yet.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            },
                            {
                                id: 'teams',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>Teams</span>
                                    </div>
                                ),
                                content: <AllTeamsDashboard teamsStats={allTeamsStats} />
                            },
                            {
                                id: 'settings',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </div>
                                ),
                                content: (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Budget</div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white">₹{room?.budgetPerTeam} Cr</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Squad Size</div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white">{room?.squadSize}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Playing XI</div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white">{room?.playingSquadSize}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Metric</div>
                                            <div className="text-xl font-black text-slate-800 dark:text-white">{room?.resultMetric}</div>
                                        </div>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
