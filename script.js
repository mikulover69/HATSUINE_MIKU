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

document.querySelectorAll("button[data-hook]").forEach((btn) => {
  btn.addEventListener("click", async () => {
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
    setStatus(`⏳ Triggering ${key}...`);

    try {
      const ok = await fireZapier(url, payload);
      setStatus(ok ? `✅ ${key} triggered` : `❌ ${key} failed`);
    } catch (err) {
      setStatus(`❌ Network error: ${err}`);
    } finally {
      btn.disabled = false;
    }
  });
});
const PASSCODE = "meow123"; // 🔑 CHANGE THIS

const buttons = document.querySelectorAll(".grid button");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");
const status = document.getElementById("status");

// Lock all buttons initially
buttons.forEach(btn => {
  btn.disabled = true;
});

unlockBtn.addEventListener("click", () => {
  if (codeInput.value === PASSCODE) {
    buttons.forEach(btn => {
      btn.disabled = false;
    });
    status.textContent = "🔓 Unlocked.";
    codeInput.value = "";
  } else {
    status.textContent = "❌ Wrong code.";
    codeInput.value = "";
  }
});
