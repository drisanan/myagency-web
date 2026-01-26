import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Card, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material';
import { listLists } from '@/services/lists';
import { assignListToClient, listAssignments, unassignListFromClient } from '@/services/listAssignments';

type CoachList = {
  id: string;
  name: string;
  type?: 'CLIENT_INTEREST' | 'AGENCY_LIST';
};

export function ListAssignmentsPanel({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const listsQuery = useQuery({
    queryKey: ['lists', 'assignable'],
    queryFn: () => listLists(''),
  });
  const assignmentsQuery = useQuery({
    queryKey: ['list-assignments', clientId],
    queryFn: () => listAssignments({ clientId }),
    enabled: Boolean(clientId),
  });

  const assignMutation = useMutation({
    mutationFn: (listId: string) => assignListToClient(clientId, listId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-assignments', clientId] }),
  });
  const unassignMutation = useMutation({
    mutationFn: (listId: string) => unassignListFromClient(clientId, listId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['list-assignments', clientId] }),
  });

  const lists = (listsQuery.data || []) as CoachList[];
  const assignable = lists.filter((l) => l.type !== 'CLIENT_INTEREST');
  const assignments = (assignmentsQuery.data?.assignments || []) as Array<{ listId: string }>;
  const assignedIds = new Set(assignments.map((a) => a.listId));

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardHeader title="Assigned Coach Lists" />
      <CardContent>
        {listsQuery.isLoading || assignmentsQuery.isLoading ? (
          <Typography color="text.secondary">Loading lists…</Typography>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {assignable.map((list) => {
                const assigned = assignedIds.has(list.id);
                return (
                  <Chip
                    key={list.id}
                    label={list.name}
                    color={assigned ? 'primary' : 'default'}
                    variant={assigned ? 'filled' : 'outlined'}
                    data-testid={`assigned-list-${list.id}`}
                  />
                );
              })}
              {assignable.length === 0 && (
                <Typography color="text.secondary">No agency lists available.</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {assignable.map((list) => {
                const assigned = assignedIds.has(list.id);
                return assigned ? (
                  <Button
                    key={list.id}
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => unassignMutation.mutate(list.id)}
                    disabled={unassignMutation.isPending}
                    data-testid={`unassign-list-${list.id}`}
                  >
                    Remove {list.name}
                  </Button>
                ) : (
                  <Button
                    key={list.id}
                    size="small"
                    variant="contained"
                    onClick={() => assignMutation.mutate(list.id)}
                    disabled={assignMutation.isPending}
                    data-testid={`assign-list-${list.id}`}
                  >
                    Assign {list.name}
                  </Button>
                );
              })}
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
