/**
 * EcoPolis: Environmental Board Game Logic
 * Local hotseat multiplayer with environmental trivia, properties, and timer systems.
 */

// Board Spaces Setup (20 tiles, 6x6 grid perimeter)
const BOARD_SPACES = [
  { id: 0,  name: "START",                  type: "start",     description: "Collect 200🌱 when passing." },
  { id: 1,  name: "Solar Panel Array",      type: "good",      cost: 150,   rents: [15, 45, 100],  eco: 10,  owner: null, level: 0 },
  { id: 2,  name: "Eco-Quiz",               type: "quiz" },
  { id: 3,  name: "Coal Power Plant",       type: "bad",       cost: 200,  payout: 80,  rents: [20, 60, 140],  eco: -15, owner: null, level: 0 },
  { id: 4,  name: "Eco-Event",              type: "event" },
  { id: 5,  name: "Pollution Detention",    type: "jail",      description: "In jail or visiting." },
  { id: 6,  name: "Wind Turbine Farm",      type: "good",      cost: 200,   rents: [20, 60, 140],  eco: 15,  owner: null, level: 0 },
  { id: 7,  name: "Eco-Quiz",               type: "quiz" },
  { id: 8,  name: "Nuclear Reactor",        type: "nuclear",   cost: 300,   owner: null, level: 0, meltdown: false },
  { id: 9,  name: "Ocean Cleanup Vessel",   type: "good",      cost: 250,   rents: [25, 75, 180],  eco: 20,  owner: null, level: 0 },
  { id: 10, name: "Eco-Quiz",               type: "quiz" },
  { id: 11, name: "Reforestation Project",  type: "good",      cost: 300,   rents: [30, 90, 220],  eco: 25,  owner: null, level: 0 },
  { id: 12, name: "Eco-Quiz",               type: "quiz" },
  { id: 13, name: "Oil Drilling Rig",       type: "bad",       cost: 300,  payout: 120, rents: [35, 105, 250], eco: -30, owner: null, level: 0 },
  { id: 14, name: "Hydroelectric Dam",      type: "good",      cost: 350,   rents: [35, 110, 260], eco: 30,  owner: null, level: 0 },
  { id: 15, name: "Go to Detention",        type: "go-jail" },
  { id: 16, name: "Geothermal Station",     type: "good",      cost: 400,   rents: [40, 130, 320], eco: 35,  owner: null, level: 0 },
  { id: 17, name: "Eco-Quiz",               type: "quiz" },
  { id: 18, name: "Nuclear Fusion Lab",     type: "nuclear",   cost: 500,   owner: null, level: 0, meltdown: false },
  { id: 19, name: "Composting Facility",    type: "good",      cost: 180,   rents: [18, 54, 120],  eco: 12,  owner: null, level: 0 }
];

// SVGs for Properties and Special Tiles
const TILE_SVGS = {
  start: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  good: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-5"/></svg>`,
  bad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M19 20v-8l-4 2v-4l-4 2v-4l-4 2v10M6 20V8l-3 1.5V20"/></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`,
  event: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  tax: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  jail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2v20M14 2v20M10 2v20M6 2v20M2 2v20M22 2v20M2 11h20M2 5h20M2 17h20"/></svg>`,
  sanctuary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M12 10a4 4 0 0 0-4-4M12 10a4 4 0 0 1 4-4M12 14a3 3 0 0 0-3-3M12 14a3 3 0 0 1 3-3"/></svg>`,
  "go-jail": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`,
  nuclear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
};

const ECO_EVENTS = [
  { title: "Carbon Tax Subsidy", desc: "Green businesses receive support. All owners of Renewable properties receive +100🌱 from the bank.", type: "subsidy", value: 100 },
  { title: "Oil Spill!", desc: "A tanker leaked in the ocean. All players pay 150🌱 clean-up costs.", type: "spill", value: 150 },
  { title: "Green Innovation", desc: "Your sustainable investments have paid off. Collect 200🌱 from the bank!", type: "innovation", value: 200 },
  { title: "Industrial Smog", desc: "Air quality hits dangerous lows. All owners of Polluting properties are fined 100🌱 per factory.", type: "smog-fine", value: 100 },
  { title: "Reforestation Grant", desc: "For planting trees in public reserves, receive 150🌱 from the government.", type: "grant", value: 150 },
  { title: "E-Waste Dumped", desc: "Hazardous electronic waste is found in water systems. You are fined 80🌱 for not recycling properly.", type: "dump-fine", value: 80 }
];

const DEFAULT_PLAYER_COLORS = [
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#EC4899", // Pink
  "#A855F7", // Purple
  "#F59E0B", // Orange
  "#EAB308"  // Yellow
];

// Game State variables
let players = [];
let activePlayerIdx = 0;
let gameTimeSeconds = 1800; // 30 mins
let timeRemaining = 1800;
let speedMultiplier = 1;
let gameTimerInterval = null;
let rolledThisTurn = false;
let hasActionedThisTurn = false;
let firstPlayerRoll = null; // Store first player's roll so second player replicates it

// Quiz State
let activeQuestion = null;
let quizTimer = null;
let quizTimeSec = 15;
let shuffledQuestions = []; // Shuffled non-repeating question pool
let questionIndex = 0;

// Confetti Animation State
let confettiActive = false;

/* --- SETUP & INITIALIZATION --- */

// Initial trigger to load Player Input elements on load
window.addEventListener("DOMContentLoaded", () => {
  adjustPlayerInputs(2);
});

function adjustPlayerInputs(count) {
  const container = document.getElementById("players-input-list");
  container.innerHTML = "";
  
  for (let i = 0; i < count; i++) {
    const color = DEFAULT_PLAYER_COLORS[i % DEFAULT_PLAYER_COLORS.length];
    const row = document.createElement("div");
    row.className = "player-input-row";
    row.innerHTML = `
      <div class="player-color-dot" style="color: ${color}; background-color: ${color}"></div>
      <input type="text" id="player-name-${i}" value="Player ${i+1}" placeholder="Player Name" required>
    `;
    container.appendChild(row);
  }
}

function startGame() {
  const count = parseInt(document.getElementById("player-count").value);
  players = [];
  firstPlayerRoll = null;
  shuffleQuestions(); // Initialize non-repeating question pool
  
  for (let i = 0; i < count; i++) {
    const nameInput = document.getElementById(`player-name-${i}`).value.trim();
    players.push({
      id: i,
      name: nameInput || `Player ${i+1}`,
      color: DEFAULT_PLAYER_COLORS[i % DEFAULT_PLAYER_COLORS.length],
      cash: 300,

      position: 0,
      inJail: false,
      jailTurns: 0,
      properties: [],
      isBankrupt: false,
      nuclearMeltdowns: 0,
      ecoPoints: 0
    });
  }

  // Set Timer settings
  const durationMin = parseInt(document.getElementById("game-duration").value);
  gameTimeSeconds = durationMin * 60;
  timeRemaining = gameTimeSeconds;

  speedMultiplier = parseInt(document.getElementById("game-speed").value);

  // Hide Setup screen, Show Board screen
  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  // Reset Property Ownership
  BOARD_SPACES.forEach(space => {
    if (space.owner !== undefined) {
      space.owner = null;
      space.level = 0;
      if (space.type === "nuclear") {
        space.meltdown = false;
      }
    }
  });

  // Build grid board
  buildBoard();
  renderBoardCenter();

  // Create player tokens
  createPlayerTokens();
  setTimeout(positionTokens, 50);
  
  // Set current turn
  activePlayerIdx = 0;
  resetTurnState();
  updateUI();

  // Start timer loop
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(gameTimerTick, 1000);

  // Resize listener to keep tokens centered
  window.removeEventListener("resize", positionTokens);
  window.addEventListener("resize", positionTokens);

  logEvent(`The Climate Race has started! Game duration: ${durationMin} minutes.`, "green");
}

/* --- BOARD GENERATION --- */

function buildBoard() {
  const grid = document.getElementById("board-grid");
  
  // Clear any existing tiles except tokens layer
  const tiles = grid.querySelectorAll(".tile, .board-center");
  tiles.forEach(t => t.remove());

  // Re-create central board area
  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <div class="board-center-visual"></div>
    <h2 class="center-logo">🌱 ECOPOLIS</h2>
    <div class="center-stats" id="center-global-status">🌿 Pristine — No development yet</div>
  `;
  grid.appendChild(center);

  // Generate 20 spaces
  BOARD_SPACES.forEach(space => {
    const tile = document.createElement("div");
    tile.className = `tile tile-${space.id}`;
    tile.setAttribute("onclick", `onTileClick(${space.id})`);

    // Tab indicator depending on type
    const tab = document.createElement("div");
    tab.className = "tile-header-bar";
    
    if (space.type === "good") tab.classList.add("good-tab");
    else if (space.type === "bad") tab.classList.add("bad-tab");
    else if (space.type === "nuclear") tab.classList.add("nuclear-tab");
    else if (space.type === "quiz") tab.classList.add("quiz-tab");
    else if (space.type === "event") tab.classList.add("event-tab");
    else tab.classList.add("special-tab");
    tile.appendChild(tab);

    // Title / Name
    const name = document.createElement("div");
    name.className = "tile-name";
    name.innerText = space.name;
    tile.appendChild(name);

    // SVG Visuals
    const icon = document.createElement("div");
    icon.className = "tile-icon";
    
    let svgMarkup = TILE_SVGS[space.type];
    if (space.type === "good") {
      svgMarkup = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-5"/></svg>`;
    } else if (space.type === "bad") {
      svgMarkup = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" stroke-width="2"><path d="M2 20h20M19 20v-8l-4 2v-4l-4 2v-4l-4 2v10M6 20V8l-3 1.5V20"/></svg>`;
    }
    icon.innerHTML = svgMarkup;
    tile.appendChild(icon);

    // Price/Payout or desc
    const footer = document.createElement("div");
    footer.className = "tile-price";
    if (space.type === "good") {
      footer.innerHTML = `${space.cost}🌱`;
    } else if (space.type === "bad") {
      footer.innerHTML = `+${space.payout}🌱`;
    } else if (space.id === 0) {
      footer.innerHTML = `Pass: +200🌱`;
    } else if (space.id === 10) {
      footer.innerHTML = `Grant: +100🌱`;
    } else {
      footer.innerText = "";
    }
    tile.appendChild(footer);

    // Upgrades container
    if (space.type === "good" || space.type === "bad") {
      const upgradeContainer = document.createElement("div");
      upgradeContainer.className = "upgrade-level-container";
      upgradeContainer.id = `upgrade-container-${space.id}`;
      tile.appendChild(upgradeContainer);
    }

    grid.appendChild(tile);
  });

  // Re-create tokens layer
  let tokensLayer = document.getElementById("tokens-layer");
  if (tokensLayer) tokensLayer.remove();
  
  tokensLayer = document.createElement("div");
  tokensLayer.className = "tokens-layer";
  tokensLayer.id = "tokens-layer";
  grid.appendChild(tokensLayer);
}

