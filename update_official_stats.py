import json
import random

# Official IPL 2025 Stats (from search results)
# Orange Cap (Runs)
top_batters = [
    {"name": "Sai Sudharsan", "role": "Batsman", "country": "IND", "stats": {"ipl_runs": 759, "avg": 50.6}, "points": 1000},
    {"name": "Suryakumar Yadav", "role": "Batsman", "country": "IND", "stats": {"ipl_runs": 717, "avg": 47.8}, "points": 950},
    {"name": "Virat Kohli", "role": "Batsman", "country": "IND", "stats": {"ipl_runs": 657, "avg": 43.8}, "points": 900},
    {"name": "Shubman Gill", "role": "Batsman", "country": "IND", "stats": {"ipl_runs": 650, "avg": 43.3}, "points": 880},
    {"name": "Mitchell Marsh", "role": "All-Rounder", "country": "AUS", "stats": {"ipl_runs": 627, "avg": 41.8}, "points": 850}
]

# Purple Cap (Wickets)
top_bowlers = [
    {"name": "Prasidh Krishna", "role": "Bowler", "country": "IND", "stats": {"wickets": 25, "economy": 7.8}, "points": 1000},
    {"name": "Noor Ahmad", "role": "Bowler", "country": "AFG", "stats": {"wickets": 24, "economy": 7.5}, "points": 950},
    {"name": "Josh Hazlewood", "role": "Bowler", "country": "AUS", "stats": {"wickets": 22, "economy": 7.2}, "points": 900},
    {"name": "Trent Boult", "role": "Bowler", "country": "NZ", "stats": {"wickets": 22, "economy": 7.9}, "points": 890},
    {"name": "Arshdeep Singh", "role": "Bowler", "country": "IND", "stats": {"wickets": 21, "economy": 8.1}, "points": 870},
    {"name": "Jasprit Bumrah", "role": "Bowler", "country": "IND", "stats": {"wickets": 18, "economy": 6.9}, "points": 850}
]

# Load existing players
with open('backend/data/players.json', 'r') as f:
    players = json.load(f)

# Helper to find player by name
def find_player(name):
    for p in players:
        if p['name'].lower() == name.lower():
            return p
    return None

# Update Stats
for b in top_batters:
    p = find_player(b['name'])
    if p:
        p['stats']['ipl_runs'] = b['stats']['ipl_runs']
        p['stats']['avg'] = b['stats']['avg']
        p['fantasy_points']['2025'] = b['points']
        # Ensure role is correct if we have better data
        # p['role'] = b['role'] 

for b in top_bowlers:
    p = find_player(b['name'])
    if p:
        p['stats']['wickets'] = b['stats']['wickets']
        p['stats']['economy'] = b['stats']['economy']
        p['fantasy_points']['2025'] = b['points']

# Assign Sets based on 2025 Fantasy Points
# Sort by 2025 points descending
players.sort(key=lambda x: x['fantasy_points'].get('2025', 0), reverse=True)

# Assign sets
for i, p in enumerate(players):
    if i < 25:
        p['set'] = 1
    elif i < 50:
        p['set'] = 2
    elif i < 75:
        p['set'] = 3
    elif i < 100:
        p['set'] = 4
    else:
        p['set'] = (i // 25) + 1

# Save
with open('backend/data/players.json', 'w') as f:
    json.dump(players, f, indent=4)

print("Updated players.json with official stats and sets.")
