import { createNote, deleteNote, listNotes, updateNote } from '@/services/notes';

// jsdom localStorage is available
describe('notes store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('create, list, update, delete respects athlete and agency', () => {
    const agencyEmail = 'agency@test.com';
    const athleteId = 'ath-1';
    const otherAgency = 'other@test.com';

    const n1 = createNote({ athleteId, agencyEmail, body: 'First' });
    createNote({ athleteId, agencyEmail, body: 'Second' });
    createNote({ athleteId, agencyEmail: otherAgency, body: 'Other agency' });

    const notes = listNotes(athleteId, agencyEmail);
    expect(notes).toHaveLength(2);
    expect(notes[0].body).toBe('Second'); // newest first
    expect(notes[1].body).toBe('First');

    const updated = updateNote(n1.id, { body: 'First-updated' }, agencyEmail);
    expect(updated?.body).toBe('First-updated');

    const notesAfterUpdate = listNotes(athleteId, agencyEmail);
    expect(notesAfterUpdate.find((n) => n.id === n1.id)?.body).toBe('First-updated');

    deleteNote(n1.id, agencyEmail);
    const notesAfterDelete = listNotes(athleteId, agencyEmail);
    expect(notesAfterDelete).toHaveLength(1);
    expect(notesAfterDelete[0].body).toBe('Second');
  });
});


