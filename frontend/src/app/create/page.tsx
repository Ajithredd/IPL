'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Users, Check } from 'lucide-react';
import Link from 'next/link';
import { IPL_TEAMS, SQUAD_SIZES } from '@/constants/teams';

export default function CreateRoomPage() {
    const router = useRouter();
    const { createRoom, user, room, isLoading, error, clearError } = useApp();

    const [formData, setFormData] = useState({
        userName: '',
        roomName: '',
        totalTeams: 4,
        budgetPerTeam: 100, // Cr.
        squadSize: 15,
        playingSquadSize: 11,
        resultMetric: 'overall',
        userTeamId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            ...prev,
            [name]: (name === 'totalTeams' || name === 'budgetPerTeam' || name === 'squadSize' || name === 'playingSquadSize') ? Number(value) : value
        }));
    };

    const handleTeamSelect = (teamId: string) => {
        setFormData(prev => ({ ...prev, userTeamId: teamId }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userName || !formData.roomName || !formData.userTeamId) return;
        createRoom(
            formData.roomName,
            formData.userName,
            formData.totalTeams,
            formData.budgetPerTeam,
            formData.squadSize,
            formData.playingSquadSize,
            formData.resultMetric,
            formData.userTeamId
        );
    };

    // Effect to redirect when room is created (user state populated)
    useEffect(() => {
        console.log('[CreateRoomPage] Effect check:', { user, room });
        if (user && room && user.isHost) {
            console.log('[CreateRoomPage] Redirecting to lobby...');
            router.push(`/lobby/${room.id}`);
        }
    }, [user, room, router]);

    // Clear errors on mount
    useEffect(() => {
        clearError();
    }, []);

    return (
        <div className="max-w-xl mx-auto w-full">
            <Link href="/" className="flex items-center text-slate-500 hover:text-ipl-blue mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Link>

            <Card>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-ipl-blue">Create Auction Room</h1>
                    <p className="text-slate-500">Configure your auction settings</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Your Display Name"
                        name="userName"
                        placeholder="e.g. Auctioneer 1"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                        autoFocus
                    />

                    <Input
                        label="Room Name"
                        name="roomName"
                        placeholder="e.g. Saturday Night Auction"
                        value={formData.roomName}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Total Teams"
                            name="totalTeams"
                            type="number"
                            min={2}
                            max={10}
                            value={formData.totalTeams}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Budget Per Team (Cr.)"
                            name="budgetPerTeam"
                            type="number"
                            min={10}
                            max={200}
                            value={formData.budgetPerTeam}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Squad Size (Players per Team)
                        </label>
                        <div className="relative">
                            <select
                                name="squadSize"
                                value={formData.squadSize}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-ipl-blue focus:border-transparent appearance-none bg-white"
                                data-testid="select-squad-size"
                            >
                                {SQUAD_SIZES.map(size => (
                                    <option key={size} value={size}>{size} Players</option>
                                ))}
                            </select>
                            <Users className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Playing Squad Size
                            </label>
                            <div className="relative">
                                <select
                                    name="playingSquadSize"
                                    value={formData.playingSquadSize}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-ipl-blue focus:border-transparent appearance-none bg-white"
                                >
                                    {[5, 7, 9, 11].map(size => (
                                        <option key={size} value={size}>{size} Players</option>
                                    ))}
                                </select>
                                <Users className="absolute right-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Result Metric
                            </label>
                            <div className="relative">
                                <select
                                    name="resultMetric"
                                    value={formData.resultMetric}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-ipl-blue focus:border-transparent appearance-none bg-white"
                                >
                                    <option value="overall">Overall IPL</option>
                                    <option value="2024">IPL 2024</option>
                                    <option value="2025">IPL 2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Select Your Team
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {IPL_TEAMS.map((team) => {
                                const isSelected = formData.userTeamId === team.id;
                                return (
                                    <button
                                        key={team.id}
                                        type="button"
                                        onClick={() => handleTeamSelect(team.id)}
                                        className={`
                                relative p-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105
                                ${isSelected ? 'ring-4 ring-offset-2 ring-ipl-blue scale-105 shadow-md' : 'opacity-80 hover:opacity-100'}
                            `}
                                        style={{
                                            backgroundColor: team.color,
                                            color: team.textColor,
                                        }}
                                        data-testid={`btn-select-team-${team.id}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                        {team.id}
                                    </button>
                                );
                            })}
                        </div>
                        {!formData.userTeamId && <p className="text-xs text-red-500 mt-1">Please select a team</p>}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!formData.userTeamId} data-testid="btn-create-room">
                        Create Room
                    </Button>
                </form>
            </Card>
        </div>
    );
}
