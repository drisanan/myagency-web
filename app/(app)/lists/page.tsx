'use client';

import React from 'react';
import { Box, Button, Card, CardContent, Divider, FormControlLabel, Checkbox, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useSession } from '@/features/auth/session';
import { getStates } from '@/services/recruiterMeta';
import { getDivisions } from '@/services/recruiterMeta';
import { getSports } from '@/features/recruiter/divisionMapping';
import { listUniversities, getUniversityDetails, DIVISION_API_MAPPING } from '@/services/recruiter';
import { listLists, saveList, updateList, deleteList, CoachEntry, CoachList } from '@/services/lists';

export default function ListsPage() {
  const { session, loading } = useSession();

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const [sport, setSport] = React.useState('');
  const [division, setDivision] = React.useState('');
  const [stateCode, setStateCode] = React.useState('');
  const [states, setStates] = React.useState<Array<{ code: string; name: string }>>([]);
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [schools, setSchools] = React.useState<Array<{ name: string }>>([]);
  const [selectedSchool, setSelectedSchool] = React.useState<string>('');
  const [schoolDetails, setSchoolDetails] = React.useState<any>(null);

  const [currentName, setCurrentName] = React.useState('');
  const [currentItems, setCurrentItems] = React.useState<CoachEntry[]>([]);
  const [editingId, setEditingId] = React.useState<string>('');

  const [saved, setSaved] = React.useState<CoachList[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const sports = React.useMemo(() => getSports(), []);

  React.useEffect(() => {
    getDivisions().then(setDivisions).catch(() => setDivisions([]));
  }, []);

  React.useEffect(() => {
    if (!division) {
      setStates([]);
      setStateCode('');
      setSchools([]);
      setSelectedSchool('');
      setSchoolDetails(null);
      return;
    }
    getStates(division).then(setStates);
  }, [division]);

  React.useEffect(() => {
    if (!sport || !division || !stateCode) {
      setSchools([]);
      setSelectedSchool('');
      setSchoolDetails(null);
      return;
    }
    const divisionSlug = DIVISION_API_MAPPING[division] || division;
    listUniversities({ sport, division: divisionSlug, state: stateCode })
      .then(setSchools)
      .catch((e) => { setError(e?.message || 'Failed to load universities'); setSchools([]); });
  }, [sport, division, stateCode]);

  React.useEffect(() => {
    if (!selectedSchool) { setSchoolDetails(null); return; }
    if (!sport || !division || !stateCode) return;
    const divisionSlug = DIVISION_API_MAPPING[division] || division;
    getUniversityDetails({ sport, division: divisionSlug, state: stateCode, school: selectedSchool })
      .then(setSchoolDetails)
      .catch((e) => { setError(e?.message || 'Failed to load school'); setSchoolDetails(null); });
  }, [selectedSchool, sport, division, stateCode]);

  // FIX: Use userEmail in dependency array and logic
  React.useEffect(() => {
    if (loading) return; 
    if (!userEmail) return;

    let cancelled = false;
    listLists(userEmail)
      .then((l) => { if (!cancelled) setSaved(l || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userEmail, loading]);

  function addCoach(c: any, coachId: string) {
    const entry: CoachEntry = {
      id: coachId,
      firstName: c.firstName || c.FirstName || '',
      lastName: c.lastName || c.LastName || '',
      email: c.email || c.Email || '',
      title: c.title || c.Position || '',
      school: schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool || '',
      division,
      state: stateCode,
    };
    if (!entry.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return;
    setCurrentItems((prev) => (prev.some(x => x.id === coachId) ? prev : [entry, ...prev]));
  }

  function removeCoach(i: number) {
    setCurrentItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addManualCoach(f: { name: string; email: string; title?: string; school?: string }) {
    const [firstName, ...rest] = (f.name || '').trim().split(/\s+/);
    const lastName = rest.join(' ');
    const school = f.school || (schoolDetails?.schoolInfo?.School || selectedSchool || '');
    const rowId = `manual::${school}::${(f.email || '').trim()}::${Date.now()}::${Math.random().toString(36).slice(2,7)}`;
    const entry: CoachEntry = {
      id: rowId,
      firstName,
      lastName,
      email: (f.email || '').trim(),
      title: f.title || '',
      school,
      division,
      state: stateCode,
    };
    if (!entry.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return;
    setCurrentItems((p) => (p.some(x => x.id === rowId) ? p : [entry, ...p]));
  }

  function resetCurrent() {
    setEditingId('');
    setCurrentName('');
    setCurrentItems([]);
    setSaveError(null);
  }

  async function saveCurrent() {
    if (loading) return;
    // FIX: Use userEmail check
    if (!userEmail) {
      setSaveError(`You must be logged in to save a list.`);
      return;
    }
    if (!currentName.trim()) {
      setSaveError('List name is required.');
      return;
    }
    if (currentItems.length === 0) {
      setSaveError('Add at least one coach before saving.');
      return;
    }
    if (editingId) {
      const updated = await updateList({ id: editingId, name: currentName.trim(), items: currentItems });
      if (updated) {
        setSaved((p) => {
          const idx = p.findIndex(x => x.id === updated.id);
          if (idx < 0) return p;
          const next = [...p];
          next[idx] = updated;
          return next.sort((a, b) => b.updatedAt - a.updatedAt);
        });
      }
      setSaveError(null);
    } else {
      // FIX: Use userEmail for saving
      const rec = await saveList({ agencyEmail: userEmail, name: currentName.trim(), items: currentItems });
      if (rec) {
        setSaved((p) => [rec, ...p]);
        setEditingId(rec.id);
        setSaveError(null);
      }
    }
  }

  function loadList(l: CoachList) {
    setEditingId(l.id);
    setCurrentName(l.name);
    setCurrentItems(l.items);
  }

  function deleteListRow(id: string) {
    deleteList(id);
    setSaved((p) => p.filter(x => x.id !== id));
    if (editingId === id) resetCurrent();
  }

  const [manualName, setManualName] = React.useState('');
  const [manualEmail, setManualEmail] = React.useState('');
  const [manualTitle, setManualTitle] = React.useState('');
  const [manualSchool, setManualSchool] = React.useState('');

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {loading && (
        <Typography variant="body2" color="text.secondary">
          Verifying session…
        </Typography>
      )}
      {!loading && !userEmail && (
        <Typography variant="body2" color="error">
          Please log in to view and save lists.
        </Typography>
      )}
      <Typography variant="h5">Lists</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            <TextField select label="Sport" value={sport} onChange={(e) => setSport(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {sports.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select label="Division" value={division} onChange={(e) => setDivision(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {divisions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select label="State" value={stateCode} onChange={(e) => setStateCode(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {states.map(s => <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
            </TextField>
          </Box>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Universities</Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mb: 2 }}>
            {schools.map(u => (
              <Card key={u.name} onClick={() => setSelectedSchool(u.name)} sx={{ width: 240, cursor: 'pointer', outline: selectedSchool === u.name ? '2px solid #1976d2' : 'none' }}>
                <CardContent><Typography>{u.name}</Typography></CardContent>
              </Card>
            ))}
          </Stack>

          {schoolDetails && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {schoolDetails?.schoolInfo?.City || '—'}, {schoolDetails?.schoolInfo?.State || '—'} — {division}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Coaches</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                {(schoolDetails.coaches ?? []).map((c: any, idx: number) => {
                  const first = c.firstName || c.FirstName || '';
                  const last = c.lastName || c.LastName || '';
                  const title = c.title || c.Position || '';
                  const email = c.email || c.Email || '';
                  const schoolName = schoolDetails?.schoolInfo?.School || schoolDetails?.name || selectedSchool || '';
                  const rowId = String(c.id || `${schoolName}::${email || '-' }::${first}-${last}::${title}::${idx}`);
                  const checked = currentItems.some(x => x.id === rowId);
                  return (
                    <FormControlLabel
                      key={rowId}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) =>
                            e.target.checked
                              ? addCoach(c, rowId)
                              : setCurrentItems(prev => prev.filter(x => x.id !== rowId))
                          }
                        />
                      }
                      label={`${first} ${last}${title ? ` — ${title}` : ''}${email ? ` (${email})` : ''}`}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Add coach manually</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 2fr auto' }, gap: 1, alignItems: 'center' }}>
            <TextField size="small" label="Full name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
            <TextField size="small" label="Email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} />
            <TextField size="small" label="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
            <TextField size="small" label="School (optional)" value={manualSchool} onChange={(e) => setManualSchool(e.target.value)} />
            <Button size="small" variant="outlined" onClick={() => { addManualCoach({ name: manualName, email: manualEmail, title: manualTitle, school: manualSchool }); setManualName(''); setManualEmail(''); setManualTitle(''); setManualSchool(''); }}>
              Add
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>Current List</Typography>
          <TextField fullWidth size="small" label="List name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} sx={{ mb: 1 }} />
          <Paper variant="outlined" sx={{ p: 1, maxHeight: 360, overflow: 'auto' }}>
            {currentItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No coaches added yet.</Typography>
            ) : (
              currentItems.map((c, i) => (
                <Box key={`${c.email}-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', py: 1 }}>
                  <Box>
                    <Typography variant="body2">{[c.firstName, c.lastName].filter(Boolean).join(' ')} {c.title ? `— ${c.title}` : ''}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.email} · {c.school} · {c.division} · {c.state}</Typography>
                  </Box>
                  <Button size="small" color="error" onClick={() => removeCoach(i)}>Remove</Button>
                </Box>
              ))
            )}
          </Paper>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="contained" onClick={saveCurrent} disabled={!currentName.trim() || currentItems.length === 0}>{editingId ? 'Update List' : 'Save List'}</Button>
            <Button variant="text" onClick={resetCurrent}>New</Button>
          </Stack>
          {saveError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {saveError}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>Saved Lists</Typography>
          <Paper variant="outlined" sx={{ p: 1, maxHeight: 320, overflow: 'auto' }}>
            {saved.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No saved lists.</Typography>
            ) : (
              saved.map(l => (
                <Box key={l.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', py: 1 }}>
                  <Box>
                    <Typography variant="body2">{l.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{l.items.length} coaches · {new Date(l.updatedAt).toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => loadList(l)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => deleteListRow(l.id)}>Delete</Button>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}