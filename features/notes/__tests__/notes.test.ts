import { Note } from '@/services/notes';

describe('notes type', () => {
  test('Note type has expected shape', () => {
    const note: Note = {
      id: 'note-1',
      athleteId: 'ath-1',
      agencyEmail: 'agency@test.com',
      body: 'Test note content',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(note.id).toBe('note-1');
    expect(note.body).toBe('Test note content');
  });
});
