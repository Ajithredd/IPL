import json
import os

def sync_mvp_data():
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    mvp_path = os.path.join(base_dir, 'backend', 'data', 'mvp_raw.json')
    players_path = os.path.join(base_dir, 'backend', 'data', 'players.json')

    # Load data
    with open(mvp_path, 'r') as f:
        mvp_data = json.load(f)['mvp']
    
    with open(players_path, 'r') as f:
        players = json.load(f)

    print(f"Loaded {len(mvp_data)} MVP records and {len(players)} existing players.")

    # Create a map for faster lookup
    # Normalize names to lowercase for matching
    player_map = {p['name'].lower(): p for p in players}

    updated_count = 0
    
    for mvp_p in mvp_data:
        name = mvp_p['PlayerName']
        # Try exact match first
        p = player_map.get(name.lower())
        
        # If not found, try partial match or fuzzy logic if needed
        # For now, we stick to direct matching to be safe
        
        if p:
            updated_count += 1
            # Update Stats
            if 'stats' not in p: p['stats'] = {}
            p['stats']['ipl_runs'] = int(mvp_p.get('Fours', 0)) * 4 + int(mvp_p.get('Sixes', 0)) * 6 # Approx runs from boundaries if total not available, or just store what we have
            # Actually the feed doesn't have total runs, just boundaries. 
            # But we can store the raw stats provided.
            p['stats']['fours'] = int(mvp_p.get('Fours', 0))
            p['stats']['sixes'] = int(mvp_p.get('Sixes', 0))
            p['stats']['wickets'] = int(mvp_p.get('Wickets', 0))
            p['stats']['matches'] = int(mvp_p.get('Matches', 0))
            
            # Update MVP Points
            try:
                p['fantasy_points']['2025'] = float(mvp_p['IndexValue'])
            except:
                pass

            # Update Role/Team if needed (optional)
            # p['team'] = mvp_p['TeamCode'] 

    print(f"Updated {updated_count} players with official MVP data.")

    # Re-assign Sets based on new 2025 points
    # Sort by 2025 points descending
    players.sort(key=lambda x: x.get('fantasy_points', {}).get('2025', 0), reverse=True)

    # Assign sets (25 per set)
    for i, p in enumerate(players):
        set_num = (i // 25) + 1
        p['set'] = set_num

    # Save back
    with open(players_path, 'w') as f:
        json.dump(players, f, indent=4)

    print("Saved updated players.json with new sets.")

if __name__ == "__main__":
    sync_mvp_data()
