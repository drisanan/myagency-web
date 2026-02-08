'use client';
import React from 'react';
import { listLists, saveList, deleteList } from '@/services/lists';
import { listAssignments } from '@/services/listAssignments';
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
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Chip,
} from '@mui/material';
import { IoSchoolOutline, IoTrashOutline } from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, gradients } from '@/theme/colors';
import { LoadingState } from '@/components/LoadingState';

type Uni = { name: string };

/** Reusable angular card wrapper matching the agency design system */
function AngularCard({
  children,
  dark,
  ...rest
}: {
  children: React.ReactNode;
  dark?: boolean;
} & React.ComponentProps<typeof Box>) {
  return (
    <Box
      {...rest}
      sx={{
        borderRadius: 0,
        clipPath:
          'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        bgcolor: dark ? undefined : colors.white,
        background: dark ? gradients.darkCard : undefined,
        color: dark ? colors.white : colors.black,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'none',
        transition: 'box-shadow 0.25s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '3px',
          background: dark
            ? `linear-gradient(180deg, ${colors.lime} 0%, ${colors.lime}60 100%)`
            : `linear-gradient(180deg, ${colors.black} 0%, ${colors.black}40 100%)`,
          zIndex: 1,
        },
        '&:hover': {
          boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 16px ${colors.lime}06`,
        },
        ...(rest.sx as any),
      }}
    >
      {children}
    </Box>
  );
}

export default function ClientListsPage() {
  const { session } = useSession();
  const { startTour } = useTour();
  const qc = useQueryClient();
  const [assignedLists, setAssignedLists] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (session?.role === 'client') startTour('client-lists', clientListsSteps);
  }, [session, startTour]);
  const [loadingAssigned, setLoadingAssigned] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // React Query for own interest lists
  const { data: lists = [], isLoading: loading } = useQuery({
    queryKey: ['client-own-lists'],
    queryFn: () => listLists(''),
  });

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

  // Optimistic delete mutation
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteList(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['client-own-lists'] });
      const prev = qc.getQueryData<any[]>(['client-own-lists']);
      qc.setQueryData<any[]>(['client-own-lists'], (old) => (old || []).filter((l) => l.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['client-own-lists'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['client-own-lists'] }),
  });

  // Fetch agency-assigned lists (coach lists the agency shared with this client)
  React.useEffect(() => {
    if (!session?.clientId) {
      setLoadingAssigned(false);
      return;
    }
    (async () => {
      try {
        setLoadingAssigned(true);
        const data = await listAssignments({ clientId: session.clientId, includeLists: true });
        setAssignedLists((data?.lists as any[]) || []);
      } catch {
        // Silently fail — assigned lists are supplemental
        setAssignedLists([]);
      } finally {
        setLoadingAssigned(false);
      }
    })();
  }, [session?.clientId]);

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
      qc.setQueryData<any[]>(['client-own-lists'], (old) => [...(old || []), saved]);
      setName('');
      setSelected({});
      setUniversities([]);
    } catch (e: any) {
      setError(e?.message || 'Failed to save list');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', zIndex: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: colors.black,
          mb: 3,
        }}
      >
        My Lists
      </Typography>

      <Stack spacing={3}>
        {/* Create Interest List */}
        <AngularCard>
          <Box
            sx={{
              background: gradients.darkCard,
              px: 3,
              py: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.8rem',
                color: colors.white,
              }}
            >
              Create Interest List
            </Typography>
            <Typography variant="caption" sx={{ color: '#FFFFFF60' }}>
              Select universities and save your list
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 2.5 }}>
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
              <Button
                variant="contained"
                onClick={loadUniversities}
                disabled={loadingUnis}
                sx={{
                  bgcolor: colors.lime,
                  color: colors.black,
                  fontWeight: 700,
                  borderRadius: 0,
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                  '&:hover': { bgcolor: '#B8E600' },
                }}
              >
                {loadingUnis ? <CircularProgress size={18} /> : 'Load Universities'}
              </Button>
            </Box>
            {universities.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Select Universities
                  </Typography>
                  {selectedCount > 0 && (
                    <Chip
                      label={`${selectedCount} selected`}
                      size="small"
                      sx={{
                        bgcolor: `${colors.lime}20`,
                        color: colors.black,
                        fontWeight: 700,
                        fontSize: 11,
                        height: 22,
                      }}
                    />
                  )}
                </Stack>
                <TextField
                  size="small"
                  label="Search school"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Type a school name"
                  sx={{ mb: 2 }}
                />
                <Box
                  sx={{
                    maxHeight: 280,
                    overflow: 'auto',
                    border: '1px solid #E0E0E0',
                    p: 1,
                    borderRadius: 0,
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  }}
                >
                  <Stack spacing={0.5}>
                    {visibleUniversities.map((u) => (
                      <FormControlLabel
                        key={u.name}
                        control={
                          <Checkbox
                            checked={!!selected[u.name]}
                            onChange={() => toggleUni(u.name)}
                            sx={{
                              '&.Mui-checked': { color: colors.lime },
                            }}
                          />
                        }
                        label={u.name}
                        sx={{
                          m: 0,
                          px: 1,
                          py: 0.25,
                          borderRadius: 0,
                          '&:hover': { bgcolor: `${colors.lime}08` },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={doSave}
                    disabled={saving}
                    sx={{
                      bgcolor: colors.lime,
                      color: colors.black,
                      fontWeight: 700,
                      borderRadius: 0,
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                      '&:hover': { bgcolor: '#B8E600' },
                    }}
                  >
                    {saving ? <CircularProgress size={18} /> : 'Save List'}
                  </Button>
                  {error ? (
                    <Typography sx={{ color: colors.error, fontSize: 13 }}>{error}</Typography>
                  ) : null}
                </Box>
              </Box>
            )}
            {!universities.length && error ? (
              <Typography sx={{ color: colors.error, mt: 2, fontSize: 13 }}>
                {error}
              </Typography>
            ) : null}
          </Box>
        </AngularCard>

        {/* Agency-Assigned Coach Lists */}
        <AngularCard>
          <Box
            sx={{
              background: gradients.darkCard,
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IoSchoolOutline color={colors.lime} size={18} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.8rem',
                color: colors.white,
              }}
            >
              Coach Lists From Your Agency
            </Typography>
            {!loadingAssigned && (
              <Chip
                label={`${assignedLists.length} lists`}
                size="small"
                sx={{
                  ml: 'auto',
                  bgcolor: `${colors.lime}20`,
                  color: colors.lime,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>
          <Box sx={{ px: 3, py: 2.5 }}>
            {loadingAssigned ? (
              <LoadingState message="Loading assigned lists..." />
            ) : assignedLists.length === 0 ? (
              <Typography sx={{ color: '#0A0A0A60' }}>
                Your agency hasn't assigned any coach lists to you yet. Check back soon!
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {assignedLists.map((l: any) => {
                  const coaches = (l.items || []) as any[];
                  const schools = new Set(
                    coaches
                      .map((c: any) => c.school || c.university || '')
                      .filter(Boolean)
                  );
                  return (
                    <Box
                      key={l.id}
                      sx={{
                        border: '1px solid #E0E0E0',
                        borderRadius: 0,
                        clipPath:
                          'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                        p: 2,
                        transition: 'background 0.15s ease',
                        '&:hover': { bgcolor: `${colors.lime}06` },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {l.name}
                        </Typography>
                        <Chip
                          label={`${coaches.length} coaches`}
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            height: 20,
                            bgcolor: '#F0F0F0',
                          }}
                        />
                        <Chip
                          label={`${schools.size} schools`}
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            height: 20,
                            bgcolor: `${colors.lime}15`,
                          }}
                        />
                      </Stack>
                      {/* Coach details */}
                      {coaches.length > 0 && (
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          {coaches.slice(0, 8).map((c: any, idx: number) => {
                            const fullName = [c.firstName, c.lastName]
                              .filter(Boolean)
                              .join(' ');
                            return (
                              <Box
                                key={c.id || c.email || idx}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  fontSize: 13,
                                  color: '#0A0A0A99',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: colors.black }}
                                >
                                  {fullName || c.email || 'Unknown'}
                                </Typography>
                                {c.title && (
                                  <Typography variant="caption" sx={{ color: '#0A0A0A60' }}>
                                    — {c.title}
                                  </Typography>
                                )}
                                {c.school && (
                                  <Chip
                                    label={c.school}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      bgcolor: '#F0F0F0',
                                      ml: 'auto',
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                          {coaches.length > 8 && (
                            <Typography variant="caption" sx={{ color: '#0A0A0A50', mt: 0.5 }}>
                              + {coaches.length - 8} more coaches
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </AngularCard>

        {/* Your Interest Lists */}
        <AngularCard data-tour="client-lists">
          <Box
            sx={{
              background: gradients.darkCard,
              px: 3,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: '0.8rem',
                color: colors.white,
              }}
            >
              Your Interest Lists
            </Typography>
            {!loading && (
              <Chip
                label={`${lists.length} lists`}
                size="small"
                sx={{
                  ml: 'auto',
                  bgcolor: `${colors.lime}20`,
                  color: colors.lime,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>
          <Box sx={{ px: 3, py: 2.5 }}>
            {loading ? (
              <LoadingState message="Loading lists..." />
            ) : (
              <Stack spacing={1.5}>
                {lists.map((l) => (
                  <Box
                    key={l.id}
                    sx={{
                      border: '1px solid #E0E0E0',
                      borderRadius: 0,
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      p: 2,
                      transition: 'background 0.15s ease',
                      '&:hover': { bgcolor: `${colors.lime}06` },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {l.name}
                      </Typography>
                      <Chip
                        label={`${(l.items || []).length} schools`}
                        size="small"
                        sx={{
                          fontSize: 11,
                          fontWeight: 600,
                          height: 20,
                          bgcolor: '#F0F0F0',
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => deleteMut.mutate(l.id)}
                        sx={{ ml: 'auto', color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                        aria-label={`Delete list ${l.name}`}
                      >
                        <IoTrashOutline size={16} />
                      </IconButton>
                    </Stack>
                    {(l.items || []).length > 0 && (
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#0A0A0A80' }}>
                        {(l.items || [])
                          .map((it: any) => it.school || it.university || it.name || '')
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    )}
                  </Box>
                ))}
                {!lists.length && (
                  <Typography sx={{ color: '#0A0A0A60' }}>No lists yet.</Typography>
                )}
              </Stack>
            )}
          </Box>
        </AngularCard>
      </Stack>
    </Box>
  );
}
