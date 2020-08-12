'use strict';

var canvas;
var context;
var pointerContainer;

// ------------- default values. ----------- //
var isDrawing = false; // To set if the stroke should be made.
var xPos = 0; // current x position of the canvas
var yPos = 0; // current y position of the canvas
var eraserColor = 'white'; // Color for the stroke when eraser is selected
var transparency = .2; // transparency used for the highlighter
var currentThickness = 1; // to store the thickness for the pencil stroke.
var allowPrompt = false; // promt before closing the canvas
var pencilColor = 'black'; // color of last selected Pencil
var highlighterColor = 'black'; // color of the last selected highlighter
var currentActive = 'pencil'; // to highlight the current active element
var fontSize = '22px'; // default font size for texts

function onMouseDown() {
  allowPrompt = true; // to track if the canvas is edited.

  if (currentActive === 'input-text') {
    enterText(); // For text inputs, we open a text prompt.

    return;
  }

  canvas.addEventListener('mousemove', drawOnCanvas, false); // call main function for drawing
};

function onMouseUp() {
  canvas.removeEventListener('mousemove', drawOnCanvas, false); // Stop drawing when the mouse button is released

  isDrawing = false;
};

function onMouseOut() {
  // Stop drawing when the mouse is outside the canvas
  isDrawing = false;
  pointerContainer.style.display = 'none';
};

function onMouseEnter() {
  pointerContainer.style.display = 'block';
}

function onPencilColorSelect(target) {
  var color = 'rgb(' + target.dataset.bgColor + ')';

  // Update the LHS menu pencil color to the selected color.
  var svgIcon = document.querySelector('#pencil svg path');
  svgIcon.style.fill = color;

  // Update the LHS menu text input color to the selected color.
  var textIcon = document.querySelector('#input-text span');
  textIcon.style.color = color;

  pencilColor = color; // globally store the pencil color so that if user clicks on the pencil icon, we select the previously selected pencil color and let them draw
};

function onThicknessSelect(target) {
  currentThickness = target.id; // Store current pencil thickness globally

  // Update the thickness selector circle size to allow user know the current selected thickness
  var svgIcon = document.querySelector('#thickness svg');
  svgIcon.style.width = currentThickness * 3 + 'px';
  svgIcon.style.height = currentThickness * 3 + 'px';
};

function onHighlighterColorSelect(target) {
  var color = 'rgba(' + target.dataset.bgColor + ',' + .5 + ')';

  // Set the LHS menu highlighter svg to the highlighter color
  var svgIcon = document.querySelector('#highlighter svg path');
  svgIcon.style.fill = 'rgba(' + target.dataset.bgColor + 1 + ')';

  highlighterColor = color; // Store highlighter color globally
};

function onFontSizeSelect(target) {
  fontSize = target.dataset.fontSize; // store the fontSize globally

  // Update the text size in the LHS menu with the selected size.
  var textIcon = document.querySelector('#input-text > span');
  textIcon.style.fontSize = fontSize;
};

function onFillColorSelect(target) {
  var selection = window.confirm('This will clear the entire canvas. Are you sure?');

  if (selection) {
    // store the color to be filled as the eraser color so that when we need to erase, it makes strokes similar to the bg-color
    eraserColor = 'rgb(' + target.dataset.bgColor + ')';
    context.globalCompositeOperation = 'source-over'; // To overwrite the globalCompositeOperation set for highlighter

    context.fillStyle = eraserColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    allowPrompt = false; // set editing tracked variable to false to not show the confirmation while leaving the page.

    if (currentActive === 'highlighter') {
      context.globalCompositeOperation = 'darken';
    }
  }
};

function onSave() {
  // To convert the canvas to an image
  var appContainer = document.getElementById('app-container');
  appContainer.style.display = 'none'; // hide the canvas

  var imageContainer = document.getElementById('image-container');
  imageContainer.style.display = 'block'; // make the image container visible


  var src = canvas.toDataURL('image/png'); // convert the canvas to image
  imageContainer.querySelector('img').src = src; // update the image src to the generated image
  imageContainer.querySelector('.download-link').href = src; // update the download link to the generated image
};

function goBack() {
  // To go back from the image view to the canvas view
  var imageContainer = document.getElementById('image-container');
  imageContainer.style.display = 'none'; // hide the image

  var appContainer = document.getElementById('app-container');
  appContainer.style.display = 'block'; // make the canvas visible to the screen
};

