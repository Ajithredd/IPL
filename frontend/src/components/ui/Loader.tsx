import { Loader2 } from 'lucide-react';

export function Loader({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex justify-center items-center ${className || ''}`}>
            <Loader2 className={`animate-spin text-ipl-blue ${sizes[size]}`} />
        </div>
    );
}
