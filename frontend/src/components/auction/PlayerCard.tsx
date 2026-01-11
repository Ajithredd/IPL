import { Player } from '@/types';
import { Card } from '@/components/ui/Card';
import { User, Shield } from 'lucide-react';

interface PlayerCardProps {
    player: Player;
    currentBid: number;
    currentBidder?: string; // Team Name or User Name
    timer: number;
}

export const PlayerCard = ({ player, currentBid, currentBidder, timer }: PlayerCardProps) => {
    return (
        <Card className="flex flex-col md:flex-row gap-6 p-6 items-stretch">
            {/* Player Image */}
            <div className="relative w-full md:w-64 h-64 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-600 mx-auto md:mx-0">
                <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm text-slate-800 dark:text-white">
                    {player.country}
                </div>
            </div>

            {/* Player Details */}
            <div className="flex-1 flex flex-col justify-between text-center md:text-left">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <span className="px-3 py-1 bg-ipl-blue/10 dark:bg-ipl-blue/20 text-ipl-blue text-sm font-bold rounded-full">
                            {player.role}
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3" data-testid="player-name">{player.name}</h2>

                    {/* Stats Grid - Improved Alignment */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                        {Object.entries(player.stats).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded border border-slate-100 dark:border-slate-600 text-center">
                                <span className="block text-lg font-bold text-slate-700 dark:text-white">{value}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{key.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bidding Info */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-xl border-2 border-ipl-gold/20 dark:border-ipl-gold/30 shadow-sm w-full sm:w-auto min-w-[200px]">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Current Bid</p>
                        <p className="text-3xl font-black text-ipl-blue">
                            ₹ {currentBid} <span className="text-lg font-normal text-slate-400 dark:text-slate-500">Lakhs</span>
                        </p>
                        {currentBidder && (
                            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-600 p-1.5 rounded">
                                <Shield className="w-4 h-4 text-ipl-blue" />
                                {currentBidder}
                            </div>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-mono text-2xl font-bold border-4 border-slate-100 dark:border-slate-500 shadow-xl">
                        {timer}
                    </div>
                </div>
            </div>
        </Card>
    );
};
