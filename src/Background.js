function Background(s,colors){
  let _colors = new CircularArray(colors);

  this.update = function(){
    _colors.next();
  };

  this.draw = function(){
    let color = _colors.getCurrent();
    s.background(color);
    /* The following does not work as expected.  
    ** I need to learn more about p5.Color! */
    //let p = 50;
    //let l = color.levels;
    //text(`HSL(${l[0]},${l[1]},${l[2]})`, p, height - p, width, height);
  };
}