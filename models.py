from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def connect_db(app):
    """Connect to database."""
    app.app_context().push()
    db.app = app
    db.init_app(app)
