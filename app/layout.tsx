import './globals.css';
import Link from 'next/link';
import { NavAuth } from '@/components/NavAuth';
import { NavLinks } from '@/components/NavLinks';

export const metadata = {
  title: 'flowCR',
  description: 'Convert scanned PDFs and images into editable DOCX files with a clean OCR workflow.',
  icons: {
    icon: '/branding/favicon.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="app-shell">
          <div className="container">
            <nav className="topnav">
              <Link href="/" className="brand" aria-label="flowCR home">
                <span className="brand-mark">
                  <img src="/branding/nav-logo.png" alt="flowCR" className="brand-logo" />
                </span>
              </Link>
              <div className="nav-links">
                <NavLinks />
                <span className="nav-sep" aria-hidden="true" />
                <NavAuth />
              </div>
            </nav>
          </div>
          {children}
          <footer className="site-footer">
            <div className="container site-footer-inner">
              <span className="footer-brand">
                <span className="brand-dot" aria-hidden="true" />
                flowCR
              </span>
              <span className="footer-note">Scanned documents, converted to clean, editable DOCX.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
