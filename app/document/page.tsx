import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DocumentDetailClient from '@/app/document/DocumentDetailClient';

export default function DocumentPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<section className="container"><p className="small">Loading...</p></section>}>
        <DocumentDetailClient />
      </Suspense>
    </ProtectedRoute>
  );
}
