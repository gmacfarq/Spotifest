"use strict";

const API_ENDPOINT = '/image';
const $submitBtn = $('#submit-btn');
const $fileInput = $('#input-file');
const $inputFileLabel = $('#input-file-label');
const $image = $('img');
const $imageWrapper = $('#image-wrapper');

$submitBtn.on("click", updloadImage);
$fileInput.on("change", showFileName);

function showFileName(evt) {
  if (evt.target.files.length) {
    $inputFileLabel.html(evt.target.files[0].name);
  }
}


/**
 * Handles the creation of a new cupcake via cupcake form
 * Post request to /api/cupcakes
 * @param {*} evt
 */
async function updloadImage(evt) {
  evt.preventDefault();

  let formData = new FormData();

  if ($fileInput[0].files.length) {
    formData.append("file", $fileInput[0].files[0]);
  }
  else {
    return;
  }



  const response = await axios.post(API_ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });

  console.log(response.data.boxes);
  overlay_boxes(response.data.boxes);
  return response;

}

function overlay_boxes(boxes) {
  let height = parseInt($image.css("height"));
  let width = parseInt($image.css("width"));

  for (let box of boxes) {

    $imageWrapper.append(
      $('<div>').html(
        box[0]
      ).css("position", "relative")
      .css("z-index", "3")
      .css("display", "inline-block")
      .css('height',`${(box[4]-box[2])*(height/4050)}px`)
      .css('width',`${(box[3]-box[1])*(width/3240)}px`)
      .css('border-style', 'solid')
    ).css('height', height).css('width', width);
  }
}
