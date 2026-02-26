const LETTER_POOL = "asdfjkl;ghqwertyuiopzxcvbnm";
const SPAWN_INTERVAL_MS = 900;
const EXPIRY_MS = 1500;
const MAX_ON_SCREEN = 8;

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const missesEl = document.getElementById("misses");
const lettersEl = document.getElementById("letters");

const state = {
  score: 0,
  combo: 0,
  misses: 0,
  notes: [],
};

function randomLetter() {
  const index = Math.floor(Math.random() * LETTER_POOL.length);
  return LETTER_POOL[index];
}

function spawnNote() {
  if (state.notes.length >= MAX_ON_SCREEN) {
    missNote(state.notes[0]);
  }

  state.notes.push({
    id: crypto.randomUUID(),
    char: randomLetter(),
    spawnedAt: Date.now(),
  });

  render();
}

function hitNote(note) {
  state.score += 10 + state.combo * 2;
  state.combo += 1;
  state.notes = state.notes.filter((n) => n.id !== note.id);
  render("hit");
}

function missNote(note) {
  state.misses += 1;
  state.combo = 0;
  state.notes = state.notes.filter((n) => n.id !== note.id);
  render("miss");
}

function removeExpiredNotes() {
  const now = Date.now();
  const expired = state.notes.filter((note) => now - note.spawnedAt > EXPIRY_MS);
  if (expired.length === 0) {
    return;
  }

  expired.forEach((note) => {
    state.misses += 1;
  });
  state.combo = 0;
  state.notes = state.notes.filter((note) => now - note.spawnedAt <= EXPIRY_MS);
  render("miss");
}

function createNoteElement(note, isActive) {
  const el = document.createElement("div");
  el.className = "letter";
  if (isActive) {
    el.classList.add("active");
  }
  el.textContent = note.char;
  return el;
}

function render(flash = "") {
  scoreEl.textContent = String(state.score);
  comboEl.textContent = String(state.combo);
  missesEl.textContent = String(state.misses);

  lettersEl.innerHTML = "";
  state.notes.forEach((note, index) => {
    const noteEl = createNoteElement(note, index === 0);
    lettersEl.append(noteEl);
  });

  if (flash && lettersEl.firstElementChild) {
    lettersEl.firstElementChild.classList.add(flash);
  }
}

document.addEventListener("keydown", (event) => {
  if (!/^[a-z;]$/i.test(event.key)) {
    return;
  }

  const current = state.notes[0];
  if (!current) {
    return;
  }

  if (event.key.toLowerCase() === current.char.toLowerCase()) {
    hitNote(current);
    return;
  }

  missNote(current);
});

spawnNote();
render();
setInterval(spawnNote, SPAWN_INTERVAL_MS);
setInterval(removeExpiredNotes, 100);
