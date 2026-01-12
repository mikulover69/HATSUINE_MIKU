export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, step: "method" });
    }

    const expected = process.env.WHIMPER_SECRET;
    const got = req.headers["x-whimper-secret"];

    if (!expected) {
      return res.status(500).json({
        ok: false,
        step: "env",
        error: "WHIMPER_SECRET missing",
      });
    }

    if (got !== expected) {
      return res.status(401).json({
        ok: false,
        step: "auth",
        got: got ? "present" : "missing",
      });
    }

    // Body safety
    let body = null;
    try {
      body = req.body;
    } catch (e) {
      return res.status(500).json({
        ok: false,
        step: "body-parse",
        error: String(e),
      });
    }

    const type = body?.type ?? "vibe";
    const intensity = body?.intensity ?? 50;
    const reason = body?.reason ?? "website trigger";

    // Check Pavlok key presence
    if (!process.env.PAVLOK_API_KEY) {
      return res.status(500).json({
        ok: false,
        step: "env",
        error: "PAVLOK_API_KEY missing",
      });
    }

    // Try fetch safely
    let pavlokRes;
    let pavlokText;

    try {
      pavlokRes = await fetch("https://api.pavlok.com/api/v5/stimulus/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PAVLOK_API_KEY}`,
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

      pavlokText = await pavlokRes.text();
    } catch (e) {
      return res.status(500).json({
        ok: false,
        step: "fetch",
        error: String(e),
      });
    }

    return res.status(200).json({
      ok: pavlokRes.ok,
      step: "done",
      pavlokStatus: pavlokRes.status,
      pavlokResponse: pavlokText,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      step: "top-level",
      error: String(e),
    });
  }
}
