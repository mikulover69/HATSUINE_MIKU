const API_STIMULUS = "/api/stimulus";
const API_VERIFY = "/api/verify";
const STORAGE_KEY = "whimper_key";

const keyInput = document.getElementById("keyInput");
const saveKeyBtn = document.getElementById("saveKey");
const keyDot = document.getElementById("keyDot");
const statusEl = document.getElementById("status");

function setDot(ok) {
  if (ok) {
    keyDot.style.background = "#2e7d32";
    keyDot.style.boxShadow = "0 0 10px rgba(46,125,50,.35)";
    statusEl.textContent = "✅ Key verified.";
  } else {
    keyDot.style.background = "#b00020";
    keyDot.style.boxShadow = "0 0 10px rgba(176,0,32,.35)";
    statusEl.textContent = "❌ Invalid key.";
  }
}

async function verifyKey(key) {
  const res = await fetch(API_VERIFY, {
    method: "POST",
    headers: { "X-Whimper-Secret": key }
  });
  return res.ok;
}

saveKeyBtn.onclick = async () => {
  const key = keyInput.value.trim();
  if (!key) return;

  localStorage.setItem(STORAGE_KEY, key);
  window.WHIMPER_SECRET = key;

  try {
    setDot(await verifyKey(key));
  } catch {
    statusEl.textContent = "⚠️ Verify failed.";
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    window.WHIMPER_SECRET = saved;
    keyInput.value = saved;
    try {
      setDot(await verifyKey(saved));
    } catch {}
  }
});

// ======================
// Stimulus buttons
// ======================
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".stimBtn");
  if (!btn) return;

  if (!window.WHIMPER_SECRET) {
    statusEl.textContent = "🔒 No key set.";
    return;
  }

  const row = btn.closest(".stimRow");
  const type = row.dataset.type;
  const value = Math.max(0, Math.min(100, Number(row.querySelector(".stimValue").value)));

  statusEl.textContent = `Sending ${type} (${value})…`;

  try {
    const res = await fetch(API_STIMULUS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Whimper-Secret": window.WHIMPER_SECRET
      },
      body: JSON.stringify({
        type,
        intensity: value,
        reason: `UI ${type} ${value}`
      })
    });

    if (!res.ok) throw new Error(await res.text());
    statusEl.textContent = `✅ ${type} sent (${value})`;
  } catch (err) {
    statusEl.textContent = "❌ Send failed.";
  }
});
