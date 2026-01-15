import json
import random
import os
from .models import db, TeamState # Import models

class AuctionEngine:
    def __init__(self, room_id, room_data, socketio, app):
        self.room_id = room_id
        self.room_data = room_data
        self.socketio = socketio
        self.app = app # Flask Context needed for DB ops
        
        self.players = self.load_players()
        self.unsold_players = list(self.players) 
        self.completed_players = []
        
        self.current_player = None
        self.current_bid = 0
        self.current_bidder = None
        
        # State: WAITING, ACTION, SOLD, UNSOLD
        self.state = 'WAITING' 
        self.timer_task = None
        
        # Note: We no longer keep self.team_states in memory as truth.
        # We query DB or hydrate it.

    def get_team_state(self, team_id):
        # Helper to get DB state (must be called inside app context)
        # Assumes caller has already established app context
        ts = TeamState.query.filter_by(room_id=self.room_id, team_id=team_id).first()
        if not ts:
            # Should have been created on join, but fallback
            ts = TeamState(
                room_id=self.room_id, 
                team_id=team_id, 
                budget=self.room_data['budgetPerTeam'] * 100
            )
            db.session.add(ts)
            db.session.commit()
        return ts

    def load_players(self):
        # Load from the JSON file we just created
        path = os.path.join(os.path.dirname(__file__), 'data', 'players.json')
        with open(path, 'r') as f:
            players = json.load(f)
        
        # Group by Set
        sets = {}
        for p in players:
            s = p.get('set', 100) # Default to high set if missing
            if s not in sets:
                sets[s] = []
            sets[s].append(p)
            
        # Sort sets and shuffle within
        sorted_set_keys = sorted(sets.keys())
        final_list = []
        
        for k in sorted_set_keys:
            group = sets[k]
            random.shuffle(group)
            final_list.extend(group)
            
        return final_list

    def get_next_player(self):
        if not self.unsold_players:
            return None
        
        # Pop the first player
        self.current_player = self.unsold_players.pop(0)
        self.current_bid = self.current_player['basePrice']
        self.current_bidder = None
        self.state = 'ACTIVE'
        print(f"[Engine] Serving player: {self.current_player['name']}")
        
        return self.current_player

    def place_bid(self, user_id, team_id, amount):
        if self.state != 'ACTIVE':
            return False, "Bidding is closed"

        if not team_id:
             return False, "You must belong to a team to bid"
        
        # Check integrity with DB
        with self.app.app_context():
             ts = self.get_team_state(team_id)
             if amount > ts.budget:
                 return False, "Insufficient budget"
             
             # Check Max Players Constraint
             # We need to know the room's max squad size.
             # self.room_data has 'squadSize'
             current_squad = json.loads(ts.squad_json)
             if len(current_squad) >= self.room_data.get('squadSize', 25):
                 return False, "Squad is full!"
        
        # Basic validation
        # Basic validation
        if self.current_bidder:
            if amount <= self.current_bid:
                return False, "Bid must be higher than current price"
        else:
            if amount < self.current_bid:
                return False, "Bid must be at least base price"
        
        self.current_bid = amount
        self.current_bidder = {'userId': user_id, 'teamId': team_id}
        
        return True, "Bid accepted"

    def sell_current_player(self):
        if not self.current_player or not self.current_bidder:
            return self.pass_unsold_player()

        team_id = self.current_bidder['teamId']
        amount = self.current_bid
        
        sale_data = None
        
        with self.app.app_context():
            ts = self.get_team_state(team_id)
            ts.budget -= amount
            
            # Add to Squad
            squad_list = json.loads(ts.squad_json)
            sold_player = self.current_player.copy()
            sold_player['soldPrice'] = amount
            squad_list.append(sold_player)
            
            ts.squad_json = json.dumps(squad_list)
            
            db.session.commit()
            
            # Prepare result to emit
            # We can return just this team's new state or reload others if needed
            # Returning hydration dict for frontend
            
            all_teams = TeamState.query.filter_by(room_id=self.room_id).all()
            all_teams_dict = {
                t.team_id: t.to_dict() for t in all_teams
            }

            sale_data = {
                'player': sold_player,
                'amount': amount,
                'winner': self.current_bidder,
                'teamStats': all_teams_dict 
            }
        
        # Add to completed
        self.completed_players.append(sale_data)
        
        print(f"[Engine] Sold {sold_player['name']} to {team_id} for {amount}")

        # Reset
        self.current_player = None
        self.current_bidder = None
        self.state = 'SOLD'
        
        return sale_data

    def pass_unsold_player(self):
         if not self.current_player:
            return None
         
         print(f"[Engine] Unsold: {self.current_player['name']}")
         
         # Logic for unsold? Put back in queue? Or mark unsold?
         # For now, mark unsold
         self.current_player['soldPrice'] = 0
         
         unsold_data = {
             'player': self.current_player,
             'status': 'UNSOLD'
         }

         self.current_player = None
         self.current_bidder = None
         self.state = 'UNSOLD'
         return unsold_data

    def pause_auction(self):
        if self.state == 'ACTIVE':
            self.state = 'PAUSED'
            print(f"[Engine] Auction PAUSED")
            return True
        return False

    def resume_auction(self):
        if self.state == 'PAUSED':
            self.state = 'ACTIVE'
            print(f"[Engine] Auction RESUMED")
            return True
        return False

    def end_auction(self):
        self.state = 'ENDED'
        print(f"[Engine] Auction ENDED")
        return True

    def get_state(self):
        # Fetch latest team stats
        with self.app.app_context():
            all_teams = TeamState.query.filter_by(room_id=self.room_id).all()
            all_teams_dict = {
                t.team_id: t.to_dict() for t in all_teams
            }

        return {
            'currentPlayer': self.current_player,
            'currentBid': self.current_bid,
            'currentBidder': self.current_bidder,
            'state': self.state,
            'timer': 30, # TODO: Sync timer properly
            'teamStats': all_teams_dict,
            'upcomingPlayers': self.unsold_players
        }
