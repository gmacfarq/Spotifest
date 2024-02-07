"use strict";

const IMAGE_ENDPOINT = '/image';
const SPOTIFY_API_BASE = "https://api.spotify.com/v1/";
const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

const $submitBtn = $('#submit-btn');
const $fileInput = $('#input-file');
const $inputFileLabel = $('#input-file-label');
const $imageWrapper = $('#image-wrapper');
const $artistList = $('#artist-list');
const $addArtistBtn = $('#add-artist-btn');




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
async function uploadImage(file) {

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
        box[5]
      ).attr("class", "content")
        .css("bottom", `${height - box[3] * ratio - box[1] * ratio}px`)
        .css("left", `${box[0] * ratio}px`)
        .css('height', `${box[3] * ratio}px`)
        .css('width', `${box[2] * ratio}px`)
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
    let response = await uploadImage(file);
    console.log(response.data);
    displayBoxes(response.data);
    addArtists(response.data);
    displayArtists();
    allowDrawing();


  } else {
    alert("bad file");
  }
}

/**
 * Adds artists to list of artists
 * @param {object} data
 */
function addArtists(data) {
  let artistNames = [];
  for (let box of data.boxes) {
    artistNames.push(box[4]);
  }

  artistNames = [...new Set(artistNames)];

  for (let name of artistNames) {
    artists.push(new Artist(name));
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

    if (editing) {
      currArtistEdit.fullDivData.remove();
      let offset = $imageWrapper.offset();
      const newTop = parseFloat($rectangle.css("top")) - offset["top"];
      const newLeft = parseFloat($rectangle.css("left")) - offset["left"];
      currArtistEdit.fullDivData = $rectangle.clone()
        .attr("class", "artistDiv")
        .attr("id", null)
        .css("position", "absolute")
        .css("top", `${newTop}px`)
        .css("left", `${newLeft}px`);

      $imageWrapper.append(currArtistEdit.fullDivData);
      return;
    }

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


/**
 * Add div to array of words
 * @param {*} $rectangle
 */
function addWord($rectangle) {
  let $wordDiv = $rectangle.clone()
    .attr("class", "wordDiv")
    .css("position", "absolute")
    .attr('id', null);

  $rectangle.html("");
  words.push($wordDiv);
}

// filled with list of artists found on page
let artists = [];
let editing = false;
let currArtistEdit;

/**
 * Class for individual Artist
 */
class Artist {
  constructor(name) {
    this.name = name;//name of artist
    this.spotifyid = null;
    this.image = null;
    this.popularity = null;
    this.li = null;
  }

  //get artist instance
  static getArtist(name) {
    // Sanitize input by removing trailing numbers, "confirm" text, and anything after "confirm"
    const sanitizedName = name.replace(/\d+confirm.*$/, '').replace(/No Artist Found$/, '').trim();
    for (let artist of artists) {
      if (artist.name === sanitizedName) {
        return artist;
      }
    }
  }

  //TODO: make use of new artist.li instead of .parent()
  static editArtist(evt) {
    evt.preventDefault();
    if (!editing) {
      editing = true;
      currArtistEdit = Artist.getArtist(this.innerText);
      const name = currArtistEdit.name;
      $(this).append($('<form>').html(
        ` <input id="name" type="text" value="${name}">
          <button id="submit-btn"> Submit </button>
          <button id="delete-btn"> Delete </button>`
      )
      );
      $(this).on("click", "#submit-btn", function () {
        let newName = $($(this).parent()[0][0]).val();
        currArtistEdit.name = newName;
        const $li = currArtistEdit.li;

        $(this).parent().remove();
        $li.empty().html(newName);

        editing = false;
        setTimeout(() => {
          currArtistEdit = null;;
        }, 10);
      });

      $(this).on("click", "#delete-btn", function () {
        currArtistEdit.removeArtist();

        const $li = currArtistEdit.li;
        $(this).parent().remove();
        $li.remove();

        editing = false;
        setTimeout(() => {
          currArtistEdit = null;;
        }, 10);
      });

    }
  }

  removeArtist() {
    this.li.remove;
    let idx = artists.indexOf(this);
    artists.splice(idx, 1);
  }

  //displays the Artist Name in the DOM
  displayArtist() {
    let $artistLi = $('<li>').html(this.name);
    $artistList.append(
      $artistLi
    );

    this.li = $artistLi;
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
      .attr("class", "artistDiv")
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
    let wordArr = [];
    let nameArr = [];
    let letterDivs = [];

    for (let $wordDiv of words) {

      if (!$wordDiv.children().length) {
        continue;
      }


      for (let $letterDiv of $wordDiv.children()) {
        wordArr.push($letterDiv["innerText"]);
        letterDivs.push($letterDiv);
      }

      nameArr.push(wordArr.join(""));
      wordArr = [];
    }

    let nameString = nameArr.join(" ");

    if (!nameString || nameString === " ") {
      alert("No Artist Created");
      return;
    }

    return new Artist(nameString, letterDivs);
  }
}

//displays all Artists in the DOM
function displayArtists() {
  for (let artist of artists) {
    let $artistLi = $('<li>').html(artist.name);
    $artistList.append(
      $artistLi
    );

    artist.li = $artistLi;
  }
}

/*
  takes form input at the bootom of the page
  and adds it to the list of artists when hitting submit
*/
function addNewArtist() {
  let artistName = $('#artist-name').val();
  if (artistName === "") {
    return;
  }
  let artist = new Artist(artistName);

  let $artistLi = $('<li>').html(artist.name);
  $artistList.prepend(
    $artistLi
  );

  artist.li = $artistLi;
  artists.push(artist);

  $('#artist-name').val("");
}
$addArtistBtn.on("click", addNewArtist);

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

function getPosition($div) {
  var offset = $div.offset();

  var top = offset.top;
  var left = offset.left;

  return { top: top, left: left };
}

async function testArtist(artist){
  let artistData = await getSpotifyArtist(artist);
    if(!artistData.data.artists.items.length){
      artist.li.append($('<p>').html("No Artist Found"));
      return;
    }
    artist.spotifyid = artistData.data.artists.items[0].id;
    artist.popularity = artistData.data.artists.items[0].popularity;
    artist.image = artistData.data.artists.items[0].images[0]?.url;

    artist.li.append($('<img>')
      .attr('src', artist.image)
      .attr('height', 'auto')
      .attr('width', '100px')
    );
    artist.li.append($('<span>').html(` ${artistData.data.artists.items[0].popularity}`));
    artist.li.append($('<button>').html("confirm").on("click", function () {
      confirmedArtists.push({
        spotifyid: artist.spotifyid,
        name: artistData.data.artists.items[0].name,
        popularity: artist.popularity
      });
      editing = false;
      artist.removeArtist();
      $(this).parent().remove();
    }));
    artist.li.append($('<button>').html("expand").on("click", function () {
      let startIndex = artistData.data.artists.items.indexOf(artist) + 1;
      let endIndex = startIndex + 10;
      let nextArtists = artistData.data.artists.items.slice(startIndex, endIndex);

      for (let nextArtist of nextArtists) {
        let nextArtistImage = nextArtist.images[0]?.url;
        let $nextArtistImage = $('<img>')
          .attr('src', nextArtistImage)
          .attr('height', 'auto')
          .attr('width', '100px');

        $nextArtistImage.on("click", function () {
          confirmedArtists.push({
            spotifyid: nextArtist.id,
            name: nextArtist.name,
            popularity: nextArtist.popularity
          });
          editing =false;
          artist.removeArtist();
        });

        artist.li.append($nextArtistImage);
      }
    }));


}

async function testArtists(artists) {
  for (let artist of artists) {
    testArtist(artist);
  };
}

async function getSpotifyArtist(artist) {
  return axios.get(`${SPOTIFY_API_BASE}search`,
    {
      params: {
        'query': `artist:${artist.name}`,
        'type': 'artist',
        'locale': 'en-US,en;q=0.9'
      },
      headers: { "Authorization": `Bearer ${await getSpotifyToken()}` }
    }
  );
}



let confirmedArtists = [];

async function getSpotifyToken(){
  const response = await axios.get('/spotifyauth');
  return response.data;
}


// async function getSpotifyArtists() {
//   let response = await testArtists(artists);
//   let artistData = [];
//   for (let resp of response) {
//     if (resp.status === "fulfilled") {
//       artistData.push(resp.value.data.artists.items[0]);
//     }
//   }

//   return artistData;
// }

async function sendFestivalToServer() {
  let festival = {
    "name": $('#festival-name').val(),
    "date": $('#festival-date').val(),
    "artists": confirmedArtists
    // "location": $('#festival-location').val()
  };

  let response = await axios.post('/festival', festival);
  console.log(response.data);
}


