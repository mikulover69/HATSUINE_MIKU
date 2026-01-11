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
  hook10:"https://hooks.zapier.com/hooks/catch/25934949/uwf62w8/",
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
// 🔐 Lock / Unlock (same idea as your original)
// =========================
const PASSCODE = "iwillbenicetoremi"; // 🔑 CHANGE THIS
const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");

let unlocked = false;

// lock all buttons initially
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
// ✅ Single click handler (guarded from double-binding)
// =========================
document.querySelectorAll("button[data-hook]").forEach((btn) => {
  // Guard: if this script gets evaluated twice, don't bind twice.
  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", async () => {
    if (!unlocked) {
      setStatus("🔒 Locked.");
      return;
    }

    const key = btn.dataset.hook;
    const url = WEBHOOKS[key];

    if (!url) {
      setStatus(`❌ Missing webhook for ${key}`);
      return;
    }

    // Disable ONLY the clicked button while it waits + fires
    const wasDisabled = btn.disabled;
    btn.disabled = true;

    const payload = {
      button: key,
      fired_at: new Date().toISOString(),
      source: "hatsuinemiku.com",
    };

    try {
      // ⏱ Wait FIRST (if enabled)
      if (isTimerOn()) {
        const secs = getDelaySeconds();
        if (secs > 0) {
          setStatus(`⏳ ${key}: waiting ${secs}s...`);
          await sleep(secs * 1000);
        }
      }

      setStatus(`⏳ ${key}: triggering...`);
      const ok = await fireZapier(url, payload);
      setStatus(ok ? `✅ ${key} triggered` : `❌ ${key} failed`);
    } catch (err) {
      // keep your original "assume success" fallback
      setStatus(`✅ ${key} triggered`);
    } finally {
      // Re-enable ONLY this button (others were never touched)
      // If you re-lock later, lock logic will disable them again.
      btn.disabled = wasDisabled ? true : false;
    }
  });
});
