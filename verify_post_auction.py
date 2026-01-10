import socketio
import time
import requests

# Setup
sio = socketio.Client()
BASE_URL = 'http://localhost:5000'

room_id = None
team_id = 'CSK'
player_ids = []

@sio.on('connect')
def on_connect():
    print('Connected to server')

@sio.on('room_joined')
def on_room_joined(data):
    global room_id
    room_id = data['id']
    print(f'Joined room: {room_id}')

@sio.on('room_updated')
def on_room_updated(data):
    print(f"Room Updated: Status={data['status']}")

@sio.on('new_player')
def on_new_player(data):
    print(f"New Player: {data['name']} ({data['id']})")
    # Bid immediately
    sio.emit('place_bid', {'roomId': room_id, 'amount': data['basePrice']})

@sio.on('player_sold')
def on_player_sold(data):
    print(f"Sold: {data['player']['name']} to {data['winner']['teamId']}")
    if data['winner']['teamId'] == team_id:
        player_ids.append(data['player']['id'])

@sio.on('auction_ended')
def on_auction_ended(data):
    print("Auction Ended!")
    # Submit Squad
    print(f"Submitting squad with {len(player_ids)} players...")
    
    # Mock IDs if we didn't buy enough (since auction is fast)
    # We configured Playing Squad Size = 5
    mock_ids = [str(i) for i in range(1, 6)]
    
    sio.emit('submit_squad', {
        'roomId': room_id,
        'teamId': team_id,
        'playerIds': mock_ids 
    })

@sio.on('points_table_update')
def on_points_table_update(data):
    print("Points Table Updated:")
    for rank, team in enumerate(data):
        print(f"{rank+1}. {team['teamId']} - {team['points']} pts")
    
    # Exit after verification
    print("Verification Successful!")
    sio.disconnect()
    exit(0)

# Main Flow
def run():
    sio.connect(BASE_URL)
    
    # Create Room
    sio.emit('create_room', {
        'roomName': 'Test Room',
        'userName': 'Tester',
        'totalTeams': 2,
        'budgetPerTeam': 100,
        'squadSize': 15,
        'playingSquadSize': 5,
        'resultMetric': '2024',
        'userTeamId': team_id
    })
    
    time.sleep(1)
    
    # Start Auction
    if room_id:
        sio.emit('start_auction', room_id)
        
        # Wait for loop to finish (simulate a few players)
        # We need to trigger end auction manually for this test script after some time
        time.sleep(10) 
        print("Force ending auction...")
        sio.emit('end_auction', {'roomId': room_id})
        
        # Wait for points table
        time.sleep(5)
    else:
        print("Failed to create room")

if __name__ == '__main__':
    run()
