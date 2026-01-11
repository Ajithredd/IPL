import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import random
import string
import os
import json
import logging
from .auction_engine import AuctionEngine
from .models import db, Room, User, TeamState
from .points_calculator import calculate_team_points

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'secret!')

database_url = os.environ.get('DATABASE_URL', 'sqlite:///auction.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Fix for Eventlet + SQLAlchemy locking issue
from sqlalchemy.pool import NullPool
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'poolclass': NullPool
}

# Handle CORS
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
CORS(app, resources={r"/*": {"origins": cors_origins}})
socketio = SocketIO(app, cors_allowed_origins=cors_origins)

db.init_app(app)

with app.app_context():
    db.create_all()

# Global dictionary to store active auction engines
auction_engines = {}

connected_users = {} 
room_post_auction_data = {} # { room_id: { team_id: { points: 0, squad: [] } } } 

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@app.route('/')
def index():
    return "IPL Auction Backend Running"

@app.route('/api/room/<room_id>')
def get_room_details(room_id):
    room = Room.query.get(room_id)
    if not room:
        return {'exists': False}, 404
    
    # Get taken teams
    users = User.query.filter_by(room_id=room_id).all()
    taken_teams = [u.team_id for u in users if u.team_id]
    
    return {
        'exists': True,
        'takenTeams': taken_teams,
        'status': room.status
    }

@socketio.on('connect')
def handle_connect():
    print('Client connected:', request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected:', request.sid)

@socketio.on('create_room')
def on_create_room(data):
    try:
        print(f"[CREATE_ROOM] Received: {data}", flush=True)
        room_code = generate_room_code()
        # Simple conflict check
        while Room.query.get(room_code):
            room_code = generate_room_code()

        print(f"[CREATE_ROOM] Generated room code: {room_code}", flush=True)

        # Create Room DB Entry
        new_room = Room(
            id=room_code,
            name=data['roomName'],
            status='LOBBY',
            budget_per_team=data['budgetPerTeam'],
            squad_size=data['squadSize'],
            playing_squad_size=data.get('playingSquadSize', 11),
            result_metric=data.get('resultMetric', 'overall'),
            total_teams=data['totalTeams']
        )
        db.session.add(new_room)
        
        print(f"[CREATE_ROOM] Room object created", flush=True)
        
        # Create Host User
        # Check if user already exists
        host_user = User.query.get(request.sid)
        if host_user:
            # Update existing user
            host_user.name = data['userName']
            host_user.room_id = room_code
            host_user.team_id = data['userTeamId']
            host_user.is_host = True
        else:
            # Create new user
            host_user = User(
                id=request.sid,
                name=data['userName'],
                room_id=room_code,
                team_id=data['userTeamId'],
                is_host=True
            )
            db.session.add(host_user)
        
        print(f"[CREATE_ROOM] User object created", flush=True)
        
        # Initialize basic team state for the host's team
        if data['userTeamId']:
            ts = TeamState(
                room_id=room_code, 
                team_id=data['userTeamId'], 
                budget=data['budgetPerTeam'] * 100
            )
            db.session.add(ts)

        db.session.commit()
        print(f"[CREATE_ROOM] Database committed", flush=True)
        
        # Initialize Engine (In-memory for active loop)
        # Ideally Engine should also verify DB state on init
        auction_engines[room_code] = AuctionEngine(room_code, new_room.to_dict(), socketio, app) # Pass app context

        join_room(room_code)
        
        # Store connection info for Host
        connected_users[request.sid] = {
            'room_id': room_code, 
            'user_name': data['userName'], 
            'team_id': data['userTeamId']
        }
        
        print(f"Room {room_code} created by {data['userName']}", flush=True)
        room_dict = new_room.to_dict()
        print(f"[CREATE_ROOM] Emitting room_joined: {room_dict}", flush=True)
        emit('room_joined', room_dict)
        print(f"[CREATE_ROOM] Emit complete", flush=True)
    except Exception as e:
        print(f"[CREATE_ROOM] ERROR: {e}", flush=True)
        import traceback
        traceback.print_exc()
        emit('error', str(e))

@socketio.on('join_room')
def on_join_room(data):
    room_id = data['roomId']
    user_name = data['userName']
    team_id = data.get('teamId')

    room = Room.query.get(room_id)
    if not room:
        emit('error', 'Room not found')
        return

    # Check if user exists (simple session update logic or new user)
    existing_user = User.query.get(request.sid)
    if existing_user:
        existing_user.name = user_name
        existing_user.room_id = room_id
        existing_user.team_id = team_id
        existing_user.is_host = False
    else:
        new_user = User(
            id=request.sid,
            name=user_name,
            room_id=room_id,
            team_id=team_id,
            is_host=False
        )
        db.session.add(new_user)
    
    # Store connection info for tracking
    connected_users[request.sid] = {
        'room_id': room_id, 
        'user_name': user_name, 
        'team_id': team_id
    }
    
    # Init Team State if new team
    if team_id:
        existing_ts = TeamState.query.filter_by(room_id=room_id, team_id=team_id).first()
        if not existing_ts:
            ts = TeamState(
                room_id=room_id, 
                team_id=team_id, 
                budget=room.budget_per_team * 100
            )
            db.session.add(ts)
            
    db.session.commit()

    join_room(room_id)
    print(f"User {user_name} joined room {room_id}")
    
    room_dict = room.to_dict()
    emit('room_joined', room_dict, to=request.sid) 
    emit('room_updated', room_dict, to=room_id, include_self=False)

@socketio.on('start_auction')
def on_start_auction(room_id):
    room = Room.query.get(room_id)
    if room:
        room.status = 'AUCTION'
        db.session.commit()
        
        emit('room_updated', room.to_dict(), to=room_id)
        
        # Give clients time to redirect
        socketio.sleep(2)
        
        # Trigger first player
        # Ensure engine is loaded (in case of server restart)
        if room_id not in auction_engines:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)

        engine = auction_engines.get(room_id)
        if engine:
            print(f"[App] Engine found for {room_id}")
            player = engine.get_next_player()
            if player:
                print(f"[App] Emitting new_player: {player['name']}")
                emit('new_player', player, to=room_id)
            else:
                print(f"[App] No players returned from engine!")
        
        print(f"Auction started in room {room_id}")

