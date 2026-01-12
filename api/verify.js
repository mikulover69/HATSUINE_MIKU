export default async function handler(req, res) {
  // Basic CORS (safe even if you don't need it)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const expected = process.env.PASSCODE;
  if (!expected) {
    res.status(500).json({ ok: false, error: "PASSCODE not set" });
    return;
  }

  try {
    const { code } = req.body || {};
    const attempt = String(code ?? "");
    const secret = String(expected);

    const ok = attempt.length === secret.length && safeEqual(attempt, secret);

    // (Optional) small delay to slow brute-force a bit
    await sleep(150);

    res.status(200).json({ ok });
  } catch (e) {
    res.status(400).json({ ok: false });
  }
}

function safeEqual(a, b) {
  // constant-time-ish compare
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
