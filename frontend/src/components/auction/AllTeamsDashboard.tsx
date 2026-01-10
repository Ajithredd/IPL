import { IPL_TEAMS } from '@/constants/teams';
import { Player } from '@/types';

interface AllTeamsDashboardProps {
    teamsStats: Record<string, { budget: number; squad: Player[] }>;
}

export const AllTeamsDashboard = ({ teamsStats }: AllTeamsDashboardProps) => {
    // Sort teams: Active (in room) first, then others
    // For now, we just show all IPL teams, highlighting those with stats

    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Tournament Overview</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
                {IPL_TEAMS.map(team => {
                    const stats = teamsStats[team.id];
                    const isActive = !!stats;

                    return (
                        <div key={team.id} className={`p-4 rounded-lg border ${isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: team.color }}>
                                    {team.id}
                                </div>
                                <span className="font-bold text-slate-700 text-sm truncate">{team.name}</span>
                            </div>

                            {isActive ? (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Budget</span>
                                        <span className="font-bold text-slate-900">₹{(stats.budget / 100).toFixed(2)} Cr</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Squad</span>
                                        <span className="font-bold text-slate-900">{stats.squad.length}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic text-center py-2">
                                    Not in room
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
