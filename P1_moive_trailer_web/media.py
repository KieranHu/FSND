import webbrowser

class Moive(object):
    def __init__(self, movie_title, moive_storyline, poster_image, trailer):
    	"""
    	inputs : movie title, moive storyline, 
    	poster image's url, trailer's url
    	"""
    	
        self.title = movie_title
        self.storyline = moive_storyline
        self.poster_image_url = poster_image
        self.trailer_youtube_url = trailer

    def open_trailer(self): # open trailer's webpage
        webbrowser.open(self.trailer_youtube_url)



