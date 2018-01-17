var images = {};

loadImage("leftArm");
loadImage("legs");
loadImage("torso");
loadImage("rightArm");
loadImage("head");
loadImage("hair");

function loadImage(name) {

  images[name] = new Image();
  images[name].onload = function() {
      resourceLoaded();
  }
  images[name].src = "/client/images/" + name + ".png";
}

var totalResources = 6;
var numResourcesLoaded = 0;
var fps = 30;

function resourceLoaded() {

  numResourcesLoaded += 1;
  if(numResourcesLoaded === totalResources) {
    setInterval(redraw, 1000 / fps);
  }
}
     var context = document.getElementById('ctx').getContext("2d");

     var charX = 245;
     var charY = 185;

function redraw() {

  var x = charX;
  var y = charY;

  canvas.width = canvas.width; // clears the canvas

  context.drawImage(images["leftArm"], x + 40, y - 42);
  context.drawImage(images["legs"], x, y);
  context.drawImage(images["torso"], x, y - 50);
  context.drawImage(images["rightArm"], x - 15, y - 42);
  context.drawImage(images["head"], x - 10, y - 125);
  context.drawImage(images["hair"], x - 37, y - 138);
}

function redraw() {

  drawEllipse(x + 47, y - 68, 8, 14); // Left Eye
  drawEllipse(x + 58, y - 68, 8, 14); // Right Eye
}

function drawEllipse(centerX, centerY, width, height) {

  context.beginPath();

  context.moveTo(centerX, centerY - height/2);

  context.bezierCurveTo(
    centerX + width/2, centerY - height/2,
    centerX + width/2, centerY + height/2,
    centerX, centerY + height/2);

  context.bezierCurveTo(
    centerX - width/2, centerY + height/2,
    centerX - width/2, centerY - height/2,
    centerX, centerY - height/2);

  context.fillStyle = "black";
  context.fill();
  context.closePath();
}

function redraw() {

  canvas.width = canvas.width; // clears the canvas

  drawEllipse(x + 40, y + 29, 160, 6);

}

var breathInc = 0.1;
var breathDir = 1;
var breathAmt = 0;
var breathMax = 2;
var breathInterval = setInterval(updateBreath, 1000 / fps);

function updateBreath() {

  if (breathDir === 1) {  // breath in
    breathAmt -= breathInc;
    if (breathAmt < -breathMax) {
      breathDir = -1;
    }
  } else {  // breath out
    breathAmt += breathInc;
    if(breathAmt > breathMax) {
      breathDir = 1;
    }
  }
}

function redraw() {

  canvas.width = canvas.width; // clears the canvas

  drawEllipse(x + 40, y + 29, 160 - breathAmt, 6); // Shadow

  context.drawImage(images["leftArm"], x + 40, y - 42 - breathAmt);
  context.drawImage(images["legs"], x, y);
  context.drawImage(images["torso"], x, y - 50);
  context.drawImage(images["head"], x - 10, y - 125 - breathAmt);
  context.drawImage(images["hair"], x - 37, y - 138 - breathAmt);
  context.drawImage(images["rightArm"], x - 15, y - 42 - breathAmt);

  drawEllipse(x + 47, y - 68 - breathAmt, 8, 14); // Left Eye
  drawEllipse(x + 58, y - 68 - breathAmt, 8, 14); // Right Eye
}

var maxEyeHeight = 14;
var curEyeHeight = maxEyeHeight;
var eyeOpenTime = 0;
var timeBtwBlinks = 4000;
var blinkUpdateTime = 200;
var blinkTimer = setInterval(updateBlink, blinkUpdateTime);
var x = 245;
var y = 185;

function redraw() {

  drawEllipse(x + 47, y - 68 - breathAmt, 8, curEyeHeight);
  drawEllipse(x + 58, y - 68 - breathAmt, 8, curEyeHeight);
}

function updateBlink() {

  eyeOpenTime += blinkUpdateTime;

  if(eyeOpenTime >= timeBtwBlinks){
    blink();
  }
}

function blink() {

  curEyeHeight -= 1;
  if (curEyeHeight <= 0) {
    eyeOpenTime = 0;
    curEyeHeight = maxEyeHeight;
  } else {
    setTimeout(blink, 10);
  }
}
