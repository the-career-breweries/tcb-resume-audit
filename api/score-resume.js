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
    ? `Role: ${jobTitle || "Not specified"} at ${company || "Not specified"}.\nJD excerpt: ${jobDescription.substring(0, 500)}`
    : "No specific JD — evaluate against general ATS best practices.";

  const prompt = `You are an ATS expert. Evaluate this resume for ATS compatibility.

${jdCtx}
Candidate notes: ${whyAts}

Respond ONLY with valid JSON — no markdown, no explanation, nothing else:
{"ats_score":72}

Rules: score is integer 1–100, be honest, do not inflate. No other fields.`;

  // Claude document API only supports PDF.
  // For Word/txt files, pass as text content with base64 decoded.
  const isPdf = (mediaType || "").includes("pdf");

  let contentBlocks;
  if (isPdf) {
    contentBlocks = [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: resumeBase64 } },
      { type: "text", text: prompt }
    ];
  } else {
    // For non-PDF: decode base64 to text and pass as plain text
    let resumeText = "";
    try {
      resumeText = Buffer.from(resumeBase64, "base64").toString("utf-8");
    } catch { resumeText = "[Could not decode resume text]"; }
    contentBlocks = [
      { type: "text", text: `RESUME CONTENT:\n${resumeText.substring(0, 4000)}\n\n${prompt}` }
    ];
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: contentBlocks }]
      })
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return res.status(500).json({
        error: "Score generation failed. Please try again.",
        detail: data?.error?.message || "Unknown error"
      });
    }

    const raw = (data?.content?.[0]?.text || "").trim().replace(/```json|```/g, "").trim();

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      console.error("JSON parse failed. Raw response:", raw);
      return res.status(500).json({ error: "Score generation failed. Please try again." });
    }

    if (!result.ats_score) {
      console.error("Missing score in result:", result);
      return res.status(500).json({ error: "Score generation failed. Please try again." });
    }

    return res.status(200).json({
      success: true,
      score: result.ats_score
    });

  } catch (err) {
    console.error("Score error:", err?.message || err);
    return res.status(500).json({ error: "Score generation failed. Please try again." });
  }
}
