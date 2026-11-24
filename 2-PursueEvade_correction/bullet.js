class Bullet extends Vehicle {
  constructor(x, y, direction, speed = 16) {
    super(x, y);
    this.vel = direction.copy().setMag(speed);
    this.maxSpeed = speed;
    this.maxForce = 0;
    this.r = 6;
    this.life = 120;
    this.isDead = false;
  }

  update() {
    super.update();
    this.life--;
    if (this.life <= 0 || this.pos.x < 0 || this.pos.x > width ||
        this.pos.y < 0 || this.pos.y > height) {
      this.isDead = true;
    }
  }

  show() {
    push();
    noStroke();
    fill('#ff4db8');
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
