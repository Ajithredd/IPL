import socketio
import time
import sys

sio = socketio.Client()
room_id = None
base_price = 0

@sio.on('connect')
def on_connect():
    print('Connected to backend')
    sio.emit('create_room', {
        'userName': 'BidTester',
        'roomName': 'BidTestRoom',
        'userTeamId': 'CSK',
        'budgetPerTeam': 100,
        'squadSize': 11,
        'totalTeams': 2
    })

@sio.on('room_joined')
def on_room_joined(data):
    global room_id
    room_id = data['id']
    print(f"Room joined: {room_id}")
    sio.emit('start_auction', room_id)

@sio.on('new_player')
def on_new_player(data):
    global base_price
    base_price = data['basePrice']
    print(f"New player: {data['name']}, Base Price: {base_price}")
    
    # Attempt to bid base price
    print(f"Attempting to bid base price: {base_price}")
    sio.emit('place_bid', {'roomId': room_id, 'amount': base_price})

@sio.on('bid_update')
def on_bid_update(data):
    print(f"Bid accepted: {data['amount']}")
    if data['amount'] == base_price:
        print("SUCCESS: Base price bid accepted.")
        sio.disconnect()
        sys.exit(0)
    else:
        print(f"FAILURE: Unexpected bid amount {data['amount']}")
        sio.disconnect()
        sys.exit(1)

@sio.on('error')
def on_error(data):
    print(f"Error: {data}")
    sio.disconnect()
    sys.exit(1)

if __name__ == '__main__':
    try:
        sio.connect('http://localhost:5000', wait_timeout=10)
        sio.wait()
    except Exception as e:
        print(f"Connection failed: {e}")
