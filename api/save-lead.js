export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, phone, hasJd, jobTitle, company } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  const sb = process.env.SUPABASE_URL; const sk = process.env.SUPABASE_SERVICE_KEY;
  try {
    const r = await fetch(`${sb}/rest/v1/resume_audits`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": sk, "Authorization": `Bearer ${sk}`, "Prefer": "return=representation" }, body: JSON.stringify({ email, phone, has_jd: hasJd, job_title: jobTitle, company, paid: false }) });
    const d = await r.json();
    const leadId = d?.[0]?.id || null;
    const hook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (hook) fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "resume_audit_lead", email, phone, hasJd, jobTitle, company }) }).catch(() => {});
    return res.status(200).json({ success: true, leadId });
  } catch { return res.status(200).json({ success: true, leadId: null }); }
}
