import { Button } from '@/components/ui/Button'; // Adjusted path if needed
import { Gavel, AlertCircle } from 'lucide-react';

interface BidControlsProps {
    currentBid: number;
    onBid: (amount: number) => void;
    isDisabled: boolean;
    budget?: number; // Team's remaining budget in Lakhs
    currentBidder?: string | null;
    isSquadFull?: boolean;
    squadCount?: number;
    totalSquadSize?: number;
}

export const BidControls = ({ currentBid, onBid, isDisabled, budget, currentBidder, isSquadFull, squadCount = 0, totalSquadSize = 25 }: BidControlsProps) => {
    // Dynamic Bid Logic
    // < 2 Cr (200L): +10L
    // 2 Cr - 5 Cr (200-500L): +25L
    // > 5 Cr (500L): +50L

    let increment = 10;

    if (!currentBidder) {
        increment = 0;
    } else if (currentBid >= 500) {
        increment = 50;
    } else if (currentBid >= 200) {
        increment = 25;
    }

    const nextBid = currentBid + increment;
    const isBudgetInsufficient = budget !== undefined && budget < nextBid;
    const isButtonDisabled = isDisabled || isBudgetInsufficient || isSquadFull;

    return (
        <div className="grid grid-cols-1 gap-3">
            <Button
                onClick={() => onBid(nextBid)}
                disabled={isButtonDisabled}
                className="flex flex-col items-center py-3 md:py-6 h-auto transition-transform active:scale-95 w-full md:w-auto"
                variant={isButtonDisabled ? 'secondary' : 'primary'}
                data-testid={`btn-bid-${increment}`}
            >
                <span className="text-xs opacity-80 font-medium">{!currentBidder ? 'BID BASE PRICE' : 'RAISE BID'}</span>
                <span className="text-3xl font-black">{!currentBidder ? 'Base Price' : `+ ${increment} Lakhs`}</span>
                <span className="text-xs opacity-60 mt-1">Total: ₹ {nextBid}L</span>
            </Button>

            {isBudgetInsufficient && (
                <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Budget Insufficient
                </div>
            )}

            {isSquadFull && (
                <div className="flex items-center justify-center gap-2 text-orange-500 dark:text-orange-400 text-sm font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Squad Full
                </div>
            )}

            {/* Stats Display */}
            {budget !== undefined && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Purse</div>
                        <div className="text-sm font-black text-slate-800 dark:text-white">₹{(budget / 100).toFixed(2)} Cr</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Squad</div>
                        <div className="text-sm font-black text-slate-800 dark:text-white">{squadCount}/{totalSquadSize}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
