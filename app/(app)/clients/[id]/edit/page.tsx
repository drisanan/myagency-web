import React, { use } from 'react';
import { ClientEditClient } from './page.client';

export default function ClientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  return <ClientEditClient id={resolved.id} />;
}


