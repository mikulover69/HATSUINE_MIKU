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
// ⏱ Timer (NEW) - delay before firing webhook
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
// 🔐 Lock / Unlock (your existing behavior)
// =========================
const PASSCODE = "iwillbenicetoremi"; // 🔑 CHANGE THIS

const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");
const status = document.getElementById("status");

let unlocked = false;

// Lock all buttons initially
buttons.forEach((btn) => {
  btn.disabled = true;
});

unlockBtn.addEventListener("click", () => {
  if (codeInput.value === PASSCODE) {
    unlocked = true;
    buttons.forEach((btn) => {
      btn.disabled = false;
    });
    status.textContent = "🔓 Unlocked.";
    codeInput.value = "";
  } else {
    status.textContent = "❌ Wrong code.";
    codeInput.value = "";
  }
});

// =========================
// ✅ Your existing button firing logic,
// plus: wait X seconds before firing when Timer is enabled
// =========================
document.querySelectorAll("button[data-hook]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!unlocked) {
      setStatus("🔒 Locked.");
      return;
    }

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

    btn.disabled = true;

    try {
      // ⏱ If timer is on, wait X seconds BEFORE firing webhook
      if (isTimerOn()) {
        const secs = getDelaySeconds();
        if (secs > 0) {
          setStatus(`⏳ Waiting ${secs}s, then triggering ${key}...`);
          await sleep(secs * 1000);
        }
      }

      setStatus(`⏳ Triggering ${key}...`);
      const ok = await fireZapier(url, payload);
      setStatus(ok ? `✅ ${key} triggered` : `❌ ${key} failed`);
    } catch (err) {
      // your original fallback message
      setStatus(`✅ ${key} triggered`);
    } finally {
      // only re-enable if still unlocked (it will be)
      btn.disabled = false;
    }
  });
});
