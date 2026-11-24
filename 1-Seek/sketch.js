let target;
let vehicles = [];
let targets = [];
let targetFragments = [];
let controls;
let soundEngine;
let gradientPhase = 0;
let currentScenario = "scenario3";
let targetWave = 1;
let desiredTargetCount = 1;

const targetFleeSettings = {
  detectionRadius: 100,
  safeDistance: 300,
  fleeMaxSpeed: 12,
  fleeMaxForce: 0.8
};

const gradientSettings = {
  radius: 350,
  animationSpeed: 0.2,
  opacity: 180,
  ringCount: 80,
  colorOffset: 0
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  target = createVector(random(width), random(height));
  soundEngine = new SoundEngine();
  controls = createControls();
  setVehicleCount(Number(controls.count.slider.value()));
  setTargetCount(Number(controls.targetCount.slider.value()));
}

function draw() {
  background("black");

  gradientPhase = (gradientPhase + gradientSettings.animationSpeed * 6) % 360;
  drawRainbowGradient(mouseX, mouseY);

  target.x = mouseX;
  target.y = mouseY;

  if (currentScenario === "scenario1") {
    push();
    fill("red");
    noStroke();
    circle(target.x, target.y, 32);
    pop();
  }

  const fleeEnabled = currentScenario === "scenario3";
  let fleeingCount = 0;
  targets.forEach((movingTarget) => {
    movingTarget.applyBehaviors(vehicles, fleeEnabled);
    movingTarget.update();
    movingTarget.edges();
    movingTarget.show();
    if (movingTarget.isFleeing) {
      fleeingCount += 1;
    }
  });

  updateAndDrawTargetFragments();

  let chasingCount = 0;
  vehicles.forEach((vehicle) => {
    vehicle.applyBehaviors(target, targets, currentScenario);
    vehicle.update();
    vehicle.edges();
    if (currentScenario !== "scenario1") {
      checkVehicleTargetContact(vehicle);
    }
    if (vehicle.isChasing) {
      chasingCount += 1;
    }
    vehicle.show();
  });

  soundEngine.updateMusic({
    dtMs: deltaTime,
    targetCount: targets.length,
    referenceCount: desiredTargetCount,
    chasingCount,
    fleeingCount,
    wave: targetWave
  });

  drawTargetCounter();
}

function shatterTarget(movingTarget) {
  soundEngine.playTargetDeath(movingTarget.pos.x, width, movingTarget.r);

  const sliceCount = 8;
  const sliceAngle = TWO_PI / sliceCount;
  for (let i = 0; i < sliceCount; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;
    targetFragments.push(
      new TargetFragment(
        movingTarget.pos.x,
        movingTarget.pos.y,
        movingTarget.r,
        movingTarget.color,
        startAngle,
        endAngle
      )
    );
  }
}

function updateAndDrawTargetFragments() {
  for (let i = targetFragments.length - 1; i >= 0; i--) {
    const fragment = targetFragments[i];
    fragment.applyBehaviors();
    fragment.update();
    if (fragment.isFinished()) {
      targetFragments.splice(i, 1);
    } else {
      fragment.show();
    }
  }
}

function checkVehicleTargetContact(vehicle) {
  let targetKilled = false;

  for (let i = targets.length - 1; i >= 0; i--) {
    const movingTarget = targets[i];
    const dx = movingTarget.pos.x - vehicle.pos.x;
    const dy = movingTarget.pos.y - vehicle.pos.y;
    const hitRadius = movingTarget.r + vehicle.r;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      if (currentScenario === "scenario3") {
        movingTarget.hp = 0;
        shatterTarget(movingTarget);
        targets.splice(i, 1);
        targetKilled = true;
      } else {
        const isDead = movingTarget.takeDamage(1);
        if (isDead) {
          shatterTarget(movingTarget);
          targets.splice(i, 1);
          targetKilled = true;
        }
      }
    }
  }

  if (targetKilled && targets.length === 0) {
    const desiredCount = Number(controls.targetCount.slider.value());
    if (desiredCount > 0) {
      targetWave += 1;
      setTargetCount(desiredCount);
      soundEngine.playWaveStart(targetWave);
    }
  }
}

