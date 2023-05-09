"use strict";

const IMAGE_ENDPOINT = '/image';
const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

const $submitBtn = $('#submit-btn');
const $fileInput = $('#input-file');
const $inputFileLabel = $('#input-file-label');
const $imageWrapper = $('#image-wrapper');
const $artistList = $('#artist-list');




/**
 * Handles changes in file input
 * Displays the selected file name in the input label
 * @param {*} evt
 */
function showFileName(evt) {
  if (evt.target.files.length) {
    $inputFileLabel.html(evt.target.files[0].name);
  }
}
$fileInput.on("change", showFileName);

/**
 * Appends the image in 'file' to the DOM
 * @param {file} file
 */
function displayImage(file) {
  var reader = new FileReader();

  reader.onload = function () {
    //$imageWrapper.html("");

    $imageWrapper.append(
      $('<img>')
        .attr("class", "image")
        .attr('src', reader.result)
    );
  };

  reader.readAsDataURL(file);
}

/**
 * Sends request to flask with image in multipart/form-data
 * Returns response with response.data structure
 * {
 *  boxes: [...,['C','1784','2187','1839','2254'],...]
 *  dim: [int(img_height), int(img_width)]
 *  msg:'success'
 * }
 * @param {file} file image file
 */
async function updloadImage(file) {

  let formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(IMAGE_ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });

  return response;
}


/**
 * Accepts an object box_data:
 * {
 *  boxes: [...,['C','1784','2187','1839','2254'],...]
 *  dim: [int(img_height), int(img_width)]
 *  msg:'success'
 * }
 *  Adds corresponding divs to DOM inside imageWrapper div
 * @param {object} box_data
 */
function displayBoxes(box_data) {
  let height = parseInt($('img').css("height"));
  let width = parseInt($('img').css("width"));
  let ratio = height / box_data.dim[0];

  for (let box of box_data.boxes) {

    $imageWrapper.append(
      $('<div>').html(
        box[0]
      ).attr("class", "content")
        .css("bottom", `${box[2] * ratio}px`)
        .css("left", `${box[1] * ratio}px`)
        .css('height', `${(box[4] - box[2]) * (ratio)}px`)
        .css('width', `${(box[3] - box[1]) * (ratio)}px`)
    ).css('height', height).css('width', width);
  }
}

/**
 * handles the event when user clicks submit button
 * calls functions to:
 *  display the uploaded image,
 *  send image to flask server and recieve response
 *  display boxes for corresponding letters in image
 * @param {*} evt
 */
async function submitImage(evt) {
  evt.preventDefault();

  let file = $fileInput[0].files[0];
  let fileType = file['type'];

  //check if file uploaded is an image
  if (validImageTypes.includes(fileType)) {

    displayImage(file);
    let response = await updloadImage(file);
    console.log(response.data);
    displayBoxes(response.data);
    allowDrawing();


  } else {
    alert("bad file");
  }
}

$submitBtn.on("click", submitImage);

/**
 * Allow user to draw boxes on screen to create artist listing
 */
function allowDrawing() {
  const $contents = $('.content');
  const $canvas = $('#canvas');
  const $rectangle = $('#rectangle');

  let isDrawing = false;
  let startX, startY;

  $imageWrapper.on('mousedown', function (e) {
    startX = e.clientX;
    startY = e.clientY;
    isDrawing = true;
    $rectangle.css({
      left: `${startX}px`,
      top: `${startY}px`,
      width: 0,
      height: 0
    });
    $canvas.css('display', 'block');
  });

  $imageWrapper.on('mouseup', function (e) {
    if (!isDrawing) return;

    //offset = $('img').offset()

    const width = e.clientX - startX;
    const height = e.clientY - startY;
    $rectangle.css({
      width: `${width}px`,
      height: `${height}px`
    });

    const rect = $rectangle[0].getBoundingClientRect();
    const left = rect.left;
    const top = rect.top;
    const right = left + rect.width;
    const bottom = top + rect.height;

    $contents.each(function () {
      const $this = $(this);
      const thisRect = this.getBoundingClientRect();
      const thisLeft = thisRect.left;
      const thisTop = thisRect.top;
      const thisRight = thisLeft + thisRect.width;
      const thisBottom = thisTop + thisRect.height;
      const isIntersecting = !(right < thisLeft || left > thisRight || bottom < thisTop || top > thisBottom);

      if (isIntersecting) {
        $rectangle.append($this.clone());
        $this.remove();
      }

    });

    addWord($rectangle);

  });
}

