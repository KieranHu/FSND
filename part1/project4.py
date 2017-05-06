import os
import urllib

print (os.getcwd())

def read_text():
    qutoes = open("/Users/Kieran/Documents/FSND/part1/movie_quotes.txt")
    file = qutoes.read()
    print(file)
    qutoes.close()
    check_profanity(file)


def check_profanity(text):
    connect = urllib.urlopen(" http://www.wdylike.appspot.com/?q=" + text)
    output = connect.read()
    print(output)
    connect.close()

read_text()
