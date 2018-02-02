/*jshint esversion: 6 */
var bg;
var playing = false;
var touchColor;
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  touchColor = color(0,0,0,50);
  bg = new Background((() => {
    var _hues = [];
    let bgLerpFactor = 8;
    for(var h=0;h<256*bgLerpFactor;h++){
      _hues.push(color(h/bgLerpFactor,255,148));
    }
    return _hues;
  })());
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  update();
  bg.draw();
  touches.forEach(t => {
    noStroke();
    fill(touchColor);
    ellipse(t.x, t.y, 200, 200);
  });
}

function update(){
  bg.update();
  if(!playing){
    return;
  }
}

function touchStarted(){
  var lastTouch = touches.slice().pop();
  return false; // This is to prevent pinch-zooming on touch devices.
}

function mousePressed(){
  return false;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}