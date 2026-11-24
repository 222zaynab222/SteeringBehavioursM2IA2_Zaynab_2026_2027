let target;
let vehicles = [];
let settingsBar;
let debugCheckbox;
let vehicleCount = 1;
let maxVehicleSpeed = 4;
let maxVehicleForce = 0.2;
let brakingRadius = 100;
let font;

function preload() {
  font = loadFont('./assets/inconsolata.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  target = createVector(random(width), random(height));
  settingsBar = createDiv();
  settingsBar.addClass('arrival-settings');
  createControls();
  setVehicleCount(vehicleCount);
}

function createControls() {
  makeSlider('Vehicles', 1, 100, vehicleCount, 1, value => {
    vehicleCount = value;
    setVehicleCount(value);
  });
  makeSlider('Max speed', 0, 20, maxVehicleSpeed, 0.1, value => {
    maxVehicleSpeed = value;
    applyVehicleSettings();
  });
  makeSlider('Max force', 0, 1, maxVehicleForce, 0.01, value => {
    maxVehicleForce = value;
    applyVehicleSettings();
  });
  makeSlider('Braking radius', 0, 400, brakingRadius, 5, value => {
    brakingRadius = value;
    applyVehicleSettings();
  });

  const debugLabel = createDiv('Debug').parent(settingsBar);
  debugLabel.addClass('arrival-debug-label');
  debugCheckbox = createCheckbox('', false).parent(settingsBar);
  debugCheckbox.addClass('arrival-debug');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });
}

function makeSlider(labelText, minValue, maxValue, initialValue, step, onChange) {
  const group = createDiv().parent(settingsBar);
  group.addClass('arrival-setting');
  const label = createDiv(`${labelText}: ${initialValue}`).parent(group);
  label.addClass('arrival-setting__label');
  const slider = createSlider(minValue, maxValue, initialValue, step).parent(group);
  slider.addClass('arrival-setting__slider');
  slider.input(() => {
    const value = Number(slider.value());
    label.html(`${labelText}: ${value}`);
    onChange(value);
  });
}

function setVehicleCount(count) {
  while (vehicles.length < count) {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
  vehicles.length = count;
  applyVehicleSettings();
}

function applyVehicleSettings() {
  vehicles.forEach(vehicle => {
    vehicle.maxSpeed = maxVehicleSpeed;
    vehicle.maxForce = maxVehicleForce;
    vehicle.rayonZoneDeFreinage = brakingRadius;
  });
}

function draw() {
  background(0);
  target.set(mouseX, mouseY);

  push();
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);
  pop();

  vehicles.forEach(vehicle => {
    vehicle.applyForce(vehicle.arrive(target, 0));
    vehicle.update();
    vehicle.show();
  });
}

function keyPressed(event) {
  if (event && event.target && event.target.matches('input, select, textarea, button')) {
    return;
  }
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
