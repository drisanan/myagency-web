import React from 'react';

/**
 * Phase 2 layout normalization: only `app/layout.tsx` renders <html>/<body>.
 * The (public) route group stays as a body-level wrapper. Marketing CSS is
 * loaded via metadata below so the root document head stays the single owner
 * of <head>/<html>/<body>.
 */
export const metadata = {
  other: {
    'custom-style-marketing': '/marketing/marketing.css',
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/marketing/marketing.css" />
      <div className="marketing-page">{children}</div>
    </>
  );
}
