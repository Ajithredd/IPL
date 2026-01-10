import socketio
import time
import sys
import os

# Client
sio = socketio.Client()
BASE_URL = 'http://localhost:5000'
ROOM_ID = None

@sio.on('connect')
def on_connect():
    print("[Bot] Connected")

@sio.on('room_joined')
def on_room_joined(data):
    global ROOM_ID
    if data.get('isHost', False) or (data.get('users') and data['users'][0]['id'] == sio.get_sid()):
        ROOM_ID = data['id']
        print(f"[Bot] Room Created: {ROOM_ID}")
        # Write ID to file for the Agent to read
        with open("temp_room_id.txt", "w") as f:
            f.write(ROOM_ID)

@sio.on('room_updated')
def on_room_updated(data):
    # If a user joined (users count > 1), start auction
    if len(data['users']) > 1 and data['status'] == 'LOBBY':
        print("[Bot] User Joined! Starting Auction...")
        time.sleep(15)
        sio.emit('start_auction', ROOM_ID)

@sio.on('bid_update')
def on_bid_update(data):
    print(f"[Bot] Bid received: {data['amount']}")
    # Fast forward: Sell after 5 seconds to keep test short
    time.sleep(5)
    print("[Bot] Selling player...")
    sio.emit('timer_ended', {'roomId': ROOM_ID})

@sio.on('player_sold')
def on_player_sold(data):
    print(f"[Bot] Player Sold to {data['winner']['userId']}")
    # Test Done
    os.remove("temp_room_id.txt")
    sio.disconnect()
    sys.exit(0)

def run_bot():
    sio.connect(BASE_URL)
    sio.emit('create_room', {
        'roomName': 'BotHostedRoom',
        'userName': 'BotHost',
        'totalTeams': 2,
        'budgetPerTeam': 100,
        'squadSize': 15,
        'userTeamId': 'CSK'
    })
    sio.wait()

if __name__ == '__main__':
    run_bot()
