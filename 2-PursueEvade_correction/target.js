class HelloKitty extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D().mult(6);
    this.rayonDetection = 100;
    this.isDead = false;
    this.maxHp = Math.floor(random(5, 11));
    this.hp = this.maxHp;
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

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp === 0;
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
      this.drawHealthBar();
    }
    pop();
  }

  drawHealthBar() {
    const barWidth = this.size * 0.66;
    const barHeight = Math.max(5, this.size * 0.07);
    const x = this.pos.x - barWidth / 2;
    const y = this.pos.y - this.size * 0.54;

    noStroke();
    fill(35, 24, 50, 220);
    rect(x, y, barWidth, barHeight, 3);
    fill('#ff5fa2');
    rect(x, y, barWidth * (this.hp / this.maxHp), barHeight, 3);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(Math.max(11, this.size * 0.16));
    text(this.hp, this.pos.x, this.pos.y);
  }
}
