import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/marketing/marketing.css" />
      </head>
      <body className="marketing-page">{children}</body>
    </html>
  );
}


