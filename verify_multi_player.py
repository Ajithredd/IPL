import socketio
import time
import sys

# Two separate clients to simulate "2 Tabs"
host = socketio.Client()
joiner = socketio.Client()

BASE_URL = 'http://localhost:5000'
ROOM_CODE = None
PLAYER_NAME = None

def print_log(role, msg):
    print(f"[{role.upper()}] {msg}")

# --- HOST EVENTS ---
@host.on('room_joined')
def on_host_room_joined(data):
    global ROOM_CODE
    ROOM_CODE = data['id']
    print_log("host", f"Room Created: {ROOM_CODE}")

@host.on('new_player')
def on_host_new_player(data):
    print_log("host", f"Serving Player: {data['name']}")

@host.on('bid_update')
def on_host_bid_update(data):
    print_log("host", f"Received Bid: {data['amount']} from {data['bidderName']}")
    # As Host, I decide to close the auction after seeing a bid
    time.sleep(1)
    print_log("host", "Timer Expired. Ending Auction...")
    host.emit('timer_ended', {'roomId': ROOM_CODE})

@host.on('player_sold')
def on_host_sold(data):
    print_log("host", f"SOLD {data['player']['name']} to {data['winner']['userId']}")
    global PLAYER_NAME
    PLAYER_NAME = data['player']['name']

# --- JOINER EVENTS ---
@joiner.on('room_joined')
def on_joiner_room_joined(data):
    print_log("joiner", f"Joined Room: {data['id']}")

@joiner.on('new_player')
def on_joiner_new_player(data):
    print_log("joiner", f"Saw New Player: {data['name']} (Base: {data['basePrice']})")
    # As Joiner, I bid immediately
    bid = data['basePrice'] + 20
    print_log("joiner", f"Placing Bid: {bid}")
    joiner.emit('place_bid', {'roomId': ROOM_CODE, 'amount': bid})

@joiner.on('player_sold')
def on_joiner_sold(data):
    print_log("joiner", f"I see player sold to: {data['winner']['userId']}")
    # Test Complete
    host.disconnect()
    joiner.disconnect()
    sys.exit(0)

def run_test():
    try:
        # 1. Connect Both
        host.connect(BASE_URL)
        joiner.connect(BASE_URL)
        
        # 2. Host Creates Room
        print_log("test", "Step 1: Host creates room")
        host.emit('create_room', {
            'roomName': 'MultiClientRoom',
            'userName': 'HostAdmin',
            'totalTeams': 2,
            'budgetPerTeam': 100,
            'squadSize': 15,
            'userTeamId': 'CSK'
        })
        time.sleep(1)
        
        if not ROOM_CODE:
            print("Failed to create room")
            return

        # 3. Joiner Joins
        print_log("test", f"Step 2: Joiner entering {ROOM_CODE}")
        joiner.emit('join_room', {
            'roomId': ROOM_CODE,
            'userName': 'JoinerUser',
            'teamId': 'MI'
        })
        time.sleep(1)

        # 4. Host Starts
        print_log("test", "Step 3: Host starts Auction")
        host.emit('start_auction', ROOM_CODE)
        
        # Wait for events to flow (New Player -> Bid -> SolD)
        host.wait() 

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    run_test()
