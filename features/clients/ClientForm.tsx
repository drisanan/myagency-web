'use client';
import React from 'react';
import { TextField, Stack, Button, MenuItem } from '@mui/material';
import { z } from 'zod';
import { upsertClient } from '@/services/clients';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string(),
  sport: z.string(),
});

export function ClientForm({ initial }: { initial?: any }) {
  const [value, setValue] = React.useState(initial ?? {});
  const onSave = async () => { Schema.parse(value); await upsertClient(value); };
  return (
    <Stack spacing={2} sx={{ maxWidth: 600 }}>
      <TextField size="small" label="Email" value={value.email ?? ''} onChange={e=>setValue({...value, email: e.target.value})}/>
      <TextField size="small" label="Password" type="password" value={value.password ?? ''} onChange={e=>setValue({...value, password: e.target.value})}/>
      <TextField size="small" label="First name" value={value.firstName ?? ''} onChange={e=>setValue({...value, firstName: e.target.value})}/>
      <TextField size="small" label="Last name" value={value.lastName ?? ''} onChange={e=>setValue({...value, lastName: e.target.value})}/>
      <TextField size="small" select label="Sport" value={value.sport ?? ''} onChange={e=>setValue({...value, sport: e.target.value})}>
        {getSports().map(s => <MenuItem key={s} value={s}>{formatSportLabel(s)}</MenuItem>)}
      </TextField>
      <Button variant="contained" onClick={onSave}>Save</Button>
    </Stack>
  );
}


