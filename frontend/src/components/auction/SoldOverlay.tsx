import { IPL_TEAMS } from '@/constants/teams';
import { Player } from '@/types';
import { Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SoldOverlayProps {
    status: 'SOLD' | 'UNSOLD' | null;
    player: Player | null; // The player who was just sold/unsold
    winnerName?: string;
    winnerTeamId?: string;
    amount?: number;
    onNext: () => void;
    isHost: boolean;
}

export const SoldOverlay = ({ status, player, winnerName, winnerTeamId, amount, onNext, isHost }: SoldOverlayProps) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (status) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [status]);

    if (!visible || !player) return null;

    const team = IPL_TEAMS.find(t => t.id === winnerTeamId);
    const bgColor = team?.color || '#334155'; // Fallback slate

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 isolate">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />

            {/* Stamp Card */}
            <div className={`relative bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform transition-all animate-in zoom-in-95 duration-300 overflow-hidden border-4 ${status === 'SOLD' ? 'border-ipl-gold' : 'border-slate-400'}`}>

                {status === 'SOLD' && (
                    <>
                        <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: bgColor }} />
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 border-2 border-slate-100">
                                {/* Team Logo substitute */}
                                <span className="text-3xl font-black" style={{ color: bgColor }}>{winnerTeamId}</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2">SOLD!</h2>
                            <p className="text-slate-500 font-medium text-lg">To <span className="font-bold text-slate-800">{winnerName}</span></p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-8">
                            <p className="text-sm text-slate-400 uppercase font-bold mb-1">Winning Bid</p>
                            <p className="text-4xl font-black text-ipl-blue">₹ {amount} <span className="text-xl font-normal text-slate-400">Lakhs</span></p>
                        </div>
                    </>
                )}

                {status === 'UNSOLD' && (
                    <div className="py-8">
                        <h2 className="text-5xl font-black text-slate-400 uppercase tracking-widest border-4 border-slate-400 inline-block px-4 py-2 rotate-[-12deg] opacity-80">UNSOLD</h2>
                        <p className="mt-6 text-slate-500">Better luck next time, {player.name}.</p>
                    </div>
                )}

                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm font-bold text-slate-500 uppercase mb-1">Next Player In</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ipl-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-ipl-blue"></span>
                        </span>
                        <span className="text-slate-800 font-medium animate-pulse">Auto-shuffling...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
