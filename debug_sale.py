import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def room_joined(data):
    print(f"Room Joined: {data['id']}")
    # Start auction after joining
    print("Starting auction...")
    sio.emit('start_auction', data['id'])

@sio.event
def new_player(data):
    print(f"New Player: {data['name']} (Base: {data['basePrice']})")
    # Place a bid
    print("Placing bid...")
    sio.emit('place_bid', {'roomId': 'SALE01', 'amount': data['basePrice'] + 25})

@sio.event
def bid_update(data):
    print(f"Bid Update: {data['amount']} by {data['teamId']}")
    # Wait for timer to end (simulate host trigger)
    time.sleep(2) 
    print("Emitting timer_ended...")
    sio.emit('timer_ended', {'roomId': 'SALE01'})

@sio.event
def player_sold(data):
    print(f"SOLD: {data['player']['name']} to {data['winner']['teamId']} for {data['amount']}")
    
    # Verify Stats
    winner_team = data['winner']['teamId']
    stats = data['teamStats'].get(winner_team)
    if stats:
        print(f"Winner Stats - Budget: {stats['budget']}, Squad Size: {len(stats['squad'])}")
    else:
        print("Winner stats not found!")
    
    sio.disconnect()

def main():
    sio.connect('http://localhost:5000')
    
    # Create Room with specific ID if possible, but we can't force ID.
    # We'll rely on the flow.
    # Actually, we need to capture the room ID from creation.
    
    # Monkey patch emit to capture room ID? No, just use the flow.
    
    print("Creating room...")
    sio.emit('create_room', {
        'userName': 'BuyerBot',
        'roomName': 'SaleRoom',
        'budgetPerTeam': 100,
        'squadSize': 25,
        'totalTeams': 10,
        'userTeamId': 'RCB'
    })

    sio.wait()

# We need to handle the dynamic room ID.
# The room_joined event gives us the ID.
# But we need to pass it to place_bid.
# Let's use a global variable or class.

class AuctionTester:
    def __init__(self):
        self.sio = socketio.Client()
        self.room_id = None
        self.setup_events()

    def setup_events(self):
        @self.sio.event
        def connect():
            print("Connected")

        @self.sio.event
        def room_joined(data):
            self.room_id = data['id']
            print(f"Room Joined: {self.room_id}")
            print("Starting auction...")
            self.sio.emit('start_auction', self.room_id)

        @self.sio.event
        def new_player(data):
            print(f"New Player: {data['name']}")
            print("Placing bid...")
            self.sio.emit('place_bid', {'roomId': self.room_id, 'amount': data['basePrice'] + 25})

        @self.sio.event
        def bid_update(data):
            print(f"Bid Update: {data['amount']}")
            time.sleep(2)
            print("Emitting timer_ended...")
            self.sio.emit('timer_ended', {'roomId': self.room_id})

        @self.sio.event
        def player_sold(data):
            print(f"SOLD: {data['player']['name']} for {data['amount']}")
            winner = data['winner']['teamId']
            stats = data['teamStats'][winner]
            print(f"Winner Budget: {stats['budget']}")
            print(f"Winner Squad: {len(stats['squad'])}")
            self.sio.disconnect()

    def run(self):
        self.sio.connect('http://localhost:5000')
        self.sio.emit('create_room', {
            'userName': 'BuyerBot',
            'roomName': 'SaleRoom',
            'budgetPerTeam': 100,
            'squadSize': 25,
            'totalTeams': 10,
            'userTeamId': 'RCB'
        })
        self.sio.wait()

if __name__ == '__main__':
    AuctionTester().run()
