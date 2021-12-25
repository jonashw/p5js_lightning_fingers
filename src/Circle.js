  function Circle(id,position,diameter,lifetime){
    this.id = id;
    this.position = position;
    this.diameter = diameter;
    this.radius = diameter/2;
    this.lifetime = lifetime;
    this.lifeLeft = lifetime;
    this.draw = function(){
      ellipse(pos.x, pos.y, diameter, diameter);
    };
    this.containsPoint = function(point){
      return dist(this.position.x, this.position.y, point.x, point.y) <= this.radius;
    };
    this.stepToward = function(x, y){
      this.position.x += this.heading.x/this.lifetime;
      this.position.y += this.heading.y/this.lifetime;
      this.lifeLeft--;
    };
  }