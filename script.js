/* =========================================================
   Ruleta de Sorteo AKVA
   - Participantes precargados (editable)
   - Carga opcional desde Excel (.xlsx/.xls) o CSV
   - Dibuja una ruleta en canvas y la hace girar
   - Detecta automáticamente columnas Nombre / Apellido
   ========================================================= */

// ----- Participantes precargados -----
// Puedes editar esta lista directamente o cargar un Excel desde la interfaz.
const DEFAULT_NAMES = [
  "Ignacio Alcantara",
  "Cristhian Caceres",
  "Leonardo Caneo",
  "Sebastián Espinoza",
  "Claudio Dorner",
  "Javier Perez Bustamante",
  "Marcos Muñoz Ortiz",
  "Rodrigo Bahamondez",
  "Luis Alvarado",
  "Jose Olivares",
  "Matias Toledo",
  "Anis Aguila",
  "Roberto Muñoz Rivas",
  "Marcela Ortega Cabezas",
  "Ricardo Hernandez",
  "Victoria Triviño Azocar",
  "Juan Manuel Higueras",
  "Eduardo Carcamo",
  "Pablo Barra",
  "Roberto Ibañez",
  "Karina Coronado",
  "Claudio Muñoz"
];

// ----- Estado -----
let names = [...DEFAULT_NAMES]; // lista de nombres completos
let currentRotation = 0;        // rotación acumulada (grados)
let spinning = false;
let pendingWinnerIndex = null;  // ganador a quitar al pulsar Continuar

// Paleta de colores para los segmentos
const COLORS = [
  "#22d3ee", "#a78bfa", "#f43f5e", "#34d399", "#fbbf24",
  "#60a5fa", "#f472b6", "#4ade80", "#fb923c", "#c084fc"
];

// ----- Referencias DOM -----
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const namesInput = document.getElementById("namesInput");
const countEl = document.getElementById("count");
const fileStatus = document.getElementById("fileStatus");
const removeWinnerChk = document.getElementById("removeWinner");
const soundChk = document.getElementById("soundOn");
const spinSecondsInput = document.getElementById("spinSeconds");
const prizeCountInput = document.getElementById("prizeCount");
const winnersList = document.getElementById("winnersList");
const modal = document.getElementById("winnerModal");
const winnerNameEl = document.getElementById("winnerName");
const winnerPrizeEl = document.getElementById("winnerPrize");
const winnerGifEl = document.getElementById("winnerGif");
const confettiBox = document.getElementById("confetti");
const pointerEl = document.querySelector(".pointer");

function flickPointer() {
  if (!pointerEl) return;
  pointerEl.classList.remove("flick");
  void pointerEl.offsetWidth; // reinicia la animación
  pointerEl.classList.add("flick");
}

// ----- Utilidades -----
function setStatus(msg, isError = false) {
  if (!fileStatus) return;
  fileStatus.textContent = msg;
  fileStatus.classList.toggle("error", isError);
}

