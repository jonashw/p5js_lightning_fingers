new p5(s => {
  /*jshint esversion: 6 */
  var bg;
  var playing = false;
  var updating = true;
  var drawing = true;
  var touchColor;
  var center = {x:0, y:0};
  let lightningColors = [];
  let oscillators;
  const oscillatorWaves = new CircularArray([ 'triangle', 'sine', 'sawtooth','square' ]);

   s.setup = () => {
    s.colorMode(s.HSL, 255, 255, 255, 100);
    //greatly impraove performance with a pixelDensity less than 1:
    //pixelDensity(0.125);
    s.pixelDensity(1);
    //alert('pixelDensity: ' + pixelDensity());
    //alert('displayDensity: ' + displayDensity());
    bg = new Background(s, (() => {
      var _hues = [];
      let bgLerpFactor = 8;
      for(var h=0;h<256*bgLerpFactor;h++){
        _hues.push(s.color(h/bgLerpFactor,255,148));
      }
      return _hues;
    })());
    s.angleMode(s.DEGREES);
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.windowResized();
    lightningColors = Array(55).fill().map((_,i) => s.color(200 + i,255,100));
    /*
    https://npm.runkit.com/@tonaljs/chord:
    var note = require("@tonaljs/note")
    var chord = require("@tonaljs/chord")
    Array.prototype.concat.apply([], [
        chord.getChord("13","C4").notes,
        chord.getChord("13","C6").notes,
        chord.getChord("13","C8").notes,
        chord.getChord("13","C10").notes
    ]).map(note.freq).join(',\n');
    */
    let freqs = [
      261.6255653005986,
      329.6275569128699,
      391.99543598174927,
      466.1637615180899,
      587.3295358348151,
      880,
      1046.5022612023945,
      1318.5102276514797,
      1567.981743926997,
      1864.6550460723597,
      2349.31814333926,
      3520,
      4186.009044809578,
      5274.040910605919,
      6271.926975707989,
      7458.620184289437,
      9397.272573357044,
      14080,
      16744.036179238312,
      21096.16364242367,
      25087.70790283195,
      29834.480737157748,
      37589.09029342818,
      56320
    ];
    oscillators = Array(20).fill().map((_,i) => {
      let osc = new p5.Oscillator();
      osc.setType(oscillatorWaves.getCurrent());
      osc.phase(i/5);
      osc.freq(freqs[i % freqs.length]);
      osc.amp(0.5);
      return osc;
    });
  }

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    center.x = s.windowWidth/2;
    center.y = s.windowHeight/2;
  };
  let touchCircles = [];
  let exitingTouchCircles = [];

  s.touchStarted = () => {
    for(var i=0; i<s.touches.length; i++){
      oscillators[i].start();
    }
    let touch = s.touches[s.touches.length-1];
    let d = 50 * s.displayDensity();
    touchCircles.push(new Circle(touch.id, s.createVector(touch.x, touch.y), d, 10));
    console.log(`touch started (total touches: ${s.touches.length}): `, touchCircles);
    return false; /* This is to prevent pinch-zooming on touch devices: */
  }
  s.touchEnded = () => {
    for(var i=s.touches.length; 0<=i && i<oscillators.length; i++){
      oscillators[i].stop();
    }
    let newlyEndedTouchCircles = touchCircles.filter(tc => !s.touches.some(t => tc.containsPoint(t)));
    let par = partition(touchCircles, tc => s.touches.some(t => tc.containsPoint(t)));
    touchCircles = par.true;
    let c = s.createVector(center.x, center.y);
    for(let i=0; i<par.false.length; i++){
      par.false[i].heading = p5.Vector.sub(c, par.false[i].position);
      exitingTouchCircles.push(par.false[i]);
    }
    console.log('finished touches:', newlyEndedTouchCircles);
    return false; /* This is to prevent pinch-zooming on touch devices: */
  }
  /* I'm not sure if this is strictly necessary: */
  s.mousePressed = () => false;

  function lightning(x1,y1,x2/*optional*/,y2/*optional*/){
    s.push();
    let x = x1; 
    let y = y1;
    let x_next, y_next;
    let n = 10;
    let d = 50 * s.displayDensity();
    let C = 5 * d / n;
    let HC = C / 2;
    let K = 10;
    s.strokeWeight(5 * s.displayDensity());
    if(x2 != undefined && y2 != undefined){
      for(var i=n; i>0; i--){
        dx = (x - x2) / i;
        dy = (y - y2) / i;
        x_next = x - dx + (s.noise(s.frameCount / s.random(n)) * C - HC);
        y_next = y - dy + (s.noise(s.frameCount / s.random(i)) * C - HC);
        s.line(x, y, x_next, y_next);
        x = x_next;
        y = y_next;
      }
      s.line(x, y, x2, y2);
    } else {
      s.noStroke();
    }
    s.pop();
  }

  s.draw = () => {
    update();
    if(!drawing) return;
    bg.draw();
    let color = lightningColors[parseInt(s.noise(s.frameCount/30) * lightningColors.length) - 1];
    if(color){
      s.stroke(color);
      s.fill(color);
    }
    let d = 50 * s.displayDensity();
    s.touches.forEach(t => {
      lightning(center.x, center.y, t.x, t.y);
      s.ellipse(t.x, t.y, d, d);
    });
    if(s.mouseIsPressed){
      lightning(center.x, center.y, s.mouseX, s.mouseY);
      s.ellipse(s.mouseX, s.mouseY, d, d);
    }
    exitingTouchCircles.forEach(tc => {
      s.ellipse(tc.position.x, tc.position.y, 50, 50);
      lightning(center.x, center.y, tc.position.x, tc.position.y);
      tc.stepToward(center.x, center.y);
    });
    for(var i=exitingTouchCircles.length-1; i>=0; i--){
      if(exitingTouchCircles[i].lifeLeft <= 0){
        exitingTouchCircles.splice(i,1);
      }
    }
    s.ellipse(center.x, center.y, d, d);
  }

  function update(){
    if(!updating) return;
    bg.update();
  }

  s.keyTyped = () => {
    if(key == 'w'){
      oscillatorWaves.next();
      let w = oscillatorWaves.getCurrent();
      console.log('switching oscillators to type:', w);
      for(let o of oscillators){
        o.setType(w);
      }
    }
    if(key == 'u'){
      updating = !updating;
      console.log('updating ' + (updating ? 'resumed' : 'paused'));
    }
    if(key == 'd'){
      drawing = !drawing;
      console.log('drawing ' + (drawing ? 'resumed' : 'paused'));
    }
  }

  function partition(array, predicate){
    let trues = [];
    let falses = [];
    for(var i=0; i<array.length; i++){
      let item = array[i];
      if(predicate(item)){
        trues.push(item);
      } else {
        falses.push(item);
      }
    }
    return {true: trues, false: falses};
  }
},'sketch');