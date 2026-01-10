import React from 'react';

interface PointsTableProps {
    ranking: { teamId: string; points: number }[];
}

const PointsTable: React.FC<PointsTableProps> = ({ ranking }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Points Table</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Rank</th>
                            <th className="py-3 px-6 text-left">Team</th>
                            <th className="py-3 px-6 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {ranking.map((team, index) => (
                            <tr key={team.teamId} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap font-bold">
                                    {index + 1}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    <span className="font-medium">{team.teamId}</span>
                                </td>
                                <td className="py-3 px-6 text-right">
                                    <span className="font-bold text-blue-600">{team.points}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PointsTable;
