import socketio
import time
import sys
import requests
import subprocess
import os

# Configuration
BASE_URL = 'http://localhost:5000'
sio = socketio.Client()
ROOM_CODE = None

@sio.on('room_joined')
def on_room_joined(data):
    global ROOM_CODE
    ROOM_CODE = data['id']
    print(f"[Client] Room Created/Joined: {ROOM_CODE}")

def restart_server():
    print("[Test] Restarting Backend Server...")
    # Kill existing
    subprocess.run(["powershell", "Get-Process python | Stop-Process -Force"], capture_output=True)
    time.sleep(2)
    # Start new (detached)
    subprocess.Popen(["python", "backend/app.py"], cwd=os.getcwd(), shell=True)
    time.sleep(5) # Wait for startup
    print("[Test] Server Restarted.")

def run_test():
    global ROOM_CODE
    try:
        # 1. Create Data
        print("[Test] Step 1: Connecting to create room...")
        sio.connect(BASE_URL)
        sio.emit('create_room', {
            'roomName': 'PersistenceTest',
            'userName': 'PersistUser',
            'totalTeams': 2,
            'budgetPerTeam': 100,
            'squadSize': 15,
            'userTeamId': 'CSK'
        })
        time.sleep(2)
        
        if not ROOM_CODE:
            print("FAILED: Room creation failed")
            return

        old_room = ROOM_CODE
        sio.disconnect()
        
        # 2. Restart Server
        restart_server()
        
        # 3. Verify Data Exists
        print(f"[Test] Step 3: Verifying Room {old_room} still exists...")
        # Since we don't have a REST API, we try to Join the room via Socket
        sio2 = socketio.Client()
        
        found = [False]
        @sio2.on('room_joined')
        def verify_join(data):
            if data['id'] == old_room:
                print(f"[Success] Successfully rejoined saved room {data['id']}")
                found[0] = True

        @sio2.on('error')
        def on_error(msg):
            print(f"[Error] {msg}")

        sio2.connect(BASE_URL)
        sio2.emit('join_room', {
            'roomId': old_room,
            'userName': 'Checker',
            'teamId': 'MI'
        })
        time.sleep(2)
        sio2.disconnect()
        
        if found[0]:
            print("SUCCESS: Persistence Verified!")
            sys.exit(0)
        else:
            print("FAILED: Could not find room after restart.")
            sys.exit(1)

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_test()
