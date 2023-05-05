"use strict";

const IMAGE_ENDPOINT = '/image';
const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

const $submitBtn = $('#submit-btn');
const $fileInput = $('#input-file');
const $inputFileLabel = $('#input-file-label');
const $imageWrapper = $('#image-wrapper');




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


function allowDrawing() {
  const $contents = $('.content');
  const $canvas = $('#canvas');
  const $rectangle = $('#rectangle');

  let isDrawing = false;
  let startX, startY;

  $(document).on('mousedown', function (e) {
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

  $(document).on('mouseup', function (e) {
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
    let $wordDiv = $rectangle.clone()
      .attr("class", "artistDiv")
      .attr('id', null);

    $rectangle.html("");

    $imageWrapper.append($wordDiv);
    words.push($wordDiv);
  });
}

$(document).keydown(function (e) {
  // check if the pressed key is the spacebar
  if (e.keyCode == 32) {
    // do something
    console.log('Spacebar pressed!');
    displayArtist();
    //combineDivs(artistName);
  }
});

let words = [];

function displayArtist() {
  let artistName = generateArtistName();
  $('ul').append(
    $('<li>').html(artistName)
  );

  words = [];
  return artistName
}

function generateArtistName() {
  let name = "";
  console.log(words);
  for (let $wordDiv of words) {
    console.log($wordDiv);
    name = name + " ";
    for (let $contentDiv of $wordDiv.children()) {
      name = name + $contentDiv["innerText"];
    }
  }
  console.log(name);
  return name;
}

/*combine divs into one div that has largest bounds
*/
function combineDivs() {

}
//then add eventlisteners to all completed divs
/*
  completed div looks like <div class="artist-div">"artists name"<div>
*/
