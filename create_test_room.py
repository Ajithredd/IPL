import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def room_joined(data):
    print(f"ROOM_ID:{data['id']}", flush=True)
    print("Waiting for 60s...", flush=True)
    time.sleep(60)
    sio.disconnect()

def main():
    sio.connect('http://localhost:5000')
    
    print("Creating room...")
    sio.emit('create_room', {
        'userName': 'TestHost',
        'roomName': 'JoinUITest',
        'budgetPerTeam': 100,
        'squadSize': 25,
        'totalTeams': 10,
        'userTeamId': 'CSK'
    })

    sio.wait()

if __name__ == '__main__':
    main()
