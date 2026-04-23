import Link from 'next/link';
import { DocumentSummary } from '@/lib/types';

export function DocumentTable({ documents }: { documents: DocumentSummary[] }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dokumentumok</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Fájlnév</th>
            <th>Állapot</th>
            <th>Azonosító</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.original_filename}</td>
              <td>{doc.status}</td>
              <td><code>{doc.id.slice(0, 8)}…</code></td>
              <td style={{ display: 'flex', gap: 8 }}>
                <Link className="btn btn-secondary" href={`/documents/${doc.id}`}>Státusz</Link>
                <Link className="btn btn-secondary" href={`/documents/${doc.id}?download=1`}>DOCX</Link>
              </td>
            </tr>
          ))}
          {documents.length === 0 ? (
            <tr>
              <td colSpan={4} className="small">Nincs még dokumentum ebben a szervezetben.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
