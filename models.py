from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


def connect_db(app):
    """Connect to database."""
    app.app_context().push()
    db.app = app
    db.init_app(app)


class Artist(db.Model):
    """Class representing a single artist e.g. Mac Miller <3"""

    __tablename__ = "artists"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    name = db.Column(
        db.String(60),
        nullable=False
    )

    spotify_id = db.Column(
        db.String(180),
        nullable=False,
        unique=True
    )

    popularity = db.Column(
        db.Integer,
        nullable=False
    )

    festivals = db.relationship("Festival", secondary="acts", backref="artists")


class Festival(db.Model):
    """Class representing a musical festival e.g. Coachella"""

    __tablename__ = "festivals"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(80),
        nullable=False
    )

    date = db.Column(
        db.Date,
        nullable=False
    )

    zipcode = db.Column(
        db.Integer,
        nullable=True
    )

    location = db.Column(
        db.String(80),
        nullable=True
    )

    website = db.Column(
        db.String(180),
        nullable=True
    )

    image = db.Column(
        db.String(255),
        nullable=True
    )


class Act(db.Model):
    """Class representing a performance of an artist at an event"""

    __tablename__ = "acts"

    artist_id = db.Column(
        db.Integer,
        db.ForeignKey('artists.id'),
        primary_key=True
    )

    event_id = db.Column(
        db.Integer,
        db.ForeignKey('festivals.id'),
        primary_key=True
    )

class User(db.Model):
    """Class representing a user of the app"""

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(180),
        nullable=False,
    )

    spotify_user_id = db.Column(
        db.String(180),
        nullable=False
    )

    created_at = db.Column(
        db.String(180),
        nullable=False,
        default=datetime.now(
            timezone.utc
        )
    )

class Playlist(db.Model):
    """Class representing a playlist created by a user"""

    __tablename__ = "playlists"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    name = db.Column(
        db.String(180),
        nullable=False
    )

    playlist_spotify_id = db.Column(
        db.String(180),
        nullable=False
    )

    created_at = db.Column(
        db.String(180),
        nullable=False,
        default=datetime.now(
            timezone.utc
        )
    )

    user = db.relationship("User", backref="playlists")

class Track(db.Model):
    """Class representing a track"""

    __tablename__ = "tracks"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    track_spotify_id = db.Column(
        db.String(180),
        nullable=False
    )

    artist_id = db.Column(
        db.Integer,
        db.ForeignKey('artists.id'),
        nullable=False
    )

    date_added = db.Column(
        db.String(180),
        nullable=False,
        default=datetime.now(
            timezone.utc
        )
    )

    artist = db.relationship("Artist", backref="tracks")

def connect_db(app):
    """Connect this database to provided Flask app.

    You should call this in your Flask app.
    """

    app.app_context().push()
    db.app = app
    db.init_app(app)