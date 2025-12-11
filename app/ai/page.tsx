import React from 'react';
import { AICounselorGate } from '@/features/ai/AICounselorGate';
import { AICounselor } from '@/features/ai/AICounselor';

export default function AIPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AI Counselor</h1>
      <AICounselorGate>
        <AICounselor />
      </AICounselorGate>
    </main>
  );
}


