'use client';

import { Box, Container } from '@mui/material';
import { ImprovementsPanel } from '@/features/suggestions';

export default function ImprovementsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <ImprovementsPanel />
    </Container>
  );
}