function renderBoardCenter() {
  const statusEl = document.getElementById("center-global-status");
  if (!statusEl) return;
  if (players.length === 0) return;

  // Count green (good) vs polluting (bad) vs nuclear properties across ALL players
  let goodCount = 0;
  let badCount = 0;
  let nuclearCount = 0;       // Running nuclear plants
  let brokenNuclearCount = 0; // Broken (melted down) nuclear plants

  players.forEach(p => {
    p.properties.forEach(propId => {
      const space = BOARD_SPACES[propId];
      if (space.type === "good") {
        goodCount++;
      } else if (space.type === "bad") {
        badCount++;
      } else if (space.type === "nuclear") {
        if (space.meltdown) {
          brokenNuclearCount++;
        } else {
          nuclearCount++;
        }
      }
    });
  });

  // Effective polluting count is bad properties + broken nuclear plants
  const effectiveBadCount = badCount + brokenNuclearCount;

  // Total properties owned
  const totalProps = goodCount + badCount + nuclearCount + brokenNuclearCount;

  let emoji, label, color;

  if (totalProps === 0) {
    // Nothing bought yet
    emoji = "🌿";
    label = "Pristine — No development yet";
    color = "#10B981";
  } else if (effectiveBadCount === 0 && nuclearCount === 0) {
    // All green!
    emoji = "🌲";
    label = "Thriving — Fully Sustainable";
    color = "#10B981";
  } else if (goodCount > effectiveBadCount * 2) {
    emoji = "🍃";
    label = "Recovering — Green leads";
    color = "#34D399";
  } else if (goodCount > effectiveBadCount) {
    emoji = "⛅";
    label = "Mixed — Under Pressure";
    color = "#F59E0B";
  } else if (goodCount === effectiveBadCount) {
    emoji = "⛅";
    label = "Balanced — Neutral";
    color = "#94A3B8";
  } else if (effectiveBadCount > goodCount * 2) {
    emoji = "🌋";
    label = "Critical — Heavy Pollution!";
    color = "#EF4444";
  } else if (effectiveBadCount > goodCount) {
    emoji = "🏭";
    label = "Struggling — Polluters Winning";
    color = "#F97316";
  } else {
    emoji = "⛅";
    label = "Neutral";
    color = "#94A3B8";
  }

  // Running nuclear doesn't affect status, but broken nuclear does
  const totalNuclear = nuclearCount + brokenNuclearCount;
  const nuclearNote = totalNuclear > 0 ? ` ☢️×${totalNuclear}` : "";
  statusEl.innerHTML = `<span style="color:${color}">${emoji} ${label}${nuclearNote}</span><br><small style="opacity:0.5;font-size:0.7rem">${goodCount}🟢 green / ${effectiveBadCount}🔴 polluting${brokenNuclearCount > 0 ? ' (incl. 💥 meltdown)' : ''}</small>`;
}

function createPlayerTokens() {
  const layer = document.getElementById("tokens-layer");
  layer.innerHTML = "";
  
  players.forEach(p => {
    const token = document.createElement("div");
    token.className = `player-token token-${p.id}`;
    token.id = `token-${p.id}`;
    token.style.backgroundColor = p.color;
    token.style.color = "#0B0F19";
    token.style.borderColor = "#FFF";
    // Show first letter of player name as identifier
    token.innerText = p.name.charAt(0).toUpperCase();
    layer.appendChild(token);
  });

  // Render locations
  positionTokens();
}

