import crypto from "crypto";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, phone, leadId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ error: "Missing fields" });
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const expected = crypto.createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).json({ error: "Verification failed" });
  try {
    const sb = process.env.SUPABASE_URL; const sk = process.env.SUPABASE_SERVICE_KEY;
    if (leadId && sb) await fetch(`${sb}/rest/v1/resume_audits?id=eq.${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json", "apikey": sk, "Authorization": `Bearer ${sk}` }, body: JSON.stringify({ paid: true, payment_id: razorpay_payment_id, order_id: razorpay_order_id }) });
    const hook = process.env.GOOGLE_SHEET_WEBHOOK;
    if (hook) fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "resume_audit_payment", email, phone, paymentId: razorpay_payment_id }) }).catch(() => {});
  } catch (e) { console.error(e); }
  return res.status(200).json({ success: true });
}
