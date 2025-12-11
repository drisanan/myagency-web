'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { generateSharePreview } from '@/features/social/service';

export function SocialComposer() {
  const [caption, setCaption] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onPreview = async () => {
    setError(null);
    setPreviewUrl(null);
    try {
      setLoading(true);
      const res = await generateSharePreview({ caption });
      setPreviewUrl(res.url);
    } catch (e) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 480 }}>
      <TextField label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="outlined" onClick={onPreview} disabled={loading || !caption}>
        Preview
      </Button>
      {previewUrl && (
        <img src={previewUrl} alt="Share preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
      )}
    </Stack>
  );
}


