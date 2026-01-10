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
        <Card className="flex flex-col md:flex-row gap-6 p-6 items-center">
            {/* Player Image */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                <img src={player.img} alt={player.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {player.country}
                </div>
            </div>

            {/* Player Details */}
            <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="px-3 py-1 bg-ipl-blue/10 text-ipl-blue text-sm font-bold rounded-full">
                        {player.role}
                    </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1" data-testid="player-name">{player.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6 text-slate-500 text-sm">
                    {Object.entries(player.stats).map(([key, value]) => (
                        <div key={key} className="bg-slate-50 px-3 py-1.5 rounded border border-slate-100 uppercase">
                            <span className="font-bold text-slate-700 mr-1">{value}</span> {key.replace('_', ' ')}
                        </div>
                    ))}
                </div>

                {/* Bidding Info */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="bg-white p-4 rounded-xl border-2 border-ipl-gold/20 shadow-sm w-full md:w-auto min-w-[200px]">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Current Bid</p>
                        <p className="text-3xl font-black text-ipl-blue">
                            ₹ {currentBid} <span className="text-lg font-normal text-slate-400">Lakhs</span>
                        </p>
                        {currentBidder && (
                            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-1.5 rounded">
                                <Shield className="w-4 h-4 text-ipl-blue" />
                                {currentBidder}
                            </div>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 text-white font-mono text-2xl font-bold border-4 border-slate-100 shadow-xl">
                        {timer}
                    </div>
                </div>
            </div>
        </Card>
    );
};
