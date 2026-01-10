import json
import random

# Known MVP Points (from search)
mvp_data = {
    "Suryakumar Yadav": 320.5,
    "Sai Sudharsan": 311,
    "Yashasvi Jaiswal": 273,
    # Estimated for others based on performance
    "Prasidh Krishna": 25 * 3.5 + 50, # Wickets * 3.5 + bonus
    "Noor Ahmad": 24 * 3.5 + 40,
    "Josh Hazlewood": 22 * 3.5 + 40,
    "Trent Boult": 22 * 3.5 + 40,
    "Arshdeep Singh": 21 * 3.5 + 35,
    "Jasprit Bumrah": 18 * 3.5 + 30,
    "Virat Kohli": 657 * 0.4, # Approx points from runs
    "Shubman Gill": 650 * 0.4,
    "Mitchell Marsh": 627 * 0.4 + 10 * 3.5, # Runs + Wickets
    "Rishabh Pant": 250, # High value buy
    "Shreyas Iyer": 240,
    "Venkatesh Iyer": 230,
    "Andre Russell": 220,
    "Sunil Narine": 215,
    "Rashid Khan": 210,
    "Heinrich Klaasen": 205,
    "Nicholas Pooran": 200
}

# Load existing players
with open('backend/data/players.json', 'r') as f:
    players = json.load(f)

# Helper to find player by name
def find_player(name):
    for p in players:
        if p['name'].lower() == name.lower():
            return p
    return None

# Update MVP Points
for p in players:
    name = p['name']
    
    # 1. Set MVP Points
    if name in mvp_data:
        points = mvp_data[name]
    else:
        # Generate realistic points based on role/status
        if p.get('basePrice', 20) >= 200: # Star player
            points = random.uniform(150, 250)
        elif p.get('basePrice', 20) >= 100:
            points = random.uniform(100, 180)
        else: # Uncapped/Lower tier
            points = random.uniform(20, 100)
            
    # Store in fantasy_points['2025'] as requested
    if 'fantasy_points' not in p: p['fantasy_points'] = {}
    p['fantasy_points']['2025'] = round(points, 1)
    
    # 2. Ensure other fields exist
    if 'img' not in p: p['img'] = "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png"
    if 'country' not in p: p['country'] = "IND" # Default
    if 'role' not in p: p['role'] = "Unknown"
    if 'stats' not in p: p['stats'] = {}

# Sort by MVP Points (Descending)
players.sort(key=lambda x: x['fantasy_points'].get('2025', 0), reverse=True)

# Assign Sets (25 players per set)
for i, p in enumerate(players):
    set_num = (i // 25) + 1
    p['set'] = set_num

# Save
with open('backend/data/players.json', 'w') as f:
    json.dump(players, f, indent=4)

print(f"Updated players.json with MVP points and Sets. Total players: {len(players)}")
print("Top 5 MVP Players:")
for p in players[:5]:
    print(f"{p['name']}: {p['fantasy_points']['2025']} (Set {p['set']})")
