import fresh_tomatoes
import media

Alien = media.Moive("Alien", "Alien lalal",
                    "http://www.scified.com/u/art-of-alien-covenant.jpg",
                    "https://youtu.be/u5KPP6lxRVg")
Kong = media.Moive("Kong", "Kong",
                   "https://upload.wikimedia.org/wikipedia/en/3/34/Kong_Skull_Island_poster.jpg",
                   "https://youtu.be/AP0-9FBs2Rs")

Beauty_and_the_beast = media.Moive("Beauty and the Beast", "Beauty and the Beast",
                                   "http://dx35vtwkllhj9.cloudfront.net/disney/beauty-and-the-beast/images/regions/gb/onesheet.jpg",
                                   "https://youtu.be/e3Nl_TCQXuw")

Movies = [Alien, Kong, Beauty_and_the_beast]
fresh_tomatoes.open_movies_page(Movies)