import React from 'react';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-100 dark:border-slate-700 ${className || ''}`}>
            {children}
        </div>
    );
}