function positionTokens() {
  players.forEach(p => {
    if (p.isBankrupt) {
      const token = document.getElementById(`token-${p.id}`);
      if (token) token.style.display = "none";
      return;
    }

    const tile = document.querySelector(`.tile-${p.position}`);
    const token = document.getElementById(`token-${p.id}`);
    
    if (!tile || !token) return;

    // Center offsets
    const x = tile.offsetLeft + tile.offsetWidth / 2;
    const y = tile.offsetTop + tile.offsetHeight / 2;

    // Multi-token spacing layout on the same space
    let dx = 0;
    let dy = 0;
    const group = players.filter(other => other.position === p.position && !other.isBankrupt);
    const myIndex = group.indexOf(p);

    if (group.length > 1) {
      // Offset circle formula based on group size
      const angle = (myIndex / group.length) * Math.PI * 2;
      const radius = 14;
      dx = Math.cos(angle) * radius;
      dy = Math.sin(angle) * radius;
    }

    token.style.left = `${x + dx}px`;
    token.style.top = `${y + dy}px`;
  });
}

/* --- TURN STATE CONTROL --- */

function resetTurnState() {
  rolledThisTurn = false;
  hasActionedThisTurn = false;

  const rollBtn = document.getElementById("roll-btn");
  const endBtn = document.getElementById("end-turn-btn");
  const bailBtn = document.getElementById("bail-btn");

  rollBtn.classList.remove("hidden");
  rollBtn.disabled = false;
  endBtn.classList.add("hidden");
  endBtn.disabled = true;
  bailBtn.classList.add("hidden");

  // Handle jail escape options at start of turn
  const activePlayer = players[activePlayerIdx];
  if (activePlayer.inJail) {
    logEvent(`${activePlayer.name} starts turn in Pollution Detention. Roll 5+ to escape, or pay 100🌱 bail!`, "orange");
    rollBtn.innerText = "Roll for Parole (5+)";
    // Show bail button if they can afford it
    if (activePlayer.cash >= 100) {
      bailBtn.classList.remove("hidden");
    }
  } else {
    rollBtn.innerText = "Roll Die";
  }
}

function payBail() {
  const player = players[activePlayerIdx];
  if (!player.inJail || player.cash < 100) return;

  player.cash -= 100;
  player.inJail = false;
  player.jailTurns = 0;

  document.getElementById("bail-btn").classList.add("hidden");
  document.getElementById("roll-btn").innerText = "Roll Die";

  logEvent(`${player.name} paid 100🌱 bail to escape Pollution Detention!`, "green");
  GameAudio.playTax();
  updateUI();
}

function updateUI() {
  const activePlayer = players[activePlayerIdx];
  
  // Active player panel
  document.getElementById("active-player-name").innerText = activePlayer.name;
  document.getElementById("active-player-color").style.backgroundColor = activePlayer.color;
  document.getElementById("active-player-color").style.color = activePlayer.color;
  const cashEl = document.getElementById("active-player-cash");
  cashEl.innerText = `${activePlayer.cash}🌱`;
  cashEl.style.color = activePlayer.cash < 0 ? '#ef4444' : '';
  document.getElementById("active-player-eco").innerText = `${activePlayer.ecoPoints}🌿`;


  // Update leaderboard
  updateLeaderboard();

  // Highlight active tile or active player token
  players.forEach(p => {
    const token = document.getElementById(`token-${p.id}`);
    if (token) {
      if (p.id === activePlayerIdx) {
        token.style.zIndex = "20";
        token.style.transform = "translate(-50%, -50%) scale(1.35)";
      } else {
        token.style.zIndex = "10";
        token.style.transform = "translate(-50%, -50%) scale(1.0)";
      }
    }
  });

  renderBoardCenter();
}

function updateLeaderboard() {
  const container = document.getElementById("leaderboard-list");
  container.innerHTML = "";

  // Sort by cash — richest player is winning
  const sorted = [...players].sort((a, b) => {
    if (a.isBankrupt) return 1;
    if (b.isBankrupt) return -1;
    return b.cash - a.cash;
  });

  sorted.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = `leader-row ${p.id === activePlayerIdx ? 'active' : ''}`;
    row.innerHTML = `
      <div class="leader-left">
        <span class="leader-rank">#${idx + 1}</span>
        <div class="leader-avatar" style="color: ${p.color}; background-color: ${p.color}"></div>
        <span class="leader-name">${p.name} ${p.isBankrupt ? '(Bankrupt)' : ''}</span>
      </div>
      <div class="leader-right">
        <div class="leader-score">${p.cash}🌱</div>
        ${p.ecoPoints > 0 ? `<div class="leader-score" style="font-size:0.75rem;color:var(--color-green)">+${p.ecoPoints}🌿</div>` : ''}
      </div>
    `;
    container.appendChild(row);
  });
}

