// Stage 2 — paid only. Claude Sonnet. Full report.
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { resumeBase64, mediaType, whyAts, satisfied, unsatisfiedSection, selfRating, hasJd, jobTitle, company, jobDescription, atsScore } = req.body;
  if (!resumeBase64 || !whyAts) return res.status(400).json({ error: "Missing required fields" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const jdContext = hasJd && jobDescription
    ? `\nROLE: ${jobTitle || "Not specified"}\nCOMPANY: ${company || "Not specified"}\nJOB DESCRIPTION:\n${jobDescription}`
    : "\nNo specific JD — evaluate against general ATS best practices.";

  const prompt = `You are an expert ATS consultant and career specialist. Provide a comprehensive ATS audit.

CANDIDATE INPUT:
- Why they need ATS optimisation: ${whyAts}
- Satisfied with resume: ${satisfied ? "Yes" : "No"}
- Unsatisfied section: ${unsatisfiedSection || "Not specified"}
- Self-rating: ${selfRating}/10
- Initial ATS score (Haiku stage): ${atsScore || "Not available"}
${jdContext}

Provide a thorough, honest, actionable audit. Be specific. Reference actual content from the resume.

Respond ONLY with valid JSON:
{
  "ats_score": 68,
  "ats_verdict": "One crisp verdict line",
  "summary": "2-3 sentence overall summary of ATS readiness",
  "sections": {
    "formatting": { "score": 65, "status": "needs_work", "findings": ["Finding 1", "Finding 2"], "fixes": ["Fix 1", "Fix 2"] },
    "keywords":   { "score": 70, "status": "average",    "findings": ["Finding 1"], "fixes": ["Fix 1"] },
    "structure":  { "score": 80, "status": "good",        "findings": ["Finding 1"], "fixes": [] },
    "content":    { "score": 75, "status": "average",    "findings": ["Finding 1", "Finding 2"], "fixes": ["Fix 1", "Fix 2"] },
    "contact":    { "score": 90, "status": "good",        "findings": ["Finding 1"], "fixes": [] }
  },
  "top_issues": ["Critical issue 1", "Critical issue 2", "Critical issue 3"],
  "quick_wins": ["Easy fix 1", "Easy fix 2", "Easy fix 3"],
  "jd_match": ${hasJd ? '"JD match analysis — percentage and specific keyword gaps"' : 'null'},
  "self_rating_vs_actual": "Honest comparison of their ${selfRating}/10 self-rating vs actual score"
}
Status: "good"=80+, "average"=60-79, "needs_work"=below 60. ATS score 1-100. Be honest.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: (()=>{
            const isPdf = (mediaType||"").includes("pdf");
            if(isPdf){
              return [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: resumeBase64 } },
                { type: "text", text: prompt }
              ];
            } else {
              let txt="";
              try{ txt=Buffer.from(resumeBase64,"base64").toString("utf-8"); }catch{}
              return [{ type: "text", text: `RESUME CONTENT:\n${txt.substring(0,6000)}\n\n${prompt}` }];
            }
          })()
        }]
      })
    });
    const data = await response.json();
    if (!response.ok) { console.error("Anthropic error:", JSON.stringify(data)); return res.status(500).json({ error: "Audit failed", detail: data?.error?.message || "Unknown" }); }
    const raw = (data?.content?.[0]?.text || "").trim().replace(/```json|```/g, "").trim();
    const audit = JSON.parse(raw);
    return res.status(200).json({ success: true, audit });
  } catch (err) {
    console.error("Audit error:", err);
    return res.status(500).json({ error: "Audit failed. Please try again." });
  }
}
