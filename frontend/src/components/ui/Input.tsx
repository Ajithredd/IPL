import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-ipl-blue focus:border-transparent transition-all',
                        'disabled:bg-slate-100 disabled:cursor-not-allowed',
                        error && 'border-ipl-red focus:ring-ipl-red',
                        className
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-ipl-red">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';
