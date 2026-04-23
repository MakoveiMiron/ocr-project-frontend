import { Hero } from '@/components/Hero';
import { SecurityHighlights } from '@/components/SecurityHighlights';

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="grid grid-2">
          <div className="card">
            <h2 className="section-title">Demo frontend</h2>
            <p className="small">
              This interface is built for demo purposes. The real backend can be deployed as a separate
              service, while this frontend demonstrates the user flow and UI.
            </p>
          </div>
          <div className="card">
            <h2 className="section-title">What is this package for?</h2>
            <p className="small">
              It is primarily useful for demos, pitches, UI previews, and as a base for further development.
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
