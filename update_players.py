import json
import random

# List of players found in IPL 2025 search results
ipl_2025_players = [
    {"name": "Rishabh Pant", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Shreyas Iyer", "role": "Batsman", "country": "IND"},
    {"name": "Venkatesh Iyer", "role": "All-Rounder", "country": "IND"},
    {"name": "Arshdeep Singh", "role": "Bowler", "country": "IND"},
    {"name": "Yuzvendra Chahal", "role": "Bowler", "country": "IND"},
    {"name": "KL Rahul", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Mitchell Starc", "role": "Bowler", "country": "AUS"},
    {"name": "Jos Buttler", "role": "Wicket Keeper", "country": "ENG"},
    {"name": "Kagiso Rabada", "role": "Bowler", "country": "SA"},
    {"name": "Vaibhav Suryavanshi", "role": "Batsman", "country": "IND"},
    {"name": "Bhuvneshwar Kumar", "role": "Bowler", "country": "IND"},
    {"name": "Deepak Chahar", "role": "Bowler", "country": "IND"},
    {"name": "Akash Deep", "role": "Bowler", "country": "IND"},
    {"name": "Mukesh Kumar", "role": "Bowler", "country": "IND"},
    {"name": "Marco Jansen", "role": "All-Rounder", "country": "SA"},
    {"name": "Jamie Overton", "role": "All-Rounder", "country": "ENG"},
    {"name": "Xavier Bartlett", "role": "Bowler", "country": "AUS"},
    {"name": "Lungi Ngidi", "role": "Bowler", "country": "SA"},
    {"name": "Yudhvir Singh", "role": "All-Rounder", "country": "IND"},
    {"name": "Rajvardhan Hangargekar", "role": "All-Rounder", "country": "IND"},
    {"name": "Arshin Kulkarni", "role": "All-Rounder", "country": "IND"},
    {"name": "Ashwani Kumar", "role": "Bowler", "country": "IND"},
    {"name": "Devon Conway", "role": "Batsman", "country": "NZ"},
    {"name": "Rahul Tripathi", "role": "Batsman", "country": "IND"},
    {"name": "Rachin Ravindra", "role": "All-Rounder", "country": "NZ"},
    {"name": "Ravichandran Ashwin", "role": "All-Rounder", "country": "IND"},
    {"name": "Khaleel Ahmed", "role": "Bowler", "country": "IND"},
    {"name": "Noor Ahmad", "role": "Bowler", "country": "AFG"},
    {"name": "Sam Curran", "role": "All-Rounder", "country": "ENG"},
    {"name": "Trent Boult", "role": "Bowler", "country": "NZ"},
    {"name": "Will Jacks", "role": "All-Rounder", "country": "ENG"},
    {"name": "Virat Kohli", "role": "Batsman", "country": "IND"},
    {"name": "Rajat Patidar", "role": "Batsman", "country": "IND"},
    {"name": "Yash Dayal", "role": "Bowler", "country": "IND"},
    {"name": "Liam Livingstone", "role": "All-Rounder", "country": "ENG"},
    {"name": "Phil Salt", "role": "Wicket Keeper", "country": "ENG"},
    {"name": "Jitesh Sharma", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Josh Hazlewood", "role": "Bowler", "country": "AUS"},
    {"name": "Rasikh Dar", "role": "Bowler", "country": "IND"},
    {"name": "Suyash Sharma", "role": "Bowler", "country": "IND"},
    {"name": "Krunal Pandya", "role": "All-Rounder", "country": "IND"},
    {"name": "Swapnil Singh", "role": "All-Rounder", "country": "IND"},
    {"name": "Tim David", "role": "Batsman", "country": "AUS"},
    {"name": "Romario Shepherd", "role": "All-Rounder", "country": "WI"},
    {"name": "Nuwan Thushara", "role": "Bowler", "country": "SL"},
    {"name": "Manoj Bhandage", "role": "All-Rounder", "country": "IND"},
    {"name": "Jacob Bethell", "role": "All-Rounder", "country": "ENG"},
    {"name": "Devdutt Padikkal", "role": "Batsman", "country": "IND"},
    {"name": "Swastik Chhikara", "role": "Batsman", "country": "IND"},
    {"name": "Abhinandan Singh", "role": "Bowler", "country": "IND"},
    {"name": "Mohit Rathee", "role": "All-Rounder", "country": "IND"},
    {"name": "Jake Fraser-McGurk", "role": "Batsman", "country": "AUS"},
    {"name": "T. Natarajan", "role": "Bowler", "country": "IND"},
    {"name": "Marcus Stoinis", "role": "All-Rounder", "country": "AUS"},
    {"name": "Rohit Sharma", "role": "Batsman", "country": "IND"},
    {"name": "Suryakumar Yadav", "role": "Batsman", "country": "IND"},
    {"name": "Hardik Pandya", "role": "All-Rounder", "country": "IND"},
    {"name": "Jasprit Bumrah", "role": "Bowler", "country": "IND"},
    {"name": "Tilak Varma", "role": "Batsman", "country": "IND"},
    {"name": "MS Dhoni", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Ruturaj Gaikwad", "role": "Batsman", "country": "IND"},
    {"name": "Ravindra Jadeja", "role": "All-Rounder", "country": "IND"},
    {"name": "Shivam Dube", "role": "All-Rounder", "country": "IND"},
    {"name": "Matheesha Pathirana", "role": "Bowler", "country": "SL"},
    {"name": "Axar Patel", "role": "All-Rounder", "country": "IND"},
    {"name": "Kuldeep Yadav", "role": "Bowler", "country": "IND"},
    {"name": "Tristan Stubbs", "role": "Batsman", "country": "SA"},
    {"name": "Abhishek Porel", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Rashid Khan", "role": "Bowler", "country": "AFG"},
    {"name": "Shubman Gill", "role": "Batsman", "country": "IND"},
    {"name": "Sai Sudharsan", "role": "Batsman", "country": "IND"},
    {"name": "Rahul Tewatia", "role": "All-Rounder", "country": "IND"},
    {"name": "Shahrukh Khan", "role": "Batsman", "country": "IND"},
    {"name": "Sunil Narine", "role": "All-Rounder", "country": "WI"},
    {"name": "Andre Russell", "role": "All-Rounder", "country": "WI"},
    {"name": "Rinku Singh", "role": "Batsman", "country": "IND"},
    {"name": "Varun Chakaravarthy", "role": "Bowler", "country": "IND"},
    {"name": "Harshit Rana", "role": "Bowler", "country": "IND"},
    {"name": "Ramandeep Singh", "role": "All-Rounder", "country": "IND"},
    {"name": "Nicholas Pooran", "role": "Wicket Keeper", "country": "WI"},
    {"name": "Ravi Bishnoi", "role": "Bowler", "country": "IND"},
    {"name": "Mayank Yadav", "role": "Bowler", "country": "IND"},
    {"name": "Mohsin Khan", "role": "Bowler", "country": "IND"},
    {"name": "Ayush Badoni", "role": "Batsman", "country": "IND"},
    {"name": "Sanju Samson", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Yashasvi Jaiswal", "role": "Batsman", "country": "IND"},
    {"name": "Riyan Parag", "role": "Batsman", "country": "IND"},
    {"name": "Sandeep Sharma", "role": "Bowler", "country": "IND"},
    {"name": "Shimron Hetmyer", "role": "Batsman", "country": "WI"},
    {"name": "Dhruv Jurel", "role": "Wicket Keeper", "country": "IND"},
    {"name": "Pat Cummins", "role": "Bowler", "country": "AUS"},
    {"name": "Abhishek Sharma", "role": "All-Rounder", "country": "IND"},
    {"name": "Heinrich Klaasen", "role": "Wicket Keeper", "country": "SA"}
]

# Load existing players
with open('backend/data/players.json', 'r') as f:
    existing_players = json.load(f)

existing_names = {p['name'] for p in existing_players}
next_id = len(existing_players) + 1

# Add new players
for p in ipl_2025_players:
    if p['name'] not in existing_names:
        new_player = {
            "id": f"p{next_id}",
            "name": p['name'],
            "role": p['role'],
            "basePrice": 200, # Default
            "stats": {
                "ipl_runs": random.randint(0, 5000) if p['role'] != 'Bowler' else random.randint(0, 500),
                "wickets": random.randint(0, 150) if p['role'] != 'Batsman' else 0,
                "avg": round(random.uniform(20, 40), 1)
            },
            "country": p['country'],
            "img": "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png", # Placeholder
            "fantasy_points": {
                "overall": random.randint(1000, 5000),
                "2024": random.randint(200, 800),
                "2025": random.randint(200, 800)
            }
        }
        existing_players.append(new_player)
        next_id += 1
    else:
        # Update existing player with 2025 points if missing
        for ep in existing_players:
            if ep['name'] == p['name']:
                if 'fantasy_points' not in ep:
                    ep['fantasy_points'] = {}
                if '2025' not in ep['fantasy_points']:
                    ep['fantasy_points']['2025'] = random.randint(200, 800)

# Save back
# Fill up to 250 with generic players if needed
current_count = len(existing_players)
target_count = 250

if current_count < target_count:
    first_names = ["Aditya", "Rohan", "Karthik", "Rahul", "Vikram", "Siddharth", "Arjun", "Varun", "Nikhil", "Pranav", "Ishaan", "Dhruv", "Ansh", "Aarav", "Vihaan", "Kabir", "Vivaan", "Reyansh", "Aryan", "Sai"]
    last_names = ["Sharma", "Verma", "Singh", "Patel", "Gupta", "Kumar", "Reddy", "Nair", "Iyer", "Rao", "Mehta", "Joshi", "Agarwal", "Jain", "Shah", "Mishra", "Tiwari", "Das", "Ghosh", "Bose"]
    
    roles = ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"]
    
    for i in range(target_count - current_count):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        role = random.choice(roles)
        
        new_player = {
            "id": f"p{len(existing_players) + 1}",
            "name": f"{fname} {lname}",
            "role": role,
            "basePrice": 20, # Uncapped price
            "stats": {
                "ipl_runs": random.randint(0, 500),
                "wickets": random.randint(0, 20),
                "avg": round(random.uniform(15, 30), 1)
            },
            "country": "IND",
            "img": "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png",
            "fantasy_points": {
                "overall": random.randint(500, 2000),
                "2024": random.randint(100, 400),
                "2025": random.randint(100, 400)
            }
        }
        existing_players.append(new_player)

with open('backend/data/players.json', 'w') as f:
    json.dump(existing_players, f, indent=4)

print(f"Updated players.json. Total players: {len(existing_players)}")