function logEvent(text, colorClass = "") {
  const container = document.getElementById("logs-container");
  const entry = document.createElement("div");
  entry.className = `log-entry ${colorClass ? 'log-' + colorClass : ''}`;
  
  // Time tag
  const elapsed = gameTimeSeconds - timeRemaining;
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  const timeStr = `[${String(min).padStart(2,'0')}:${String(String(sec).slice(-2)).padStart(2,'0')}]`;
  
  entry.innerText = `${timeStr} ${text}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

/* --- DICE ROLLING & TOKENS --- */

function rollDice() {
  if (rolledThisTurn) return;
  rolledThisTurn = true;

  const rollBtn = document.getElementById("roll-btn");
  rollBtn.disabled = true;

  GameAudio.playDiceRoll();
  const dice = document.getElementById("dice");
  dice.className = "die rolling";

  setTimeout(() => {
    const roll = Math.min(6, Math.floor(Math.random() * 6) + 1); // Strictly 1-6

    dice.className = `die show-${roll}`;

    setTimeout(() => {
      handleRollResult(roll);
    }, 450);

  }, 800);
}

function handleRollResult(roll) {
  const player = players[activePlayerIdx];
  logEvent(`${player.name} rolled a ${roll}.`, "cyan");

  // Jail Escape Logic
  if (player.inJail) {
    if (roll >= 5) {
      player.inJail = false;
      player.jailTurns = 0;
      logEvent(`${player.name} rolled a ${roll} and escaped Pollution Detention on parole!`, "green");
      GameAudio.playPassStart();
      // Continue normal movement
    } else {
      player.jailTurns++;
      logEvent(`${player.name} failed to roll a 5+ to escape detention. Turns spent: ${player.jailTurns}/2`, "red");
      
      if (player.jailTurns >= 2) {
        player.inJail = false;
        player.jailTurns = 0;
        player.cash -= 100;
        logEvent(`${player.name} paid a 100🌱 clean air bail to exit detention after 2 turns.`, "orange");
        GameAudio.playTax();
      }
      // Failed parole roll — no movement regardless
      finishTurnOptions();
      return;
    }
  }

  // Smooth movement step-by-step
  let stepsLeft = roll;
  
  function moveStep() {
    if (stepsLeft <= 0) {
      // Movement finished, resolve final tile action
      positionTokens();
      resolveLandedTile();
      return;
    }
    
    player.position = (player.position + 1) % 20;
    stepsLeft--;
    
    // Passing START tile bonus
    if (player.position === 0) {
      player.cash += 200;
      logEvent(`${player.name} passed START and received 200🌱 clean economy funding!`, "green");
      GameAudio.playPassStart();
      updateUI();
    }
    
    positionTokens();
    setTimeout(moveStep, 200); // 200ms per step
  }

  moveStep();
}

/* --- TILE LANDED ACTIONS --- */

function resolveLandedTile() {
  const player = players[activePlayerIdx];
  const space = BOARD_SPACES[player.position];
  
  logEvent(`${player.name} landed on ${space.name}.`);

  switch (space.type) {
    case "start":
      logEvent(`${player.name} landed on START. Cash +200🌱.`, "green");
      player.cash += 200;
      GameAudio.playPassStart();
      finishTurnOptions();
      break;

    case "good":
    case "bad":
      handlePropertyLanding(space);
      break;

    case "nuclear":
      handleNuclearLanding(space);
      break;

    case "quiz":
      triggerQuiz();
      break;

    case "event":
      triggerEventCard();
      break;

    case "tax":
      triggerCarbonTax();
      break;

    case "jail":
      // Just visiting
      logEvent(`${player.name} is visiting the eco-violators detention yard.`, "muted");
      finishTurnOptions();
      break;

    case "go-jail":
      sendPlayerToJail(player);
      break;

    case "sanctuary":
      logEvent(`${player.name} rested at the Eco-Sanctuary. Clean air grant +100🌱 received!`, "green");
      player.cash += 100;
      GameAudio.playPassStart();
      finishTurnOptions();
      break;

    default:
      finishTurnOptions();
      break;
  }
  
  updateUI();
}

let jailedPlayer = null;

function sendPlayerToJail(player) {
  jailedPlayer = player;
  
  // Open the choice modal
  document.getElementById("jail-modal").classList.remove("hidden");
  
  // Play alert / jail sound
  GameAudio.playJail();
}

function finishTurnOptions() {
  hasActionedThisTurn = true;
  const rollBtn = document.getElementById("roll-btn");
  const endBtn = document.getElementById("end-turn-btn");
  
  rollBtn.classList.add("hidden");
  endBtn.classList.remove("hidden");
  endBtn.disabled = false;
}

/* --- NUCLEAR POWER PLANT --- */

function handleNuclearLanding(space) {
  const player = players[activePlayerIdx];
  activePropertySpace = space;

  if (space.owner === null) {
    // Offer to buy — show a confirm dialog
    const wantBuy = confirm(
      `☢️ ${space.name} is available for ${space.cost}🌱!\n\n` +
      `HIGH RISK, HIGH REWARD:\n` +
      `• Each turn there's a 5% chance of a meltdown (costly repairs)\n` +
      `• If it survives until the end, the government pays you a MASSIVE 800🌱 bonus!\n\n` +
      `Do you want to invest?`
    );

    if (wantBuy && player.cash >= space.cost) {
      player.cash -= space.cost;
      player.properties.push(space.id);
      space.owner = player.id;
      space.level = 0;
      space.meltdown = false;

      logEvent(`☢️ ${player.name} invested in ${space.name} for ${space.cost}🌱! High risk, high reward!`, "cyan");
      GameAudio.playPurchase();

      drawUpgradesOnBoard(space.id);
      const tile = document.querySelector(`.tile-${space.id}`);
      if (tile) {
        tile.classList.add("owned-border");
        tile.style.color = player.color;
      }
    } else if (wantBuy) {
      logEvent(`${player.name} can't afford ${space.name} (${space.cost}🌱).`, "red");
    } else {
      logEvent(`${player.name} declined to invest in ${space.name}.`, "muted");
    }

    finishTurnOptions();
    updateUI();
  } else if (space.owner === player.id) {
    logEvent(`${player.name} inspects their ${space.name}. Systems running... for now. ☢️`, "muted");
    finishTurnOptions();
  } else {
    // Someone else owns it — pay a visit fee (like rent)
    const owner = players[space.owner];
    const fee = 50;
    const actualPaid = Math.min(player.cash, fee);
    player.cash -= fee;
    owner.cash += actualPaid;
    logEvent(`${player.name} paid ${actualPaid}🌱 radiation inspection fee to ${owner.name} for ${space.name}.`, "orange");
    GameAudio.playTax();
    updateUI();
    finishTurnOptions();
  }
}

const NUCLEAR_DISASTERS = [
  { name: "Cooling System Failure", cost: 500, msg: "The cooling system broke down! Emergency repairs needed!" },
  { name: "Radiation Leak", cost: 600, msg: "A radiation leak was detected! Containment costs are massive!" },
  { name: "Turbine Malfunction", cost: 300, msg: "A turbine malfunctioned! Engineers dispatched for repairs." },
  { name: "Control Rod Jam", cost: 400, msg: "Control rods jammed! Emergency shutdown required!" },
  { name: "Waste Spill", cost: 360, msg: "Radioactive waste spilled! Cleanup crews mobilized!" }
];

function checkAllNuclearPlants() {
  // Check every player's nuclear plants — 10% chance of disaster each turn
  players.forEach(player => {
    if (player.isBankrupt) return;

    const nuclearProps = player.properties
      .map(id => BOARD_SPACES[id])
      .filter(s => s.type === "nuclear");

    nuclearProps.forEach(plant => {
      const roll = Math.random();
      if (roll < 0.05) {
        // DISASTER!
        const disaster = NUCLEAR_DISASTERS[Math.floor(Math.random() * NUCLEAR_DISASTERS.length)];
        const repairCost = disaster.cost;
        player.cash -= repairCost;
        player.nuclearMeltdowns++;
        plant.meltdown = true; // Mark meltdown to affect world status

        logEvent(`☢️ NUCLEAR ALERT at ${plant.name}! ${disaster.name}: ${disaster.msg} ${player.name} must pay ${repairCost}🌱 for repairs!`, "red");
        GameAudio.playTax();
      } else {
        logEvent(`☢️ ${plant.name} running smoothly for ${player.name}. No incidents this turn.`, "muted");
      }
    });
  });

  updateUI();
}

/* --- CARBON TAX & PROPERTY ACTIONS --- */

function triggerCarbonTax() {
  const player = players[activePlayerIdx];
  
  // Count bad properties owned
  const badProperties = player.properties
    .map(id => BOARD_SPACES[id])
    .filter(space => space.type === "bad");
    
  let fine = 50 * badProperties.length;
  // If zero bad properties, a basic carbon compliance audit costs 50
  if (fine === 0) fine = 50;

  player.cash -= fine;
  logEvent(`Carbon Tax Audit: ${player.name} pays ${fine}🌱 carbon emissions levy for owning ${badProperties.length} polluting properties.`, "red");
  GameAudio.playTax();
  
  finishTurnOptions();
}

let activePropertySpace = null;

