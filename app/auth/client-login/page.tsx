'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { clientLogin } from '@/services/clientAuth';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [accessCode, setAccessCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      await clientLogin({ email, phone, accessCode });
      router.push('/client/lists');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Client Login</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Access Code
          <input
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </label>
        {error ? <div style={{ color: 'red' }}>{error}</div> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

