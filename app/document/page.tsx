import { Suspense } from 'react';
import DocumentDetailClient from '@/app/document/DocumentDetailClient';

export default function DocumentPage() {
  return (
    <Suspense fallback={<section className="container"><p className="small">Loading...</p></section>}>
      <DocumentDetailClient />
    </Suspense>
  );
}
