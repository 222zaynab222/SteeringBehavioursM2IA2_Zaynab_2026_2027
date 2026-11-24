class Miffy extends Vehicle {
  show() {
    push();
    imageMode(CENTER);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    image(miffyImage, 0, 0, this.size, this.size * 1.17);
    pop();
  }
}