function handlePropertyLanding(space) {
  const player = players[activePlayerIdx];
  activePropertySpace = space;

  // Unowned property — offer to buy
  if (space.owner === null) {
    openPropertyModal("buy");
  }
  // Owned by the current player
  else if (space.owner === player.id) {
    if (space.type === "bad") {
      // Collect income from the polluting industry
      const income = Math.round(space.payout * (1 + space.level * 0.5));
      player.cash += income;
      logEvent(`🏭 ${player.name} collected ${income}🌱 income from ${space.name} (Level ${space.level + 1}). ☁️ Air polluted!`, "red");
      GameAudio.playPurchase();
      updateUI();
      // Offer to decommission or upgrade
      if (space.level < 2) {
        openPropertyModal("bad-owned");
      } else {
        openPropertyModal("bad-owned-maxed");
      }
    } else if (space.level < 2) {
      openPropertyModal("upgrade");
    } else {
      logEvent(`${player.name} already fully upgraded ${space.name}.`, "muted");
      finishTurnOptions();
    }
  }
  // Owned by someone else — PAY RENT dynamically based on purchase value
  else {
    const owner = players[space.owner];

    // Base value = purchase cost (both good and bad now bought by player)
    const baseValue = space.cost;

    // Rent scales with level: 10% at base, 30% at level 1, 70% at level 2
    const rentRates = [0.15, 0.50, 1.10];
    const rent = Math.round(baseValue * rentRates[space.level]);

    // Transfer — visitor can't pay more than they have
    const actualPaid = Math.min(player.cash, rent);
    player.cash -= rent;
    owner.cash += actualPaid;

    if (space.type === "good") {
      logEvent(`${player.name} paid ${actualPaid}🌱 rent to ${owner.name} for ${space.name} (${baseValue}🌱 property, Level ${space.level + 1}).`, "orange");
    } else {
      logEvent(`${player.name} paid ${actualPaid}🌱 surcharge to ${owner.name} for ${space.name} (${baseValue}🌱 property, Level ${space.level + 1}).`, "red");
    }

    GameAudio.playTax();
    updateUI();
    finishTurnOptions();
  }
}

function openPropertyModal(actionType) {
  const modal = document.getElementById("property-modal");
  const title = document.getElementById("prop-modal-name");
  const badge = document.getElementById("prop-modal-badge");
  const header = document.getElementById("prop-modal-header");
  const visual = document.getElementById("prop-modal-visual");
  const impact = document.getElementById("prop-modal-impact");
  const rent = document.getElementById("prop-modal-rent");
  const cost = document.getElementById("prop-modal-cost");
  
  const costLabel = document.getElementById("prop-modal-cost-label");
  const rentLabel = document.getElementById("prop-modal-rent-label");
  const confirmBtn = document.getElementById("prop-confirm-btn");
  const declineBtn = document.getElementById("prop-decline-btn");

  const player = players[activePlayerIdx];
  const space = activePropertySpace;

  modal.classList.remove("hidden");
  declineBtn.innerText = "Decline";
  declineBtn.classList.remove("hidden");

  // Determine SVG illustration to render
  let color = space.type === "good" ? "var(--color-green)" : "var(--color-red)";
  let svg = TILE_SVGS[space.type];
  if (space.type === "good") {
    svg = `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>`;
  } else {
    svg = `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`;
  }
  visual.innerHTML = svg;

  if (actionType === "buy") {
    title.innerText = space.name;
    badge.innerText = space.type === "good" ? "SUSTAINABLE VENTURE" : "POLLUTING INDUSTRY";
    badge.style.backgroundColor = space.type === "good" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
    badge.style.color = color;

    impact.innerText = `${space.eco > 0 ? '+' : ''}${space.eco} Environmental Score`;
    impact.className = space.type === "good" ? "text-green" : "text-red";

    rentLabel.innerText = space.type === "good" ? "Initial Green Tariff (Rent)" : "Initial Surcharge (Rent)";
    rent.innerText = `${space.rents[0]}🌱`;

    if (space.type === "good") {
      costLabel.innerText = "Investment Cost";
      cost.innerText = `${space.cost}🌱`;
      cost.className = "text-cyan";
      confirmBtn.innerText = "Invest";
      
      // Check if player has enough money to buy green
      if (player.cash < space.cost) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Insufficient Funds";
      } else {
        confirmBtn.disabled = false;
      }
    } else {
      // Bad property — player now buys it
      costLabel.innerText = "Investment Cost";
      cost.innerText = `${space.cost}🌱`;
      cost.className = "text-cyan";
      rentLabel.innerText = "Income Per Landing (yours)";
      rent.innerText = `${space.payout}🌱`;
      confirmBtn.innerText = "Buy & Operate";
      if (player.cash < space.cost) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Insufficient Funds";
      } else {
        confirmBtn.disabled = false;
      }
    }
  }
  else if (actionType === "bad-owned") {
    title.innerText = space.name;
    badge.innerText = "POLLUTING INDUSTRY";
    badge.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
    badge.style.color = color;
    visual.innerHTML = svg;
    impact.innerText = `${space.eco} Environmental Score`;
    impact.className = "text-red";
    rentLabel.innerText = `Upgrade Income (Lvl ${space.level + 2})`;
    const nextIncome = Math.round(space.payout * (1 + (space.level + 1) * 0.5));
    rent.innerText = `${nextIncome}🌱 (now ${Math.round(space.payout * (1 + space.level * 0.5))}🌱)`;
    const upgradeCost = Math.round(space.cost * 0.5);
    costLabel.innerText = "Upgrade Cost";
    cost.innerText = `${upgradeCost}🌱`;
    cost.className = "text-cyan";
    confirmBtn.innerText = "Expand Factory";
    confirmBtn.disabled = player.cash < upgradeCost;
    if (player.cash < upgradeCost) confirmBtn.innerText = "Insufficient Funds";
    declineBtn.innerText = `Decommission (+${Math.abs(space.eco)}🌿, +${Math.round(space.cost * 0.25)}🌱)`;
    declineBtn.onclick = () => decommissionBadProperty();
  }
  else if (actionType === "bad-owned-maxed") {
    title.innerText = space.name;
    badge.innerText = "POLLUTING INDUSTRY (MAX)";
    badge.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
    badge.style.color = color;
    visual.innerHTML = svg;
    impact.innerText = `${space.eco} Environmental Score`;
    impact.className = "text-red";
    rentLabel.innerText = "Current Income Per Landing";
    rent.innerText = `${Math.round(space.payout * (1 + space.level * 0.5))}🌱`;
    costLabel.innerText = "Decommission Refund";
    cost.innerText = `+${Math.round(space.cost * 0.25)}🌱 +${Math.abs(space.eco)}🌿`;
    cost.className = "text-green";
    confirmBtn.innerText = "Decommission for Eco Points";
    confirmBtn.disabled = false;
    confirmBtn.onclick = () => { decommissionBadProperty(); confirmBtn.onclick = () => confirmPropertyAction(); };
    declineBtn.innerText = "Keep Operating";
    declineBtn.onclick = () => closePropertyModal();
  }
  else if (actionType === "upgrade") {
    const nextLvl = space.level + 1;
    title.innerText = `${space.name} (Upgrade)`;
    badge.innerText = "FACILITY EXPANSION";
    badge.style.backgroundColor = "rgba(245, 158, 11, 0.15)";
    badge.style.color = "var(--color-orange)";

    // Eco point increment
    const addEco = space.type === "good" ? 10 : -10;
    impact.innerText = `${addEco > 0 ? '+' : ''}${addEco} Environmental Score`;
    impact.className = space.type === "good" ? "text-green" : "text-red";

    rentLabel.innerText = `New Rent (Lvl ${nextLvl+1})`;
    rent.innerText = `${space.rents[nextLvl]}🌱 (was ${space.rents[space.level]}🌱)`;

    if (space.type === "good") {
      // Cost to upgrade green
      const upgradeCost = Math.round(space.cost * 0.7);
      costLabel.innerText = "Upgrade Cost";
      cost.innerText = `${upgradeCost}🌱`;
      cost.className = "text-cyan";
      confirmBtn.innerText = "Upgrade";

      if (player.cash < upgradeCost) {
        confirmBtn.disabled = true;
        confirmBtn.innerText = "Insufficient Funds";
      } else {
        confirmBtn.disabled = false;
      }
    } else {
      // Upgrading factory gives you MORE money!
      const upgradePayout = Math.round(space.payout * 0.7);
      costLabel.innerText = "Expansion Payout (Bank Pays You)";
      cost.innerText = `+${upgradePayout}🌱`;
      cost.className = "text-green";
      confirmBtn.innerText = "Expand Factory (Get Paid)";
      confirmBtn.disabled = false;
    }
  }
}

