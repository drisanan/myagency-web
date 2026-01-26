"use client";
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enrollInDrip,
  listDripEnrollments,
  listEmailDrips,
  unenrollFromDrip,
} from '@/services/emailDrips';

type Props = {
  clientId: string;
};

export function DripEnrollmentPanel({ clientId }: Props) {
  const queryClient = useQueryClient();
  const dripsQuery = useQuery({
    queryKey: ['emailDrips'],
    queryFn: listEmailDrips,
    staleTime: 60_000,
  });
  const enrollmentsQuery = useQuery({
    queryKey: ['dripEnrollments', clientId],
    queryFn: () => listDripEnrollments({ clientId }),
    enabled: Boolean(clientId),
    staleTime: 60_000,
  });

  const enrollMutation = useMutation({
    mutationFn: ({ dripId, clientId }: { dripId: string; clientId: string }) => enrollInDrip(dripId, clientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dripEnrollments', clientId] }),
  });
  const unenrollMutation = useMutation({
    mutationFn: ({ dripId, clientId }: { dripId: string; clientId: string }) => unenrollFromDrip(dripId, clientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dripEnrollments', clientId] }),
  });

  const enrollments = enrollmentsQuery.data || [];
  const enrollmentByDrip = new Map(enrollments.map((e) => [e.dripId, e]));
  const drips = dripsQuery.data || [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Email Drip Enrollments</Typography>
        {dripsQuery.isLoading || enrollmentsQuery.isLoading ? (
          <CircularProgress />
        ) : (
          <Stack spacing={1}>
            {drips.map((drip) => {
              const enrollment = enrollmentByDrip.get(drip.id);
              const nextSendAt = enrollment?.nextSendAt ? new Date(enrollment.nextSendAt).toLocaleString() : null;
              return (
                <Card key={drip.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1">{drip.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {drip.steps.length} step{drip.steps.length === 1 ? '' : 's'}
                        </Typography>
                        {enrollment && (
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                            <Chip label="Enrolled" color="success" size="small" />
                            {nextSendAt && (
                              <Typography variant="caption" color="text.secondary">
                                Next send: {nextSendAt}
                              </Typography>
                            )}
                          </Stack>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        {enrollment ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => unenrollMutation.mutate({ dripId: drip.id, clientId })}
                          >
                            Unenroll
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => enrollMutation.mutate({ dripId: drip.id, clientId })}
                            disabled={!drip.isActive}
                          >
                            Enroll
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
            {drips.length === 0 && (
              <Typography color="text.secondary">No drips available. Create one first.</Typography>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
