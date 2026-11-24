const SETTINGS_BAR_HEIGHT = 112;

let miffies = [];
let helloKitties = [];
let bullets = [];
let doneForBurst = [];
let settingsBar;

let gameBackground;
let miffyImage;
let helloKittyImage;
let helloKittyDeathImage;
let doneForImage;

let miffySpeed = 10;
let miffyForce = 0.4;
let kittySpeed = 10;
let kittyEscapeSpeed = 20;
let evadeDistance = 100;
let miffySize = 96;
let helloKittySize = 96;
let miffyCount = 1;
let helloKittyCount = 10;
let bulletCooldownMs = 700;

function preload() {
  gameBackground = loadImage('../images/space.jpeg');
  miffyImage = loadImage('../images/attacker.png');
  helloKittyImage = loadImage('../images/attacked.png');
  helloKittyDeathImage = loadImage('../images/attacked_death.png');
  doneForImage = loadImage('../images/done_for.png');
}

function setup() {
  const canvas = createCanvas(windowWidth, max(1, windowHeight - SETTINGS_BAR_HEIGHT));
  canvas.position(0, SETTINGS_BAR_HEIGHT);
  settingsBar = createDiv();
  settingsBar.addClass('settings-bar');
  createPopulation();
  createParameterControls();
}

function windowResized() {
  resizeCanvas(windowWidth, max(1, windowHeight - SETTINGS_BAR_HEIGHT));
}

function createPopulation() {
  while (miffies.length < miffyCount) {
    const miffy = new Miffy(random(width), random(height));
    miffy.maxSpeed = miffySpeed;
    miffy.maxForce = miffyForce;
    miffy.size = miffySize;
    miffy.r = miffySize / 2;
    miffy.vel = p5.Vector.random2D().mult(2);
    miffy.lastShotAt = -bulletCooldownMs;
    miffies.push(miffy);
  }
  miffies.length = miffyCount;

  const livingKitties = helloKitties.filter(kitty => !kitty.isDead);
  while (livingKitties.length > helloKittyCount) {
    const kitty = livingKitties.pop();
    helloKitties.splice(helloKitties.indexOf(kitty), 1);
  }
  while (livingKitties.length < helloKittyCount) {
    const kitty = createHelloKitty();
    helloKitties.push(kitty);
    livingKitties.push(kitty);
  }
}

function createHelloKitty() {
  const kitty = new HelloKitty(random(width), random(height));
  kitty.maxSpeed = kittySpeed;
  kitty.maxForce = 0.5;
  kitty.rayonDetection = evadeDistance;
  kitty.size = helloKittySize;
  kitty.r = helloKittySize / 2;
  return kitty;
}

function draw() {
  push();
  imageMode(CENTER);
  translate(width / 2, height / 2);
  rotate(HALF_PI);
  image(gameBackground, 0, 0, height, width);
  pop();

  miffies.forEach(miffy => {
    const kitty = closestHelloKitty(miffy, helloKitties);
    if (kitty) {
      miffy.applyForce(miffy.pursue(kitty));
      if (millis() - miffy.lastShotAt >= bulletCooldownMs) {
        fireBullet(miffy, kitty);
        miffy.lastShotAt = millis();
      }
    }
    miffy.update();
    miffy.edges();
    miffy.show();
  });

  helloKitties.forEach(kitty => {
    if (kitty.isDead) {
      kitty.show();
      return;
    }

    kitty.edges();
    const miffy = closestMiffy(kitty, miffies);
    if (miffy) {
      const distance = p5.Vector.dist(miffy.pos, kitty.pos);
      kitty.maxSpeed = distance < evadeDistance ? kittyEscapeSpeed : kittySpeed;
      kitty.maxForce = distance < evadeDistance ? 1 : 0.5;
      if (distance < evadeDistance) kitty.applyForce(kitty.evade(miffy));
    }
    kitty.update();
    kitty.show();
  });

  updateBullets();
  drawDoneForBurst();

  helloKitties = helloKitties.filter(kitty => !kitty.isDead || millis() - kitty.deathTime < 10000);
  while (helloKitties.filter(kitty => !kitty.isDead).length < helloKittyCount) {
    helloKitties.push(createHelloKitty());
  }
}