function confirmPropertyAction() {
  const player = players[activePlayerIdx];
  const space = activePropertySpace;
  const modal = document.getElementById("property-modal");

  const isUpgrade = space.owner === player.id;

  if (!isUpgrade) {
    // BUY/COMMISSION
    if (space.type === "good") {
      player.cash -= space.cost;
      player.properties.push(space.id);
      space.owner = player.id;
      space.level = 0;
      
      logEvent(`${player.name} invested in ${space.name} for ${space.cost}🌱.`, "green");
      GameAudio.playPurchase();
    } else {
      player.cash -= space.cost;
      player.properties.push(space.id);
      space.owner = player.id;
      space.level = 0;

      logEvent(`🏭 ${player.name} bought ${space.name} for ${space.cost}🌱. Collect income each time you land on it!`, "red");
      GameAudio.playPurchase();
    }
  } else {
    // UPGRADE
    const nextLvl = space.level + 1;
    if (space.type === "good") {
      const upgradeCost = Math.round(space.cost * 0.7);
      player.cash -= upgradeCost;
      space.level = nextLvl;

      logEvent(`${player.name} upgraded ${space.name} to Level ${nextLvl+1} for ${upgradeCost}🌱.`, "green");
      GameAudio.playPurchase();
    } else {
      const upgradeCost = Math.round(space.cost * 0.5);
      player.cash -= upgradeCost;
      space.level = nextLvl;

      logEvent(`🏭 ${player.name} expanded ${space.name} to Level ${nextLvl+1} for ${upgradeCost}🌱. Income per landing increased!`, "red");
      GameAudio.playPurchase();
    }
  }

  // Draw upgrade indicators on board
  drawUpgradesOnBoard(space.id);

  // Mark owner color on tile border
  const tile = document.querySelector(`.tile-${space.id}`);
  if (tile) {
    tile.classList.add("owned-border");
    tile.style.color = player.color;
  }

  modal.classList.add("hidden");
  finishTurnOptions();
  updateUI();
}

function drawUpgradesOnBoard(spaceId) {
  const container = document.getElementById(`upgrade-container-${spaceId}`);
  if (!container) return;
  container.innerHTML = "";

  const space = BOARD_SPACES[spaceId];
  const dotClass = space.type === "good" ? "good-dot" : "bad-dot";
  
  for (let i = 0; i <= space.level; i++) {
    const dot = document.createElement("div");
    dot.className = `upgrade-dot ${dotClass}`;
    container.appendChild(dot);
  }
}

function closePropertyModal() {
  const modal = document.getElementById("property-modal");
  modal.classList.add("hidden");

  // Reset decline button to default behaviour
  document.getElementById("prop-decline-btn").onclick = () => closePropertyModal();

  const space = activePropertySpace;
  logEvent(`${players[activePlayerIdx].name} declined to buy/upgrade ${space.name}.`, "muted");

  finishTurnOptions();
}

function closePropertyModalSilent() {
  document.getElementById("property-modal").classList.add("hidden");
  document.getElementById("prop-decline-btn").onclick = () => closePropertyModal();
}

function decommissionBadProperty() {
  const player = players[activePlayerIdx];
  const space = activePropertySpace;
  const modal = document.getElementById("property-modal");

  const refund = Math.round(space.cost * 0.25);
  const ecoGain = Math.abs(space.eco);

  player.cash += refund;
  player.ecoPoints += ecoGain;
  player.properties = player.properties.filter(id => id !== space.id);

  space.owner = null;
  space.level = 0;

  // Remove owner border styling from tile
  const tile = document.querySelector(`.tile-${space.id}`);
  if (tile) {
    tile.classList.remove("owned-border");
    tile.style.color = "";
  }

  drawUpgradesOnBoard(space.id);

  logEvent(`♻️ ${player.name} decommissioned ${space.name}! Refund: ${refund}🌱, Eco Points gained: +${ecoGain}🌿`, "green");
  GameAudio.playPassStart();

  modal.classList.add("hidden");
  document.getElementById("prop-decline-btn").onclick = () => closePropertyModal();
  updateUI();
  finishTurnOptions();
}

/* --- ECO-QUIZ MODAL --- */

function shuffleQuestions() {
  // Fisher-Yates shuffle to create a non-repeating question order
  shuffledQuestions = [...ENVIRONMENTAL_QUESTIONS];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }
  questionIndex = 0;
}

function getNextQuestion() {
  // If we've used all questions, reshuffle
  if (questionIndex >= shuffledQuestions.length) {
    shuffleQuestions();
  }
  return shuffledQuestions[questionIndex++];
}

function triggerQuiz() {
  const modal = document.getElementById("quiz-modal");
  const qText = document.getElementById("quiz-question");
  const optionsContainer = document.getElementById("quiz-options");
  const explanationPanel = document.getElementById("quiz-explanation-panel");
  
  explanationPanel.classList.add("hidden");
  optionsContainer.classList.remove("hidden");
  modal.classList.remove("hidden");

  // Pick the next non-repeating question
  activeQuestion = getNextQuestion();

  qText.innerText = activeQuestion.question;
  optionsContainer.innerHTML = "";

  // Render options buttons
  activeQuestion.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.innerHTML = `<span style="font-weight: 600; color: var(--color-cyan); margin-right: 8px;">${String.fromCharCode(65+idx)}.</span> ${opt}`;
    btn.setAttribute("onclick", `selectQuizAnswer(${idx}, this)`);
    optionsContainer.appendChild(btn);
  });

  // Start quiz timer (15 seconds)
  quizTimeSec = 15;
  document.getElementById("quiz-time-sec").innerText = quizTimeSec;
  
  const timerBar = document.getElementById("quiz-timer-bar");
  timerBar.style.width = "100%";
  timerBar.style.transition = "none";
  
  if (quizTimer) clearInterval(quizTimer);
  
  // Trigger bar reduction animation next frame
  setTimeout(() => {
    timerBar.style.transition = "width 15s linear";
    timerBar.style.width = "0%";
  }, 50);

  quizTimer = setInterval(() => {
    quizTimeSec--;
    document.getElementById("quiz-time-sec").innerText = quizTimeSec;
    if (quizTimeSec <= 0) {
      clearInterval(quizTimer);
      handleQuizTimeout();
    }
  }, 1000);
}

