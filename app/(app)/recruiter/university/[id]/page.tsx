'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUniversity } from '@/services/recruiterMeta';
import { Typography } from '@mui/material';

export default function UniversityPage({ params }: { params: { id: string }}) {
  const q = useQuery({ queryKey: ['university', params.id], queryFn: () => getUniversity(params.id) });
  if (!q.data) return null;
  return (
    <>
      <Typography variant="h4" gutterBottom>{q.data.name}</Typography>
      <Typography variant="body2">{q.data.city}, {q.data.state} — {q.data.division}</Typography>
    </>
  );
}


