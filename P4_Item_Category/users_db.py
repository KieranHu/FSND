from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from passlib.apps import custom_app_context

Base = declarative_base()

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(32), nullable=False, index=True)
    passward_hash= Column(String(64), nullable=False)

    def hash_passward(self, passward):
        self.passward_hash = custom_app_context.encrypt(passward)

    def verify_password(self, passward):
        return custom_app_context.verify(passward, self.passward_hash)

engine = create_engine('sqlite:///user.db')
Base.metadata.create_all(engine)