import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from backend.app import app, db, Room

with app.app_context():
    rooms = Room.query.all()
    for room in rooms:
        print(f"Room: {room.id}, Name: {room.name}, Status: {room.status}", flush=True)
