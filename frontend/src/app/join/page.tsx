'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { IPL_TEAMS } from '@/constants/teams';

export default function JoinRoomPage() {
    const router = useRouter();
    const { joinRoom, user, room, isLoading, error, clearError } = useApp();

    const [formData, setFormData] = useState({
        userName: '',
        roomId: '',
        teamId: ''
    });
    const [takenTeams, setTakenTeams] = useState<string[]>([]);

    useEffect(() => {
        const checkRoom = async () => {
            if (formData.roomId.length >= 4) {
                try {
                    const res = await fetch(`http://localhost:5000/api/room/${formData.roomId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTakenTeams(data.takenTeams || []);
                    } else {
                        setTakenTeams([]); // Clear if room not found or error
                    }
                } catch (e) {
                    console.error("Failed to fetch room details", e);
                    setTakenTeams([]); // Clear on error
                }
            } else {
                setTakenTeams([]); // Clear if room ID is too short
            }
        };
        const timeout = setTimeout(checkRoom, 500);
        return () => clearTimeout(timeout);
    }, [formData.roomId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'roomId' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userName || !formData.roomId || !formData.teamId) return;
        joinRoom(formData.roomId, formData.userName, formData.teamId);
    };

    // Redirect on success
    useEffect(() => {
        if (user && room && room.id === formData.roomId) {
            router.push(`/lobby/${room.id}`);
        }
    }, [user, room, router, formData.roomId]);

    useEffect(() => {
        clearError();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="flex items-center mb-8">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors mr-4">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Join Room</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Room Code</label>
                        <input
                            type="text"
                            name="roomId"
                            value={formData.roomId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-ipl-blue focus:ring-4 focus:ring-ipl-blue/10 outline-none transition-all font-mono text-lg uppercase placeholder:normal-case"
                            placeholder="e.g. ABCD12"
                            required
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Your Name</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-ipl-blue focus:ring-4 focus:ring-ipl-blue/10 outline-none transition-all"
                            placeholder="Enter your display name"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Select Team</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {IPL_TEAMS.map((team) => {
                                const isTaken = takenTeams.includes(team.id);
                                const isSelected = formData.teamId === team.id;
                                return (
                                    <button
                                        key={team.id}
                                        type="button"
                                        onClick={() => !isTaken && setFormData(prev => ({ ...prev, teamId: team.id }))}
                                        disabled={isTaken}
                                        className={`
                                            relative p-2 rounded-lg font-bold text-sm transition-all transform 
                                            ${isSelected ? 'ring-4 ring-offset-2 ring-ipl-blue scale-105 shadow-md' : ''}
                                            ${isTaken ? 'opacity-40 cursor-not-allowed grayscale' : 'opacity-90 hover:opacity-100 hover:scale-105'}
                                        `}
                                        style={{
                                            backgroundColor: team.color,
                                            color: team.textColor,
                                        }}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                <Check className="w-3 h-3" />
                                            </div>
                                        )}
                                        {team.id}
                                        {isTaken && <span className="block text-[10px] font-normal opacity-75">(Taken)</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {!formData.teamId && <p className="text-xs text-slate-400 mt-2">Choose an available team to join.</p>}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-ipl-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 mt-4"
                    >
                        {isLoading ? 'Joining...' : 'Join Room'}
                    </button>
                </form>
            </div>
        </div>
    );
}
