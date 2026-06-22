/* =========================================================
   Ruleta de Sorteo AKVA
   - Participantes precargados (editable)
   - Carga opcional desde Excel (.xlsx/.xls) o CSV
   - Dibuja una ruleta en canvas y la hace girar
   - Detecta automáticamente columnas Nombre / Apellido
   ========================================================= */

export function initRuletaApp() {
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

// Paleta de colores para los segmentos
const COLORS = [
  "#22d3ee", "#a78bfa", "#f43f5e", "#34d399", "#fbbf24",
  "#60a5fa", "#f472b6", "#4ade80", "#fb923c", "#c084fc"
];

// ----- Referencias DOM -----
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const spinBtnAlt = document.getElementById("spinBtnAlt");
const namesInput = document.getElementById("namesInput");
const countEl = document.getElementById("count");
const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const removeWinnerChk = document.getElementById("removeWinner");
const soundChk = document.getElementById("soundOn");
const winnersList = document.getElementById("winnersList");
const modal = document.getElementById("winnerModal");
const winnerNameEl = document.getElementById("winnerName");
const confettiBox = document.getElementById("confetti");

// ----- Utilidades -----
function setStatus(msg, isError = false) {
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

// ----- Carga de archivo Excel/CSV -----
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        setStatus("El archivo está vacío o no tiene datos.", true);
        return;
      }

      const headers = Object.keys(rows[0]);
      const parsed = rows
        .map((r) => buildFullName(r, headers))
        .filter((n) => n);

      if (!parsed.length) {
        setStatus("No se encontraron nombres. Revisa las columnas Nombre/Apellido.", true);
        return;
      }

      names = parsed;
      syncTextarea();
      drawWheel();
      setStatus(`✓ ${names.length} participantes cargados desde "${file.name}".`);
    } catch (err) {
      console.error(err);
      setStatus("No se pudo leer el archivo. ¿Es un Excel o CSV válido?", true);
    }
  };
  reader.onerror = () => setStatus("Error al leer el archivo.", true);
  reader.readAsArrayBuffer(file);
  fileInput.value = ""; // permite recargar el mismo archivo
});

// ----- Plantilla de Excel descargable -----
document.getElementById("templateBtn").addEventListener("click", () => {
  const ejemplo = [
    { Nombre: "Juan", Apellido: "Pérez" },
    { Nombre: "María", Apellido: "González" },
    { Nombre: "Carlos", Apellido: "Rodríguez" }
  ];
  const ws = XLSX.utils.json_to_sheet(ejemplo);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Participantes");
  XLSX.writeFile(wb, "plantilla_participantes.xlsx");
});

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
  const center = size / 2;
  const radius = center - 6;
  ctx.clearRect(0, 0, size, size);

  if (!names.length) {
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 20px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Carga participantes", center, center - 8);
    ctx.fillText("para empezar 🎡", center, center + 20);
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
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texto
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#0f172a";
    const fontSize = names.length > 30 ? 11 : names.length > 18 ? 13 : 16;
    ctx.font = `600 ${fontSize}px Poppins, sans-serif`;
    const label = name.length > 22 ? name.slice(0, 21) + "…" : name;
    ctx.fillText(label, radius - 14, 5);
    ctx.restore();
  });

  // Centro
  ctx.beginPath();
  ctx.arc(center, center, 46, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
}

// ----- Sonido (tick simple con WebAudio) -----
let audioCtx = null;
function playTick() {
  if (!soundChk.checked) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 600;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
  } catch (_) { /* ignora si el navegador bloquea el audio */ }
}

// ----- Girar -----
function spin() {
  if (spinning) return;
  if (names.length < 2) {
    setStatus("Necesitas al menos 2 participantes para girar.", true);
    return;
  }
  spinning = true;
  spinBtn.disabled = true;
  spinBtnAlt.disabled = true;

  const slice = 360 / names.length;
  const winnerIndex = Math.floor(Math.random() * names.length);

  // Ángulo para que el ganador quede arriba (donde apunta el puntero)
  const targetWithinWheel = 360 - (winnerIndex * slice + slice / 2);
  const extraTurns = 6 + Math.floor(Math.random() * 3); // 6-8 vueltas
  const finalRotation = currentRotation + extraTurns * 360 + (targetWithinWheel - (currentRotation % 360));

  currentRotation = finalRotation;
  canvas.style.transform = `rotate(${finalRotation}deg)`;

  // Ticks durante el giro
  let ticks = 0;
  const tickInterval = setInterval(() => {
    playTick();
    if (++ticks > 25) clearInterval(tickInterval);
  }, 180);

  // Al terminar la animación (coincide con la transición CSS de 5.5s)
  setTimeout(() => {
    clearInterval(tickInterval);
    spinning = false;
    spinBtn.disabled = false;
    spinBtnAlt.disabled = false;
    const winner = names[winnerIndex];
    showWinner(winner);

    if (removeWinnerChk.checked) {
      names.splice(winnerIndex, 1);
      syncTextarea();
      // Redibuja sin animación de reset
      const keep = canvas.style.transition;
      canvas.style.transition = "none";
      currentRotation = currentRotation % 360;
      canvas.style.transform = `rotate(${currentRotation}deg)`;
      drawWheel();
      // restaura la transición en el próximo frame
      requestAnimationFrame(() => requestAnimationFrame(() => { canvas.style.transition = keep; }));
    }
  }, 5600);
}

spinBtn.addEventListener("click", spin);
spinBtnAlt.addEventListener("click", spin);

// ----- Modal de ganador + confeti -----
function showWinner(name) {
  winnerNameEl.textContent = name;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  launchConfetti();
  addWinnerToHistory(name);
}

function addWinnerToHistory(name) {
  const li = document.createElement("li");
  li.textContent = name;
  winnersList.prepend(li);
}

document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  confettiBox.innerHTML = "";
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
}
