import socketio
import time
import sys

sio = socketio.Client()
BASE_URL = 'http://localhost:5000'

@sio.on('room_joined')
def on_room_joined(data):
    print(f"ROOM_ID:{data['id']}")
    sio.disconnect()
    sys.exit(0)

try:
    sio.connect(BASE_URL)
    sio.emit('create_room', {
        'roomName': 'Step1Room',
        'userName': 'Step1User',
        'totalTeams': 2,
        'budgetPerTeam': 100,
        'squadSize': 15,
        'userTeamId': 'CSK'
    })
    sio.wait()
except Exception as e:
    print(e)
    sys.exit(1)