let words = [];
let editing = false;

/**
 * Add div to array of words
 * @param {*} $rectangle
 */
function addWord($rectangle) {
  let $wordDiv = $rectangle.clone()
    .attr("class", "artistDiv")
    .css("position", "absolute")
    .attr('id', null);

  $rectangle.html("");
  words.push($wordDiv);
}

// filled with list of artists found on page
let artists = [];

/**
 * Class for individual Artist
 */
class Artist {
  constructor(name, letterDivs) {
    this.name = name;//name of artist
    this.letterDivs = letterDivs; //all content letterDivs
    this.fullDivData = null;
  }

  //get artist instance
  static getArtist(name) {
    for (let artist of artists) {
      if (artist.name === name) {
        return artist;
      }
    }
  }

  static editArtist(evt) {
    evt.preventDefault();
    if (!editing) {
      editing = true;
      const artist = Artist.getArtist(this.innerText);
      const name = artist.name;
      $(this).append($('<form>').html(
        ` <input id="name" type="text" value="${name}">
          <button> Submit </button>`
      )
      );
      $(this).on("click", "button", function () {
        let newName = $($(this).parent()[0][0]).val();
        artist.name = newName;
        const $li = $(this).parent().parent()
        $(this).parent().remove();
        $li.empty().html(newName);
        editing = false;
      });
    }
  }

  //displays the Artist Name in the DOM
  displayArtist() {
    $artistList.append(
      $('<li>').html(this.name)
    );
  }

  //TODO: Clean this shit up
  displayBoundingBox() {

    const firstLetterDiv = this.letterDivs[0];
    const lastLetterDiv = this.letterDivs[this.letterDivs.length - 1];
    let bottom = getMinPixels(this.letterDivs.map(div => div.style['bottom']));
    let left = getMinPixels(this.letterDivs.map(div => div.style['left']));
    let width = parseFloat(lastLetterDiv.style['left']) +
      parseFloat(lastLetterDiv.style['width']) -
      parseFloat(left);
    let highestPoint = getMaxPixels(this.letterDivs.map(div => parseFloat(div.style['bottom']) + parseFloat(div.style['height'])));
    let height = highestPoint - parseFloat(bottom);

    let $fullArtistDiv = $('<div>')
      .attr("class", "content")
      .css("bottom", `${bottom}`)
      .css("left", `${left}`)
      .css('height', `${height}px`)
      .css('width', `${width}px`);

    $imageWrapper.append($fullArtistDiv);

    this.fullDivData = $fullArtistDiv;
  }

  /**
   * Generates an instance of the Artist object from the global list of words
   * @returns {Artist}
   */
  static generateArtistFromWords() {
    let name = "";
    let letters = [];
    for (let $wordDiv of words) {

      if (!$wordDiv.children().length) {
        continue;
      }

      name = name + " ";

      for (let $letterDiv of $wordDiv.children()) {
        name = name + $letterDiv["innerText"];
        letters.push($letterDiv);
      }
    }

    if (!name || name === " ") {
      alert("No Artist Created");
      return;
    }

    return new Artist(name.trim(), letters);
  }
}

$artistList.on("click", "li", Artist.editArtist);


$(document).keydown(function (e) {
  // check if the pressed key is the spacebar
  if (e.keyCode == 18) {
    // do something
    console.log('Left Alt!');
    let artist = Artist.generateArtistFromWords();
    words = [];
    if (artist) {
      artist.displayArtist();
      artist.displayBoundingBox();
      artists.push(artist);
    }
    //combineletterDivs(artistName);
  }
});

function getMaxPixels(strs) {
  let max = 0;
  let mpx = "";
  for (let str of strs) {
    if (parseFloat(str) > max) {
      max = parseFloat(str);
      mpx = str;
    }
  }
  return mpx;
}

function getMinPixels(strs) {
  let min = Infinity;
  let mpx = "";
  for (let str of strs) {
    if (parseFloat(str) < min) {
      min = parseFloat(str);
      mpx = str;
    }
  }
  return mpx;
}


