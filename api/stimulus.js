export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // 🔐 Secret lock (same as before)
  const expected = process.env.WHIMPER_SECRET;
  const got = req.headers["x-whimper-secret"];
  if (!expected || got !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { type = "vibe", intensity = 50, reason = "website trigger" } = req.body || {};

  try {
    const r = await fetch("https://api.pavlok.com/api/v5/stimulus/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAVLOK_API_KEY}`, // raw token only
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stimulus: {
          stimulusType: type,
          stimulusValue: intensity,
          reason,
        },
      }),
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!r.ok) {
      return res.status(502).json({ ok: false, error: data });
    }

    return res.status(200).json({ ok: true, result: data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
