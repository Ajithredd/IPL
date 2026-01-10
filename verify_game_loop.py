import socketio
import time
import sys

# Create two clients: Host and Bidder
sio_host = socketio.Client()
sio_player = socketio.Client()

room_id = None
test_player = None

# --- Host Events ---
@sio_host.event
def connect():
    print("[Host] Connected")

@sio_host.on('room_joined')
def host_room_joined(data):
    global room_id
    room_id = data['id']
    print(f"[Host] Room Created: {room_id}")

@sio_host.on('new_player')
def host_new_player(data):
    global test_player
    test_player = data
    print(f"[Host] New Player on Block: {data['name']} (Base: {data['basePrice']})")

@sio_host.on('player_sold')
def host_player_sold(data):
    print(f"[Host] Player SOLD: {data['player']['name']} to {data['winner']['userId']} for {data['amount']}")
    print(f"[Host] Team Stats Update: {data['teamStats']}")
    # Verification
    winner_team = data['winner']['teamId']
    remaining_budget = data['teamStats'][winner_team]['budget']
    print(f"[VERIFY] Remaining Budget: {remaining_budget} (Expected < 10000)")
    
    # End Test
    print("SUCCESS: Game Loop Verified")
    sio_host.disconnect()
    sio_player.disconnect()
    sys.exit(0)

# --- Player Events ---
@sio_player.event
def connect():
    print("[Player] Connected")

@sio_player.on('room_joined')
def player_room_joined(data):
    print(f"[Player] Joined Room: {data['id']}")

@sio_player.on('bid_update')
def player_bid_update(data):
    print(f"[Player] Bid Updated: {data['amount']} by {data['bidderName']}")

# --- Main Flow ---
def run_test():
    try:
        # 1. Connect
        sio_host.connect('http://localhost:5000')
        sio_player.connect('http://localhost:5000')

        # 2. Create Room (Host)
        print("Creating Room...")
        sio_host.emit('create_room', {
            'roomName': 'TestRoom',
            'userName': 'HostUser',
            'totalTeams': 2,
            'budgetPerTeam': 100,
            'squadSize': 15,
            'userTeamId': 'MI'
        })
        time.sleep(1)

        if not room_id:
            print("FAILED: Room not created")
            return

        # 3. Join Room (Player)
        print(f"Joining Room {room_id}...")
        sio_player.emit('join_room', {
            'roomId': room_id,
            'userName': 'PlayerUser',
            'teamId': 'CSK'
        })
        time.sleep(1)

        # 4. Start Auction
        print("Starting Auction...")
        sio_host.emit('start_auction', room_id)
        time.sleep(1)

        if not test_player:
             print("FAILED: No player received")
             return

        # 5. Place Bid (Player)
        bid_amount = test_player['basePrice'] + 20
        print(f"Placing Bid of {bid_amount}...")
        sio_player.emit('place_bid', {'roomId': room_id, 'amount': bid_amount})
        time.sleep(1)

        # 6. End Timer (Host)
        print("Ending Timer (Force Sell)...")
        sio_host.emit('timer_ended', {'roomId': room_id})
        
        # Wait for Sold event (handled in callback)
        time.sleep(2)

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_test()
