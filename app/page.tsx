import { Hero } from '@/components/Hero';
import { SecurityHighlights } from '@/components/SecurityHighlights';

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Demo frontend</h2>
            <p className="small">
              Ez a felület bemutató célra készült. A valódi backend külön szolgáltatásként deployolható, ez a frontend pedig a folyamat és az UI demonstrálására szolgál.
            </p>
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Mire való ez a csomag?</h2>
            <p className="small">
              Elsősorban demo, pitch, UI preview és későbbi továbbfejlesztés alapjaként használható.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <SecurityHighlights />
        </div>
      </section>
    </>
  );
}
