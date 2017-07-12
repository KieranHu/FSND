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


Abyssinian_cat = Items(name = 'Abyssinian cat', description = 'The Abyssinian cat as it is known today was bred in Great Britain. '
                                                    'The name Abyssinian refers to Ethiopia, in reference to widely-spread '
                                                    'stories of British soldiers deployed to North Africa '
                                                    'in the nineteenth century returning home with kittens '
                                                    'purchased from local traders. Despite its temperment, '
                                                    'this breed has a charming history.',
                       catename='cat', item=cat)
session.add(Abyssinian_cat)
session.commit()

Peterbald = Items(name = 'Peterbald', description = 'Peterbalds resemble Oriental Shorthairs. They have a hair-losing '
                                                    'gene and can be born bald, flocked, velour, brush, or with a '
                                                    'straight coat. Those born with hair, excepting the straight-coats, '
                                                    'can lose their hair over time. They come in all colors and markings.',
                  catename='cat', item = cat)
session.add(Peterbald)
session.commit()

dog = Category(name = 'dog')
session.add(dog)
session.commit()

Husky = Items(name = 'Husky', description = 'Husky is a general name for a sled-type of dog used in northern regions, '
                                            'differentiated from other sled-dog types by their fast pulling style. '
                                            'They are an ever-changing cross-breed of the fastest dogs.',
              catename='dog', item=dog)
session.add(Husky)
session.commit()

Golden_Retriever = Items(name = 'Golden Retriever', description = 'The Golden Retriever is a large-sized breed of dog '
                                                                  'bred as gun dogs to retrieve shot waterfowl such as'
                                                                  ' ducks and upland game birds during hunting and '
                                                                  'shooting parties,[3] and were named retriever '
                                                                  'because of their ability to retrieve shot game '
                                                                  'undamaged. ',
                         catename='dog', item=dog)

session.add(Golden_Retriever)
session.commit()


print (session.query(Items).all())