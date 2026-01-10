import Link from 'next/link';
import { Gavel } from 'lucide-react';

export function Header() {
    return (
        <header className="bg-ipl-blue text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-ipl-gold p-2 rounded-full">
                        <Gavel className="w-6 h-6 text-ipl-blue" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">IPL Auction <span className="text-ipl-gold">Simulator</span></h1>
                </Link>
                <nav>
                    <ul className="flex gap-6 text-sm font-medium">
                        {/* <li>
                            <a href="https://github.com/ajithredd/IPL" target="_blank" rel="noopener noreferrer" className="hover:text-ipl-gold transition-colors">
                                GitHub
                            </a>
                        </li> */}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
