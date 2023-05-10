
import os

from flask import Flask, request, request, jsonify, render_template
from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db
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
    """renders homepage"""

    return render_template('base.html')

@app.post('/image')
def send_boxes():
    """
        accepts multipart/form data image in request
        sends list of boxes and image dimensions in response
    """

    file = request.files['file'].read()

    #filename = str(request.files["file"]).split()[1][1:-1]
    boxes, dim = get_boxes(file)
    #file.save(f'static/images/{filename}')

    return jsonify({'msg': 'success', 'boxes': boxes, 'dim':dim})

@app.get('/auth')
def get_token():
    """request to spotify API to get new auth token"""
    return