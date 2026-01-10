import { IPL_TEAMS } from '@/constants/teams';
import { Player } from '@/types';
import { Users } from 'lucide-react';

interface TeamStatsProps {
    teamId: string; // My Team
    stats?: { budget: number; squad: Player[] };
    allStats?: Record<string, { budget: number; squad: Player[] }>;
}

export const TeamStats = ({ teamId, stats }: TeamStatsProps) => {
    // If no stats yet (start of game), we might use defaults or wait
    const currentBudget = stats ? stats.budget : 10000; // Base 100 Cr in Lakhs
    const squadCount = stats ? stats.squad.length : 0;

    // Formatting: 10000 Lakhs = 100 Cr
    const budgetCr = (currentBudget / 100).toFixed(2);

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">My Squad</h3>

            <div className="flex items-center justify-between mb-6 p-3 bg-slate-50 rounded-lg">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Purse Remaining</p>
                    <p className="text-2xl font-black text-slate-800">₹ {budgetCr} <span className="text-sm font-normal text-slate-500">Cr</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">Squad Size</p>
                    <p className="text-2xl font-black text-slate-800">{squadCount} <span className="text-sm font-normal text-slate-400">/ 25</span></p>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Recent Buys</h4>
                {stats?.squad.slice(-5).reverse().map((p) => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 truncate">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
