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

const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function fireZapier(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}

// =========================
// 🔐 Lock / Unlock (your existing behavior)
// =========================
const PASSCODE = "iwillbenicetoremi"; // 🔑 CHANGE THIS
const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");

let unlocked = false;

// Lock all buttons initially
buttons.forEach((btn) => {
  btn.disabled = true;
});

// =========================
// ⏱ Timer / Cooldown (NEW)
// =========================
const timerToggle = document.getElementById("timerToggle");
const timerSeconds = document.getElementById("timerSeconds");
const timerIndicator = document.getElementById("timerIndicator");
const cooldownReadout = document.getElementById("cooldownReadout");

let cooldownMs = 0;
let cooldownInterval = null;

function isTimerOn() {
  return !!timerToggle?.checked;
}

function getAddSeconds() {
  const n = Number(timerSeconds?.value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
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

function renderCooldown() {
  if (!cooldownReadout) return;

  if (!isTimerOn()) {
    cooldownReadout.textContent = "Timer: off";
    return;
  }

  if (cooldownMs <= 0) {
    cooldownReadout.textContent = "Timer: ready";
    return;
  }

  cooldownReadout.textContent = `Cooldown: ${Math.ceil(cooldownMs / 1000)}s`;
}

function applyButtonState() {
  // If locked, always disabled.
  if (!unlocked) {
    buttons.forEach((btn) => (btn.disabled = true));
    return;
  }

  // If unlocked and timer cooldown active, disable all.
  if (isTimerOn() && cooldownMs > 0) {
    buttons.forEach((btn) => (btn.disabled = true));
    return;
  }

  // Otherwise unlocked + no cooldown => enable all.
  buttons.forEach((btn) => (btn.disabled = false));
}

function stopCooldown() {
  cooldownMs = 0;
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
  renderCooldown();
  applyButtonState();
}

function addCooldownSeconds(seconds) {
  if (!isTimerOn()) return;
  if (!unlocked) return;
  if (seconds <= 0) return;

  cooldownMs += seconds * 1000;
  renderCooldown();
  applyButtonState();

  if (cooldownInterval) return;

  cooldownInterval = setInterval(() => {
    cooldownMs -= 250;
    if (cooldownMs <= 0) {
      stopCooldown();
    } else {
      renderCooldown();
    }
  }, 250);
}

// init timer ui
updateTimerIndicator();
renderCooldown();

timerToggle?.addEventListener("change", () => {
  updateTimerIndicator();

  // turning timer OFF cancels cooldown immediately
  if (!isTimerOn()) stopCooldown();

  renderCooldown();
  applyButtonState();
});

// =========================
// Unlock click
// =========================
unlockBtn.addEventListener("click", () => {
  if (codeInput.value === PASSCODE) {
    unlocked = true;
    setStatus("🔓 Unlocked.");
    codeInput.value = "";

    // enable depending on cooldown
    applyButtonState();
  } else {
    setStatus("❌ Wrong code.");
    codeInput.value = "";
  }
});

// =========================
// ✅ Your existing Zapier button logic, preserved,
// plus: "add time in seconds whenever buttons are pressed"
// =========================
document.querySelectorAll("button[data-hook]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    // If timer is ON, add seconds on *every press*
    addCooldownSeconds(getAddSeconds());

    const key = btn.dataset.hook;
    const url = WEBHOOKS[key];

    if (!url || url.startsWith("PASTE_")) {
      setStatus(`❌ Missing Zapier webhook for ${key}`);
      return;
    }

    const payload = {
      button: key,
      fired_at: new Date().toISOString(),
      source: "hatsuinemiku.com",
    };

    // keep your per-button disabled behavior,
    // but if cooldown is active, everything stays disabled anyway
    btn.disabled = true;
    setStatus(`⏳ Triggering ${key}...`);

    try {
      const ok = await fireZapier(url, payload);
      setStatus(ok ? `✅ ${key} triggered` : `❌ ${key} failed`);
    } catch (err) {
      // your original fallback message
      setStatus(`✅ ${key} triggered`);
    } finally {
      // if cooldown still active, keep disabled; otherwise re-enable
      applyButtonState();
    }
  });
});
