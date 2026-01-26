'use client';
import React from 'react';
import { listLists, saveList } from '@/services/lists';
import { listUniversities, DIVISION_API_MAPPING } from '@/services/recruiter';
import { useSession } from '@/features/auth/session';
import { useTour } from '@/features/tour/TourProvider';
import { clientListsSteps } from '@/features/tour/clientSteps';
import { getDivisions, getStates } from '@/services/recruiterMeta';
import { getSports } from '@/features/recruiter/divisionMapping';
import { getClient } from '@/services/clients';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';

type Uni = { name: string };

export default function ClientListsPage() {
  const { session } = useSession();
  const { startTour } = useTour();
  const [lists, setLists] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (session?.role === 'client') startTour('client-lists', clientListsSteps);
  }, [session, startTour]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [sport, setSport] = React.useState('');
  const [division, setDivision] = React.useState('');
  const [state, setState] = React.useState('');
  const [sports, setSports] = React.useState<string[]>([]);
  const [divisions, setDivisions] = React.useState<string[]>([]);
  const [states, setStates] = React.useState<Array<{ code: string; name: string }>>([]);
  const [universities, setUniversities] = React.useState<Uni[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [schoolSearch, setSchoolSearch] = React.useState('');
  const [loadingUnis, setLoadingUnis] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [clientProfile, setClientProfile] = React.useState<any>(null);
  const visibleUniversities = React.useMemo(() => {
    const term = schoolSearch.trim().toLowerCase();
    if (!term) return universities;
    return universities.filter((u) => u.name.toLowerCase().includes(term));
  }, [universities, schoolSearch]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listLists('');
        setLists(data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load lists');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    const sportsList = getSports();
    if (Array.isArray(sportsList)) setSports(sportsList);
    Promise.resolve(getDivisions())
      .then((divs) => {
        if (Array.isArray(divs)) {
          setDivisions(divs);
          if (divs.length) setDivision(divs[0]);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!division) {
      setStates([]);
      setState('');
      return;
    }
    Promise.resolve(getStates(division) || [])
      .then((s) => {
        if (Array.isArray(s)) {
          setStates(s);
          if (s.length) setState(s[0].code);
        }
      })
      .catch(() => {});
  }, [division]);

  // Load client profile and seed sport/division/state if present
  React.useEffect(() => {
    if (!session?.clientId) return;
    getClient(session.clientId)
      .then((c) => {
        setClientProfile(c);
        if (c?.sport) setSport(c.sport);
        if (c?.division) setDivision(c.division);
        if (c?.state) setState(c.state);
      })
      .catch(() => {});
  }, [session?.clientId]);

  const loadUniversities = async () => {
    try {
      setError(null);
      setLoadingUnis(true);
      const divisionSlug = DIVISION_API_MAPPING[division] || division;
      const data = await listUniversities({ sport, division: divisionSlug, state });
      setUniversities(data);
      setSelected({});
    } catch (e: any) {
      setError(e?.message || 'Failed to load universities');
    } finally {
      setLoadingUnis(false);
    }
  };

  const toggleUni = (name: string) => {
    setSelected((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const doSave = async () => {
    try {
      setError(null);
      setSaving(true);
      const items = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([uniName]) => ({
          email: '',
          firstName: '',
          lastName: '',
          title: '',
          school: uniName,
          division,
          state,
        }));
      if (!name.trim()) throw new Error('List name is required');
      if (items.length === 0) throw new Error('Select at least one university');
      const saved = await saveList({ agencyEmail: session?.agencyEmail || '', name: name.trim(), items });
      setLists((prev) => [...prev, saved]);
      setName('');
      setSelected({});
      setUniversities([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to save list');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader
            title="Create Interest List"
            subheader="Select universities and save your list"
            sx={{ px: 3, pt: 3, pb: 2 }}
          />
          <Divider />
          <CardContent sx={{ px: 3, pb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                size="small"
                label="List Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Box />
              <TextField
                size="small"
                select
                label="Sport"
                fullWidth
                value={sport}
                disabled
                helperText="Sport is set from your profile"
              >
                {sports.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <TextField size="small" select label="Division" fullWidth value={division} onChange={(e) => setDivision(e.target.value)}>
                {divisions.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField size="small" select label="State" fullWidth value={state} onChange={(e) => setState(e.target.value)}>
                {states.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={loadUniversities} disabled={loadingUnis}>
                {loadingUnis ? <CircularProgress size={18} /> : 'Load Universities'}
              </Button>
            </Box>
            {universities.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select universities
                </Typography>
                <TextField
                  size="small"
                  label="Search school"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Type a school name"
                  sx={{ mb: 2 }}
                />
                <Box sx={{ maxHeight: 280, overflow: 'auto', border: '1px solid #eee', p: 1, borderRadius: 1 }}>
                  <Stack spacing={1}>
                    {visibleUniversities.map((u) => (
                      <FormControlLabel
                        key={u.name}
                        control={
                          <Checkbox
                            checked={!!selected[u.name]}
                            onChange={() => toggleUni(u.name)}
                          />
                        }
                        label={u.name}
                      />
                    ))}
                  </Stack>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button variant="contained" onClick={doSave} disabled={saving}>
                    {saving ? <CircularProgress size={18} /> : 'Save List'}
                  </Button>
                  {error ? <Typography color="error">{error}</Typography> : null}
                </Box>
              </Box>
            )}
            {!universities.length && error ? (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            ) : null}
          </CardContent>
        </Card>

        <Card data-tour="client-lists" variant="outlined" sx={{ borderRadius: 2 }}>
          <CardHeader title="Your Interest Lists" sx={{ px: 3, pt: 3, pb: 2 }} />
          <Divider />
          <CardContent sx={{ px: 3, pb: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} />
                <Typography>Loading…</Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {lists.map((l) => (
                  <Box key={l.id} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="subtitle1">{l.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(l.items || []).length} universities
                    </Typography>
                    {(l.items || []).length > 0 && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {(l.items || [])
                          .map((it: any) => it.school || it.university || it.name || '')
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    )}
                  </Box>
                ))}
                {!lists.length ? <Typography>No lists yet.</Typography> : null}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

