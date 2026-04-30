// Saves full audit session to Supabase for Path C (user going to Rewriter)
// Returns UUID token that Rewriter uses to fetch session
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    resumeBase64, mediaType,
    whyAts, satisfied, unsatisfiedSection, selfRating,
    hasJd, jobTitle, company, jobDescription,
    auditScore, auditVerdict,
    email, phone
  } = req.body;

  if (!resumeBase64 || !email) return res.status(400).json({ error: "Missing required fields" });

  const sb  = process.env.SUPABASE_URL;
  const sk  = process.env.SUPABASE_SERVICE_KEY;
  if (!sb || !sk) return res.status(500).json({ error: "Database not configured" });

  try {
    const r = await fetch(`${sb}/rest/v1/audit_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": sk,
        "Authorization": `Bearer ${sk}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        resume_base64:      resumeBase64,
        media_type:         mediaType || "application/pdf",
        why_ats:            whyAts,
        satisfied:          satisfied,
        unsatisfied_section: unsatisfiedSection || null,
        self_rating:        selfRating,
        has_jd:             hasJd,
        job_title:          jobTitle || null,
        company:            company || null,
        job_description:    jobDescription || null,
        ats_score:          auditScore || null,
        ats_verdict:        auditVerdict || null,
        email:              email,
        phone:              phone || null,
        audit_charge:       99,
        // expires 7 days from now
        expires_at:         new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    const d = await r.json();
    if (!r.ok || !d?.[0]?.id) return res.status(500).json({ error: "Failed to create session" });
    return res.status(200).json({ success: true, sessionId: d[0].id });
  } catch (err) {
    console.error("Create session error:", err);
    return res.status(500).json({ error: "Failed to create session. Please try again." });
  }
}
