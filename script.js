const WEBHOOKS = {
  hook1: "https://hooks.zapier.com/hooks/catch/25934949/uwkjao5/",
  hook2: "PASTE_ZAPIER_WEBHOOK_2",
  hook3: "PASTE_ZAPIER_WEBHOOK_3",
};

const statusEl = document.getElementById("status");

function setStatus(msg) {
  statusEl.textContent = msg;
}

async function fireZapier(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
      source: "github-pages-site",
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
