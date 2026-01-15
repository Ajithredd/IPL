import { useState } from 'react';
import { IPL_TEAMS } from '@/constants/teams';
import { Player } from '@/types';
import { X } from 'lucide-react';

interface AllTeamsDashboardProps {
    teamsStats: Record<string, { budget: number; squad: Player[] }>;
}

export const AllTeamsDashboard = ({ teamsStats }: AllTeamsDashboardProps) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    // Sort teams: Active (in room) first, then others
    const sortedTeams = [...IPL_TEAMS].sort((a, b) => {
        const aActive = !!teamsStats[a.id];
        const bActive = !!teamsStats[b.id];
        if (aActive === bActive) return 0;
        return aActive ? -1 : 1;
    });

    const selectedTeam = selectedTeamId ? IPL_TEAMS.find(t => t.id === selectedTeamId) : null;
    const selectedStats = selectedTeamId ? teamsStats[selectedTeamId] : null;

    return (
        <>
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Tournament Overview</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
                    {sortedTeams.map(team => {
                        const stats = teamsStats[team.id];
                        const isActive = !!stats;

                        return (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`text-left p-4 rounded-lg border transition-all hover:scale-105 ${isActive
                                    ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm hover:shadow-md cursor-pointer'
                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-60 grayscale hover:grayscale-0'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: team.color }}>
                                        {team.id}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{team.name}</span>
                                </div>

                                {isActive ? (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Budget</span>
                                            <span className="font-bold text-slate-900 dark:text-white">₹{(stats.budget / 100).toFixed(2)} Cr</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Squad</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{stats.squad.length}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic text-center py-2">
                                        Inactive
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Team Details Modal */}
            {selectedTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-90" style={{ backgroundColor: selectedTeam.color }} />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-lg font-black shadow-lg" style={{ color: selectedTeam.color }}>
                                    {selectedTeam.id}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedTeam.name}</h2>
                                    <p className="text-white/80 text-sm font-medium">Team Details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedTeamId(null)}
                                className="relative z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {!selectedStats ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p>This team has not joined the auction room yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Remaining Purse</div>
                                            <div className="text-2xl font-black text-slate-800 dark:text-white">₹{(selectedStats.budget / 100).toFixed(2)} Cr</div>
                                            <div className="text-xs text-slate-400">{(selectedStats.budget).toFixed(0)} Lakhs</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-slate-100 dark:border-slate-700">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Squad Strength</div>
                                            <div className="text-2xl font-black text-slate-800 dark:text-white">{selectedStats.squad.length}</div>
                                            <div className="text-xs text-slate-400">Players</div>
                                        </div>
                                    </div>

                                    {/* Squad List */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Current Squad</h3>
                                        {selectedStats.squad.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                No players purchased yet.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedStats.squad.map((p) => (
                                                    <div key={p.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-500" />
                                                            <div>
                                                                <div className="font-bold text-slate-800 dark:text-white">{p.name}</div>
                                                                <div className="text-xs text-slate-500">{p.role}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono font-bold text-green-600">₹{p.soldPrice} L</div>
                                                            <div className="text-[10px] text-slate-400 uppercase font-bold">Sold Price</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
