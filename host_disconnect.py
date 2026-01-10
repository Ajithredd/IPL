import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Host Connected")
    sio.emit('create_room', {
        'userName': 'HostBot',
        'roomName': 'MigrationTest',
        'budgetPerTeam': 100,
        'squadSize': 25,
        'totalTeams': 10,
        'userTeamId': 'CSK'
    })

@sio.event
def room_joined(data):
    print(f"ROOM_ID:{data['id']}", flush=True)

@sio.event
def room_updated(data):
    pass

@sio.event
def connect_error(data):
    print(f"Connection failed: {data}", flush=True)

@sio.event
def error(data):
    print(f"Error received: {data}", flush=True)

def main():
    sio.connect('http://localhost:5000')
    # Wait for room creation
    time.sleep(2)
    # Keep connection open for browser to join
    print("Waiting for browser to join...")
    time.sleep(15) 
    print("Host Disconnecting...")
    sio.disconnect()

if __name__ == '__main__':
    main()
