class Vehicle {
  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 10;
    // force maximale appliquée au véhicule
    this.maxForce = 0.25;
    // rayon du véhicule
    this.r = 16;
    this.distanceCercle = 140;
    this.wanderRadius = 65;
    this.wanderTheta = 0;
    this.displaceRange = 0.35;
  }

  /*
   seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
   */
    seek(target) {
    // on calcule la direction vers la cible
    // C'est l'ETAPE 1 (action : se diriger vers une cible)
    let force = p5.Vector.sub(target, this.pos);

    // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
    // on limite ce vecteur à la longueur maxSpeed
    force.setMag(this.maxSpeed);
    // on calcule la force à appliquer pour atteindre la cible
    force.sub(this.vel);
    // on limite cette force à la longueur maxForce
    force.limit(this.maxForce);
    // on applique la force au véhicule
    return force;
  }

  arrive(target, slowingRadius = 140) {
    const desired = p5.Vector.sub(target, this.pos);
    const distance = desired.mag();
    let desiredSpeed = this.maxSpeed;
    if (slowingRadius > 0 && distance < slowingRadius) {
      desiredSpeed = map(distance, 0, slowingRadius, 0, this.maxSpeed);
    }
    desired.setMag(desiredSpeed);
    const force = p5.Vector.sub(desired, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  wander() {
    let forward = this.vel.copy();
    if (forward.magSq() === 0) forward = p5.Vector.fromAngle(random(TWO_PI));
    forward.setMag(this.distanceCercle);
    const circleCenter = p5.Vector.add(this.pos, forward);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    const theta = this.wanderTheta + this.vel.heading();
    const wanderPoint = createVector(
      circleCenter.x + this.wanderRadius * cos(theta),
      circleCenter.y + this.wanderRadius * sin(theta)
    );

    if (Vehicle.debug) {
      push();
      noFill();
      stroke(255, 180);
      circle(circleCenter.x, circleCenter.y, this.wanderRadius * 2);
      stroke('#ffe66d');
      line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);
      fill('#ffe66d');
      noStroke();
      circle(wanderPoint.x, wanderPoint.y, 8);
      pop();
    }

    return this.seek(wanderPoint);
  }

  // inverse de seek !
  flee(target, distanceDeDetection = Infinity) {
    return this.seek(target.pos, distanceDeDetection).mult(-1);
  }

  /* Poursuite d'un point devant la target !
     cette methode renvoie la force à appliquer au véhicule
  */
  pursue(target) {
    let targetAhead = target.vel.copy();
    targetAhead.mult(20);
    targetAhead.add(target.pos);
    return this.seek(targetAhead);
  }

  /* inverse de pursue
     cette methode renvoie la force à appliquer au véhicule
  */
  evade(target) {
    // TODO : on inverse la logique de pursue
    let force = this.pursue(target).mult(-1);
    return force;
  }

  /**  Fonction de poursuite parfaite (avec le point devant la
  target qui se rapproche quand le poursuiveur se rapproche)
  */
  pursuePerfect(vehicle) {
    // Use the Law of Sines (https://en.wikipedia.org/wiki/Law_of_sines)
    // to predict the right collision point
    const speed_ratio = vehicle.vel.mag() / this.maxSpeed;
    const target_angle = vehicle.vel.angleBetween(p5.Vector.sub(this.pos, vehicle.pos));
    const my_angle = asin(sin(target_angle) * speed_ratio);
    const dist = this.pos.dist(vehicle.pos);
    const prediction = dist * sin(my_angle) / sin(PI - my_angle - target_angle);
    const target = vehicle.vel.copy().setMag(prediction).add(vehicle.pos);
    
    drawArrow(vehicle.pos, p5.Vector.mult(vehicle.vel, 20), 'red');
    drawArrow(this.pos, p5.Vector.sub(target, this.pos), 'green');
    
    fill(0, 255, 0);
    circle(target.x, target.y, 8);
    return this.seek(target);
  }


  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteurr force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    // on ajoute l'accélération à la vitesse. L'accélération est un incrément de vitesse
    // (accélératiion = dérivée de la vitesse)
    this.vel.add(this.acc);
    // on contraint la vitesse à la valeur maxSpeed
    this.vel.limit(this.maxSpeed);
    // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
    // (la vitesse est la dérivée de la position)
    this.pos.add(this.vel);

    // on remet l'accélération à zéro
    this.acc.set(0, 0);
  }

  drawVector(pos, v) {
    push();
    // Dessin du vecteur depuis pos comme origne
    strokeWeight(3);
    stroke("red");
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x , pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  // que fait cette méthode ?
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

// draw an arrow for a vector at a given base position
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}
