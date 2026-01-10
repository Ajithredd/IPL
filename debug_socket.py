import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def room_joined(data):
    print(f"Room Joined: {data}")
    # Start auction after joining
    print("Starting auction...")
    sio.emit('start_auction', data['id'])

@sio.event
def room_updated(data):
    print(f"Room Updated: {data['status']}")

@sio.event
def new_player(data):
    print(f"New Player Received: {data['name']}")
    sio.disconnect()

@sio.event
def disconnect():
    print("Disconnected")

def main():
    sio.connect('http://localhost:5000')
    
    # Create Room
    print("Creating room...")
    sio.emit('create_room', {
        'userName': 'DebugBot',
        'roomName': 'DebugRoom',
        'budgetPerTeam': 100,
        'squadSize': 25,
        'totalTeams': 10,
        'userTeamId': 'CSK'
    })

    sio.wait()

if __name__ == '__main__':
    main()
