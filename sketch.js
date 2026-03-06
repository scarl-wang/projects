// ------------------------------------------------
// VARIABLES & ARRAYS
// ------------------------------------------------
const DIALOGUES = {
  far: [
    "HEY THERE....",
    "YES YOU...",
    "COME HERE...WILL YOU?",
    "CAN YOU HOLD MY HAND?...",
  ],
  near: [
    "COME CLOSER, AM I SCARING YOU?",
    "PUT YOUR HAND ON MINE...",
    "JUST A LITTLE CLOSER...",
    "I WANT TO FEEL YOUR SKIN...",
    "HOLD ME TIGHTER...",
    "PUT YOUR SKIN AGAINST MINE...",
  ],
  touch: [
    "YOU ARE SO WARM...",
    "DON'T LET GO...",
    "THAT FEELS NICE...",
    "STAY A LITTLE LONGER?",
    "IS THIS WHAT BREATHING FEELS LIKE?",
  ],
  leaving: [
    "DON'T LEAVE SO SOON...",
    "COME BACK...",
    "NO WAIT...",
    "WHY DID YOU STOP?",
  ],
};

let dialogueIndices = { far: 0, near: 0, touch: 0, leaving: 0 };
let currentLine = "";
let dialogueTimer = 0;
let lastZone = null;
let leavingTimer = 0;
const LEAVING_DURATION = 2000;

const TOUCH_ON = 1000;
const TOUCH_OFF = 900;
let isTouching = false;

// ------------------------------------------------
// SETUP
// ------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15);
  updateDialogue();
}

// ------------------------------------------------
// MAIN DRAW LOOP
// ------------------------------------------------
function draw() {
  background(0);
  textFont("Courier New");
  textSize(32);

  const dist = window.getDistance ? window.getDistance() : null;
  const touchRaw = window.getTouchValue ? window.getTouchValue() : null;

  // Hysteresis latch — only flip on clear threshold crossings
  if (touchRaw !== null) {
    if (!isTouching && touchRaw > TOUCH_ON) isTouching = true;
    if (isTouching && touchRaw < TOUCH_OFF) isTouching = false;
  }

  const zone = isTouching ? "touch" : getZone(dist);

  // Push TOUCHING + ZONE up to the debug panel every frame
  if (window.updateZoneLabel) {
    window.updateZoneLabel(zone.toUpperCase(), isTouching);
  }

  // Detect leaving touch zone
  if (lastZone === "touch" && zone !== "touch") {
    triggerLeaving();
  }

  // Zone change → immediate dialogue update (skip if leaving)
  if (zone !== lastZone && !isLeaving()) {
    updateDialogue(zone);
    lastZone = zone;
  } else if (zone !== lastZone) {
    lastZone = zone;
  }

  // Periodic dialogue refresh every 3s
  if (zone !== "none" && !isLeaving() && millis() - dialogueTimer > 3000) {
    updateDialogue(zone);
  }

  const displayZone = isLeaving() ? "leaving" : zone;

  if (displayZone === "touch") {
    drawLowResFace();
    displayDialogue(255);
  } else if (displayZone === "leaving") {
    drawGhostFace(0.3);
    displayDialogue(180);
  } else if (displayZone === "near") {
    drawGhostFace(0.5);
    displayDialogue(200);
  } else if (displayZone === "far") {
    drawStatic();
    drawUI();
    displayDialogue(170);
  } else {
    drawStatic();
    drawUI();
  }

  // ---- ON-CANVAS DEBUG (top-left corner) ----
  noStroke();
  fill(0, 180, 0);
  textAlign(LEFT);
  textSize(11);
  textFont("Courier New");
  const td = dist !== null ? dist.toFixed(1) : "null";
  const tt = touchRaw !== null ? touchRaw : "null";
  text(
    "dist=" +
      td +
      "  raw=" +
      tt +
      "  touching=" +
      isTouching +
      "  zone=" +
      zone,
    10,
    height - 14,
  );
}

// ------------------------------------------------
// LEAVING STATE
// ------------------------------------------------
function triggerLeaving() {
  let index = dialogueIndices["leaving"];
  currentLine = DIALOGUES["leaving"][index];
  dialogueIndices["leaving"] = (index + 1) % DIALOGUES["leaving"].length;
  leavingTimer = millis();
  dialogueTimer = millis();
}

function isLeaving() {
  return millis() - leavingTimer < LEAVING_DURATION;
}

// ------------------------------------------------
// DISTANCE → ZONE
// ------------------------------------------------
function getZone(d) {
  if (d === null) return "none";
  if (d < 100) return "near";
  if (d > 100) return "far";
  return "none";
}

// ------------------------------------------------
// DIALOGUE LOGIC
// ------------------------------------------------
function updateDialogue(zone) {
  if (!zone || zone === "none") {
    currentLine = "";
    return;
  }
  let index = dialogueIndices[zone];
  currentLine = DIALOGUES[zone][index];
  dialogueIndices[zone] = (index + 1) % DIALOGUES[zone].length;
  dialogueTimer = millis();
}

// ------------------------------------------------
// KEYBOARD TESTING  a=far  b=near  c=touch  d=none
// ------------------------------------------------
let _testDist = null;
let _testTouch = 0;

function keyPressed() {
  if (key === "a") {
    _testDist = 50;
    _testTouch = 0;
  }
  if (key === "b") {
    _testDist = 15;
    _testTouch = 0;
  }
  if (key === "c") {
    _testDist = null;
    _testTouch = 1100;
  }
  if (key === "d") {
    _testDist = null;
    _testTouch = 0;
  }
  window.getDistance = () => _testDist;
  window.getTouchValue = () => _testTouch;
}

// ------------------------------------------------
// VISUALS
// ------------------------------------------------
function drawLowResFace() {
  push();
  translate(width / 2, height / 2);
  translate(random(-1, 1), random(-1, 1));
  fill(220);
  noStroke();
  rect(-width * 0.2 + random(-2, 2), -height * 0.18, 80, 12);
  rect(width * 0.1 + random(-2, 2), -height * 0.2, 75, 14);
  let mouthSize = map(sin(frameCount * 0.2), -1, 1, 5, 40);
  fill(200, 0, 0, 150);
  rect(-width * 0.05, height * 0.03, 120, mouthSize);
  pop();
}

function drawGhostFace(alpha) {
  push();
  translate(width / 2, height / 2);
  translate(random(-2, 2), random(-2, 2));
  fill(220, alpha * 255 * 0.6);
  noStroke();
  rect(-width * 0.2 + random(-2, 2), -height * 0.18, 80, 12);
  rect(width * 0.1 + random(-2, 2), -height * 0.2, 75, 14);
  pop();
  for (let i = 0; i < 200; i++) {
    stroke(random(20, 60));
    point(random(width), random(height));
  }
}

function displayDialogue(brightness) {
  if (!currentLine) return;
  noStroke();
  fill(brightness);
  textAlign(CENTER);
  textFont("Courier New");
  textSize(32);
  text(currentLine, width / 2, height * 0.8);
}

function drawStatic() {
  for (let i = 0; i < 400; i++) {
    stroke(random(30, 80));
    point(random(width), random(height));
  }
}

function drawUI() {
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(28);
  textFont("Courier New");
  text("REC ●", width * 0.09, height * 0.1);
  text("SIGNAL LOST", width * 0.09, height * 0.14);
}

function drawScanlines() {
  stroke(0, 50);
  strokeWeight(1);
  for (let i = 0; i < height; i += 4) {
    line(0, i, width, i);
  }
}
