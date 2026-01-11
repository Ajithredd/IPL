import socketio
import time
import sys

sio = socketio.Client()

@sio.on('connect')
def on_connect():
    print('Connected to backend')
    # Create a room to trigger engine loading
    sio.emit('create_room', {
        'userName': 'ImageTester',
        'roomName': 'ImageTestRoom',
        'userTeamId': 'CSK',
        'budgetPerTeam': 100,
        'squadSize': 11,
        'totalTeams': 2
    })

@sio.on('room_joined')
def on_room_joined(data):
    print(f"Room joined: {data['id']}")
    # Start auction to get a player
    sio.emit('start_auction', data['id'])

@sio.on('new_player')
def on_new_player(data):
    print(f"Received player: {data['name']}")
    print(f"Image URL: {data['img']}")
    
    expected_base = "https://ipl-stats-sports-mechanic.s3.ap-south-1.amazonaws.com/ipl/playerimages/"
    if data['img'].startswith(expected_base):
        print("SUCCESS: Image URL matches new S3 bucket format.")
    else:
        print("FAILURE: Image URL does not match expected format.")
    
    sio.disconnect()
    sys.exit(0)

@sio.on('error')
def on_error(data):
    print(f"Error: {data}")
    sio.disconnect()
    sys.exit(1)

if __name__ == '__main__':
    try:
        sio.connect('http://localhost:5000')
        sio.wait()
    except Exception as e:
        print(f"Connection failed: {e}")
