import socketio
import time
import sys

sio = socketio.Client()
BASE_URL = 'http://localhost:5000'
ROOM_ID = sys.argv[1]

@sio.on('room_joined')
def on_room_joined(data):
    if data['id'] == ROOM_ID:
        print("SUCCESS")
        sio.disconnect()
        sys.exit(0)

@sio.on('error')
def on_error(data):
    print("FAILED")
    sio.disconnect()
    sys.exit(1)

try:
    sio.connect(BASE_URL)
    sio.emit('join_room', {
        'roomId': ROOM_ID,
        'userName': 'Step2User',
        'teamId': 'MI'
    })
    sio.wait()
except Exception as e:
    print(e)
    sys.exit(1)
