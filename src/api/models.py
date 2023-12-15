from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


# Representa un usuario el cual puede ejecutar varios eventos
# para procesar documentos
class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema' : 'gramas'}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False) 
    created_at = db.Column(db.DateTime(), nullable=False, default=db.func.current_timestamp())
    
    @classmethod
    def create(cls, username):
        user = User(username=username)
        return user.save()

    def save(self):
        try:
            db.session.add(self)
            db.session.commit()

            return self
        except:
            return False
        
    def json(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at
        }
    
    def update(self):
        self.save()
    
    def delete(self):
        try:
            db.session.delete(self)
            db.session.commit()

            return True
        except:
            return False
        
# Esta clase representa el model del evento para procesar documentos
# y al final aplicarle los procedimientos de genración de ngramas
class Event(db.Model):
    __tablename__ = 'events'
    __table_args__ = {'schema' : 'gramas'}

    id = db.Column(db.Integer, primary_key=True)
    documento = db.Column(db.String(50), nullable=False) 
    created_at = db.Column(db.DateTime(), nullable=False, default=db.func.current_timestamp())

