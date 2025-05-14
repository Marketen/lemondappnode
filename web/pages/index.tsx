import React, { useState } from "react";

export default function Home() {
  const [licenseKey, setLicenseKey] = useState("");
  const [machineName, setMachineName] = useState("");
  const [status, setStatus] = useState(null);
  const [activation, setActivation] = useState(null);
  const [error, setError] = useState(null);

  const validateLicense = async () => {
    setError(null);
    setStatus(null);
    setActivation(null);
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_key: licenseKey }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Invalid license");
    setStatus(data);
  };

  const activateLicense = async () => {
    setError(null);
    setActivation(null);
    const res = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        license_key: licenseKey,
        machine_name: machineName,
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Activation failed");
    setActivation(data);
  };

  const openCustomerPortal = async () => {
    if (!licenseKey) {
      return setError("Please enter your license key first.");
    }

    const res = await fetch("/api/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_key: licenseKey }),
    });

    const data = await res.json();
    if (!res.ok || !data.portal_url) {
      return setError(data.error || "Failed to open customer portal");
    }

    window.open(data.portal_url, "_blank");
  };

  return (
    <main>
      <div className="container">
        <h1>DAppNode Premium</h1>

        <label>License Key</label>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Enter your license key"
        />

        <button className="button-validate" onClick={validateLicense}>
          ✅ Validate License
        </button>

        <button className="button-cancel" onClick={openCustomerPortal}>
          ❌ Cancel Subscription
        </button>

        {status && (
          <div className="status-box">
            <p><strong>Status:</strong> {status.status}</p>
            <p><strong>Expires At:</strong> {status.expires_at || "N/A"}</p>
            <p><strong>Usage:</strong> {status.activation_usage}/{status.activation_limit}</p>
          </div>
        )}

        <hr style={{ margin: "2rem 0" }} />

        <label>Machine Name</label>
        <input
          type="text"
          className="machine-name"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          placeholder="Enter machine name"
        />

        <button className="button-activate" onClick={activateLicense}>
          ⚡ Activate License
        </button>

        {activation && (
          <div className="status-box">
            <p><strong>Status:</strong> {activation.status}</p>
            <p><strong>Machine:</strong> {activation.machine_name}</p>
            <p><strong>Activated At:</strong> {activation.activated_at}</p>
            <p><strong>Usage:</strong> {activation.activation_usage}/{activation.activation_limit}</p>
          </div>
        )}
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        <a
          className="button-buy button-link"
          href="https://testdappnodepremium.lemonsqueezy.com/buy/91e0f96c-4e0e-4c2a-bf31-a6ebaef4fce5"
          target="_blank"
          rel="noopener noreferrer"
        >
          💳 Buy Subscription
        </a>
      </div>

      {error && <p className="error">{error}</p>}
    </main>
  );
}
