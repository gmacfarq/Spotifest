import os

from flask import Flask, request, request, jsonify, render_template
from flask_debugtoolbar import DebugToolbarExtension
from flask_cors import CORS
from models import connect_db, db
from boxes import get_boxes
from openAIinterface import artists_from_image
from zipcodeAPI import get_location
from getSpotifyToken import get_token
from processArtists import makeArtistBoxes
from models import Artist, Festival, Act, connect_db, db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "postgresql:///festy"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

app.config["SECRET_KEY"] = "a-very-big-secret"

CORS(app, resources={r"/*": {"origins": "http://localhost:5500"}})

connect_db(app)


@app.get("/")
def home():
    """renders homepage"""

    return render_template("base.html")


@app.post("/image")
async def send_boxes():
    """
    accepts multipart/form data image in request
    sends list of boxes and image dimensions in response
    """

    file = request.files["file"].read()
    artists = await artists_from_image(file)
    artists_string = artists["content"]

    # filename = str(request.files["file"]).split()[1][1:-1]
    boxes, dim = get_boxes(file)

    # file.save(f'static/images/{filename}')
    newboxes = makeArtistBoxes(boxes, artists_string)

    # print(newboxes)

    return jsonify({"msg": "success", "boxes": newboxes, "dim": dim})


@app.get("/spotifyauth")
async def send_token():
    """
    accepts code in request
    sends access token in response
    """
    return jsonify(get_token())


@app.post("/festival")
def add_festival():
    """
    accepts festival and artist data in request
    adds festival and artist data to database
    returns success message
    """

    data = request.json
    print(data)

    zipcode = data["zipcode"]

    festival = Festival(
        name=data["name"],
        date=data["date"],
        location= get_location(zipcode),
        zipcode=zipcode,
        website=data["website"],
        image=data["image"],
    )

    db.session.add(festival)
    db.session.commit()

    for artist in data["artists"]:
        existing_artist = Artist.query.filter_by(spotify_id=artist["spotifyid"]).first()
        if existing_artist:
            act = Act(artist_id=existing_artist.id, event_id=festival.id)
            db.session.add(act)
            db.session.commit()
        else:
            new_artist = Artist(
                name=artist["name"],
                spotify_id=artist["spotifyid"],
                popularity=artist["popularity"],
            )
            db.session.add(new_artist)
            db.session.commit()
            act = Act(artist_id=new_artist.id, event_id=festival.id)
            db.session.add(act)
            db.session.commit()

    return jsonify({"msg": "success"})
