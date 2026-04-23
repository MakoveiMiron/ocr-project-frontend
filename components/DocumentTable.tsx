import Link from 'next/link';
import { DocumentSummary } from '@/lib/types';

export function DocumentTable({ documents }: { documents: DocumentSummary[] }) {
  return (
    <div className="card">
      <h2 className="section-title">Documents</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Status</th>
            <th>Identifier</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.original_filename}</td>
              <td>{doc.status}</td>
              <td><code>{doc.id.slice(0, 8)}…</code></td>
              <td className="actions-row">
                <Link className="btn btn-secondary" href={`/documents/${doc.id}`}>Status</Link>
                <Link className="btn btn-secondary" href={`/documents/${doc.id}?download=1`}>DOCX</Link>
              </td>
            </tr>
          ))}
          {documents.length === 0 ? (
            <tr>
              <td colSpan={4} className="small">No documents yet in this organization.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
