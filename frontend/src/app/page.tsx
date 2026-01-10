import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlusCircle, LogIn, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 space-y-8">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-ipl-blue/10 p-6 rounded-full">
            <Trophy className="w-20 h-20 text-ipl-blue" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-ipl-blue tracking-tight">
          Common Man's <span className="text-ipl-gold">Mega Auction</span>
        </h1>
        <p className="text-xl text-slate-600">
          Experience the thrill of the auction table. Create a room, invite friends, and build your dream team in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Card className="flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-shadow border-t-4 border-t-ipl-blue">
          <div className="bg-blue-50 p-4 rounded-full">
            <PlusCircle className="w-10 h-10 text-ipl-blue" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Create a Room</h2>
            <p className="text-slate-500">Host your own auction, set the rules, and become the auctioneer.</p>
          </div>
          <Link href="/create" className="w-full">
            <Button className="w-full" size="lg">Start New Auction</Button>
          </Link>
        </Card>

        <Card className="flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-shadow border-t-4 border-t-ipl-gold">
          <div className="bg-yellow-50 p-4 rounded-full">
            <LogIn className="w-10 h-10 text-ipl-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Join a Room</h2>
            <p className="text-slate-500">Enter a room code to join an existing lobby and start bidding.</p>
          </div>
          <Link href="/join" className="w-full">
            <Button variant="secondary" className="w-full" size="lg">Join Auction</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
