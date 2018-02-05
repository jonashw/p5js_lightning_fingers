/*jshint esversion: 6 */
var bg;
var playing = false;
var updating = true;
var drawing = true;
var touchColor;
var center = {x:0, y:0};
let lightningColors = [];
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  //greatly improve performance with a pixelDensity less than 1:
  //pixelDensity(0.125);
  pixelDensity(1);
  //alert('pixelDensity: ' + pixelDensity());
  //alert('displayDensity: ' + displayDensity());
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
  windowResized();
  lightningColors = countFrom(200,55).map(l => color(l,255,100));
}

function range(min, max){
  let values = [];
  for(let n=min; n<=max; n++){
    values.push(n);
  }
  return values;
}

function countFrom(from, count){
  let values = [];
  for(let i=0; i<count; i++){
    values.push(from + i);
  }
  return values;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  center.x = windowWidth/2;
  center.y = windowHeight/2;
}
/* This is to prevent pinch-zooming on touch devices: */
function touchStarted(){ return false; }
/* I'm not sure if this is strictly necessary: */
function mousePressed(){ return false; }

function lightning(x1,y1,x2/*optional*/,y2/*optional*/){
  push();
  let x = x1; 
  let y = y1;
  let x_next, y_next;
  let d = 50 * displayDensity();
  let n = 10;
  let C = 5 * d / n;
  let HC = C / 2;
  let K = 10;
  strokeWeight(5 * displayDensity());
  if(x2 != undefined && y2 != undefined){
    for(var i=n; i>0; i--){
      dx = (x - x2) / i;
      dy = (y - y2) / i;
      x_next = x - dx + (noise(frameCount / random(n)) * C - HC);
      y_next = y - dy + (noise(frameCount / random(i)) * C - HC);
      line(x, y, x_next, y_next);
      x = x_next;
      y = y_next;
    }
    line(x, y, x2, y2);
    noStroke();
    ellipse(x1, y1, d, d);
    ellipse(x2, y2, d, d);
  } else {
    noStroke();
    ellipse(x1, y1, d, d);
  }
  pop();
}

function draw() {
  if(!focused){
    //return;
  }
  update();
  if(!drawing) return;
  bg.draw();
  let color = lightningColors[parseInt(noise(frameCount/30) * lightningColors.length) - 1];
  if(color){
    stroke(color);
    fill(color);
  }
  touches.forEach(t => {
    lightning(center.x, center.y, t.x, t.y);
  });
  if(mouseIsPressed){
    lightning(center.x, center.y, mouseX, mouseY);
  }
  let d = 50 * displayDensity();
  ellipse(center.x, center.y, d, d);
}

function update(){
  if(!updating) return;
  bg.update();
}

function keyTyped(){
  if(key == 'u'){
    updating = !updating;
    console.log('updating ' + (updating ? 'resumed' : 'paused'));
  }
  if(key == 'd'){
    drawing = !drawing;
    console.log('drawing ' + (drawing ? 'resumed' : 'paused'));
  }
}