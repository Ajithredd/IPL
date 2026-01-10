import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}: ButtonProps) {

    const variants = {
        primary: 'bg-ipl-blue text-white hover:bg-opacity-90',
        secondary: 'bg-ipl-gold text-ipl-blue hover:bg-opacity-90',
        outline: 'border-2 border-ipl-blue text-ipl-blue hover:bg-ipl-blue hover:text-white',
        ghost: 'bg-transparent text-ipl-blue hover:bg-slate-100',
        danger: 'bg-ipl-red text-white hover:bg-opacity-90',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin w-4 h-4" />}
            {children}
        </button>
    );
}
