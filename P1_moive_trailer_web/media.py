import webbrowser

class Moive(object):
    def __init__(self, movie_title, moive_storyline, poster_image, trailer):
        self.title = movie_title
        self.storyline = moive_storyline
        self.poster_image_url = poster_image
        self.trailer_youtube_url = trailer

    def open_trailer(self):
        webbrowser.open(self.trailer_youtube_url)



