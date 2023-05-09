from flask_sqlalchemy import SQLAlchemy
import os

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
        db.String(80),
        nullable=False
    )

    events = db.relationship("Event", secondary="acts", backref="artists")
    acts = db.relationship("Act", backref="artist")


class Event(db.Model):
    """Class representing a musical event e.g. Coachella"""

    __tablename__ = "events"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(80),
        nullable=False
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
        db.ForeignKey('events.id'),
        primary_key=True
    )

    dim_bottom = db.Column(
        db.Integer,
        nullable=False
    )