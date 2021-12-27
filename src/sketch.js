new p5(s => {
  /*jshint esversion: 6 */
  var bgColors=new CircularArray(['red']);
  var updating = true;
  var drawing = true;
  let exitingTouchCircles = [];
  var fingers = [];
  var center = {x:0, y:0};
  s.colorMode(s.HSL, 255, 255, 255, 100);
  const lightningColors = Array(55).fill().map((_,i) => s.color(200 + i,255,100));
  const randomLightningColor = () => {
    let i = parseInt(s.noise(s.frameCount/30) * lightningColors.length) - 1;
    return lightningColors[i];
  }
  let monoSynth;
  let oscillators = [];
  const oscillatorWaves = new CircularArray([ 'triangle', 'sine', 'sawtooth','square' ]);
  let lightningFactors = new CircularArray([100]);

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    center.x = s.windowWidth/2;
    center.y = s.windowHeight/2;
  };

  s.setup = () => {
    monoSynth = new p5.MonoSynth();
    //greatly impraove performance with a pixelDensity less than 1:
    //pixelDensity(0.125);
    s.pixelDensity(1);
    //alert('pixelDensity: ' + pixelDensity());
    //alert('displayDensity: ' + displayDensity());
    bgColors = (() => {
      var _hues = [];
      let bgLerpFactor = 8;
      for(var h=0;h<256*bgLerpFactor;h++){
        _hues.push(s.color(h/bgLerpFactor,255,148));
      }
      return new CircularArray(_hues);
    })();
    s.angleMode(s.DEGREES);
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.windowResized();
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

    let dd = s.displayDensity();
    lightningFactors = new CircularArray([dd * 50, dd*75, dd*100, dd*200]);
    console.log('setUp ran', s);
  }

  s.draw = () => {
    if(updating){
      bgColors.next();
      for(var i=exitingTouchCircles.length-1; i>=0; i--){
        let tc = exitingTouchCircles[i];
        tc.stepToward(center.x, center.y);
        if(tc.lifeLeft <= 0){
          exitingTouchCircles.splice(i,1);
        }
      }

    }
    setFirstNOscillatorsPlaying(fingers.length + exitingTouchCircles.length);
    if(!drawing){
      return;
    }
    s.background(bgColors.getCurrent());
    let lightningColor = randomLightningColor();
    if(lightningColor){
      s.stroke(lightningColor);
      s.fill(lightningColor);
    }
    let dd = s.displayDensity();
    let d = lightningFactors.getCurrent();
    let strokeWeight = 5 * dd;
    fingers.forEach(t => {
      lightning(s, center.x, center.y, t.x, t.y, d, strokeWeight);
      s.ellipse(t.x, t.y, d, d);
    });

    for(let tc of exitingTouchCircles){
      s.ellipse(tc.position.x, tc.position.y, d/3, d/3);
      lightning(s, center.x, center.y, tc.position.x, tc.position.y, d/3, strokeWeight/3);
    }

    s.ellipse(center.x, center.y, d, d);
  }

  const setFirstNOscillatorsPlaying = n => 
  {
    for(var i=0; i<oscillators.length; i++){
      let osc = oscillators[i];
      if(n <= i){
        osc.stop();
      } else {
        if(!osc.started){ //starting an already started osc creates an audible 'jerk'
          osc.start();
        }
        osc.amp(0.5/n); //10 osc at 0.5 amp sounds clippy.  let's instead keep volume consistent
      }
    }
  };

  const circleContainsPoint = (center, radius, point) =>
    s.dist(center.x, center.y, point.x, point.y) <= radius;

  s.mousePressed = () => {
    /* I'm not sure if this is strictly necessary: */
    beginExitOfTouches(fingers);
    let mouse = {x: s.mouseX, y: s.mouseY};
    if(circleContainsPoint(center, lightningFactors.getCurrent()/2, mouse)){
      playUpdateToggleSound(updating);
      updating = !updating;
      return;
    }
    fingers = [mouse];
    return false;
  };

  s.mouseReleased = () => {
    beginExitOfTouches(fingers);
    fingers = [];
    return false;
  }
  
  const playUpdateToggleSound = updating => {
      let time = 0;
      let dur = 1/6;
      let vel = 0.25;
      let note = updating ? 'C4' : 'G4';
      monoSynth.play(note, vel, time, dur);
  };

  s.touchStarted = (e) => {
    let touch = s.touches[s.touches.length-1];
    if(circleContainsPoint(center, lightningFactors.getCurrent()/2, touch)){
      playUpdateToggleSound(updating);
      updating = !updating;
      return;
    }
    fingers = s.touches;
    console.log(`touch started (total touches: ${s.touches.length}): `, touch.id);
    return false; /* This is to prevent pinch-zooming on touch devices: */
  }

  s.touchMoved = e => {
    fingers = s.touches;
  };

  s.touchEnded = (e) => {
    fingers = s.touches;
    let completedTouches = Array.from(e.changedTouches).map(getTouchInfo);
    let touchesToExit = completedTouches.filter(t => !circleContainsPoint(center, lightningFactors.getCurrent(), t));
    beginExitOfTouches(touchesToExit);
    console.log('finished touches:',  completedTouches.map(t => t.id).join(', '), completedTouches.map(t => `x:${t.x},y:${t.y}`));
    return false; /* This is to prevent pinch-zooming on touch devices: */
  }

  const beginExitOfTouches = completedTouches => {
    let c = s.createVector(center.x, center.y);
    let newlyEndedTouchCircles = completedTouches.map(touch => {
      let pos = s.createVector(touch.x, touch.y);
      let lifetime = 10;
      return {
        id: touch.id,
        position: pos,
        heading: p5.Vector.sub(c, pos),
        lifetime,
        lifeLeft: lifetime,
        stepToward: function(x, y){
          this.position.x += this.heading.x/this.lifetime;
          this.position.y += this.heading.y/this.lifetime;
          this.lifeLeft--;
        }
      };
    });
    for(let tc of newlyEndedTouchCircles){
      exitingTouchCircles.push(tc);
    }
  }

  const emulateTouchesViaPressedKeys = (pressedKeys) => {
    let n = pressedKeys.map(parseInt).filter(n => !isNaN(n))[0];
    if(n === 0){
      n = 10;
    }
    if(isNaN(n)){
      beginExitOfTouches(fingers);
      fingers = [];
    } else {
      fingers = Array(n).fill().map((_,i) => {
        let t = i/n * 2 * Math.PI;
        let r = Math.min(s.width/3, s.height/3);
        return {
          x: r*Math.cos(t) + center.x,
          y: r*Math.sin(t) + center.y
        };
      });
      console.log(fingers);
    }
    setFirstNOscillatorsPlaying(n || 0);
  }

  let pressedKeys = {};
  s.keyPressed = e => {
    //console.log('keyPressed',e);
    pressedKeys[e.key] = true;
    emulateTouchesViaPressedKeys(Object.keys(pressedKeys));
  }
 s.keyReleased = e => {
    //console.log('keyReleased',e);
    delete pressedKeys[e.key] 
    emulateTouchesViaPressedKeys(Object.keys(pressedKeys));
  }

  s.keyTyped = (e) => {
    const key = e.key;
    if(key === 'w'){
      oscillatorWaves.next();
      let w = oscillatorWaves.getCurrent();
      console.log('switching oscillators to type:', w);
      for(let o of oscillators){
        o.setType(w);
      }
    }
    if(key === 'l'){
      lightningFactors.next();
      console.log('switched lightningFactor to:', lightningFactors.getCurrent());
    }
    if(key === 'u'){
      updating = !updating;
      console.log('updating ' + (updating ? 'resumed' : 'paused'));
    }
    if(key === 'd'){
      drawing = !drawing;
      console.log('drawing ' + (drawing ? 'resumed' : 'paused'));
    }
  }

  function getTouchInfo(touch) {
    /* p5 uses its own coordinate system, requiring all touches be translated.  
    ** adapted from https://github.com/processing/p5.js/blob/374acfb44588bfd565c54d61264df197d798d121/src/events/touch.js */
    const canvas = s._curElement.elt;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.scrollWidth / s.width || 1;
    const sy = canvas.scrollHeight / s.height || 1;
    return {
      x: (touch.clientX - rect.left) / sx,
      y: (touch.clientY - rect.top) / sy,
      winX: touch.clientX,
      winY: touch.clientY,
      id: touch.identifier
    };
  }
},'sketch');