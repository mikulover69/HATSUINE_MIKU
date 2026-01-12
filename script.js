const API_VERIFY = "/api/verify";
const API_STIMULUS = "/api/stimulus";
const STORAGE_KEY = "whimper_secret";

const keyInput = document.getElementById("keyInput");
const saveKeyBtn = document.getElementById("saveKey");
const keyDot = document.getElementById("keyDot");
const statusEl = document.getElementById("status");

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

function getSavedKey() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function saveKey(secret) {
  localStorage.setItem(STORAGE_KEY, secret);
  window.WHIMPER_SECRET = secret;
}

saveKeyBtn.addEventListener("click", async () => {
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

window.addEventListener("DOMContentLoaded", async () => {
  const saved = getSavedKey();
  if (!saved) return;

  window.WHIMPER_SECRET = saved;
  keyInput.value = saved;

  try {
    const ok = await verifyKey(saved);
    setDot(ok);
  } catch {}
});

// ---- Test buttons ----
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".stimBtn");
  if (!btn) return;

  const secret = window.WHIMPER_SECRET || "";
  if (!secret) {
    statusEl.textContent = "🔒 No key set.";
    return;
  }

  const row = btn.closest(".stimRow");
  const type = row.dataset.type;
  const input = row.querySelector(".stimValue");
  const value = clamp(Number(input.value) || 0, 0, 100);
  input.value = value;

  statusEl.textContent = `Sending ${type} (${value})...`;

  try {
    const res = await fetch(API_STIMULUS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Whimper-Secret": secret,
      },
      body: JSON.stringify({
        type,
        intensity: value,
        reason: `UI test: ${type} ${value}`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : `HTTP ${res.status}`);

    statusEl.textContent = `✅ Sent ${type} (${value})`;
  } catch (err) {
    statusEl.textContent = `❌ ${err.message}`;
  }
});
