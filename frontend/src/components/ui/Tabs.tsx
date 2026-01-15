import React, { useState } from 'react';

interface Tab {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-ipl-blue text-ipl-blue'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-b-xl shadow-sm">
                {tabs.find((t) => t.id === activeTab)?.content}
            </div>
        </div>
    );
}
