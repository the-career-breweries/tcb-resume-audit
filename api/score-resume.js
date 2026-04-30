// Stage 1 — Free. Claude Haiku. Score + one-liner only.
// Fires BEFORE payment. Never uses Sonnet.
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { resumeBase64, mediaType, whyAts, hasJd, jobTitle, company, jobDescription } = req.body;
  if (!resumeBase64 || !whyAts) return res.status(400).json({ error: "Missing required fields" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const jdCtx = hasJd && jobDescription
    ? `Role: ${jobTitle || "Not specified"} at ${company || "Not specified"}. JD (first 400 chars): ${jobDescription.substring(0, 400)}`
    : "No specific JD provided — evaluate against general ATS best practices.";

  const prompt = `You are an ATS expert. Quickly evaluate this resume for ATS compatibility.

${jdCtx}
Candidate notes: ${whyAts}

Respond ONLY with valid JSON, nothing else:
{"ats_score":72,"ats_verdict":"One crisp sentence — e.g. Moderate ATS compatibility with key formatting issues"}

Rules: score is integer 1–100, be honest, do not inflate.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 120,
        messages: [{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: mediaType || "application/pdf", data: resumeBase64 } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: "Score generation failed" });
    const raw = (data?.content?.[0]?.text || "").trim().replace(/```json|```/g, "").trim();
    const result = JSON.parse(raw);
    return res.status(200).json({ success: true, score: result.ats_score, verdict: result.ats_verdict });
  } catch (err) {
    console.error("Score error:", err);
    return res.status(500).json({ error: "Score generation failed. Please try again." });
  }
}
