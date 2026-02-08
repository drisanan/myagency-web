'use client';
import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Chip,
  Paper,
} from '@mui/material';
import { IoSearchOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';
import { useQuery } from '@tanstack/react-query';
import { listClientsByAgencyEmail } from '@/services/clients';
import { listTasks } from '@/services/tasks';
import { listLists } from '@/services/lists';
import { colors } from '@/theme/colors';

type SearchResult = {
  id: string;
  label: string;
  group: 'Athletes' | 'Lists' | 'Tasks';
  href: string;
  subtitle?: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const email = session?.agencyEmail || session?.email || '';

  // Lightweight index queries — cached at 5min (slow tier)
  const clientsQ = useQuery({
    queryKey: ['global-search-clients', email],
    enabled: Boolean(email) && session?.role !== 'client',
    queryFn: () => listClientsByAgencyEmail(email),
    staleTime: 5 * 60_000,
  });

  const tasksQ = useQuery({
    queryKey: ['global-search-tasks'],
    enabled: Boolean(email) && session?.role !== 'client',
    queryFn: () => listTasks({}),
    staleTime: 5 * 60_000,
  });

  const listsQ = useQuery({
    queryKey: ['global-search-lists', email],
    enabled: Boolean(email) && session?.role !== 'client',
    queryFn: () => listLists(email),
    staleTime: 5 * 60_000,
  });

  // Build search index
  const options = React.useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    const clients = Array.isArray(clientsQ.data)
      ? clientsQ.data
      : (clientsQ.data as any)?.clients ?? [];
    for (const c of clients) {
      if (!c || c.deletedAt) continue;
      results.push({
        id: c.id,
        label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || c.id,
        group: 'Athletes',
        href: `/clients/${c.id}`,
        subtitle: c.sport || c.email,
      });
    }

    for (const l of listsQ.data ?? []) {
      if (!l) continue;
      results.push({
        id: l.id,
        label: l.name || l.id,
        group: 'Lists',
        href: '/lists',
        subtitle: `${(l as any).items?.length ?? 0} items`,
      });
    }

    for (const t of tasksQ.data ?? []) {
      if (!t || t.deletedAt) continue;
      results.push({
        id: t.id,
        label: t.title || t.id,
        group: 'Tasks',
        href: '/tasks',
        subtitle: t.status,
      });
    }

    return results;
  }, [clientsQ.data, listsQ.data, tasksQ.data]);

  // Keyboard shortcut: Cmd/Ctrl+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render for client role
  if (session?.role === 'client') return null;

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      options={options}
      groupBy={(option) => (typeof option === 'string' ? '' : option.group)}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
      filterOptions={(opts, { inputValue: iv }) => {
        if (!iv) return opts.slice(0, 20);
        const lower = iv.toLowerCase();
        return opts
          .filter(
            (o) =>
              typeof o !== 'string' &&
              (o.label.toLowerCase().includes(lower) ||
                o.subtitle?.toLowerCase().includes(lower)),
          )
          .slice(0, 20);
      }}
      onChange={(_, value) => {
        if (value && typeof value !== 'string') {
          router.push(value.href);
          setInputValue('');
          setOpen(false);
        }
      }}
      PaperComponent={(props) => (
        <Paper
          {...props}
          sx={{
            bgcolor: '#1a1a2e',
            color: '#fff',
            border: `1px solid ${colors.lime}30`,
            '& .MuiAutocomplete-groupLabel': {
              bgcolor: '#12121f',
              color: colors.lime,
              fontWeight: 700,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        if (typeof option === 'string') return null;
        return (
          <Box
            component="li"
            {...props}
            key={option.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': { bgcolor: 'rgba(204,255,0,0.08) !important' },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.label}
              </Typography>
              {option.subtitle && (
                <Typography variant="caption" sx={{ color: '#ffffff60' }}>
                  {option.subtitle}
                </Typography>
              )}
            </Box>
            <Chip
              label={option.group}
              size="small"
              sx={{
                ml: 1,
                height: 20,
                fontSize: '0.65rem',
                bgcolor: 'rgba(204,255,0,0.12)',
                color: colors.lime,
              }}
            />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search athletes, lists, tasks…"
          size="small"
          sx={{
            width: { xs: 180, sm: 260, md: 320 },
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              fontSize: '0.85rem',
              bgcolor: 'rgba(255,255,255,0.06)',
              borderRadius: 0,
              clipPath:
                'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
              '&.Mui-focused fieldset': { borderColor: `${colors.lime}60` },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.4)',
              opacity: 1,
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                <IoSearchOutline size={16} />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: '0.65rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    px: 0.5,
                    borderRadius: '3px',
                    mr: 0.5,
                    display: { xs: 'none', md: 'inline' },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {'\u2318'}K
                </Typography>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ flexShrink: 0 }}
    />
  );
}
