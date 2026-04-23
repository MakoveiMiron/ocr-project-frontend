export function SecurityHighlights() {
  const items = [
    'Private object storage with signed URL upload',
    'Secrets are handled only on the backend',
    'CSP, HSTS, and hardened security headers',
    'Tenant-level separation and entitlement checks',
    'Webhook verification and audit-log foundations',
    'OCR APIs are called server-side only'
  ];

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Security foundations</h2>
      <div className="grid">
        {items.map((item) => (
          <div key={item} className="kpi">
            <span className="small">Control</span>
            <strong style={{ fontSize: 18 }}>{item}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
