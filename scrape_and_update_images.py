import requests
import json
import os
import re
import time

TEAMS = [
    "chennai-super-kings",
    "delhi-capitals",
    "gujarat-titans",
    "kolkata-knight-riders",
    "lucknow-super-giants",
    "mumbai-indians",
    "punjab-kings",
    "rajasthan-royals",
    "royal-challengers-bengaluru",
    "sunrisers-hyderabad"
]

BASE_URL = "https://www.iplt20.com/teams/{}/squad"
IMG_BASE_URL = "https://documents.iplt20.com/ipl/IPLHeadshot2024/{}.png"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def scrape_and_update():
    # Load players
    base_dir = os.path.dirname(os.path.abspath(__file__))
    players_path = os.path.join(base_dir, 'backend', 'data', 'players.json')
    
    with open(players_path, 'r') as f:
        players = json.load(f)
    
    # Map name to player object for easy update
    player_map = {p['name'].lower().strip(): p for p in players}
    
    updated_count = 0
    
    for team in TEAMS:
        url = BASE_URL.format(team)
        print(f"Scraping {team}...")
        try:
            response = requests.get(url, headers=HEADERS, timeout=10)
            if response.status_code != 200:
                print(f"Failed to fetch {team}: {response.status_code}")
                continue
                
            # Regex to find player links: href="https://www.iplt20.com/players/name-slug/id"
            # The HTML might look like: <a href="https://www.iplt20.com/players/rohit-sharma/107">
            # or encoded spaces etc.
            
            # Pattern: https://www.iplt20.com/players/([a-zA-Z0-9-]+)/(\d+)
            matches = re.findall(r'https://www.iplt20.com/players/([a-zA-Z0-9-]+)/(\d+)', response.text)
            
            print(f"Found {len(matches)} players in {team}")
            
            for slug, pid in matches:
                # Convert slug to name (approximate)
                # rohit-sharma -> rohit sharma
                name_from_slug = slug.replace('-', ' ').lower().strip()
                
                # Try to find in our players list
                # We try exact match first
                matched_p = player_map.get(name_from_slug)
                
                if not matched_p:
                    # Try partial match or fuzzy
                    # e.g. "surya-kumar-yadav" vs "suryakumar yadav"
                    name_parts = name_from_slug.split()
                    for p_name, p_obj in player_map.items():
                        if all(part in p_name for part in name_parts) or p_name in name_from_slug:
                             matched_p = p_obj
                             break
                
                if matched_p:
                    new_img = IMG_BASE_URL.format(pid)
                    if matched_p.get('img') != new_img:
                        matched_p['img'] = new_img
                        # Also update ID if we want to use official ID? 
                        # Maybe keep internal ID for now to avoid breaking references
                        # matched_p['official_id'] = pid 
                        updated_count += 1
                        # print(f"Updated {matched_p['name']} -> {pid}")
        
        except Exception as e:
            print(f"Error scraping {team}: {e}")
        
        time.sleep(1) # Be nice

    print(f"Total players updated: {updated_count}")
    
    with open(players_path, 'w') as f:
        json.dump(players, f, indent=4)

if __name__ == "__main__":
    scrape_and_update()
