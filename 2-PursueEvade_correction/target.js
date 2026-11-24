class HelloKitty extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D().mult(6);
    this.rayonDetection = 100;
    this.isDead = false;
  }

  update() {
    super.update();

    if (this.pos.x + this.r >= width || this.pos.x - this.r <= 0) {
      this.pos.x = constrain(this.pos.x, this.r, width - this.r);
      this.vel.x *= -1;
    }
    if (this.pos.y + this.r >= height || this.pos.y - this.r <= 0) {
      this.pos.y = constrain(this.pos.y, this.r, height - this.r);
      this.vel.y *= -1;
    }
  }

  show() {
    push();
    imageMode(CENTER);
    if (this.isDead) {
      const elapsed = millis() - this.deathTime;
      const opacity = map(elapsed, 0, 10000, 255, 0, true);
      tint(255, opacity);
      image(helloKittyDeathImage, this.pos.x, this.pos.y, this.size, this.size * 0.85);
    } else {
      image(helloKittyImage, this.pos.x, this.pos.y, this.size, this.size);
    }
    pop();
  }
}
