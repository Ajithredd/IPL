export interface User {
  id: string;
  name: string;
  isHost: boolean;
  roomId?: string;
  teamId?: string; // e.g. 'CSK'
}

export interface Room {
  id: string; // The Room Code (e.g., "ABCD")
  name: string;
  hostId: string;
  totalTeams: number;
  budgetPerTeam: number;
  squadSize: number; // Max players per team
  playingSquadSize: number;
  resultMetric: 'overall' | '2024' | '2025';
  users: User[];
  status: 'LOBBY' | 'AUCTION' | 'COMPLETED' | 'POST_AUCTION';
}

// Socket Events (Mocked)
export interface Player {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket Keeper';
  basePrice: number;
  stats: {
    ipl_runs?: number;
    wickets?: number;
    avg?: number;
    strike_rate?: number;
    economy?: number;
  };
  country: string;
  img: string;
  fantasy_points?: {
    overall: number;
    '2024': number;
    '2025': number;
  };
}

export interface BidUpdate {
  amount: number;
  teamId: string;
  bidderName: string;
}

export interface ClientToServerEvents {
  create_room: (data: {
    roomName: string;
    userName: string;
    totalTeams: number;
    budgetPerTeam: number;
    squadSize: number;
    playingSquadSize: number;
    resultMetric: string;
    userTeamId: string;
  }) => void;
  join_room: (data: { roomId: string; userName: string; teamId?: string }) => void;
  leave_room: () => void;
  start_auction: (roomId: string) => void;
  place_bid: (data: { roomId: string; amount: number }) => void;
  timer_ended: (data: { roomId: string }) => void;
  get_auction_state: (data: { roomId: string }) => void;
  pause_auction: (data: { roomId: string }) => void;
  resume_auction: (data: { roomId: string }) => void;
  end_auction: (data: { roomId: string }) => void;
  submit_squad: (data: { roomId: string; teamId: string; playerIds: string[] }) => void;
  get_points_table: (data: { roomId: string }) => void;
}

export interface SaleResult {
  player: Player;
  amount: number;
  winner: { userId: string; teamId: string };
  teamStats: Record<string, { budget: number; squad: Player[] }>;
}

export interface UnsoldResult {
  player: Player;
  status: 'UNSOLD';
}

export interface ServerToClientEvents {
  room_joined: (room: Room) => void;
  room_updated: (room: Room) => void;
  new_player: (player: Player) => void;
  bid_update: (data: BidUpdate) => void;
  player_sold: (data: SaleResult) => void;
  player_unsold: (data: UnsoldResult) => void;
  auction_state: (state: any) => void;
  error: (message: string) => void;
  auction_paused: (data: any) => void;
  auction_resumed: (data: any) => void;
  auction_ended: (data: any) => void;
  points_table_update: (data: { teamId: string; points: number }[]) => void;
}
