import socketio
import time
import sys
import threading

# Configuration
SIO_URL = 'http://localhost:5000'

# State containers
host_state = {'room_id': None, 'player': None, 'sold_to': None}
user2_state = {'room_id': None, 'player': None}

auction_ended_event = threading.Event()
bid_update_event = threading.Event()
user2_joined_event = threading.Event()

# Clients
# host_sio = socketio.Client(logger=True, engineio_logger=True)
# user2_sio = socketio.Client(logger=True, engineio_logger=True)
host_sio = socketio.Client()
user2_sio = socketio.Client()
auction_started = threading.Event()
new_player_event = threading.Event()
player_sold_event = threading.Event()
auction_ended_event = threading.Event()
bid_update_event = threading.Event()

# --- Host Handlers ---
@host_sio.event
def connect():
    print("[Host] Connected")

@host_sio.on('room_joined')
def host_on_room_joined(data):
    print(f"[Host] Joined Room: {data.get('id')}")
    host_state['room_id'] = data.get('id')

@host_sio.on('new_player')
def host_on_new_player(data):
    print(f"[Host] New Player: {data.get('name')}")
    host_state['player'] = data
    new_player_event.set()

@host_sio.on('player_sold')
def host_on_player_sold(data):
    print(f"[Host] Player Sold: {data}")
    host_state['sold_to'] = data.get('winner', {}).get('teamId')
    player_sold_event.set()

@host_sio.on('bid_update')
def host_on_bid_update(data):
    print(f"[Host] Bid Update: {data['amount']} by {data['bidderName']}")

@host_sio.on('auction_ended')
def host_on_auction_ended(data):
    print("[Host] Auction Ended")
    auction_ended_event.set()

@host_sio.on('error')
def host_on_error(data):
    print(f"[Host] ERROR: {data}")

# --- User 2 Handlers ---
@user2_sio.event
def connect():
    print("[User2] Connected")

@user2_sio.on('room_joined')
def user2_on_room_joined(data):
    print(f"[User2] Joined Room: {data.get('id')}")
    user2_joined_event.set()

@user2_sio.on('bid_update')
def user2_on_bid_update(data):
    print(f"[User2] Bid Update: {data['amount']} by {data['bidderName']}")
    bid_update_event.set()

@user2_sio.on('error')
def user2_on_error(data):
    print(f"[User2] ERROR: {data}")

def run_test():
    try:
        # 1. Connect Host
        host_sio.connect(SIO_URL)
        
        # 2. Create Room
        print("\n--- Step 1: Host Creating Room ---")
        host_sio.emit('create_room', {
            'roomName': 'E2E Test Room',
            'userName': 'HostUser',
            'userTeamId': 'CSK',
            'budgetPerTeam': 100,
            'squadSize': 15,
            'totalTeams': 10
        })
        time.sleep(2)
        room_id = host_state['room_id']
        if not room_id:
            raise Exception("Room creation failed")
            
        # 3. Connect User 2 and Join
        print("\n--- Step 2: User 2 Joining Room ---")
        user2_sio.connect(SIO_URL)
        user2_sio.emit('join_room', {
            'roomId': room_id,
            'userName': 'Player2',
            'teamId': 'MI'
        })
        if not user2_joined_event.wait(timeout=5):
            raise Exception("Timed out waiting for User 2 to join room")
        
        # 4. Start Auction
        print("\n--- Step 3: Starting Auction ---")
        host_sio.emit('start_auction', room_id)
        
        # Wait for first player
        if not new_player_event.wait(timeout=10):
            raise Exception("Timed out waiting for first player")
        new_player_event.clear()
        
        # 5. Bidding War
        print("\n--- Step 4: Bidding War ---")
        base_price = host_state['player'].get('basePrice', 20)
        bid1 = base_price + 50
        bid2 = base_price + 100
        
        # Host bids
        print(f"Host placing bid: {bid1}")
        bid_update_event.clear()
        host_sio.emit('place_bid', {'roomId': room_id, 'amount': bid1})
        if not bid_update_event.wait(timeout=5):
             raise Exception("Timed out waiting for Host bid update")
        
        # User 2 bids
        print(f"User 2 placing bid: {bid2}")
        bid_update_event.clear()
        user2_sio.emit('place_bid', {'roomId': room_id, 'amount': bid2})
        if not bid_update_event.wait(timeout=5):
             raise Exception("Timed out waiting for User 2 bid update")
        
        # 6. Sell Player (Simulate Timer End)
        print("\n--- Step 5: Selling Player ---")
        # In a real scenario, we'd wait for the timer. Here we can force it if we had a force_sell event,
        # or we just wait for the timer logic if it's short.
        # Since we can't easily force the timer from client without waiting, 
        # let's just trigger 'timer_ended' manually if the backend allows it (it does!)
        host_sio.emit('timer_ended', {'roomId': room_id})
        
        if not player_sold_event.wait(timeout=5):
            raise Exception("Timed out waiting for player sold")
        
        if host_state['sold_to'] != 'MI':
            raise Exception(f"Player sold to wrong team: {host_state['sold_to']}, expected MI")
        print("Player correctly sold to MI")
        
        # 7. End Auction
        print("\n--- Step 6: Ending Auction ---")
        host_sio.emit('end_auction', {'roomId': room_id})
        
        if not auction_ended_event.wait(timeout=5):
            raise Exception("Timed out waiting for auction end")
            
        print("\n--- E2E TEST PASSED ---")
        
    except Exception as e:
        print(f"\n--- E2E TEST FAILED: {e} ---")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        host_sio.disconnect()
        user2_sio.disconnect()

if __name__ == '__main__':
    run_test()
