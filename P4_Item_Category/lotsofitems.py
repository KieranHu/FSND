from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from items_db import Base, Category,Items


engine = create_engine('sqlite:///item.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


cat = Category(name = 'cat')
session.add(cat)
session.commit()


