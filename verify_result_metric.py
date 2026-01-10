import requests
import socketio
import time
import sys

# Configuration
BASE_URL = 'http://localhost:5000'
SIO_URL = 'http://localhost:5000'

# Test Data
PLAYERS = [
    {"id": "p15", "name": "Suryakumar Yadav", "points_2025": 320.5, "points_2024": 516},
    {"id": "p83", "name": "Sai Sudharsan", "points_2025": 311.0, "points_2024": 270},
    {"id": "p95", "name": "Yashasvi Jaiswal", "points_2025": 273.0, "points_2024": 528}
]

EXPECTED_TOTAL_2025 = sum(p['points_2025'] for p in PLAYERS)
EXPECTED_TOTAL_2024 = sum(p['points_2024'] for p in PLAYERS)

def test_metric(metric, expected_total):
    print(f"\n--- Testing Metric: {metric} ---")
    
    # 1. Create Room
    print(f"Creating room with metric={metric}...")
    room_data = {
        'roomName': f'TestRoom_{metric}_{int(time.time())}',
        'userName': 'Admin',
        'totalTeams': 2,
        'budgetPerTeam': 100,
        'squadSize': 5,
        'playingSquadSize': 3, # We will select 3 players
        'resultMetric': metric,
        'userTeamId': 'team1'
    }
    
    # Enable logging
    import logging
    logging.basicConfig(level=logging.DEBUG)
    logging.getLogger('socketio').setLevel(logging.DEBUG)
    logging.getLogger('engineio').setLevel(logging.DEBUG)

    sio = socketio.Client()
    
    room_created = {}
    
    @sio.on('room_joined')
    def on_room_created(data):
        room_created['id'] = data['id'] # room_dict has 'id'
        print(f"Room created/joined: {data['id']}")

    try:
        sio.connect(SIO_URL, transports=['polling'])
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

    print("Socket connected")
    time.sleep(1) # Wait for connection to stabilize
    sio.emit('create_room', room_data)
    print("Sent create_room event")
    
    # Wait for room creation
    start_time = time.time()
    while not room_created.get('id') and time.time() - start_time < 5:
        time.sleep(0.1)
        
    room_id = room_created.get('id')
    if not room_id:
        print("Failed to create room - Timeout")
        sio.disconnect()
        return False

    # 2. Start Auction
    print("Starting auction...")
    sio.emit('start_auction', {'roomId': room_id})
    time.sleep(1)
    
    # 3. End Auction
    sio.emit('end_auction', {'roomId': room_id})
    time.sleep(2)
    
    # 4. Submit Squad
    print(f"Submitting squad for team1 with players: {[p['name'] for p in PLAYERS]}...")
    player_ids = [p['id'] for p in PLAYERS]
    
    submission_result = {}
    
    @sio.on('points_table_update')
    def on_points_update(data):
        print(f"Points update received: {data}")
        for team in data:
            if team['teamId'] == 'team1':
                submission_result['points'] = team['points']
                print(f"Team1 Points: {team['points']}")

    sio.emit('submit_squad', {
        'roomId': room_id,
        'teamId': 'team1',
        'playerIds': player_ids
    })
    
    time.sleep(2)
    
    # 5. Verify
    actual_points = submission_result.get('points')
    print(f"Expected: {expected_total}, Actual: {actual_points}")
    
    sio.disconnect()
    
    if actual_points == expected_total:
        print("SUCCESS")
        return True
    else:
        print("FAILURE")
        return False

if __name__ == "__main__":
    success_2025 = test_metric('2025', EXPECTED_TOTAL_2025)
    success_2024 = test_metric('2024', EXPECTED_TOTAL_2024)
    
    if success_2025 and success_2024:
        print("\nALL TESTS PASSED")
        sys.exit(0)
    else:
        print("\nSOME TESTS FAILED")
        sys.exit(1)
