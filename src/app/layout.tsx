import { ReactNode } from 'react';

// Next.js App Router requires root layout to have html and body tags
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
