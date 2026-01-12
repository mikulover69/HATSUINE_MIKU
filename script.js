const API_VERIFY = "/api/verify";
const API_STIMULUS = "/api/stimulus";
const STORAGE_KEY = "whimper_secret";

// Key UI
const keyInput = document.getElementById("keyInput");
const saveKeyBtn = document.getElementById("saveKey");
const keyDot = document.getElementById("keyDot");
const statusEl = document.getElementById("status");

// Timer UI
const timerToggle = document.getElementById("timerToggle");
const timerSeconds = document.getElementById("timerSeconds");
const timerIndicator = document.getElementById("timerIndicator");

// Reason UI
const reasonToggle = document.getElementById("reasonToggle");
const reasonInput = document.getElementById("reasonInput");
const reasonIndicator = document.getElementById("reasonIndicator");

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function setDot(ok, msg) {
  if (ok) {
    keyDot.style.background = "#2e7d32";
    keyDot.style.boxShadow = "0 0 10px rgba(46,125,50,.35)";
    statusEl.textContent = msg || "✅ Key verified.";
  } else {
    keyDot.style.background = "#b00020";
    keyDot.style.boxShadow = "0 0 10px rgba(176,0,32,.35)";
    statusEl.textContent = msg || "❌ Invalid key.";
  }
}

async function verifyKey(secret) {
  const res = await fetch(API_VERIFY, {
    method: "POST",
    headers: { "X-Whimper-Secret": secret },
  });
  const data = await res.json().catch(() => ({}));
  return !!data.ok;
}

function saveKey(secret) {
  localStorage.setItem(STORAGE_KEY, secret);
  window.WHIMPER_SECRET = secret;
}

function loadKey() {
  const saved = localStorage.getItem(STORAGE_KEY) || "";
  if (saved) {
    window.WHIMPER_SECRET = saved;
    keyInput.value = saved;
  }
  return saved;
}

function updateTimerIndicator() {
  if (!timerIndicator) return;
  const on = !!timerToggle?.checked;
  timerIndicator.style.background = on ? "#00c853" : "#b00020";
  timerIndicator.style.boxShadow = on
    ? "0 0 10px rgba(0, 200, 83, 0.35)"
    : "0 0 10px rgba(176, 0, 32, 0.35)";
}

function updateReasonIndicator() {
  if (!reasonIndicator) return;
  const on = !!reasonToggle?.checked;
  reasonIndicator.style.background = on ? "#00c853" : "#b00020";
  reasonIndicator.style.boxShadow = on
    ? "0 0 10px rgba(0, 200, 83, 0.35)"
    : "0 0 10px rgba(176, 0, 32, 0.35)";
}

timerToggle?.addEventListener("change", updateTimerIndicator);
reasonToggle?.addEventListener("change", updateReasonIndicator);

updateTimerIndicator();
updateReasonIndicator();

// Save key button
saveKeyBtn?.addEventListener("click", async () => {
  const secret = keyInput.value.trim();
  if (!secret) return;

  saveKey(secret);
  setDot(false, "⏳ Verifying...");

  try {
    const ok = await verifyKey(secret);
    setDot(ok);
  } catch {
    setDot(false, "⚠️ Verify request failed.");
  }
});

// Auto-load + verify on page load
window.addEventListener("DOMContentLoaded", async () => {
  const saved = loadKey();
  if (!saved) return;

  try {
    const ok = await verifyKey(saved);
    setDot(ok);
  } catch {
    // leave as-is
  }
});

function getDelaySeconds() {
  const n = Number(timerSeconds?.value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getReason(type, value) {
  const overrideOn = !!reasonToggle?.checked;
  const text = reasonInput?.value?.trim() || "";
  if (overrideOn && text) return text;
  return `UI test: ${type} ${value}`;
}

// Stimulus send
async function sendStimulus(type, value) {
  const secret = window.WHIMPER_SECRET || "";
  if (!secret) {
    statusEl.textContent = "🔒 No key set.";
    return;
  }

  const delay = timerToggle?.checked ? getDelaySeconds() : 0;

  if (delay > 0) {
    statusEl.textContent = `⏳ Sending ${type} (${value}) in ${delay}s...`;
    await sleep(delay * 1000);
  } else {
    statusEl.textContent = `Sending ${type} (${value})...`;
  }

  const reason = getReason(type, value);

  const res = await fetch(API_STIMULUS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Whimper-Secret": secret,
    },
    body: JSON.stringify({
      type,
      intensity: value,
      reason,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : `HTTP ${res.status}`);
  statusEl.textContent = `✅ Sent ${type} (${value})`;
}

// Button handler
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".stimBtn");
  if (!btn) return;

  const row = btn.closest(".stimRow");
  const type = row.dataset.type;
  const input = row.querySelector(".stimValue");
  const value = clamp(Number(input.value) || 0, 0, 100);
  input.value = value;

  try {
    await sendStimulus(type, value);
  } catch (err) {
    statusEl.textContent = `❌ ${err.message}`;
  }
});
