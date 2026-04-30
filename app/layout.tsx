import './globals.css';
import Link from 'next/link';
import { NavAuth } from '@/components/NavAuth';
import { NavLinks } from '@/components/NavLinks';

export const metadata = {
  title: 'PDF to DOCX OCR Converter',
  description: 'Convert scanned PDFs and images into editable DOCX files with a clean OCR workflow.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="app-shell">
          <div className="container">
            <nav className="topnav">
              <Link href="/" className="brand">PDF → DOCX</Link>
              <div className="nav-links">
                <NavLinks />
                <NavAuth />
              </div>
            </nav>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
