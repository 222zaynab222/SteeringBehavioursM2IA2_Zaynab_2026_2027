class DoneForParticle extends Vehicle {
  constructor(x, y, vx, vy, size, rotation, spin, life, maxLife) {
    super(x, y);
    this.vel.set(vx, vy);
    this.maxSpeed = 16;
    this.maxForce = 0.08;
    this.size = size;
    this.rotation = rotation;
    this.spin = spin;
    this.life = life;
    this.maxLife = maxLife;
  }

  update() {
    this.applyForce(createVector(0, 0.035));
    super.update();
    this.vel.mult(0.985);
    this.life--;
  }

  show() {
    push();
    imageMode(CENTER);
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    tint(255, map(this.life, 0, this.maxLife, 0, 255));
    image(doneForImage, 0, 0, this.size, this.size * 1.41);
    pop();
  }
}
