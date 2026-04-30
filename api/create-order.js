export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, amount, description } = req.body;
  if (!email || !amount) return res.status(400).json({ error: "Missing required fields" });
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(500).json({ error: "Payment gateway not configured" });
  try {
    const creds = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Basic ${creds}` },
      body: JSON.stringify({ amount, currency: "INR", receipt: `tcb_audit_${Date.now()}`, notes: { email, description, product: "Resume Audit" } })
    });
    const order = await r.json();
    if (!r.ok) return res.status(500).json({ error: "Failed to create order" });
    return res.status(200).json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch { return res.status(500).json({ error: "Failed to create order" }); }
}
