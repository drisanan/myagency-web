'use client';
import React from 'react';
import { Stack, TextField, MenuItem, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { getDivisions, getStates, getUniversities } from '@/services/recruiterMeta';

export function DivisionFinder() {
  const [division, setDivision] = React.useState<string>('');
  const [state, setState] = React.useState<string>('');
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [states, setStates] = React.useState<Array<{code:string;name:string}>>([]);
  const [universities, setUniversities] = React.useState<Array<{id:string; name:string}>>([]);

  React.useEffect(() => { getDivisions().then(setDivisions); }, []);
  React.useEffect(() => { if (division) getStates(division).then(setStates); setState(''); setUniversities([]); }, [division]);
  React.useEffect(() => { if (division && state) getUniversities({ division, state }).then(setUniversities); }, [division, state]);

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <TextField
        select
        label="Division"
        value={division}
        onChange={e => setDivision(e.target.value)}
        SelectProps={{ MenuProps: { disablePortal: true } }}
      >
        {divisions.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}
      </TextField>
      {division && (
        <TextField
          select
          label="State"
          value={state}
          onChange={e=>setState(e.target.value)}
          SelectProps={{ MenuProps: { disablePortal: true } }}
        >
          {states.map(s=><MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
        </TextField>
      )}
      {division && state && universities.map(u => (
        <Card key={u.id}><CardActionArea href={`/recruiter/university/${u.id}`}>
          <CardContent><Typography>{u.name}</Typography></CardContent>
        </CardActionArea></Card>
      ))}
    </Stack>
  );
}