function selectQuizAnswer(index, element) {
  clearInterval(quizTimer);
  const optionsContainer = document.getElementById("quiz-options");
  const explanationPanel = document.getElementById("quiz-explanation-panel");
  const feedback = document.getElementById("quiz-feedback-text");
  const explanation = document.getElementById("quiz-explanation-text");

  const buttons = optionsContainer.querySelectorAll(".quiz-opt-btn");
  buttons.forEach(b => b.disabled = true);

  const player = players[activePlayerIdx];

  if (index === activeQuestion.answer) {
    // CORRECT — cash reward
    element.classList.add("correct");
    feedback.innerText = "✅ CORRECT!";
    feedback.className = "feedback-text text-green";

    player.cash += 200;

    logEvent(`${player.name} answered correctly! +200🌱 cash!`, "green");
    GameAudio.playCorrect();
  } else {
    // INCORRECT — no reward
    element.classList.add("incorrect");
    buttons[activeQuestion.answer].classList.add("correct");

    feedback.innerText = "❌ INCORRECT";
    feedback.className = "feedback-text text-red";

    logEvent(`${player.name} answered incorrectly. No reward.`, "red");
    GameAudio.playIncorrect();
  }

  explanation.innerText = activeQuestion.explanation;
  explanationPanel.classList.remove("hidden");
  updateUI();
}

function handleQuizTimeout() {
  const optionsContainer = document.getElementById("quiz-options");
  const explanationPanel = document.getElementById("quiz-explanation-panel");
  const feedback = document.getElementById("quiz-feedback-text");
  const explanation = document.getElementById("quiz-explanation-text");

  // Disable options clicking
  const buttons = optionsContainer.querySelectorAll(".quiz-opt-btn");
  buttons.forEach(b => b.disabled = true);
  
  // Show correct answer
  buttons[activeQuestion.answer].classList.add("correct");

  const player = players[activePlayerIdx];

  feedback.innerText = "⏰ TIME EXPIRED";
  feedback.className = "feedback-text text-orange";

  logEvent(`${player.name} ran out of time! No reward.`, "orange");
  GameAudio.playIncorrect();

  explanation.innerText = activeQuestion.explanation;
  explanationPanel.classList.remove("hidden");
  updateUI();
}

function closeQuizModal() {
  document.getElementById("quiz-modal").classList.add("hidden");
  finishTurnOptions();
}

/* --- ECO-EVENTS (CHANCE CARDS) --- */

function triggerEventCard() {
  const modal = document.getElementById("event-modal");
  const title = document.getElementById("event-modal-title");
  const desc = document.getElementById("event-modal-desc");
  const icon = document.getElementById("event-modal-icon");

  // Draw card
  const cardIdx = Math.floor(Math.random() * ECO_EVENTS.length);
  const card = ECO_EVENTS[cardIdx];

  title.innerText = card.title;
  desc.innerText = card.desc;

  // Render appropriate emoji icon
  if (card.type === "subsidy" || card.type === "grant") icon.innerText = "💰";
  else if (card.type === "spill") icon.innerText = "🛢️";
  else if (card.type === "innovation") icon.innerText = "💡";
  else if (card.type === "smog-fine") icon.innerText = "🌫️";
  else icon.innerText = "📢";

  // Execute card logic
  executeEventCardEffect(card);

  modal.classList.remove("hidden");
}

function executeEventCardEffect(card) {
  const activePlayer = players[activePlayerIdx];

  switch (card.type) {
    case "subsidy":
      // All owners of green properties receive 100
      players.forEach(p => {
        if (p.isBankrupt) return;
        const count = p.properties.map(id => BOARD_SPACES[id]).filter(s => s.type === "good").length;
        if (count > 0) {
          const payout = card.value * count;
          p.cash += payout;
          logEvent(`${p.name} receives ${payout}🌱 green venture subsidy.`, "green");
        }
      });
      GameAudio.playPassStart();
      break;

    case "spill":
      // All players pay 150
      players.forEach(p => {
        if (p.isBankrupt) return;
        p.cash -= card.value;
        logEvent(`${p.name} paid ${card.value}🌱 oceanic cleanup fee.`, "red");
      });
      GameAudio.playTax();
      break;

    case "innovation":
      // Active player gets cash
      activePlayer.cash += card.value;
      logEvent(`${activePlayer.name} received ${card.value}🌱 from a clean innovation grant!`, "green");
      GameAudio.playPassStart();
      break;

    case "smog-fine":
      // Owners of polluting properties are fined 100 per factory
      players.forEach(p => {
        if (p.isBankrupt) return;
        const count = p.properties.map(id => BOARD_SPACES[id]).filter(s => s.type === "bad").length;
        if (count > 0) {
          const fine = card.value * count;
          p.cash -= fine;
          logEvent(`${p.name} fined ${fine}🌱 for factory smog production.`, "red");
        }
      });
      GameAudio.playTax();
      break;

    case "grant":
      activePlayer.cash += card.value;
      GameAudio.playPassStart();
      break;

    case "dump-fine":
      activePlayer.cash -= card.value;
      GameAudio.playTax();
      break;
  }
}

function closeEventModal() {
  document.getElementById("event-modal").classList.add("hidden");
  finishTurnOptions();
}

/* --- GAME LOOP TIMER & END GAME --- */

function gameTimerTick() {
  timeRemaining -= speedMultiplier;
  
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    clearInterval(gameTimerInterval);
    endGame();
  }

  // Update timer display MM:SS
  const display = document.getElementById("timer-display");
  const progress = document.getElementById("timer-progress");
  
  const min = Math.floor(timeRemaining / 60);
  const sec = timeRemaining % 60;
  display.innerText = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;

  const pct = (timeRemaining / gameTimeSeconds) * 100;
  progress.style.width = `${pct}%`;
}