function registerEvents() {
  // Register all the events and their handlers
  canvas.addEventListener('mousedown', onMouseDown, false); // when mouse is pressed within the canvas

  canvas.addEventListener('mouseout', onMouseOut, false); // when mouse is moved out of the canvas within the canvas

  window.addEventListener('mouseup', onMouseUp, false); // when mouse is released anywhere in the window

  canvas.addEventListener('mousemove', updateCoordinates, false); // to update the coordinates whenever the mouse moves inside the canvas

  canvas.addEventListener('mouseenter', onMouseEnter, false); // to show the pointer style

  // adds an eventListener to all the color items in the popover of the pencil
  var pencilColorItems = document.querySelectorAll('.pencil-item') || [];
  pencilColorItems.forEach(function (item) {
    item.addEventListener('click', function (ev) {
      onPencilColorSelect(ev.target); // this function will set the selected color
    }, false);
  });

  // adds an eventListener to all the thickness items in the popover of the thickness selector
  var thicknessItems = document.querySelectorAll('.thickness-item') || [];
  thicknessItems.forEach(function (item) {
    item.addEventListener('click', function (ev) {
      onThicknessSelect(ev.target); // this function will set the thickness
    }, false);
  });

  // adds an eventListener to all the font items in the popover of the font size selector
  var fontItems = document.querySelectorAll('.font-item') || [];
  fontItems.forEach(function (item) {
    item.addEventListener('click', function (ev) {
      var target = ev.target;
      target = target.closest('button'); // to point to the nearest button ancestor, as it contains the dataset

      onFontSizeSelect(target); // this function will set the font size
    }, false);
  });

  // adds an eventListener to all the highlighter color items in the popover of the highlighter selector
  var highliterItems = document.querySelectorAll('.highlighter-item') || [];
  highliterItems.forEach(function (item) {
    item.addEventListener('click', function (ev) {
      onHighlighterColorSelect(ev.target); // this function will set the highlighter color
    }, false);
  });

  // adds an eventListener to all the fill color items in the popover of the fill selector
  var fillItems = document.querySelectorAll('.fill-item') || [];
  fillItems.forEach(function (item) {
    item.addEventListener('click', function (ev) {
      onFillColorSelect(ev.target); // this function will fill the canvas with a new color
    }, false);
  });

  // adds an eventListener to the LHS pencil button to select pencil strokes with default last pencil color
  document.getElementById('pencil').addEventListener('click', function () {
    currentActive = 'pencil';
    setActive();
  }, false);

  // adds an eventListener to the LHS highlighter button to select pencil strokes with default last highlighter color
  document.getElementById('highlighter').addEventListener('click', function () {
    currentActive = 'highlighter';
    setActive();
  }, false);

  // adds an eventListener to the LHS pencil button to select eraser strokes
  document.getElementById('eraser').addEventListener('click', function () {
    currentActive = 'eraser';
    setActive();
  }, false); // adds an eventListener to the LHS Text input to let the user add texts

  document.getElementById('input-text').addEventListener('click', function (ev) {
    currentActive = 'input-text';
    setActive();
  }, false);

  // adds an eventListener to allow user to convert the canvas into an image
  document.getElementById('save').addEventListener('click', function () {
    onSave();
  }, false);

  // adds an eventListener to allow user to go back from image to canvas
  document.getElementById('go-back').addEventListener('click', function () {
    goBack();
  }, false);
  setActive(); // default pencil selector
};


// ----------- This function sets the selected canvas item in the screen -------//
function setActive() {
  var activeElements = { // these LHS menu items can be marked as selected
    pencil: document.getElementById('pencil'),
    highlighter: document.getElementById('highlighter'),
    eraser: document.getElementById('eraser'),
    'input-text': document.getElementById('input-text')
  };

  // iterate through the list of aloowed active buttons and add or remove class to highlight the selected item
  Object.keys(activeElements).forEach(function (key) {
    if (key === currentActive) {
      activeElements[key].classList.add('active');
    } else {
      activeElements[key].classList.remove('active');
    }
  });

  var pointerStyles = {
    pencil: 'pencil-pointer',
    highlighter: 'highlighter-pointer',
    eraser: 'eraser-pointer',
    'input-text': 'text-pointer'
  }
  pointerContainer.className = pointerStyles[currentActive];
  // canvas.style.cursor = 'none';

  // For highlighters, using the darken property so that the highlighter doesn't overlap the strokes.
  if (currentActive === 'highlighter') {
    // highlighter works only when the strokes are darker and the highlighter color is lighter.
    // TODO: Make the highlighter work with opacity.
    // TODO: highlighter to work on darker strokes.
    context.globalCompositeOperation = 'darken';
  } else {
    context.globalCompositeOperation = 'source-over';
  }
};