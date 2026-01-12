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
// Elements
// =========================
const statusEl = document.getElementById("status");
const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");

const timerToggle = document.getElementById("timerToggle");
const timerSeconds = document.getElementById("timerSeconds");
const timerIndicator = document.getElementById("timerIndicator");
const cooldownReadout = document.getElementById("cooldownReadout");

// =========================
// State
// =========================
let unlocked = false;

// =========================
// UI helpers
// =========================
function setStatus(msg) {
  statusEl.textContent = msg;
}

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
    cooldownReadout.textContent = "Timer: on";
  } else {
    timerIndicator.style.background = "#b00020"; // red
    timerIndicator.style.boxShadow = "0 0 10px rgba(176, 0, 32, 0.35)";
    cooldownReadout.textContent = "Timer: off";
  }
}

timerToggle?.addEventListener("change", updateTimerIndicator);
updateTimerIndicator();

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

// =========================
// 🔐 Lock initial state
// =========================
buttons.forEach((btn) => {
  btn.disabled = true;
});

// =========================
// 🔐 Unlock via Vercel serverless verify endpoint
// =========================
unlockBtn.addEventListener("click", async () => {
  const attempt = codeInput.value;
  codeInput.value = "";

  try {
    setStatus("⏳ Checking code...");

    // IMPORTANT: absolute URL since your page is on hatsuinemiku.com
    const res = await fetch("https://hatsuine-miku.vercel.app/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: attempt }),
    });

    // If verify endpoint isn't deployed or errors out
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setStatus(`❌ Verify error (${res.status}). ${txt}`.slice(0, 180));
      return;
    }

    const data = await res.json();

    if (data.ok) {
      unlocked = true;
      buttons.forEach((btn) => (btn.disabled = false));
      setStatus("🔓 Unlocked.");
    } else {
      setStatus("❌ Wrong code.");
    }
  } catch (e) {
    setStatus("❌ Verify failed (server/network).");
  }
});

// =========================
// ✅ Button firing logic (no lockout, supports multiple presses)
// Timer ON => wait X seconds BEFORE firing webhook
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

    const secs = isTimerOn() ? getDelaySeconds() : 0;

    // queue counter (UI only)
    const qKey = `q_${key}`;
    const current = Number(btn.dataset[qKey] || "0") || 0;
    btn.dataset[qKey] = String(current + 1);

    if (secs > 0) {
      setStatus(`⏳ ${key}: queued (${current + 1}) — fires in ${secs}s`);
    } else {
      setStatus(`⏳ ${key}: queued (${current + 1}) — firing now`);
    }

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
        // keep your original "assume success" fallback
        setStatus(`✅ ${key} triggered`);
      }
    })();
  });
});
