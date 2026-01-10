import React, { useState, useMemo } from 'react';
import { Player } from '../../types';

interface SquadSelectorProps {
    squad: Player[];
    targetSize: number;
    onSubmit: (selectedIds: string[]) => void;
}

const SquadSelector: React.FC<SquadSelectorProps> = ({ squad, targetSize, onSubmit }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const togglePlayer = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size < targetSize) {
                newSet.add(id);
            }
        }
        setSelectedIds(newSet);
    };

    const currentPoints = useMemo(() => {
        let total = 0;
        squad.forEach(p => {
            if (selectedIds.has(p.id)) {
                const pts = p.fantasy_points?.overall || 0; // Default to overall for preview
                total += pts;
            }
        });
        return total;
    }, [squad, selectedIds]);

    const handleSubmit = () => {
        if (selectedIds.size !== targetSize) {
            alert(`Please select exactly ${targetSize} players.`);
            return;
        }
        onSubmit(Array.from(selectedIds));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Select Playing Squad</h2>
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 font-medium">Required Size: <span className="font-bold text-ipl-blue">{targetSize}</span></label>
                </div>
            </div>

            <div className="mb-4 text-gray-600">
                Selected: <span className="font-bold text-blue-600">{selectedIds.size}</span> / {targetSize}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto mb-6">
                {squad.map(player => (
                    <div
                        key={player.id}
                        onClick={() => togglePlayer(player.id)}
                        className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-colors ${selectedIds.has(player.id)
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                            : 'hover:bg-gray-50 border-gray-200'
                            }`}
                    >
                        <img
                            src={player.img}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        />
                        <div>
                            <div className="font-bold text-gray-800">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.role}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={selectedIds.size !== targetSize}
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${selectedIds.size === targetSize
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                    }`}
            >
                Submit Squad
            </button>
        </div>
    );
};

export default SquadSelector;
