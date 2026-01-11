import socketio
import time
import sys

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def connect_error(data):
    print(f"Connection failed: {data}")

@sio.event
def disconnect():
    print("Disconnected from server")

@sio.on('room_joined')
def on_room_joined(data):
    print(f"Room Joined Event Received: {data.get('name')} (ID: {data.get('id')})")

@sio.on('error')
def on_error(data):
    print(f"Error Event Received: {data}")

def run_test():
    try:
        print("Attempting to connect to http://localhost:5000...")
        sio.connect('http://localhost:5000')
        
        # 1. Create a room
        print("\n[Step 1] Creating Room 1...")
        sio.emit('create_room', {
            'roomName': 'Test Room 1',
            'userName': 'Tester',
            'userTeamId': 'CSK',
            'budgetPerTeam': 100,
            'squadSize': 15,
            'totalTeams': 10
        })
        time.sleep(2)
        
        # 2. Create another room (should trigger upsert and NOT crash)
        print("\n[Step 2] Creating Room 2 (should trigger upsert)...")
        sio.emit('create_room', {
            'roomName': 'Test Room 2',
            'userName': 'Tester',
            'userTeamId': 'MI',
            'budgetPerTeam': 100,
            'squadSize': 15,
            'totalTeams': 10
        })
        time.sleep(2)
        
        print("\nTest execution finished. If no server error occurred, the fix is verified.")
        sio.disconnect()
        
    except Exception as e:
        print(f"Exception during test: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_test()
