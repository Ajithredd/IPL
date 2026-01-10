import React, { useEffect, useState } from 'react';
import { mockSocket } from '@/services/mockSocket';
import { Player } from '@/types';
import SquadSelector from './SquadSelector';
import PointsTable from './PointsTable';

interface PostAuctionDashboardProps {
    roomId: string;
    teamId: string;
    squad: Player[];
    playingSquadSize: number;
}

const PostAuctionDashboard: React.FC<PostAuctionDashboardProps> = ({ roomId, teamId, squad, playingSquadSize }) => {
    const [ranking, setRanking] = useState<{ teamId: string; points: number }[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        // Listen for updates
        mockSocket.on('points_table_update', (data) => {
            console.log('Points table updated:', data);
            setRanking(data);
        });

        // Request initial state
        mockSocket.emit('get_points_table', { roomId });

        return () => {
            mockSocket.off('points_table_update');
        };
    }, [roomId]);

    const handleSubmitSquad = (selectedIds: string[]) => {
        mockSocket.emit('submit_squad', {
            roomId,
            teamId,
            playerIds: selectedIds
        });
        setHasSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-ipl-blue mb-8">
                    Post-Auction Analysis
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Squad Selection */}
                    <div>
                        {!hasSubmitted ? (
                            <SquadSelector squad={squad} targetSize={playingSquadSize} onSubmit={handleSubmitSquad} />
                        ) : (
                            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                                <div className="text-5xl mb-4">✅</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Squad Submitted!</h2>
                                <p className="text-gray-600">
                                    Your playing squad has been locked in. Check the leaderboard to see how you rank!
                                </p>
                                <button
                                    onClick={() => setHasSubmitted(false)}
                                    className="mt-4 text-blue-600 hover:underline"
                                >
                                    Edit Squad
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Points Table */}
                    <div>
                        <PointsTable ranking={ranking} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostAuctionDashboard;
