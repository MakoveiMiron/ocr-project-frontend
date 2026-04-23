import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero container">
      <div className="badge">Elsődleges fókusz: adatbiztonság</div>
      <h1>Biztonságos PDF → DOCX platform regisztrációval és előfizetéssel</h1>
      <p>
        Strukturális elemzés, intelligens OCR-routing és Word-visszaépítés egy több-bérlős,
        előfizetéses rendszerben.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <Link className="btn btn-primary" href="/dashboard">Megnyitás</Link>
        <Link className="btn btn-secondary" href="/pricing">Csomagok</Link>
      </div>
    </section>
  );
}
