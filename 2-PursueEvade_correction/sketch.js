const SETTINGS_BAR_HEIGHT = 112;

let miffies = [];
let helloKitties = [];
let bullets = [];
let doneForBurst = [];
let settingsBar;
let soundEngine;

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
let wave = 1;
let score = 0;
let wavePendingAt = null;
let waveAnnouncementUntil = 0;
let volume = 60;

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
  soundEngine = new SoundEngine();
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
  kitty.maxSpeed = kittySpeed * waveSpeedMultiplier();
  kitty.maxForce = 0.5 * waveForceMultiplier();
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

  let chasingCount = 0;
  let fleeingCount = 0;
  miffies.forEach(miffy => {
    const kitty = closestHelloKitty(miffy, helloKitties);
    if (kitty) {
      chasingCount++;
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
      const isFleeing = distance < evadeDistance;
      kitty.maxSpeed = (isFleeing ? kittyEscapeSpeed : kittySpeed) * waveSpeedMultiplier();
      kitty.maxForce = (isFleeing ? 1 : 0.5) * waveForceMultiplier();
      if (isFleeing) {
        fleeingCount++;
        kitty.applyForce(kitty.evade(miffy));
      }
    }
    kitty.update();
    kitty.show();
  });

  updateBullets();
  drawDoneForBurst();

  helloKitties = helloKitties.filter(kitty => !kitty.isDead || millis() - kitty.deathTime < 10000);
  updateWave();
  soundEngine.updateMusic({
    dtMs: deltaTime,
    targetCount: livingHelloKittyCount(),
    referenceCount: helloKittyCount,
    chasingCount,
    fleeingCount,
    wave
  });
  drawHud();
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
  makeSlider('Volume', 0, 100, volume, 1, value => {
    volume = value;
    soundEngine.unlock();
    soundEngine.setVolume(value / 100);
  });

  const audioToggle = createButton('Audio: ON').parent(settingsBar);
  audioToggle.addClass('setting-audio');
  audioToggle.mousePressed(() => {
    const isEnabled = soundEngine.toggleEnabled();
    audioToggle.html(`Audio: ${isEnabled ? 'ON' : 'OFF'}`);
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
  const distance = p5.Vector.dist(miffy.pos, kitty.pos);
  const leadFrames = distance / 16;
  const aimPoint = kitty.pos.copy().add(kitty.vel.copy().mult(leadFrames));
  const direction = p5.Vector.sub(aimPoint, miffy.pos);
  bullets.push(new Bullet(miffy.pos.x, miffy.pos.y, direction));
}

function updateBullets() {
  bullets = bullets.filter(bullet => !bullet.isDead);
  bullets.forEach(bullet => {
    bullet.update();
    bullet.show();

    const hitKitty = helloKitties.find(kitty => {
      if (kitty.isDead) return false;
      const dx = bullet.pos.x - kitty.pos.x;
      const dy = bullet.pos.y - kitty.pos.y;
      const hitRadius = kitty.r + bullet.r;
      return dx * dx + dy * dy < hitRadius * hitRadius;
    });
    if (hitKitty) {
      bullet.isDead = true;
      if (hitKitty.takeDamage(1)) {
        hitKitty.isDead = true;
        hitKitty.deathTime = millis();
        score++;
        soundEngine.playTargetDeath(hitKitty.pos.x, width, hitKitty.r);
        createDoneForBurst(hitKitty.pos);
      }
    }
  });
  bullets = bullets.filter(bullet => !bullet.isDead);
}

function createDoneForBurst(position) {
  for (let i = 0; i < 36; i++) {
    const angle = random(TWO_PI);
    const speed = random(2, 9);
    const particle = new DoneForParticle(
      position.x,
      position.y,
      cos(angle) * speed,
      sin(angle) * speed,
      random(18, 42),
      random(TWO_PI),
      random(-0.12, 0.12),
      random(45, 85),
      85
    );
    doneForBurst.push(particle);
  }
}

function drawDoneForBurst() {
  doneForBurst = doneForBurst.filter(particle => particle.life > 0);
  doneForBurst.forEach(particle => {
    particle.update();
    particle.rotation += particle.spin;
    particle.show();
  });
}

function updateWave() {
  const livingCount = livingHelloKittyCount();
  if (livingCount > 0) {
    wavePendingAt = null;
    return;
  }

  if (wavePendingAt === null) {
    wavePendingAt = millis();
    waveAnnouncementUntil = wavePendingAt + 1600;
  } else if (millis() - wavePendingAt >= 1600) {
    wave++;
    wavePendingAt = null;
    createPopulation();
    soundEngine.playWaveStart(wave);
    waveAnnouncementUntil = millis() + 1600;
  }
}

function livingHelloKittyCount() {
  return helloKitties.reduce((count, kitty) => count + (kitty.isDead ? 0 : 1), 0);
}

function waveSpeedMultiplier() {
  return 1 + (wave - 1) * 0.15;
}

function waveForceMultiplier() {
  return 1 + (wave - 1) * 0.1;
}

function drawHud() {
  push();
  const label = `Wave ${wave}  ·  Score ${score}  ·  Hello Kitties ${livingHelloKittyCount()}`;
  textSize(16);
  textStyle(BOLD);
  textAlign(RIGHT, CENTER);
  const paddingX = 14;
  const boxHeight = 38;
  const boxWidth = textWidth(label) + paddingX * 2;
  const boxX = width - boxWidth - 14;
  const boxY = 14;
  fill(12, 15, 35, 205);
  stroke(255, 255, 255, 120);
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 8);
  noStroke();
  fill(255);
  text(label, boxX + boxWidth - paddingX, boxY + boxHeight / 2);
  if (wavePendingAt !== null && millis() < waveAnnouncementUntil) {
    textAlign(CENTER, CENTER);
    textSize(26);
    text('Wave clear!', width / 2, height / 2);
  } else if (millis() < waveAnnouncementUntil) {
    textAlign(CENTER, CENTER);
    textSize(26);
    text(`Wave ${wave}`, width / 2, height / 2);
  }
  pop();
}

function mousePressed() {
  if (soundEngine && soundEngine.enabled) soundEngine.unlock();
}

function keyPressed() {
  if (soundEngine && soundEngine.enabled) soundEngine.unlock();
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
