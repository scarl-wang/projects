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

let dialogueIndices = {
  far: 0,
  near: 0,
  touch: 0,
  leaving: 0,
};

let currentLine = "";
let dialogueTimer = 0;
let lastZone = null;
let leavingTimer = 0;
const LEAVING_DURATION = 3000; // ms to show leaving dialogue before returning to normal

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

  const dist = window.getDistance();
  const zone = getZone(dist);

  // Check if we just left the touch zone
  if (lastZone === "touch" && zone !== "touch") {
    triggerLeaving();
  }

  // Zone change → immediate dialogue update (skip if leaving is active)
  if (zone !== lastZone && !isLeaving()) {
    updateDialogue(zone);
    lastZone = zone;
  } else if (zone !== lastZone) {
    lastZone = zone; // still track zone but don't override leaving dialogue
  }

  // Periodic dialogue refresh (every 3s while active, skip if leaving)
  if (zone !== "none" && !isLeaving() && millis() - dialogueTimer > 3000) {
    updateDialogue(zone);
  }

  // Display Logic — use leaving visuals while leaving timer is active
  const displayZone = isLeaving() ? "leaving" : zone;

  window.updateZoneLabel(displayZone.toUpperCase());

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
}

// ------------------------------------------------
// LEAVING STATE
// ------------------------------------------------
function triggerLeaving() {
  // Use sequential logic for leaving too
  let zone = "leaving";
  let index = dialogueIndices[zone];

  currentLine = DIALOGUES[zone][index];

  // Increment and wrap
  dialogueIndices[zone] = (index + 1) % DIALOGUES[zone].length;

  leavingTimer = millis();
  dialogueTimer = millis();
}

function isLeaving() {
  return millis() - leavingTimer < LEAVING_DURATION;
}

// ------------------------------------------------
// DISTANCE & STATE
// ------------------------------------------------
function getZone(d) {
  if (d === null) return "none";
  if (d < 3 || d > 1000) return "touch";
  if (d < 100) return "near";
  return "far";
}

// ------------------------------------------------
// DIALOGUE LOGIC
// ------------------------------------------------
function updateDialogue(zone) {
  if (!zone || zone === "none") {
    currentLine = "";
    return;
  }

  // Get current index for this specific zone
  let index = dialogueIndices[zone];

  // Set the text
  currentLine = DIALOGUES[zone][index];

  // Move to next index, wrap back to 0 if at the end of array
  dialogueIndices[zone] = (index + 1) % DIALOGUES[zone].length;

  dialogueTimer = millis();
}

// ------------------------------------------------
// KEYBOARD TESTING  (a = FAR, b = CLOSE, c = TOUCH)
// ------------------------------------------------
function keyPressed() {
  if (key === "a") {
    distance = 500;
  } else if (key === "b") {
    distance = 50;
  } else if (key === "c") {
    distance = 3000;
  }

  window.getDistance = () => distance;
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