function createParameterControls() {
  makeSlider('Miffys', 1, 10, miffyCount, 1, value => {
    miffyCount = value;
    createPopulation();
  });
  makeSlider('Hello Kitties', 1, 30, helloKittyCount, 1, value => {
    helloKittyCount = value;
    createPopulation();
  });
  makeSlider('Miffy size', 40, 180, miffySize, 4, value => {
    miffySize = value;
    miffies.forEach(miffy => { miffy.size = value; miffy.r = value / 2; });
  });
  makeSlider('Hello Kitty size', 40, 180, helloKittySize, 4, value => {
    helloKittySize = value;
    helloKitties.filter(kitty => !kitty.isDead).forEach(kitty => {
      kitty.size = value;
      kitty.r = value / 2;
    });
  });
  makeSlider('Miffy speed', 0, 24, miffySpeed, 0.5, value => {
    miffySpeed = value;
    miffies.forEach(miffy => { miffy.maxSpeed = value; });
  });
  makeSlider('Miffy force', 0, 1, miffyForce, 0.05, value => {
    miffyForce = value;
    miffies.forEach(miffy => { miffy.maxForce = value; });
  });
  makeSlider('Evade distance', 0, 400, evadeDistance, 10, value => {
    evadeDistance = value;
    helloKitties.filter(kitty => !kitty.isDead).forEach(kitty => { kitty.rayonDetection = value; });
  });
  makeSlider('Kitty speed', 0, 20, kittySpeed, 1, value => { kittySpeed = value; });
  makeSlider('Escape speed', 0, 32, kittyEscapeSpeed, 1, value => { kittyEscapeSpeed = value; });
  makeSlider('Shot delay', 100, 2000, bulletCooldownMs, 50, value => {
    bulletCooldownMs = value;
  });
}

function makeSlider(labelText, minValue, maxValue, initialValue, step, onChange) {
  const group = createDiv().parent(settingsBar);
  group.addClass('setting-control');
  const label = createDiv(`${labelText}: ${initialValue}`).parent(group);
  label.addClass('setting-label');
  const slider = createSlider(minValue, maxValue, initialValue, step).parent(group);
  slider.addClass('setting-slider');
  slider.input(() => {
    label.html(`${labelText}: ${slider.value()}`);
    onChange(Number(slider.value()));
  });
}

function fireBullet(miffy, kitty) {
  const direction = p5.Vector.sub(kitty.pos, miffy.pos).setMag(16);
  bullets.push({
    pos: miffy.pos.copy(),
    velocity: direction,
    life: 120
  });
}

function updateBullets() {
  bullets = bullets.filter(bullet => bullet.life > 0);
  bullets.forEach(bullet => {
    bullet.pos.add(bullet.velocity);
    bullet.life--;
    noStroke();
    fill('#ff4db8');
    circle(bullet.pos.x, bullet.pos.y, 12);

    const hitKitty = helloKitties.find(kitty => !kitty.isDead &&
      p5.Vector.dist(bullet.pos, kitty.pos) < kitty.r + 6);
    if (hitKitty) {
      hitKitty.isDead = true;
      hitKitty.deathTime = millis();
      createDoneForBurst(hitKitty.pos);
      bullet.life = 0;
    }
  });
}

function createDoneForBurst(position) {
  for (let i = 0; i < 36; i++) {
    const angle = random(TWO_PI);
    const speed = random(2, 9);
    doneForBurst.push({
      x: position.x,
      y: position.y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      size: random(18, 42),
      rotation: random(TWO_PI),
      spin: random(-0.12, 0.12),
      life: random(45, 85),
      maxLife: 85
    });
  }
}

function drawDoneForBurst() {
  doneForBurst = doneForBurst.filter(particle => particle.life > 0);
  imageMode(CENTER);
  doneForBurst.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.985;
    particle.vy = particle.vy * 0.985 + 0.035;
    particle.rotation += particle.spin;
    particle.life--;

    push();
    translate(particle.x, particle.y);
    rotate(particle.rotation);
    tint(255, map(particle.life, 0, particle.maxLife, 0, 255));
    image(doneForImage, 0, 0, particle.size, particle.size * 1.41);
    pop();
  });
}

function closestHelloKitty(miffy, kitties) {
  let closest = null;
  let minimumDistance = Infinity;
  kitties.forEach(kitty => {
    if (kitty.isDead) return;
    const distance = p5.Vector.dist(miffy.pos, kitty.pos);
    if (distance < minimumDistance) {
      minimumDistance = distance;
      closest = kitty;
    }
  });
  return closest;
}

function closestMiffy(kitty, miffyList) {
  let closest = null;
  let minimumDistance = Infinity;
  miffyList.forEach(miffy => {
    const distance = p5.Vector.dist(miffy.pos, kitty.pos);
    if (distance < minimumDistance) {
      minimumDistance = distance;
      closest = miffy;
    }
  });
  return closest;
}
