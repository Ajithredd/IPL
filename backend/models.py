from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import json

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class Room(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='LOBBY') # LOBBY, AUCTION
    budget_per_team = db.Column(db.Integer, default=100)
    squad_size = db.Column(db.Integer, default=15)
    playing_squad_size = db.Column(db.Integer, default=11)
    result_metric = db.Column(db.String(20), default='overall') # overall, 2024, 2025
    total_teams = db.Column(db.Integer, default=10)
    
    # Relationships
    users = db.relationship('User', backref='room', lazy=True)
    team_states = db.relationship('TeamState', backref='room', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status,
            'budgetPerTeam': self.budget_per_team,
            'squadSize': self.squad_size,
            'playingSquadSize': self.playing_squad_size,
            'resultMetric': self.result_metric,
            'totalTeams': self.total_teams,
            'users': [u.to_dict() for u in self.users]
        }

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True) # Socket/Session ID
    name = db.Column(db.String(50), nullable=False)
    room_id = db.Column(db.String(10), db.ForeignKey('room.id'), nullable=False)
    team_id = db.Column(db.String(10), nullable=True) # e.g. CSK, MI
    is_host = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'roomId': self.room_id,
            'teamId': self.team_id,
            'isHost': self.is_host
        }

class TeamState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(10), db.ForeignKey('room.id'), nullable=False)
    team_id = db.Column(db.String(10), nullable=False)
    budget = db.Column(db.Integer, default=0)
    squad_json = db.Column(db.Text, default='[]') # Store list of sold players as JSON string
    
    def to_dict(self):
        return {
            'budget': self.budget,
            'squad': json.loads(self.squad_json)
        }

# We might persist specific auction state (current player etc) later, 
# for now Room/User/Team persistence covers the big restart risks (losing who is in the room and what they bought).
