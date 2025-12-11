'use client';
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useRadarFeed } from '@/features/radar/useRadarFeed';

export function RadarFeedList() {
  const { feedQuery, followMutation } = useRadarFeed(1);
  if (feedQuery.isLoading) return <CircularProgress role="progressbar" />;
  if (feedQuery.isError) return <Alert severity="error">Failed to load feed</Alert>;
  const items = feedQuery.data ?? [];
  return (
    <List>
      {items.map((a) => (
        <ListItem key={a.id} secondaryAction={
          <Button
            variant="outlined"
            onClick={() => followMutation.mutate({ athleteId: a.id, follow: true })}
          >
            Follow
          </Button>
        }>
          <ListItemText primary={a.name} />
        </ListItem>
      ))}
    </List>
  );
}


