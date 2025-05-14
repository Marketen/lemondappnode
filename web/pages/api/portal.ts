export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { license_key } = req.body;
    if (!license_key) {
      return res.status(400).json({ error: "Missing license key" });
    }
  
    try {
      const headers = {
        Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
        Accept: "application/vnd.api+json",
      };
  
      // Step 1: Get license ID
      const listRes = await fetch(
        `https://api.lemonsqueezy.com/v1/licenses?filter[key]=${license_key}`,
        { headers }
      );
  
      const listData = await listRes.json();
      const licenseId = listData?.data?.[0]?.id;
      if (!licenseId) return res.status(404).json({ error: "License not found" });
  
      // Step 2: Get full license info to extract subscription_id
      const licenseRes = await fetch(
        `https://api.lemonsqueezy.com/v1/licenses/${licenseId}`,
        { headers }
      );
      const licenseData = await licenseRes.json();
      const subscriptionId = licenseData?.data?.attributes?.subscription_id;
  
      if (!subscriptionId) {
        return res.status(404).json({ error: "No subscription linked to license" });
      }
  
      // Step 3: Fetch subscription to get portal URL
      const subRes = await fetch(
        `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
        { headers }
      );
      const subData = await subRes.json();
      const portalUrl = subData?.data?.attributes?.urls?.customer_portal;
  
      if (!portalUrl) {
        return res.status(500).json({ error: "Failed to retrieve portal URL" });
      }
  
      return res.status(200).json({ portal_url: portalUrl });
    } catch (err) {
      console.error("Portal error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  