import Link from 'next/link';
import { DocumentSummary } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  queued: 'processing',
  uploaded: 'processing',
  running: 'processing',
  completed: 'completed',
  failed: 'failed'
};

export function DocumentTable({ documents }: { documents: DocumentSummary[] }) {
  const sorted = [...documents].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="card">
      <h2 className="section-title">Recent conversions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>File</th>
            <th>Status</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((doc) => {
            const status = STATUS_LABELS[doc.status] ?? doc.status;
            return (
              <tr key={doc.id}>
                <td>{doc.original_filename}</td>
                <td>{status}</td>
                <td className="actions-row">
                  <Link className="btn btn-secondary" href={`/document?documentId=${doc.id}`}>View</Link>
                  {status === 'completed' ? (
                    <Link className="btn btn-primary" href={`/document?documentId=${doc.id}&download=1`}>Download DOCX</Link>
                  ) : null}
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={3} className="small">No conversions yet.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
