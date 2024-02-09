from flask_sqlalchemy import SQLAlchemy

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

def connect_db(app):
    """Connect this database to provided Flask app.

    You should call this in your Flask app.
    """

    app.app_context().push()
    db.app = app
    db.init_app(app)