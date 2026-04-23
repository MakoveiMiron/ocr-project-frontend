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
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.original_filename}</td>
              <td>{doc.status}</td>
              <td><code>{doc.id.slice(0, 8)}…</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
