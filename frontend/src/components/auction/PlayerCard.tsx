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
        <Card className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-3 sm:p-6 items-stretch">
            {/* Player Image - Smaller on mobile */}
            <div className="relative w-28 h-28 sm:w-48 sm:h-48 md:w-56 md:h-56 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-600 mx-auto sm:mx-0">
                <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
                <div className="absolute top-1 right-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm text-slate-800 dark:text-white">
                    {player.country}
                </div>
            </div>

            {/* Player Details - Compact on mobile */}
            <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                <div>
                    {/* Role & Name - Inline on mobile */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-ipl-blue/10 dark:bg-ipl-blue/20 text-ipl-blue text-xs font-bold rounded-full">
                            {player.role}
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2" data-testid="player-name">{player.name}</h2>

                    {/* Stats - Horizontal scroll on mobile, hide less important stats */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-3">
                        {Object.entries(player.stats).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded border border-slate-100 dark:border-slate-600 text-center">
                                <span className="text-sm font-bold text-slate-700 dark:text-white">{value}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase ml-1">{key.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bidding Info - Compact row on mobile */}
                <div className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="bg-white dark:bg-slate-700 p-2 sm:p-3 rounded-xl border-2 border-ipl-gold/20 dark:border-ipl-gold/30 shadow-sm flex-1 sm:flex-none sm:min-w-[160px]">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Current Bid</p>
                        <p className="text-xl sm:text-2xl font-black text-ipl-blue">
                            ₹ {currentBid} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">L</span>
                        </p>
                        {currentBidder && (
                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-600 p-1 rounded">
                                <Shield className="w-3 h-3 text-ipl-blue" />
                                {currentBidder}
                            </div>
                        )}
                    </div>

                    {/* Timer - Smaller on mobile */}
                    <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-mono text-xl sm:text-2xl font-bold border-4 border-slate-100 dark:border-slate-500 shadow-xl">
                        {timer}
                    </div>
                </div>
            </div>
        </Card>
    );
};
