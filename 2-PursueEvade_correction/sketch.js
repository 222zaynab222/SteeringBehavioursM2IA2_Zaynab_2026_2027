const TOP_UI_HEIGHT = 104;
const PC_SCREEN_RECT = { left: 0.194, top: 0.194, width: 0.612, height: 0.46 };

let miffies = [];
let helloKitties = [];
let bullets = [];
let doneForBurst = [];
let settingsHeader;
let gameCanvas;
let soundEngine;
let gameState = 'ready';
let mouseSteeringTarget;
let previousMouseX = 0;
let previousMouseY = 0;
let miffyCountSlider;
let helloKittyCountSlider;

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
let miffyBehavior = 'all';
let arrivalRadius = 140;
let score = 0;
let volume = 60;

function preload() {
  gameBackground = loadImage('../images/background.jpeg');
  miffyImage = loadImage('../images/attacker.png');
  helloKittyImage = loadImage('../images/attacked.png');
  helloKittyDeathImage = loadImage('../images/attacked_death.png');
  doneForImage = loadImage('../images/done_for.png');
}

function setup() {
  const screen = getPcScreenRect();
  gameCanvas = createCanvas(screen.width, screen.height);
  gameCanvas.position(screen.x, screen.y);
  settingsHeader = createDiv();
  settingsHeader.addClass('settings-header');
  updatePcBackdropSize();
  soundEngine = new SoundEngine();
  mouseSteeringTarget = {
    pos: createVector(width / 2, height / 2),
    vel: createVector(0, 0)
  };
  createParameterControls();
}

function windowResized() {
  const screen = getPcScreenRect();
  resizeCanvas(screen.width, screen.height);
  gameCanvas.position(screen.x, screen.y);
  updatePcBackdropSize();
}

function getPcFrameRect() {
  const availableHeight = Math.max(1, windowHeight - TOP_UI_HEIGHT);
  const size = Math.max(1, Math.min(windowWidth, availableHeight));
  return {
    x: (windowWidth - size) / 2,
    y: TOP_UI_HEIGHT + (availableHeight - size) / 2,
    size
  };
}

function getPcScreenRect() {
  const frame = getPcFrameRect();
  return {
    x: frame.x + frame.size * PC_SCREEN_RECT.left,
    y: frame.y + frame.size * PC_SCREEN_RECT.top,
    width: Math.max(1, Math.floor(frame.size * PC_SCREEN_RECT.width)),
    height: Math.max(1, Math.floor(frame.size * PC_SCREEN_RECT.height))
  };
}

function updatePcBackdropSize() {
  const frame = getPcFrameRect();
  document.body.style.backgroundSize = `${frame.size}px ${frame.size}px`;
  document.body.style.backgroundPosition = `${frame.x}px ${frame.y}px`;
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
  drawGameBackground();
  if (gameState === 'ready') {
    drawStartScreen();
    return;
  }
  if (gameState === 'gameOver') {
    helloKitties.forEach(kitty => kitty.show());
    miffies.forEach(miffy => miffy.show());
    drawDoneForBurst();
    drawGameOverScreen();
    return;
  }

  updateMouseSteeringTarget();
  runGameFrame();
}

function drawGameBackground() {
  push();
  imageMode(CENTER);
  translate(width / 2, height / 2);
  rotate(HALF_PI);
  image(gameBackground, 0, 0, height, width);
  pop();
}

