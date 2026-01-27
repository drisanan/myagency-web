'use client';

import React from 'react';
import { 
  Box, Button, Card, CardContent, Divider, FormControlLabel, Checkbox, MenuItem, 
  Paper, Stack, TextField, Typography, Snackbar, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, CircularProgress, Skeleton
} from '@mui/material';
import { MetricCard } from '@/app/(app)/dashboard/MetricCard';
import { IoListOutline, IoSchoolOutline, IoPieChartOutline } from 'react-icons/io5';
import { useSession } from '@/features/auth/session';
import { getStates } from '@/services/recruiterMeta';
import { getDivisions } from '@/services/recruiterMeta';
import { getSports, formatSportLabel } from '@/features/recruiter/divisionMapping';
import { listUniversities, getUniversityDetails, DIVISION_API_MAPPING } from '@/services/recruiter';
import { listLists, saveList, updateList, deleteList, CoachEntry, CoachList } from '@/services/lists';
import { listClientsByAgencyEmail } from '@/services/clients';
import { assignListToClient } from '@/services/listAssignments';
import { useTour } from '@/features/tour/TourProvider';
import { listsSteps } from '@/features/tour/listsSteps';

export default function ListsPage() {
  const { session, loading } = useSession();
  const { startTour } = useTour();

  React.useEffect(() => {
    if (!loading && session) startTour('lists', listsSteps);
  }, [loading, session, startTour]);

  // FIX: Safely grab the email regardless of property name
  const userEmail = session?.agencyEmail || session?.email;

  const [sport, setSport] = React.useState('');
  const [division, setDivision] = React.useState('');
  const [stateCode, setStateCode] = React.useState('');
  const [states, setStates] = React.useState<Array<{ code: string; name: string }>>([]);
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [schools, setSchools] = React.useState<Array<{ name: string; logo?: string }>>([]);
  const [selectedSchool, setSelectedSchool] = React.useState<string>('');
  const [schoolDetails, setSchoolDetails] = React.useState<any>(null);
  const [loadingSchools, setLoadingSchools] = React.useState(false);
  const [loadingSchoolDetails, setLoadingSchoolDetails] = React.useState(false);

  const [currentName, setCurrentName] = React.useState('');
  const [currentItems, setCurrentItems] = React.useState<CoachEntry[]>([]);
  const [editingId, setEditingId] = React.useState<string>('');
  const [selectedClientId, setSelectedClientId] = React.useState('');

  const [saved, setSaved] = React.useState<CoachList[]>([]);
  const [loadingLists, setLoadingLists] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [clients, setClients] = React.useState<Array<{ id: string; firstName?: string; lastName?: string; email?: string }>>([]);
  const [loadingClients, setLoadingClients] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [listToDelete, setListToDelete] = React.useState<CoachList | null>(null);

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
    setLoadingSchools(true);
    listUniversities({ sport, division: divisionSlug, state: stateCode })
      .then(setSchools)
      .catch((e) => { setError(e?.message || 'Failed to load universities'); setSchools([]); })
      .finally(() => setLoadingSchools(false));
  }, [sport, division, stateCode]);

  React.useEffect(() => {
    if (!userEmail) {
      setClients([]);
      return;
    }
    setLoadingClients(true);
    listClientsByAgencyEmail(userEmail)
      .then((data: any) => {
        setClients(Array.isArray(data) ? data : Array.isArray(data?.clients) ? data.clients : []);
      })
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false));
  }, [userEmail]);

  React.useEffect(() => {
    if (!selectedSchool) { setSchoolDetails(null); return; }
    if (!sport || !division || !stateCode) return;
    const divisionSlug = DIVISION_API_MAPPING[division] || division;
    setLoadingSchoolDetails(true);
    getUniversityDetails({ sport, division: divisionSlug, state: stateCode, school: selectedSchool })
      .then(setSchoolDetails)
      .catch((e) => { setError(e?.message || 'Failed to load school'); setSchoolDetails(null); })
      .finally(() => setLoadingSchoolDetails(false));
  }, [selectedSchool, sport, division, stateCode]);

  // FIX: Use userEmail in dependency array and logic
  React.useEffect(() => {
    if (loading) return; 
    if (!userEmail) return;

    let cancelled = false;
    setLoadingLists(true);
    listLists(userEmail)
      .then((l) => { if (!cancelled) setSaved(l || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingLists(false); });
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
    setSelectedClientId('');
  }

  function resetListBuilder() {
    setEditingId('');
    setCurrentName('');
    setCurrentItems([]);
    setSaveError(null);
    setSport('');
    setDivision('');
    setStateCode('');
    setSchools([]);
    setSelectedSchool('');
    setSchoolDetails(null);
    setManualName('');
    setManualEmail('');
    setManualTitle('');
    setManualSchool('');
    setSelectedClientId('');
  }

  async function saveCurrent() {
    if (loading || saving) return;
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
    
    setSaving(true);
    try {
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
          setSnackbar({ open: true, message: 'List updated successfully!', severity: 'success' });
          if (selectedClientId) {
            await assignListToClient(selectedClientId, updated.id);
          }
        }
        setSaveError(null);
      } else {
        // FIX: Use userEmail for saving
        const rec = await saveList({ agencyEmail: userEmail, name: currentName.trim(), items: currentItems });
        if (rec) {
          setSaved((p) => [rec, ...p]);
          setSaveError(null);
          setSnackbar({ open: true, message: 'List saved successfully!', severity: 'success' });
          if (selectedClientId) {
            await assignListToClient(selectedClientId, rec.id);
          }
          resetListBuilder();
        }
      }
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save list');
      setSnackbar({ open: true, message: e?.message || 'Failed to save list', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }

  function loadList(l: CoachList) {
    setEditingId(l.id);
    setCurrentName(l.name);
    setCurrentItems(l.items);
    setSelectedClientId('');
  }

  function handleDeleteClick(list: CoachList) {
    setListToDelete(list);
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (listToDelete) {
      deleteList(listToDelete.id);
      setSaved((p) => p.filter(x => x.id !== listToDelete.id));
      if (editingId === listToDelete.id) resetCurrent();
      setSnackbar({ open: true, message: 'List deleted successfully!', severity: 'success' });
    }
    setDeleteDialogOpen(false);
    setListToDelete(null);
  }

  const [manualName, setManualName] = React.useState('');
  const [manualEmail, setManualEmail] = React.useState('');
  const [manualTitle, setManualTitle] = React.useState('');
  const [manualSchool, setManualSchool] = React.useState('');

  const totalLists = saved.length;
  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const totalUniversities = React.useMemo(() => {
    const unique = new Set<string>();
    saved.forEach((list) => {
      (list.items || []).forEach((item: any) => {
        const name = item.school || item.university || item.name;
        if (name) unique.add(String(name));
      });
    });
    return unique.size;
  }, [saved]);
  const divisionCounts = React.useMemo(() => {
    const order = ['D1', 'D1AA', 'D2', 'D3', 'JUCO', 'NAIA'];
    const counts: Record<string, number> = {};
    saved.forEach((list) => {
      (list.items || []).forEach((item: any) => {
        const div = String(item.division || item.Division || '').trim();
        if (!div) return;
        counts[div] = (counts[div] || 0) + 1;
      });
    });
    order.forEach((div) => { if (counts[div] == null) counts[div] = 0; });
    return { order, counts };
  }, [saved]);

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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <MetricCard
          title="Total Lists"
          value={loadingLists ? '—' : totalLists}
          icon={<IoListOutline size={20} />}
          bgColor="#EFF4FF"
          textColor="#1D4ED8"
        />
        <MetricCard
          title="Universities Targeted"
          value={loadingLists ? '—' : totalUniversities}
          icon={<IoSchoolOutline size={20} />}
          bgColor="#ECFDF3"
          textColor="#027A48"
        />
        <MetricCard
          title="Breakdown by Division"
          value={loadingLists ? '—' : ''}
          icon={<IoPieChartOutline size={20} />}
          footer={
            loadingLists ? (
              <Typography variant="body2" sx={{ color: '#667085' }}>
                Loading breakdown…
              </Typography>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, width: '100%' }}>
                {divisionCounts.order.map((div) => (
                  <Typography key={div} variant="body2" sx={{ color: '#667085' }}>
                    {div} - {divisionCounts.counts[div] ?? 0}
                  </Typography>
                ))}
              </Box>
            )
          }
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Search for Universities</Typography>
              <Typography variant="body2" color="text.secondary">
                Select a sport and division then you can either search by state or use the search box.
              </Typography>
            </Box>
            <Box data-tour="list-filters" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField size="small" select label="Sport" value={sport} onChange={(e) => setSport(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {sports.map(s => <MenuItem key={s} value={s}>{formatSportLabel(s)}</MenuItem>)}
            </TextField>
            <TextField size="small" select label="Division" value={division} onChange={(e) => setDivision(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {divisions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField size="small" select label="State" value={stateCode} onChange={(e) => setStateCode(e.target.value)} SelectProps={{ MenuProps: { disablePortal: true } }}>
              {states.map(s => <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>)}
            </TextField>
          </Box>

          <Typography variant="subtitle2" color="text.secondary">Universities</Typography>
          <Box data-tour="school-selector" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1 }}>
            {loadingSchools && Array.from({ length: 6 }).map((_, idx) => (
              <Card key={`school-skeleton-${idx}`} variant="outlined">
                <CardContent>
                  <Skeleton variant="rectangular" height={48} sx={{ mb: 1 }} />
                  <Skeleton height={18} />
                </CardContent>
              </Card>
            ))}
            {!loadingSchools && schools.map(u => (
              <Card
                key={u.name}
                variant="outlined"
                onClick={() => setSelectedSchool(u.name)}
                sx={{
                  cursor: 'pointer',
                  borderColor: selectedSchool === u.name ? '#2563EB' : '#eaecf0',
                  boxShadow: selectedSchool === u.name ? '0 0 0 2px rgba(37, 99, 235, 0.12)' : 'none',
                }}
              >
                <CardContent sx={{ display: 'grid', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {u.logo ? (
                      <img src={u.logo} alt={`${u.name} logo`} style={{ maxHeight: 40, maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Skeleton variant="rectangular" height={40} width="100%" />
                    )}
                  </Box>
                  <Typography variant="body2">{u.name}</Typography>
                </CardContent>
              </Card>
            ))}
            {!loadingSchools && schools.length === 0 && (
              <Typography color="text.secondary">No universities found. Select filters above.</Typography>
            )}
          </Box>

          {loadingSchoolDetails && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">Loading school details…</Typography>
            </Box>
          )}
          {schoolDetails && !loadingSchoolDetails && (
            <Box>
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

          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Manual Entry</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Add a coach manually to your list. This can also be a seed account that you are tracking.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 2fr 1fr 2fr auto' }, gap: 1, alignItems: 'center' }}>
            <TextField size="small" label="Full name" value={manualName} onChange={(e) => setManualName(e.target.value)} />
            <TextField size="small" label="Email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} />
            <TextField size="small" label="Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
            <TextField size="small" label="School (optional)" value={manualSchool} onChange={(e) => setManualSchool(e.target.value)} />
            <Button size="small" variant="outlined" onClick={() => { addManualCoach({ name: manualName, email: manualEmail, title: manualTitle, school: manualSchool }); setManualName(''); setManualEmail(''); setManualTitle(''); setManualSchool(''); }}>
              Add
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Name Your List</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Name your list so you can keep track of it.
            </Typography>
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {selectedClient
                ? `Make List Available to ${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim()
                : 'Make List Available to'}
            </Typography>
            <TextField
              fullWidth
              size="small"
              select
              label="Select an athlete"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={loadingClients || clients.length === 0}
            >
              <MenuItem value="">(Not assigned)</MenuItem>
              {clients.map((c) => {
                const name = `${c.firstName || ''} ${c.lastName || ''}`.trim();
                return (
                  <MenuItem key={c.id} value={c.id}>
                    {name || c.email || 'Unknown'} {c.email ? `— ${c.email}` : ''}
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>
          <TextField fullWidth size="small" label="List name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} sx={{ mb: 1 }} />

          <Paper variant="outlined" sx={{ p: 1, maxHeight: 360, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {currentItems.length > 0 && currentItems.map((c, i) => (
              <Box key={`${c.email}-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', py: 1 }}>
                <Box>
                  <Typography variant="body2">{[c.firstName, c.lastName].filter(Boolean).join(' ')} {c.title ? `— ${c.title}` : ''}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.email} · {c.school} · {c.division} · {c.state}</Typography>
                </Box>
                <Button size="small" color="error" onClick={() => removeCoach(i)}>Remove</Button>
              </Box>
            ))}
            {currentItems.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>No coaches added yet.</Typography>
            )}
          </Paper>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button 
              data-tour="save-list-btn" 
              variant="contained" 
              onClick={saveCurrent}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Saving...' : editingId ? 'Update List' : 'Save List'}
            </Button>
            <Button variant="text" onClick={resetCurrent}>New</Button>
          </Stack>
          {saveError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {saveError}
            </Typography>
          )}
        </Stack>
        </Paper>

        <Paper sx={{ p: 2.5 }} variant="outlined">
          <Typography variant="h6" sx={{ mb: 1 }}>Saved Lists</Typography>
          <Paper data-tour="saved-lists" variant="outlined" sx={{ p: 1, maxHeight: 420, overflow: 'auto' }}>
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
                    <Button size="small" color="error" onClick={() => handleDeleteClick(l)}>Delete</Button>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => { setDeleteDialogOpen(false); setListToDelete(null); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete List</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the list <strong>"{listToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will remove {listToDelete?.items?.length || 0} coach{(listToDelete?.items?.length || 0) !== 1 ? 'es' : ''} from this list.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setListToDelete(null); }}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}