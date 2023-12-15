def combineBoxes(boxes):
    '''
    take the least dimensions from several boxes like
        ['left', 'top', 'width', 'height']
    and return a new box like
        ['least_left', 'least_top', 'total_width', 'total_height']
    '''

    combine = boxes[:-1]
    text = boxes[-1]

    least_left = float('inf')
    least_top = float('inf')
    greatest_bottom = float('-inf')

    for i in range(len(combine)):

        left = int(combine[i][0])
        top = int(combine[i][1])
        width = int(combine[i][2])
        height = int(combine[i][3])
        bottom = top + height

        if left < least_left:
            least_left = left

        if top < least_top:
            least_top = top

        if bottom > greatest_bottom:
            greatest_bottom = bottom

        if i == len(combine) - 1:
            total_width = left - least_left + width
            total_height = greatest_bottom - least_top

    new_box = [least_left, least_top, total_width, total_height, text]

    return new_box


def parseArtists(string):
    '''
    Takes in a string of comma seperated artists and returns a list of artists like
        [["John","Batiste"],["Lil","Durk"],["the","Kid","Laroi"],...]
    '''
    artists = string.split(",")
    artists = [artist.split() for artist in artists]
    return artists

import unicodedata
import string

def normalize_string(s):
    """
    Normalize string by removing accents, converting to lowercase, and removing punctuation.
    """

    # Remove accents
    no_accents = ''.join(
        c for c in unicodedata.normalize('NFD', s)
        if unicodedata.category(c) != 'Mn'
    )

    # Remove punctuation
    no_punctuation = ''.join(
        c for c in no_accents
        if c not in string.punctuation
    )

    return no_punctuation.lower()

def compare_insensitive(str1, str2):
    """
    Compare two strings in a case-insensitive manner, also ignoring accents.
    """
    normalized_str1 = normalize_string(str1)
    normalized_str2 = normalize_string(str2)
    return normalized_str1 == normalized_str2

def findArtistBoxes(boxes, artist):
    '''
    Takes in list of boxes and one artist and returns the
    boxes that correspond to that artist
    '''
    full_name = " ".join(artist)
    artist_boxes = []
    first_name = artist[0]
    for k in range(len(boxes)):
        if compare_insensitive(boxes[k][-1], first_name):
            artist_boxes.append(boxes[k])
            for i in range(1, len(artist)):
                if compare_insensitive(boxes[k+i][-1], artist[i]):
                    artist_boxes.append(boxes[k+i])
                else:
                    artist_boxes = []
                    break
            if len(artist_boxes) == len(artist):
                artist_boxes.append(full_name)
                return artist_boxes

    return "Not Found"

def makeArtistBoxes(boxes, artists_string):
    '''
    Takes in list of boxes and a string of comma seperated artists and returns
    a list of boxes that correspond to the artists
    '''
    artists = parseArtists(artists_string)
    new_boxes = [findArtistBoxes(boxes, artist) for artist in artists]
    new_boxes = [box for box in new_boxes if box != "Not Found"]
    new_boxes = [combineBoxes(boxes) for boxes in new_boxes]
    return new_boxes
