import { Button } from '@/components/ui/Button'; // Adjusted path if needed
import { Gavel } from 'lucide-react';

interface BidControlsProps {
    currentBid: number;
    onBid: (amount: number) => void;
    isDisabled: boolean;
}

export const BidControls = ({ currentBid, onBid, isDisabled }: BidControlsProps) => {
    // Dynamic Bid Logic
    // < 2 Cr (200L): +10L
    // 2 Cr - 5 Cr (200-500L): +25L
    // > 5 Cr (500L): +50L

    let increment = 10;
    if (currentBid >= 500) {
        increment = 50;
    } else if (currentBid >= 200) {
        increment = 25;
    }

    const nextBid = currentBid + increment;

    return (
        <div className="grid grid-cols-1 gap-3">
            <Button
                onClick={() => onBid(nextBid)}
                disabled={isDisabled}
                className="flex flex-col items-center py-6 h-auto transition-transform active:scale-95 w-full"
                variant={isDisabled ? 'secondary' : 'primary'}
                data-testid={`btn-bid-${increment}`}
            >
                <span className="text-xs opacity-80 font-medium">RAISE BID</span>
                <span className="text-3xl font-black">+ {increment} Lakhs</span>
                <span className="text-xs opacity-60 mt-1">Total: ₹ {nextBid}L</span>
            </Button>
        </div>
    );
};
