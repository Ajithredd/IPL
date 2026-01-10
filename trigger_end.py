import socketio
import sys

sio = socketio.Client()
room_id = sys.argv[1] if len(sys.argv) > 1 else '5FJG04' # Default to previous test room if available

@sio.event
def connect():
    print("Connected to server")
    print(f"Joining room {room_id}...")
    sio.emit('join_room', {'roomId': room_id, 'userName': 'Terminator'})

@sio.event
def room_joined(data):
    print(f"Joined room {room_id}. Ending auction...")
    sio.emit('end_auction', {'roomId': room_id})
@sio.event
def auction_ended(data):
    print("Received auction_ended event!")
    sio.disconnect()

def main():
    sio.connect('http://localhost:5000')
    sio.wait()

if __name__ == '__main__':
    main()
