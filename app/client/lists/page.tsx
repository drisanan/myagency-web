'use client';
import React from 'react';
import { listLists, saveList } from '@/services/lists';
import { listUniversities } from '@/services/recruiter';
import { useSession } from '@/features/auth/session';

type Uni = { name: string };

export default function ClientListsPage() {
  const { session } = useSession();
  const [lists, setLists] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [sport, setSport] = React.useState('Football');
  const [division, setDivision] = React.useState('D1');
  const [state, setState] = React.useState('California');
  const [universities, setUniversities] = React.useState<Uni[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [loadingUnis, setLoadingUnis] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

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

  const loadUniversities = async () => {
    try {
      setError(null);
      setLoadingUnis(true);
      const data = await listUniversities({ sport, division, state });
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
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={{ padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <h3>Create Interest List</h3>
        <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
          <label>
            List Name
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            Sport
            <input value={sport} onChange={(e) => setSport(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            Division
            <input value={division} onChange={(e) => setDivision(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>
            State
            <input value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%' }} />
          </label>
          <button onClick={loadUniversities} disabled={loadingUnis}>
            {loadingUnis ? 'Loading…' : 'Load Universities'}
          </button>
        </div>
        {universities.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong>Select universities</strong>
            <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
              {universities.map((u) => (
                <label key={u.name} style={{ display: 'block' }}>
                  <input type="checkbox" checked={!!selected[u.name]} onChange={() => toggleUni(u.name)} /> {u.name}
                </label>
              ))}
            </div>
            <button onClick={doSave} disabled={saving} style={{ marginTop: 8 }}>
              {saving ? 'Saving…' : 'Save List'}
            </button>
          </div>
        )}
        {error ? <div style={{ color: 'red', marginTop: 8 }}>{error}</div> : null}
      </section>
      <section style={{ padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <h3>Your Interest Lists</h3>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul>
            {lists.map((l) => (
              <li key={l.id}>
                <strong>{l.name}</strong> ({(l.items || []).length} universities)
              </li>
            ))}
            {!lists.length ? <li>No lists yet.</li> : null}
          </ul>
        )}
      </section>
    </div>
  );
}

