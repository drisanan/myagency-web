'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { askCounselor } from '@/features/ai/service';

export function AICounselor() {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onAsk = async () => {
    setError(null);
    setAnswer(null);
    try {
      setLoading(true);
      const res = await askCounselor({ question });
      setAnswer(res.answer);
    } catch (e) {
      setError('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 600 }}>
      <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" onClick={onAsk} disabled={loading || !question}>
        Ask
      </Button>
      {answer && <Alert severity="success">{answer}</Alert>}
    </Stack>
  );
}


