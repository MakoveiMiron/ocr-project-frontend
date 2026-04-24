import './globals.css';
import Link from 'next/link';
import { NavAuth } from '@/components/NavAuth';
import { NavLinks } from '@/components/NavLinks';

export const metadata = {
  title: 'PDF to DOCX Converter',
  description: 'Convert PDF files to editable DOCX in a simple subscription-based workflow.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="container">
          <nav className="topnav">
            <Link href="/"><strong>PDF → DOCX</strong></Link>
            <div className="links">
              <NavLinks />
              <NavAuth />
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
