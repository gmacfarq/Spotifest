
import os

from flask import Flask, request, request, jsonify, render_template
from flask_debugtoolbar import DebugToolbarExtension
from flask_cors import CORS
from models import connect_db, db
from boxes import get_boxes
from openAIinterface import artists_from_image
from processArtists import makeArtistBoxes, findArtistBoxes

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "postgresql:///blogly"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True

app.config["SECRET_KEY"] = "a-very-big-secret"

CORS(app, resources={r"/*": {"origins": "http://localhost:8000"}})

connect_db(app)

@app.get('/')
def home():
    """renders homepage"""

    return render_template('base.html')

@app.post('/image')
async def send_boxes():
    """
        accepts multipart/form data image in request
        sends list of boxes and image dimensions in response
    """

    file = request.files['file'].read()
    artists = await artists_from_image(file)
    artists_string = artists["content"]






    #filename = str(request.files["file"]).split()[1][1:-1]
    boxes, dim = get_boxes(file)

    #file.save(f'static/images/{filename}')
    newboxes = makeArtistBoxes(boxes, artists_string)
    

    return jsonify({'msg': 'success', 'boxes': newboxes, 'dim':dim})