@socketio.on('place_bid')
def on_place_bid(data):
    # data: { roomId, amount }
    room_id = data['roomId']
    amount = data['amount']
    
    room = Room.query.get(room_id)
    if not room: return

    # Verify User
    user = User.query.get(request.sid)
    if not user or user.room_id != room_id: return

    # Ensure engine
    if room_id not in auction_engines:
         auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)

    engine = auction_engines.get(room_id)
    if engine:
        success, message = engine.place_bid(user.id, user.team_id, amount)
        if success:
            emit('bid_update', {
                'amount': amount,
                'teamId': user.team_id,
                'bidderName': user.name
            }, to=room_id)
        else:
            emit('error', message, to=request.sid)

@socketio.on('timer_ended')
def on_timer_ended(data):
    room_id = data['roomId']
    
    if room_id not in auction_engines:
        room = Room.query.get(room_id)
        if room:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)
    
    engine = auction_engines.get(room_id)
    if not engine: return
    
    if engine.state == 'ACTIVE':
        # Check if there is a bidder
        if engine.current_bidder:
            result = engine.sell_current_player()
            if result.get('status') == 'UNSOLD':
                emit('player_unsold', result, to=room_id)
            else:
                emit('player_sold', result, to=room_id)
        else:
            result = engine.pass_unsold_player()
            emit('player_unsold', result, to=room_id)
        
        # Auto-Next Logic
        socketio.sleep(5)
        
        # Trigger next player
        player = engine.get_next_player()
        if player:
            print(f"[App] Auto-Next: Emitting new_player: {player['name']}")
            emit('new_player', player, to=room_id)
        else:
            print(f"[App] Auto-Next: No more players.")
            # Optional: Emit auction ended

@socketio.on('get_auction_state')
def on_get_auction_state(data):
    room_id = data['roomId']
    print(f"[App] get_auction_state request for {room_id}")
    if room_id not in auction_engines:
        room = Room.query.get(room_id)
        if room:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)
    
    if room_id in auction_engines:
        engine = auction_engines[room_id]
        state = engine.get_state()
        print(f"[App] Sending state: Current Player={state.get('currentPlayer', {}).get('name')}")
        emit('auction_state', state, to=request.sid)

@socketio.on('pause_auction')
def on_pause_auction(data):
    room_id = data.get('roomId')
    if room_id not in auction_engines:
        room = Room.query.get(room_id)
        if room:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)
    
    if room_id in auction_engines:
        engine = auction_engines[room_id]
        if engine.pause_auction():
            emit('auction_paused', {}, to=room_id)

