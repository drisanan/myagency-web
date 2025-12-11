import React from 'react';
import { CoachRosterTable } from '@/features/coach/CoachRosterTable';

export default function CoachPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Coach</h1>
      <CoachRosterTable />
    </main>
  );
}


