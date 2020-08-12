'use strict';

// --------------- initialization of the app ----------//
function init() {
  canvas = document.getElementById('canvas-box');
  context = canvas.getContext('2d');
  pointerContainer = document.getElementById('pointer-container');

  // Set the canvas sixe to fit the screen
  canvas.width = window.innerWidth - 80;
  canvas.height = window.innerHeight - 75;

  // Initialize the canvas with white background
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Register the event handlers for all the actions
  registerEvents();
};

function updateCoordinates(ev) { // calculates the current mouse position in x and y axis
  if (ev.layerX >= 0) {
    xPos = ev.layerX; // global storage for x position
    yPos = ev.layerY; // global storage for y position

  } else if (ev.offsetX >= 0) { // Cross-browser support
    xPos = ev.offsetX;
    yPos = ev.offsetY;
  }

  // updates the current mouse position in the screen
  document.getElementById('co-ordinates').innerText = '(' + xPos + ', ' + yPos + ')';

  pointerContainer.style.top = yPos + 'px';
  pointerContainer.style.left = xPos + 'px';
};


// ------------- Main Draw function ---------------- //
// This function is invoked when the user presses the mouse button. //
function drawOnCanvas(ev) {
  if (currentActive === 'pencil') {
    context.lineWidth = currentThickness; // Get the stroke width and set it to context
    context.strokeStyle = pencilColor;

  } else if (currentActive === 'eraser') {
    context.lineWidth = 10; // All erasers to be having a stroke of 10px.
    context.strokeStyle = eraserColor; // Get make strokes of the current background color

  } else { // for highlighter
    context.lineWidth = 5; // each highlighter would have a stroke of 5px.
    context.strokeStyle = highlighterColor;
  }

  if (!isDrawing) {
    isDrawing = true;
    context.beginPath(); // To reset the previous stroke path.
    context.moveTo(xPos, yPos); // move the canvas to xPos and yPos so that the stroke starts from here.

  } else {
    context.lineTo(xPos, yPos); // line from previous canvas point to the new position (point by point)
    context.stroke(); // to stroke the lines as calculated from the 2 set of positions
  }
};


// ---------- Function to let the user input a text --------//
function enterText() {
  var text = window.prompt('Enter the text to be added');

  if (text) {
    context.font = fontSize + ' Arial'; // set the font style to Arial and take size from the globally set fontSize
    context.fillStyle = pencilColor; // Text color to be same as the selected pencil color
    context.fillText(text, xPos, yPos); // to fill in the text at the current mouse pointer location.
  }
};

window.addEventListener('DOMContentLoaded', function () {
  init(); // Initialize the application once dom is loaded
}, false);