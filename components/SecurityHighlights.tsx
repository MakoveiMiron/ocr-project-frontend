export function SecurityHighlights() {
  const items = [
    'Privát objektumtár és signed URL feltöltés',
    'Titkok csak backend oldalon',
    'CSP, HSTS, secure header-ek',
    'Tenant-szintű szeparáció és entitlement ellenőrzés',
    'Webhook ellenőrzés és audit log alapok',
    'OCR API-k kizárólag szerveroldalon'
  ];

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Biztonsági alapelvek</h2>
      <div className="grid">
        {items.map((item) => (
          <div key={item} className="kpi">
            <span className="small">Kontroll</span>
            <strong style={{ fontSize: 18 }}>{item}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
