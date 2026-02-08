'use client';
import React from 'react';
import { Typography } from '@mui/material';
import { RecruiterWizard } from '@/features/recruiter/RecruiterWizard';
import { FeatureErrorBoundary } from '@/components/FeatureErrorBoundary';
import { useTour } from '@/features/tour/TourProvider';
import { recruiterSteps } from '@/features/tour/recruiterSteps';
import { useSession } from '@/features/auth/session';

export default function RecruiterBackofficePage() {
  const { session, loading } = useSession();
  const { startTour } = useTour();

  React.useEffect(() => {
    if (!loading && session) startTour('recruiter', recruiterSteps);
  }, [loading, session, startTour]);

  return (
    <main style={{ padding: 24 }}>
      <Typography variant="h4" gutterBottom>Recruiter</Typography>
      <FeatureErrorBoundary name="recruiter-wizard">
        <RecruiterWizard />
      </FeatureErrorBoundary>
    </main>
  );
}


