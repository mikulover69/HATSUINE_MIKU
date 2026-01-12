const ALLOWED_ORIGINS = new Set([
  "https://www.hatsuinemiku.com",
  "https://hatsuinemiku.com",
]);

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // CORS: only allow your site(s)
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  // allow our custom header too
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Whimper-Secret");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  // Prefer WHIMPER_SECRET, fall back to PASSCODE
  const expected = process.env.WHIMPER_SECRET ?? process.env.PASSCODE;
  if (!expected) {
    return res
      .status(500)
      .json({ ok: false, error: "WHIMPER_SECRET/PASSCODE not set" });
  }

  try {
    // Accept either header or body
    const headerSecret = req.headers["x-whimper-secret"];
    const { code } = req.body || {};

    const attempt = String(headerSecret ?? code ?? "");
    const b = String(expected);

    const ok = attempt.length === b.length && safeEqual(attempt, b);

    // small delay (helps a little vs brute forcing)
    await sleep(150);

    return res.status(200).json({ ok });
  } catch {
    return res.status(400).json({ ok: false });
  }
}

function safeEqual(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