function normalize(str) {
  return String(str || "").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Combina las columnas de nombre y apellido encontradas en una fila
function buildFullName(row, headers) {
  const nombreKeys = ["nombre", "nombres", "name", "first", "firstname", "first name"];
  const apellidoKeys = ["apellido", "apellidos", "last", "lastname", "last name", "surname"];

  let nombre = "";
  let apellido = "";

  headers.forEach((h) => {
    const key = normalize(h);
    if (nombreKeys.includes(key)) nombre = row[h];
    if (apellidoKeys.includes(key)) apellido = row[h];
  });

  const full = `${nombre || ""} ${apellido || ""}`.trim();
  if (full) return full;

  // Si no hubo columnas reconocibles, usa la primera celda con texto
  for (const h of headers) {
    if (row[h] && String(row[h]).trim()) return String(row[h]).trim();
  }
  return "";
}

// ----- Edición manual -----
function syncTextarea() {
  namesInput.value = names.join("\n");
  countEl.textContent = names.length;
}

document.getElementById("applyBtn").addEventListener("click", () => {
  names = namesInput.value.split("\n").map((n) => n.trim()).filter(Boolean);
  countEl.textContent = names.length;
  drawWheel();
  setStatus(`✓ ${names.length} participantes en la ruleta.`);
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  syncTextarea();
  drawWheel();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  names = [...DEFAULT_NAMES];
  syncTextarea();
  drawWheel();
  setStatus(`✓ Lista restablecida (${names.length} participantes).`);
});

// ----- Dibujo de la ruleta -----
function drawWheel() {
  const size = canvas.width;
  const k = size / 640; // factor de escala respecto al diseño base
  const center = size / 2;
  const radius = center - 6 * k;
  ctx.clearRect(0, 0, size, size);

  if (!names.length) {
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.font = `600 ${20 * k}px Poppins, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Carga participantes", center, center - 8 * k);
    ctx.fillText("para empezar 🎡", center, center + 20 * k);
    return;
  }

  const slice = (Math.PI * 2) / names.length;

  names.forEach((name, i) => {
    const start = i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = COLORS[i % COLORS.length];
    ctx.fill();
    ctx.strokeStyle = "rgba(15,23,42,0.35)";
    ctx.lineWidth = 2 * k;
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#0f172a";
    const fontSize = (names.length > 30 ? 11 : names.length > 18 ? 13 : 16) * k;
    ctx.font = `600 ${fontSize}px Poppins, sans-serif`;
    const label = name.length > 22 ? name.slice(0, 21) + "…" : name;
    ctx.fillText(label, radius - 14 * k, 5 * k);
    ctx.restore();
  });

  // Centro
  ctx.beginPath();
  ctx.arc(center, center, 46 * k, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
}

// ----- Sonido (WebAudio con volumen maestro) -----
let audioCtx = null;
let masterGain = null;
let volume = 0.7;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function setVolume(v) {
  volume = Math.min(1, Math.max(0, v));
  if (masterGain) masterGain.gain.value = volume;
}

// Control de volumen de la configuración
const volumeSlider = document.getElementById("volume");
if (volumeSlider) {
  setVolume(volumeSlider.value / 100);
  volumeSlider.addEventListener("input", () => setVolume(volumeSlider.value / 100));
}

function playTick() {
  if (!soundChk.checked) return;
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 660;
    // Envolvente con ataque rápido para un tic contundente
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.6, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain).connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (_) { /* ignora si el navegador bloquea el audio */ }
}

// Sonido de ganador: fanfarria triunfal estilo trompeta + acorde final con brillo
function playWinnerFanfare() {
  if (!soundChk.checked) return;
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime + 0.05;
    const G4 = 392, C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5;

    // Fanfarria ascendente con ritmo corto-corto-corto-largo
    playNote(ctx, G4, t,        0.16, 0.45, "sawtooth");
    playNote(ctx, C5, t + 0.16, 0.16, 0.45, "sawtooth");
    playNote(ctx, E5, t + 0.32, 0.16, 0.45, "sawtooth");
    playNote(ctx, G5, t + 0.48, 0.55, 0.5,  "sawtooth");

    // Acorde mayor final (Do) en varias octavas
    const chordAt = t + 1.05;
    [C5, E5, G5, C6].forEach((f) => playNote(ctx, f, chordAt, 1.2, 0.22, "sawtooth"));

    // Brillo / campanilla por encima
    playNote(ctx, C6 * 2, chordAt + 0.04, 0.7, 0.12, "triangle");
    playNote(ctx, E5 * 2, chordAt + 0.12, 0.6, 0.1,  "triangle");
  } catch (_) { /* ignora si el navegador bloquea el audio */ }
}

function playNote(ctx, freq, when, duration, peak, type) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "triangle";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain).connect(masterGain);
  osc.start(when);
  osc.stop(when + duration + 0.05);
}

// ----- Girar -----
function spin() {
  if (spinning) return;
  if (names.length < 2) {
    setStatus("Necesitas al menos 2 participantes para girar.", true);
    return;
  }
  const maxPrizes = Math.max(1, parseInt(prizeCountInput && prizeCountInput.value, 10) || 3);
  if (winnersList.children.length >= maxPrizes) {
    setStatus(`Ya se sortearon los ${maxPrizes} premios. Limpia la lista para reiniciar.`, true);
    return;
  }
  spinning = true;
  spinBtn.disabled = true;

  const slice = 360 / names.length;
  const winnerIndex = Math.floor(Math.random() * names.length);

  // El puntero está a la derecha (3 en punto). En el canvas el ángulo 0 está a
  // las 3 en punto y crece en sentido horario, por lo que la derecha = 0°.
  // El centro del segmento ganador es (winnerIndex*slice + slice/2); rotamos la
  // rueda para que ese centro quede exactamente bajo el puntero (0°).
  const POINTER_ANGLE = 0;
  const sliceCenter = winnerIndex * slice + slice / 2;
  const targetWithinWheel = ((POINTER_ANGLE - sliceCenter) % 360 + 360) % 360;
  const extraTurns = 12 + Math.floor(Math.random() * 4); // 12-15 vueltas
  const finalRotation =
    currentRotation + extraTurns * 360 +
    (((targetWithinWheel - (currentRotation % 360)) % 360 + 360) % 360);

  // Duración del giro configurable (por defecto 20 s)
  const spinSeconds = Math.min(120, Math.max(5, parseInt(spinSecondsInput && spinSecondsInput.value, 10) || 20));
  const SPIN_MS = spinSeconds * 1000;
  canvas.style.transition = `transform ${spinSeconds}s cubic-bezier(0.12, 0.62, 0.06, 1)`;

  const startRotation = currentRotation;
  currentRotation = finalRotation;
  canvas.style.transform = `rotate(${finalRotation}deg)`;

  // Sincroniza cada clic con el cruce de un participante por el puntero.
  // Leemos el ángulo real de la rueda cada frame y emitimos un tic cada vez
  // que avanza el ancho de un segmento. No suena al entrar al sector ganador.
  const totalDelta = finalRotation - startRotation;
  const startedAt = performance.now();
  let prevAngle = ((startRotation % 360) + 360) % 360;
  let traveled = 0;
  let ticks = 0;
  let stopped = false;
  let rafId;

  function readWheelAngle() {
    const tr = getComputedStyle(canvas).transform;
    if (!tr || tr === "none") return prevAngle;
    try {
      const m = new DOMMatrixReadOnly(tr);
      const deg = Math.atan2(m.b, m.a) * 180 / Math.PI;
      return ((deg % 360) + 360) % 360;
    } catch (_) {
      return prevAngle;
    }
  }

  function tickFrame() {
    const elapsed = performance.now() - startedAt;
    const angle = readWheelAngle();
    let delta = angle - prevAngle;
    if (delta < -180) delta += 360;
    if (delta > 180) delta -= 360;
    if (delta > 0) traveled += delta;
    prevAngle = angle;

    const count = Math.floor(traveled / slice);
    const allow = traveled < totalDelta - slice / 2; // no clic al llegar al ganador
    if (allow && count > ticks) {
      ticks = count;
      playTick();
      flickPointer();
    }
    if (elapsed < SPIN_MS && !stopped) {
      rafId = requestAnimationFrame(tickFrame);
    }
  }
  rafId = requestAnimationFrame(tickFrame);

  // Al terminar la animación: muestra el ganador (sin quitarlo todavía)
  setTimeout(() => {
    stopped = true;
    cancelAnimationFrame(rafId);
    spinning = false;
    spinBtn.disabled = false;
    pendingWinnerIndex = winnerIndex;
    showWinner(names[winnerIndex]);
  }, SPIN_MS + 150);
}

spinBtn.addEventListener("click", spin);

// ----- Modal de ganador + confeti -----
// GIFs de celebración del ganador (se elige uno al azar)
const WINNER_GIFS = [
  "https://media.tenor.com/NRvAuY9ug-gAAAAd/applause-clapping.gif",
  "https://media.tenor.com/dk14TWjRq5AAAAAd/bravo-gif.gif",
  "https://media.tenor.com/n6dZw48CPV4AAAAd/aplausos-minions-gif.gif"
];
let lastGifIndex = -1;

function pickWinnerGif() {
  if (WINNER_GIFS.length <= 1) return WINNER_GIFS[0];
  let i;
  do {
    i = Math.floor(Math.random() * WINNER_GIFS.length);
  } while (i === lastGifIndex);
  lastGifIndex = i;
  return WINNER_GIFS[i];
}

function showWinner(name) {
  const prizeNumber = winnersList.children.length + 1;
  winnerNameEl.textContent = name;
  if (winnerPrizeEl) winnerPrizeEl.textContent = `Premio ${prizeNumber}`;
  if (winnerGifEl) winnerGifEl.src = pickWinnerGif();
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  launchConfetti();
  playWinnerFanfare();
  addWinnerToHistory(name, prizeNumber);
}

function addWinnerToHistory(name, prizeNumber) {
  const n = prizeNumber || (winnersList.children.length + 1);
  const li = document.createElement("li");
  const label = document.createElement("strong");
  label.textContent = `${n} `;
  li.appendChild(label);
  li.appendChild(document.createTextNode(name));
  winnersList.appendChild(li);
}

document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  confettiBox.innerHTML = "";

  // Quita al ganador de la ruleta al confirmar
  if (removeWinnerChk.checked && pendingWinnerIndex !== null) {
    names.splice(pendingWinnerIndex, 1);
    syncTextarea();
    const keep = canvas.style.transition;
    canvas.style.transition = "none";
    currentRotation = currentRotation % 360;
    canvas.style.transform = `rotate(${currentRotation}deg)`;
    drawWheel();
    requestAnimationFrame(() => requestAnimationFrame(() => { canvas.style.transition = keep; }));
  }
  pendingWinnerIndex = null;
});

function launchConfetti() {
  confettiBox.innerHTML = "";
  const colors = ["#22d3ee", "#a78bfa", "#f43f5e", "#34d399", "#fbbf24", "#60a5fa"];
  for (let i = 0; i < 80; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.background = colors[Math.floor(Math.random() * colors.length)];
    s.style.animationDuration = 1.5 + Math.random() * 1.5 + "s";
    s.style.animationDelay = Math.random() * 0.5 + "s";
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiBox.appendChild(s);
  }
}

// ----- Inicio -----
syncTextarea();
drawWheel();
setStatus(`✓ ${names.length} participantes precargados. ¡Listo para girar! 🎯`);
