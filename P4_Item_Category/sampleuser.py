from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from users_db import Base, User

engine = create_engine('sqlite:///user.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


udacity = User(name = 'udacity')
udacity.hash_passward('udacity')
session.add(udacity)
session.commit()