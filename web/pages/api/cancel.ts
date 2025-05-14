export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { license_key } = req.body;
    if (!license_key) {
      return res.status(400).json({ error: "Missing license key" });
    }
  
    try {
      // 1. Get license by key
      const licenseRes = await fetch(`https://api.lemonsqueezy.com/v1/licenses?filter[key]=${license_key}`, {
        headers: {
          Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      });
  
      const licenseData = await licenseRes.json();
      const license = licenseData?.data?.[0];
      const subscriptionId = license?.attributes?.subscription_id;
  
      if (!subscriptionId) {
        return res.status(404).json({ error: "Subscription not found for this license" });
      }
  
      // 2. Cancel subscription using DELETE
      const cancelRes = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      });
  
      const cancelData = await cancelRes.json();
  
      if (!cancelRes.ok) {
        return res.status(400).json({ error: cancelData.error || "Cancellation failed" });
      }
  
      return res.status(200).json({ message: "Subscription canceled", data: cancelData });
    } catch (err) {
      console.error("Cancel error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  