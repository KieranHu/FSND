import fresh_tomatoes
import media


"""Create instance for moives"""

# Moive Alien
Alien = media.Moive(
	"Alien", "Alien lalal",
    "http://www.scified.com/u/art-of-alien-covenant.jpg",
    "https://youtu.be/u5KPP6lxRVg")
# Moive Kong: Skull Island
Kong = media.Moive(
	"Kong: Skull Island", "Kong",
    "https://upload.wikimedia.org/wikipedia/en/3/34/Kong_Skull_Island_poster.jpg",
    "https://youtu.be/AP0-9FBs2Rs")

# Moive Beauty and the beast
Beauty_and_the_beast = media.Moive(
	"Beauty and the Beast", "Beauty and the Beast",
    "http://dx35vtwkllhj9.cloudfront.net/disney/beauty-and-the-beast/images/regions/gb/onesheet.jpg",
    "https://youtu.be/e3Nl_TCQXuw")

"""Load moives information into pages."""

Movies = [Alien, Kong, Beauty_and_the_beast]
fresh_tomatoes.open_movies_page(Movies)