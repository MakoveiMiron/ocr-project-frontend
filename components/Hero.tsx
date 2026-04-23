import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero container">
      <div className="badge">Subscription-based OCR conversion</div>
      <h1>Convert PDF files into editable DOCX in minutes</h1>
      <p>
        Upload your PDF, let OCR process the content, and download a ready-to-edit DOCX file from one
        clean workflow.
      </p>
      <div className="actions-row mt-16">
        <Link className="btn btn-primary" href="/register">Start free</Link>
        <Link className="btn btn-secondary" href="/login">Sign in</Link>
      </div>
    </section>
  );
}
