import { DocumentTable } from '@/components/DocumentTable';
import { UploadForm } from '@/components/UploadForm';

const sampleDocs = [
  { id: '1f13d998-1111-2222-3333-aabbccddeeff', original_filename: 'szerzodes.pdf', status: 'completed' },
  { id: '2f13d998-1111-2222-3333-aabbccddeeff', original_filename: 'ajanlat.pdf', status: 'processing' }
];

export default function DashboardPage() {
  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="kpis" style={{ marginBottom: 16 }}>
        <div className="kpi"><span className="small">Csomag</span><strong>Pro</strong></div>
        <div className="kpi"><span className="small">Havi keret</span><strong>10 000</strong></div>
        <div className="kpi"><span className="small">Feldolgozott</span><strong>1 284</strong></div>
        <div className="kpi"><span className="small">Aktív jobok</span><strong>3</strong></div>
      </div>

      <div className="grid grid-2">
        <UploadForm />
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Feldolgozási szabály</h2>
          <p className="small">
            Először szerkezeti elemzés fut, utána a rendszer oldal/szekció szinten eldönti,
            hogy Document AI vagy Textract OCR legyen használva.
          </p>
          <p className="small">
            A visszaépítés egy normalizált köztes JSON alapján készül, így a Word export
            egységes marad több OCR-motor mellett is.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <DocumentTable documents={sampleDocs} />
      </div>
    </section>
  );
}
