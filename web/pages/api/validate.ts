export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { license_key } = req.body;
  if (!license_key) {
    return res.status(400).json({ error: "Missing license key" });
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LEMON_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_key }),
    });

    const data = await response.json();
    console.log("DEBUG: Lemon Squeezy validate response", data);

    if (!response.ok || !data.license_key) {
      return res.status(400).json({ error: data.error || "Invalid license" });
    }

    const license = data.license_key;

    return res.status(200).json({
      status: license.status,
      expires_at: license.expires_at,
      activation_usage: license.activation_usage,
      activation_limit: license.activation_limit,
    });
  } catch (err) {
    console.error("Error validating license:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
