export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { license_key, machine_name } = req.body;
    if (!license_key || !machine_name) {
      return res.status(400).json({ error: "Missing license key or machine name" });
    }
  
    try {
      const form = new URLSearchParams();
      form.append("license_key", license_key);
      form.append("instance_name", machine_name); // <-- Note: it's instance_name, not machine_name
  
      const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      
  
      const data = await response.json();
      console.log("DEBUG: Lemon Squeezy activate response", data);
  
      if (!data.activated) {
        return res.status(400).json({ error: data.error || "Activation failed" });
      }
  
      return res.status(200).json({
        status: data.license_key?.status,
        activation_usage: data.license_key?.activation_usage,
        activation_limit: data.license_key?.activation_limit,
        machine_name: data.instance?.name,
        activated_at: data.instance?.created_at,
      });
    } catch (err) {
      console.error("Error activating license:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  