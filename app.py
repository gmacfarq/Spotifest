
import os

from flask import Flask, request, request, jsonify, render_template
from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db
from PIL import Image
from boxes import get_boxes

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "postgresql:///blogly"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

app.config["SECRET_KEY"] = "a-very-big-secret"

connect_db(app)

@app.get('/')
def home():
    return render_template('base.html')

@app.post('/image')
def boxes():
    filestr = request.files['file'].read()
    #breakpoint()
    boxes = get_boxes(filestr)

    return jsonify({'msg': 'success', 'boxes': boxes})