function runGameFrame() {
  let chasingCount = 0;
  let fleeingCount = 0;
  miffies.forEach(miffy => {
    const kitty = closestHelloKitty(miffy, helloKitties);
    if (kitty) {
      chasingCount++;
      if (millis() - miffy.lastShotAt >= bulletCooldownMs) {
        fireBullet(miffy, kitty);
        miffy.lastShotAt = millis();
      }
    }
    miffy.applyForce(getMiffySteering(miffy, mouseSteeringTarget));
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
      kitty.maxSpeed = isFleeing ? kittyEscapeSpeed : kittySpeed;
      kitty.maxForce = isFleeing ? 1 : 0.5;
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
  if (livingHelloKittyCount() === 0) {
    gameState = 'gameOver';
    setPopulationControlsEnabled(true);
  }
  soundEngine.updateMusic({
    dtMs: deltaTime,
    targetCount: livingHelloKittyCount(),
    referenceCount: helloKittyCount,
    chasingCount,
    fleeingCount
  });
  drawHud();
}

function updateMouseSteeringTarget() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  const x = constrain(mouseX, 0, width);
  const y = constrain(mouseY, 0, height);
  mouseSteeringTarget.vel.set(x - previousMouseX, y - previousMouseY).limit(16);
  mouseSteeringTarget.pos.set(x, y);
  previousMouseX = x;
  previousMouseY = y;
}

function startGame() {
  miffies = [];
  helloKitties = [];
  bullets = [];
  doneForBurst = [];
  score = 0;
  gameState = 'playing';
  setPopulationControlsEnabled(false);
  previousMouseX = constrain(mouseX, 0, width);
  previousMouseY = constrain(mouseY, 0, height);
  mouseSteeringTarget.pos.set(previousMouseX, previousMouseY);
  mouseSteeringTarget.vel.set(0, 0);
  createPopulation();
}

function getGameActionButton() {
  const buttonWidth = Math.min(220, width * 0.72);
  const buttonHeight = 52;
  return {
    x: (width - buttonWidth) / 2,
    y: height * 0.62,
    width: buttonWidth,
    height: buttonHeight
  };
}

function drawGameActionButton(label) {
  const button = getGameActionButton();
  push();
  rectMode(CORNER);
  fill('#ef5baf');
  stroke('#fff3fb');
  strokeWeight(2);
  rect(button.x, button.y, button.width, button.height, 16);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(label, button.x + button.width / 2, button.y + button.height / 2);
  pop();
}

function drawStartScreen() {
  push();
  fill(28, 20, 48, 155);
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(Math.min(30, width * 0.075));
  text('Miffy vs Hello Kitty', width / 2, height * 0.32);
  textStyle(NORMAL);
  textSize(Math.min(15, width * 0.04));
  text('Move Miffy with your mouse. Defeat every Hello Kitty!',
    width / 2, height * 0.45, width * 0.84, 42);
  pop();
  drawGameActionButton('START GAME');
}

function drawGameOverScreen() {
  push();
  fill(28, 20, 48, 170);
  noStroke();
  rect(0, 0, width, height);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(Math.min(34, width * 0.09));
  text('GAME OVER', width / 2, height * 0.35);
  textSize(Math.min(18, width * 0.05));
  text(`Score: ${score}`, width / 2, height * 0.48);
  pop();
  drawGameActionButton('START AGAIN');
}

function setPopulationControlsEnabled(enabled) {
  if (miffyCountSlider) miffyCountSlider.elt.disabled = !enabled;
  if (helloKittyCountSlider) helloKittyCountSlider.elt.disabled = !enabled;
}

function createParameterControls() {
  const miffySettings = createCharacterSettingsCard(
    'Miffy', '../images/attacker.png', 'character-card--miffy'
  );
  const kittySettings = createCharacterSettingsCard(
    'Hello Kitty', '../images/attacked.png', 'character-card--kitty'
  );
  const generalSettings = createDiv().parent(settingsHeader);
  generalSettings.addClass('general-settings');
  createDiv('GAME SETTINGS').parent(generalSettings).addClass('general-settings__title');

  miffyCountSlider = makeSlider(miffySettings, 'Miffies', 1, 10, miffyCount, 1, value => {
    miffyCount = value;
  });
  makeSlider(miffySettings, 'Miffy size', 40, 180, miffySize, 4, value => {
    miffySize = value;
    miffies.forEach(miffy => { miffy.size = value; miffy.r = value / 2; });
  });
  makeSlider(miffySettings, 'Miffy speed', 0, 24, miffySpeed, 0.5, value => {
    miffySpeed = value;
    miffies.forEach(miffy => { miffy.maxSpeed = value; });
  });
  makeSlider(miffySettings, 'Miffy force', 0, 1, miffyForce, 0.05, value => {
    miffyForce = value;
    miffies.forEach(miffy => { miffy.maxForce = value; });
  });
  makeSlider(miffySettings, 'Arrival radius', 0, 400, arrivalRadius, 10,
    value => { arrivalRadius = value; });

  helloKittyCountSlider = makeSlider(kittySettings, 'Hello Kitties', 1, 30, helloKittyCount, 1, value => {
    helloKittyCount = value;
  });
  makeSlider(kittySettings, 'Hello Kitty size', 40, 180, helloKittySize, 4, value => {
    helloKittySize = value;
    helloKitties.filter(kitty => !kitty.isDead).forEach(kitty => {
      kitty.size = value;
      kitty.r = value / 2;
    });
  });
  makeSlider(kittySettings, 'Kitty speed', 0, 20, kittySpeed, 1,
    value => { kittySpeed = value; });
  makeSlider(kittySettings, 'Escape speed', 0, 32, kittyEscapeSpeed, 1,
    value => { kittyEscapeSpeed = value; });
  makeSlider(kittySettings, 'Evade distance', 0, 400, evadeDistance, 10, value => {
    evadeDistance = value;
    helloKitties.filter(kitty => !kitty.isDead).forEach(kitty => { kitty.rayonDetection = value; });
  });

  const behaviorGroup = createDiv().parent(generalSettings);
  behaviorGroup.addClass('general-setting');
  createDiv('Miffy behavior').parent(behaviorGroup).addClass('general-setting__label');
  const behaviorSelect = createSelect().parent(behaviorGroup);
  behaviorSelect.addClass('setting-select');
  behaviorSelect.option('All behaviors', 'all');
  behaviorSelect.option('Seek', 'seek');
  behaviorSelect.option('Pursue', 'pursue');
  behaviorSelect.option('Arrival', 'arrive');
  behaviorSelect.option('Wander', 'wander');
  behaviorSelect.selected(miffyBehavior);
  behaviorSelect.changed(() => { miffyBehavior = behaviorSelect.value(); });

  makeSlider(generalSettings, 'Shot delay', 100, 2000, bulletCooldownMs, 50, value => {
    bulletCooldownMs = value;
  });
  makeSlider(generalSettings, 'Volume', 0, 100, volume, 1, value => {
    volume = value;
    soundEngine.unlock();
    soundEngine.setVolume(value / 100);
  });

  const audioToggle = createButton('Audio: ON').parent(generalSettings);
  audioToggle.addClass('setting-audio');
  audioToggle.mousePressed(() => {
    const isEnabled = soundEngine.toggleEnabled();
    audioToggle.html(`Audio: ${isEnabled ? 'ON' : 'OFF'}`);
  });
}

function createCharacterSettingsCard(name, imagePath, modifierClass) {
  const card = createDiv().parent(settingsHeader);
  card.addClass('character-card');
  card.addClass(modifierClass);

  const trigger = createButton('').parent(card);
  trigger.addClass('character-card__trigger');
  trigger.attribute('aria-expanded', 'false');
  createImg(imagePath, `${name} settings`)
    .parent(trigger)
    .addClass('character-card__image');
  createSpan(name).parent(trigger).addClass('character-card__name');

  const panel = createDiv().parent(card);
  panel.addClass('character-card__panel');
  trigger.mousePressed(() => {
    const isOpen = card.elt.classList.toggle('character-card--open');
    trigger.attribute('aria-expanded', String(isOpen));
  });
  return panel;
}

function getMiffySteering(miffy, target) {
  switch (miffyBehavior) {
    case 'seek':
      return miffy.seek(target.pos);
    case 'arrive':
      return miffy.arrive(target.pos, arrivalRadius);
    case 'wander': {
      const wanderingForce = miffy.wander().mult(0.65);
      wanderingForce.add(miffy.seek(target.pos).mult(0.35));
      return wanderingForce.limit(miffy.maxForce);
    }
    case 'all': {
      const combinedForce = createVector(0, 0);
      combinedForce.add(miffy.seek(target.pos).mult(0.2));
      combinedForce.add(miffy.pursue(target).mult(0.35));
      combinedForce.add(miffy.arrive(target.pos, arrivalRadius).mult(0.3));
      combinedForce.add(miffy.wander().mult(0.15));
      return combinedForce.limit(miffy.maxForce);
    }
    case 'pursue':
    default:
      return miffy.pursue(target);
  }
}

function makeSlider(parent, labelText, minValue, maxValue, initialValue, step, onChange) {
  const group = createDiv().parent(parent);
  group.addClass('setting-control');
  const label = createDiv(`${labelText}: ${initialValue}`).parent(group);
  label.addClass('setting-label');
  const slider = createSlider(minValue, maxValue, initialValue, step).parent(group);
  slider.addClass('setting-slider');
  slider.input(() => {
    label.html(`${labelText}: ${slider.value()}`);
    onChange(Number(slider.value()));
  });
  return slider;
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

function livingHelloKittyCount() {
  return helloKitties.reduce((count, kitty) => count + (kitty.isDead ? 0 : 1), 0);
}

function drawHud() {
  push();
  const behaviorLabel = miffyBehavior === 'all' ? 'ALL 4 BEHAVIORS' : miffyBehavior.toUpperCase();
  const label = `Score ${score}  ·  ${behaviorLabel}`;
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
  pop();
}

function mousePressed(event) {
  if (soundEngine && soundEngine.enabled) soundEngine.unlock();
  if (!gameCanvas || event.target !== gameCanvas.elt || gameState === 'playing') return;

  const button = getGameActionButton();
  if (mouseX >= button.x && mouseX <= button.x + button.width &&
      mouseY >= button.y && mouseY <= button.y + button.height) {
    startGame();
  }
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