@socketio.on('resume_auction')
def on_resume_auction(data):
    room_id = data.get('roomId')
    if room_id not in auction_engines:
        room = Room.query.get(room_id)
        if room:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)

    if room_id in auction_engines:
        engine = auction_engines[room_id]
        if engine.resume_auction():
            emit('auction_resumed', {}, to=room_id)

@socketio.on('end_auction')
def on_end_auction(data):
    room_id = data.get('roomId')
    print(f"[App] End Auction requested for {room_id}", flush=True)
    if room_id not in auction_engines:
        print(f"[App] Engine not found for {room_id}, attempting lazy load...", flush=True)
        room = Room.query.get(room_id)
        if room:
             auction_engines[room_id] = AuctionEngine(room_id, room.to_dict(), socketio, app)
             print(f"[App] Engine loaded for {room_id}", flush=True)
        else:
             print(f"[App] Room {room_id} not found in DB!", flush=True)

    if room_id in auction_engines:
        engine = auction_engines[room_id]
        engine.end_auction()
        print(f"[App] Emitting auction_ended for {room_id}", flush=True)
        
        # Update Room Status
        room = Room.query.get(room_id)
        if room:
            room.status = 'POST_AUCTION'
            db.session.commit()
            emit('room_updated', room.to_dict(), to=room_id)
            
        emit('auction_ended', {}, to=room_id)

@socketio.on('submit_squad')
def on_submit_squad(data):
    room_id = data['roomId']
    team_id = data['teamId']
    selected_player_ids = data['playerIds']
    
    print(f"[App] submit_squad: {team_id} in {room_id} with {len(selected_player_ids)} players")
    
    # Load players to get points
    # In a real app, use a DB or cached service
    with open('backend/data/players.json', 'r') as f:
        all_players = json.load(f)
    
    # Validate Squad Size
    room = Room.query.get(room_id)
    if not room: return
    
    if len(selected_player_ids) != room.playing_squad_size:
        emit('error', f'You must select exactly {room.playing_squad_size} players.', to=request.sid)
        return

    team_players = [p for p in all_players if p['id'] in selected_player_ids]
    result = calculate_team_points(team_players, metric=room.result_metric)
    
    if room_id not in room_post_auction_data:
        room_post_auction_data[room_id] = {}
        
    room_post_auction_data[room_id][team_id] = {
        'points': result['total_points'],
        'breakdown': result['breakdown'],
        'squad': selected_player_ids
    }
    
    # Emit updated table
    emit_points_table(room_id)

def emit_points_table(room_id):
    if room_id not in room_post_auction_data: return
    
    data = room_post_auction_data[room_id]
    # Convert to list and sort
    # data is { team_id: { points, ... } }
    
    ranking = []
    for tid, info in data.items():
        ranking.append({
            'teamId': tid,
            'points': info['points']
        })
    
    # Sort descending
    ranking.sort(key=lambda x: x['points'], reverse=True)
    
    emit('points_table_update', ranking, to=room_id)

@socketio.on('get_points_table')
def on_get_points_table(data):
    room_id = data['roomId']
    emit_points_table(room_id)

@socketio.on('disconnect')
def on_disconnect(*args):
    logging.info(f"[App] Client disconnected: {request.sid}")
    logging.info(f"[App] Connected users: {connected_users}")
    
    if request.sid in connected_users:
        user_info = connected_users[request.sid]
        room_id = user_info['room_id']
        user_name = user_info['user_name']
        logging.info(f"[App] User {user_name} disconnected from {room_id}")
        
        # Host Migration Logic
        room = Room.query.get(room_id)
        if room:
            disconnected_user = next((u for u in room.users if u.name == user_name), None)
            
            if disconnected_user and disconnected_user.is_host:
                logging.info(f"[App] Host {user_name} left. Migrating host...")
                remaining_users = [u for u in room.users if u.id != disconnected_user.id]
                if remaining_users:
                    new_host = remaining_users[0]
                    # room.host_id = new_host.id # Room has no host_id column
                    
                    # Update users list (modify objects directly)
                    for u in room.users:
                        if u.id == new_host.id:
                            u.is_host = True
                        else:
                            u.is_host = False
                    
                    db.session.commit()
                    
                    logging.info(f"[App] New host is {new_host.name}")
                    emit('room_updated', room.to_dict(), to=room_id)
                else:
                    logging.info("[App] No users left to be host.")
            
        del connected_users[request.sid]

@socketio.on('leave_room')
def on_leave_room():
    # Handle explicit leave
    pass

if __name__ == '__main__':
    socketio.run(app, debug=False, port=5000)