function endGame() {
  GameAudio.playVictory();

  const modal = document.getElementById("game-over-modal");
  modal.classList.remove("hidden");

  // Government end-of-game payout:
  // Green properties → government REWARDS you (eco value × 15 × level multiplier)
  // Bad properties → government FINES you (|eco value| × 10 × level multiplier)
  const rankings = [...players].map(p => {
    if (p.isBankrupt) {
      return { name: p.name, color: p.color, baseCash: 0, govBonus: 0, govFine: 0, finalCash: 0, isBankrupt: true };
    }

    let govBonus = 0;
    let govFine = 0;

    p.properties.forEach(propId => {
      const space = BOARD_SPACES[propId];
      const levelMultiplier = space.level + 1; // Level 0=×1, Level 1=×2, Level 2=×3

      if (space.type === "good") {
        // Government rewards green investments
        govBonus += Math.abs(space.eco) * 30 * levelMultiplier;
      } else if (space.type === "bad") {
        // Government heavily fines polluters
        govFine += Math.abs(space.eco) * 30 * levelMultiplier;
      } else if (space.type === "nuclear") {
        // Nuclear plants that survived = massive government bonus!
        govBonus += 800;
      }
    });

    const ecoBonus = p.ecoPoints * 8;
    const finalCash = p.cash + govBonus - govFine + ecoBonus;

    return {
      name: p.name,
      color: p.color,
      baseCash: p.cash,
      govBonus,
      govFine,
      ecoBonus,
      ecoPoints: p.ecoPoints,
      finalCash,
      isBankrupt: false
    };
  }).sort((a, b) => b.finalCash - a.finalCash);

  // Check for ties at the top
  const topCash = rankings[0].finalCash;
  const winners = rankings.filter(r => r.finalCash === topCash);

  if (winners.length > 1) {
    // TIE!
    const names = winners.map(w =>
      `<span style="color: ${w.color}; font-weight: 800;">${w.name}</span>`
    ).join(" & ");
    document.getElementById("victory-announcement").innerHTML = `
      🤝 It's a TIE! ${names} are tied with <strong>${topCash}🌱</strong> each!
    `;
  } else {
    const winner = rankings[0];
    let bonusDesc = "";
    if (winner.govBonus > 0 && winner.govFine > 0) {
      bonusDesc = `(+${winner.govBonus}🌱 gov. bonus, -${winner.govFine}🌱 gov. fine)`;
    } else if (winner.govBonus > 0) {
      bonusDesc = `(+${winner.govBonus}🌱 government eco-bonus!)`;
    } else if (winner.govFine > 0) {
      bonusDesc = `(despite -${winner.govFine}🌱 government pollution fine)`;
    }
    document.getElementById("victory-announcement").innerHTML = `
      🏆 <span style="color: ${winner.color}; font-weight: 800;">${winner.name}</span> wins with <strong>${winner.finalCash}🌱</strong> ${bonusDesc}
    `;
  }

  const tbody = document.getElementById("game-over-rankings");
  tbody.innerHTML = "";

  rankings.forEach((r, idx) => {
    const govText = r.govBonus > 0 || r.govFine > 0
      ? `+${r.govBonus} / -${r.govFine}`
      : "—";
    const ecoText = r.ecoPoints > 0 ? `+${r.ecoBonus}🌱 (${r.ecoPoints}🌿)` : "—";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="summary-rank">#${idx + 1}</td>
      <td class="summary-name">
        <span class="summary-color" style="background-color: ${r.color}"></span>
        ${r.name} ${r.isBankrupt ? '(Bankrupt)' : ''}
      </td>
      <td style="font-weight: 700; color: var(--color-cyan);">${r.finalCash}🌱</td>
      <td class="text-green">${govText}</td>
      <td style="color:var(--color-green)">${ecoText}</td>
    `;
    tbody.appendChild(row);
  });

  startConfetti();
}

function restartEntireGame() {
  stopConfetti();
  document.getElementById("game-over-modal").classList.add("hidden");
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("setup-screen").classList.remove("hidden");
}

function stopAndLeaveGame() {
  if (confirm("Are you sure you want to stop the game and calculate final scores now?")) {
    clearInterval(gameTimerInterval);
    timeRemaining = 0;
    endGame();
  }
}

function confirmReset() {
  if (confirm("Are you sure you want to restart the game? Current progress will be lost.")) {
    clearInterval(gameTimerInterval);
    restartEntireGame();
  }
}

function endTurn() {
  // Check ALL players' nuclear plants for meltdowns
  checkAllNuclearPlants();

  // Cycle turn
  activePlayerIdx = (activePlayerIdx + 1) % players.length;
  resetTurnState();
  updateUI();

  logEvent(`It is now ${players[activePlayerIdx].name}'s turn.`, "cyan");
}

/* --- AUDIO CONTROL MUTING --- */

function toggleMute() {
  const muted = GameAudio.toggleMute();
  const btn = document.getElementById("mute-btn");
  btn.innerText = muted ? "🔇" : "🔊";
}

/* --- TILE INTERACTION FOR INFO --- */

function onTileClick(spaceId) {
  // Let players click spaces at any time to inspect their stats (payouts, rent tiers, etc.)
  const space = BOARD_SPACES[spaceId];
  if (space.type !== "good" && space.type !== "bad") return;

  activePropertySpace = space;
  
  // Open modal in a read-only "Inspect" mode by hiding Action buttons or converting them
  const modal = document.getElementById("property-modal");
  openPropertyModal("buy"); // Load details
  
  // Adjust modal buttons for inspection view if it's not the active player landing on it
  const player = players[activePlayerIdx];
  const confirmBtn = document.getElementById("prop-confirm-btn");
  const declineBtn = document.getElementById("prop-decline-btn");

  if (space.owner !== null && space.owner === player.id && space.type === "bad") {
    // Owner inspecting their own bad property — offer decommission at any time
    openPropertyModal(space.level < 2 ? "bad-owned" : "bad-owned-maxed");
  } else if (space.owner !== null) {
    const ownerName = players[space.owner].name;
    confirmBtn.innerText = `Owned by ${ownerName}`;
    confirmBtn.disabled = true;
    declineBtn.innerText = "Close";
    declineBtn.onclick = () => closePropertyModalSilent();
  } else {
    if (player.position !== spaceId) {
      confirmBtn.innerText = "Land here to buy";
      confirmBtn.disabled = true;
      declineBtn.innerText = "Close";
      declineBtn.onclick = () => closePropertyModalSilent();
    }
  }
}

/* --- CONFETTI ANIMATION SYSTEM --- */

function startConfetti() {
  confettiActive = true;
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  
  // Set canvas size
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;

  const colors = ["#06B6D4", "#10B981", "#EC4899", "#A855F7", "#F59E0B", "#EAB308"];
  const particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  function draw() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, index) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

      // Wrap around edges
      if (p.y > canvas.height) {
        p.x = Math.random() * canvas.width;
        p.y = -20;
        p.tilt = Math.random() * 10 - 5;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

function stopConfetti() {
  confettiActive = false;
}

function openInstructionsModal() {
  document.getElementById("instructions-modal").classList.remove("hidden");
}

function closeInstructionsModal() {
  document.getElementById("instructions-modal").classList.add("hidden");
}

function openAboutModal() {
  document.getElementById("about-modal").classList.remove("hidden");
}

function closeAboutModal() {
  document.getElementById("about-modal").classList.add("hidden");
}

function payJailBailImmediately() {
  if (!jailedPlayer) return;
  
  jailedPlayer.cash -= 100;
  jailedPlayer.position = 5; // Jail space (visiting)
  jailedPlayer.inJail = false;
  jailedPlayer.jailTurns = 0;
  
  logEvent(`${jailedPlayer.name} paid 100🌱 bail immediately to avoid Pollution Detention!`, "green");
  GameAudio.playTax();
  
  positionTokens();
  updateUI();
  
  document.getElementById("jail-modal").classList.add("hidden");
  finishJailedTurn();
}

function riskDetention() {
  if (!jailedPlayer) return;
  
  jailedPlayer.position = 5; // Jail space (in jail)
  jailedPlayer.inJail = true;
  jailedPlayer.jailTurns = 0;
  
  logEvent(`⚠️ ${jailedPlayer.name} decided to risk it and went to Pollution Detention!`, "red");
  
  positionTokens();
  updateUI();
  
  document.getElementById("jail-modal").classList.add("hidden");
  finishJailedTurn();
}

function finishJailedTurn() {
  jailedPlayer = null;
  rolledThisTurn = true;
  hasActionedThisTurn = true;
  
  const rollBtn = document.getElementById("roll-btn");
  const endBtn = document.getElementById("end-turn-btn");
  rollBtn.classList.add("hidden");
  endBtn.classList.remove("hidden");
  endBtn.disabled = false;
}

/* --- LANDING SCREEN NAVIGATION --- */
function showSetupScreen() {
  document.getElementById("landing-screen").classList.add("hidden");
  document.getElementById("setup-screen").classList.remove("hidden");
}

function showLandingScreen() {
  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("landing-screen").classList.remove("hidden");
}