function drawTargetCounter() {
  push();
  const label = `Vague ${targetWave} · Cibles : ${targets.length}`;
  textSize(16);
  textStyle(BOLD);
  textAlign(RIGHT, CENTER);

  const paddingX = 14;
  const boxHeight = 36;
  const boxWidth = textWidth(label) + paddingX * 2;
  const boxX = width - boxWidth - 14;
  const boxY = 12;

  fill(15, 15, 25, 210);
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 8);

  noStroke();
  fill(255);
  text(label, boxX + boxWidth - paddingX, boxY + boxHeight / 2);
  pop();
}

function drawRainbowGradient(cx, cy) {
  const { radius, opacity, ringCount, colorOffset } = gradientSettings;
  if (opacity <= 0 || radius <= 0 || ringCount <= 0) {
    return;
  }

  const ctx = drawingContext;
  const maxAlpha = opacity / 255;

  push();
  ctx.save();

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  for (let i = 0; i < ringCount; i++) {
    const startStop = i / ringCount;
    const endStop = (i + 1) / ringCount;
    const t = i / ringCount;
    const hue = (((t * 360 + colorOffset - gradientPhase) % 360) + 360) % 360;
    const alpha = maxAlpha * (1 - t * t);
    const ringColor = `hsla(${hue.toFixed(1)}, 85%, 50%, ${alpha.toFixed(3)})`;

    gradient.addColorStop(startStop, ringColor);
    gradient.addColorStop(endStop, ringColor);
  }
  gradient.addColorStop(1, "hsla(0, 85%, 50%, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  pop();
}

function createControls() {
  const panel = createDiv();
  panel.addClass("controls");

  const header = createDiv();
  header.addClass("controls__header");
  header.parent(panel);

  const title = createElement("h1", "Paramètres de la simulation");
  title.parent(header);

  const toggleButton = createButton("Masquer");
  toggleButton.addClass("controls__toggle");
  toggleButton.attribute("aria-expanded", "true");
  toggleButton.parent(header);

  const content = createDiv();
  content.addClass("controls__content");
  content.parent(panel);

  toggleButton.mousePressed(() => {
    const isOpen = !panel.elt.classList.toggle("controls--collapsed");
    toggleButton.html(isOpen ? "Masquer" : "Afficher");
    toggleButton.attribute("aria-expanded", String(isOpen));
  });

  const scenarioRow = createDiv();
  scenarioRow.addClass("controls__row controls__row--select");
  scenarioRow.parent(content);

  const scenarioLabel = createElement("label", "Scénario");
  scenarioLabel.parent(scenarioRow);

  const scenarioSelect = createSelect();
  scenarioSelect.addClass("controls__select");
  scenarioSelect.option("Scénario 1 : Suivre la souris", "scenario1");
  scenarioSelect.option("Scénario 2 : Chasse aux cibles", "scenario2");
  scenarioSelect.option("Scénario 3 : Fuite des cibles", "scenario3");
  scenarioSelect.selected(currentScenario);
  scenarioSelect.parent(scenarioRow);
  scenarioSelect.changed(() => {
    currentScenario = scenarioSelect.value();
  });

  const count = createSliderControl(
    content,
    "Nombre de vaisseaux",
    1,
    200,
    1,
    1,
    (value) => setVehicleCount(value)
  );
  const targetCount = createSliderControl(
    content,
    "Nombre de cibles",
    0,
    20,
    1,
    1,
    (value) => setTargetCount(value)
  );
  const detectionRadius = createSliderControl(
    content,
    "Rayon de détection (vaisseaux)",
    20,
    200,
    150,
    1,
    (value) => updateVehicleProperty("detectionRadius", value)
  );
  const maxSpeed = createSliderControl(
    content,
    "Vitesse maximale",
    0,
    20,
    4,
    0.01,
    (value) => {
      updateVehicleProperty("baseMaxSpeed", value);
      updateVehicleProperty("maxSpeed", value);
    }
  );
  const maxForce = createSliderControl(
    content,
    "Accélération maximale",
    0,
    10,
    0.1,
    0.01,
    (value) => {
      updateVehicleProperty("baseMaxForce", value);
      updateVehicleProperty("maxForce", value);
    }
  );

  const debugCheckbox = createCheckbox("Debug", false);
  debugCheckbox.addClass("controls__checkbox");
  debugCheckbox.parent(content);
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  const audioTitle = createElement("h2", "Audio (Web Audio)");
  audioTitle.addClass("controls__section-title");
  audioTitle.parent(content);

  const audioRow = createDiv();
  audioRow.addClass("controls__row controls__row--select");
  audioRow.parent(content);

  const audioLabel = createElement("label", "Musique / Sons");
  audioLabel.parent(audioRow);

  const audioToggleButton = createButton("ON");
  audioToggleButton.addClass("controls__toggle controls__audio-toggle");
  audioToggleButton.attribute("aria-pressed", "true");
  audioToggleButton.parent(audioRow);
  audioToggleButton.mousePressed(() => {
    const isOn = soundEngine.toggleEnabled();
    audioToggleButton.html(isOn ? "ON" : "OFF");
    audioToggleButton.attribute("aria-pressed", String(isOn));
    audioToggleButton.elt.classList.toggle("controls__audio-toggle--off", !isOn);
  });

  const audioVolume = createSliderControl(
    content,
    "Volume",
    0,
    100,
    60,
    1,
    (value) => {
      soundEngine.unlock();
      soundEngine.setVolume(value / 100);
    }
  );

  const fleeTitle = createElement("h2", "Fuite des cibles");
  fleeTitle.addClass("controls__section-title");
  fleeTitle.parent(content);

  const targetDetectionRadius = createSliderControl(
    content,
    "Rayon de détection (cibles)",
    20,
    300,
    targetFleeSettings.detectionRadius,
    1,
    (value) => {
      targetFleeSettings.detectionRadius = value;
      updateTargetProperty("detectionRadius", value);
    }
  );
  const targetSafeDistance = createSliderControl(
    content,
    "Distance de sécurité",
    100,
    600,
    targetFleeSettings.safeDistance,
    1,
    (value) => {
      targetFleeSettings.safeDistance = value;
      updateTargetProperty("safeDistance", value);
    }
  );
  const targetFleeSpeed = createSliderControl(
    content,
    "Vitesse max en fuite",
    5,
    25,
    targetFleeSettings.fleeMaxSpeed,
    0.1,
    (value) => {
      targetFleeSettings.fleeMaxSpeed = value;
      updateTargetProperty("fleeMaxSpeed", value);
    }
  );
  const targetFleeForce = createSliderControl(
    content,
    "Accélération max en fuite",
    0.1,
    5,
    targetFleeSettings.fleeMaxForce,
    0.05,
    (value) => {
      targetFleeSettings.fleeMaxForce = value;
      updateTargetProperty("fleeMaxForce", value);
    }
  );

  const gradientTitle = createElement("h2", "Dégradé radial");
  gradientTitle.addClass("controls__section-title");
  gradientTitle.parent(content);

  const gradientRadius = createSliderControl(
    content,
    "Rayon du dégradé",
    50,
    1000,
    gradientSettings.radius,
    1,
    (value) => {
      gradientSettings.radius = value;
    }
  );
  const gradientSpeed = createSliderControl(
    content,
    "Vitesse d'animation",
    0,
    2,
    gradientSettings.animationSpeed,
    0.01,
    (value) => {
      gradientSettings.animationSpeed = value;
    }
  );
  const gradientOpacity = createSliderControl(
    content,
    "Opacité",
    0,
    255,
    gradientSettings.opacity,
    1,
    (value) => {
      gradientSettings.opacity = value;
    }
  );
  const gradientRings = createSliderControl(
    content,
    "Nombre d'anneaux",
    10,
    200,
    gradientSettings.ringCount,
    1,
    (value) => {
      gradientSettings.ringCount = value;
    }
  );
  const gradientOffset = createSliderControl(
    content,
    "Décalage des couleurs",
    0,
    360,
    gradientSettings.colorOffset,
    1,
    (value) => {
      gradientSettings.colorOffset = value;
    }
  );

  return {
    scenarioSelect,
    count: { slider: count.slider },
    targetCount: { slider: targetCount.slider },
    detectionRadius: { slider: detectionRadius.slider },
    maxSpeed: { slider: maxSpeed.slider },
    maxForce: { slider: maxForce.slider },
    debugCheckbox,
    targetFlee: {
      detectionRadius: targetDetectionRadius.slider,
      safeDistance: targetSafeDistance.slider,
      fleeMaxSpeed: targetFleeSpeed.slider,
      fleeMaxForce: targetFleeForce.slider
    },
    gradient: {
      radius: gradientRadius.slider,
      animationSpeed: gradientSpeed.slider,
      opacity: gradientOpacity.slider,
      ringCount: gradientRings.slider,
      colorOffset: gradientOffset.slider
    }
  };
}

function createSliderControl(parent, labelText, min, max, initial, step, onInput) {
  const row = createDiv();
  row.addClass("controls__row");
  row.parent(parent);

  const label = createElement("label", labelText);
  label.parent(row);

  const slider = createSlider(min, max, initial, step);
  slider.parent(row);

  const valueDisplay = createSpan(formatControlValue(initial, step));
  valueDisplay.addClass("controls__value");
  valueDisplay.parent(row);

  slider.input(() => {
    const value = Number(slider.value());
    valueDisplay.html(formatControlValue(value, step));
    onInput(value);
  });

  return { slider, valueDisplay };
}

function formatControlValue(value, step) {
  return step < 1 ? Number(value).toFixed(2) : String(value);
}

function setVehicleCount(count) {
  while (vehicles.length < count) {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
  vehicles.length = count;
  const maxSpeed = Number(controls.maxSpeed.slider.value());
  const maxForce = Number(controls.maxForce.slider.value());
  updateVehicleProperty("baseMaxSpeed", maxSpeed);
  updateVehicleProperty("maxSpeed", maxSpeed);
  updateVehicleProperty("baseMaxForce", maxForce);
  updateVehicleProperty("maxForce", maxForce);
  updateVehicleProperty("detectionRadius", Number(controls.detectionRadius.slider.value()));
}

function getWaveMultipliers() {
  return {
    speedMultiplier: 1 + (targetWave - 1) * 0.15,
    forceMultiplier: 1 + (targetWave - 1) * 0.1
  };
}

function setTargetCount(count) {
  desiredTargetCount = count;
  if (count === 0) {
    targetWave = 1;
  }
  const { speedMultiplier, forceMultiplier } = getWaveMultipliers();
  while (targets.length < count) {
    targets.push(new Target(random(width), random(height), speedMultiplier, forceMultiplier));
  }
  targets.length = count;
  updateTargetProperty("detectionRadius", targetFleeSettings.detectionRadius);
  updateTargetProperty("safeDistance", targetFleeSettings.safeDistance);
  updateTargetProperty("fleeMaxSpeed", targetFleeSettings.fleeMaxSpeed);
  updateTargetProperty("fleeMaxForce", targetFleeSettings.fleeMaxForce);
}

function updateVehicleProperty(propertyName, value) {
  vehicles.forEach((vehicle) => {
    vehicle[propertyName] = value;
  });
}

function updateTargetProperty(propertyName, value) {
  targets.forEach((movingTarget) => {
    if (propertyName === "fleeMaxSpeed") {
      movingTarget.fleeMaxSpeed = value * movingTarget.speedMultiplier;
    } else if (propertyName === "fleeMaxForce") {
      movingTarget.fleeMaxForce = value * movingTarget.forceMultiplier;
    } else {
      movingTarget[propertyName] = value;
    }
  });
}

function mousePressed() {
  if (soundEngine && soundEngine.enabled) {
    soundEngine.unlock();
  }
}

function keyPressed() {
  if (soundEngine && soundEngine.enabled) {
    soundEngine.unlock();
  }
  if (key === "d" || key === "D") {
    Vehicle.debug = !Vehicle.debug;
    controls.debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
