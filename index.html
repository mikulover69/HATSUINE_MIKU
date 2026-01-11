const WEBHOOKS = {
  hook1: "https://hooks.zapier.com/hooks/catch/25934949/uwkjao5/",
  hook2: "https://hooks.zapier.com/hooks/catch/25934949/uwfbwpx/",
  hook3: "https://hooks.zapier.com/hooks/catch/25934949/uwfbcir/",
  hook4: "https://hooks.zapier.com/hooks/catch/25934949/uwf36ad/",
  hook5: "https://hooks.zapier.com/hooks/catch/25934949/uwf3efi/",
  hook6: "https://hooks.zapier.com/hooks/catch/25934949/uwfusr7/",
  hook7: "https://hooks.zapier.com/hooks/catch/25934949/uwf438a/",
  hook8: "https://hooks.zapier.com/hooks/catch/25934949/uwf47mv/",
  hook9: "https://hooks.zapier.com/hooks/catch/25934949/uwf6ri2/",
  hook10: "https://hooks.zapier.com/hooks/catch/25934949/uwf62w8/",
};

// =========================
// Status helpers (+ streak counter)
// =========================
const statusEl = document.getElementById("status");

// Counts upward from 0 when presses are within 10s of each other.
// If >10s since last press, resets to 0.
let pressCount = 0;
let lastPressAtMs = 0;
const PRESS_WINDOW_MS = 10_000;

function recordPressAndUpdateCount() {
  const now = Date.now();
  if (lastPressAtMs && now - lastPressAtMs <= PRESS_WINDOW_MS) {
    pressCount += 1;
  } else {
    pressCount = 0;
  }
  lastPressAtMs = now;
}

function setStatus(msg) {
  statusEl.textContent = `[#${pressCount}] ${msg}`;
}

// =========================
// Network helpers
// =========================
async function fireZapier(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =========================
// ⏱ Timer delay (wait BEFORE firing webhook)
// =========================
const timerToggle = document.getElementById("timerToggle");
const timerSeconds = document.getElementById("timerSeconds");
const timerIndicator = document.getElementById("timerIndicator");

function isTimerOn() {
  return !!timerToggle?.checked;
}

function getDelaySeconds() {
  const n = Number(timerSeconds?.value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function updateTimerIndicator() {
  if (!timerIndicator) return;
  if (isTimerOn()) {
    timerIndicator.style.background = "#00c853"; // green
    timerIndicator.style.boxShadow = "0 0 10px rgba(0, 200, 83, 0.35)";
  } else {
    timerIndicator.style.background = "#b00020"; // red
    timerIndicator.style.boxShadow = "0 0 10px rgba(176, 0, 32, 0.35)";
  }
}
timerToggle?.addEventListener("change", updateTimerIndicator);
updateTimerIndicator();

// =========================
// 🔐 Lock / Unlock
// =========================
const PASSCODE = "iwillbenicetoremi"; // 🔑 CHANGE THIS
const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");

let unlocked = false;

// Lock all buttons initially
buttons.forEach((btn) => (btn.disabled = true));

unlockBtn.addEventListener("click", () => {
  if (codeInput.value === PASSCODE) {
    unlocked = true;
    buttons.forEach((btn) => (btn.disabled = false));
    setStatus("🔓 Unlocked.");
    codeInput.value = "";
  } else {
    setStatus("❌ Wrong code.");
    codeInput.value = "";
  }
});

// =========================
// ✅ Webhook buttons
// - NO lockout
// - Multiple clicks allowed
// - Each click queues its own delayed fire
// - Press counter increments if within 10s of last press
// =========================
document.querySelectorAll("button[data-hook]").forEach((btn) => {
  // Guard against double-binding
  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", () => {
    if (!unlocked) {
      setStatus("🔒 Locked.");
      return;
    }

    // ✅ update streak counter on EVERY press
    recordPressAndUpdateCount();

    const key = btn.dataset.hook;
    const url = WEBHOOKS[key];

    if (!url) {
      setStatus(`❌ Missing webhook for ${key}`);
      return;
    }

    const payload = {
      button: key,
      fired_at: new Date().toISOString(),
      source: "hatsuinemiku.com",
    };

    // Determine delay per click
    const secs = isTimerOn() ? getDelaySeconds() : 0;

    // Track queued count per button (UI only)
    const qKey = `q_${key}`;
    const current = Number(btn.dataset[qKey] || "0") || 0;
    btn.dataset[qKey] = String(current + 1);

    if (secs > 0) {
      setStatus(`⏳ ${key}: queued (${current + 1}) — fires in ${secs}s`);
    } else {
      setStatus(`⏳ ${key}: queued (${current + 1}) — firing now`);
    }

    // Fire in background (do not block UI)
    (async () => {
      try {
        if (secs > 0) await sleep(secs * 1000);

        // decrement queued just before firing
        const remaining = Math.max(
          0,
          (Number(btn.dataset[qKey] || "1") || 1) - 1
        );
        btn.dataset[qKey] = String(remaining);

        setStatus(`⏳ ${key}: triggering...`);
        const ok = await fireZapier(url, payload);
        setStatus(ok ? `✅ ${key} triggered` : `❌ ${key} failed`);
      } catch (err) {
        // Keep original behavior: assume success if fetch throws
        setStatus(`✅ ${key} triggered`);
      }
    })();
  });
});
