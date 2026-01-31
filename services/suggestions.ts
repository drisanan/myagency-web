/**
 * Suggestions Service
 * Handles CRUD operations for user improvement suggestions
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export type SuggestionStatus = 'pending' | 'resolved' | 'denied';

export type Suggestion = {
  id: string;
  submittedByEmail: string;
  submittedByName: string;
  agencyId?: string;
  screenPath: string;
  areaSelector: string;
  areaContext: string;
  originalSuggestion: string;
  requirements: string;
  status: SuggestionStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateSuggestionPayload = {
  screenPath: string;
  areaSelector: string;
  areaContext: string;
  originalSuggestion: string;
};

export type UpdateSuggestionPayload = {
  status?: SuggestionStatus;
  resolutionNotes?: string;
};

/**
 * Fetch all suggestions
 */
export async function listSuggestions(): Promise<Suggestion[]> {
  const res = await fetch(`${API_BASE_URL}/suggestions`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch suggestions' }));
    throw new Error(error.error || 'Failed to fetch suggestions');
  }
  
  const data = await res.json();
  return data.suggestions || [];
}

/**
 * Fetch a single suggestion by ID
 */
export async function getSuggestion(id: string): Promise<Suggestion | null> {
  const res = await fetch(`${API_BASE_URL}/suggestions/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    const error = await res.json().catch(() => ({ error: 'Failed to fetch suggestion' }));
    throw new Error(error.error || 'Failed to fetch suggestion');
  }
  
  const data = await res.json();
  return data.suggestion || null;
}

/**
 * Create a new suggestion
 */
export async function createSuggestion(payload: CreateSuggestionPayload): Promise<Suggestion> {
  const res = await fetch(`${API_BASE_URL}/suggestions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create suggestion' }));
    throw new Error(error.error || 'Failed to create suggestion');
  }
  
  const data = await res.json();
  return data.suggestion;
}

/**
 * Update a suggestion (mainly for status changes)
 */
export async function updateSuggestion(id: string, payload: UpdateSuggestionPayload): Promise<Suggestion> {
  const res = await fetch(`${API_BASE_URL}/suggestions/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update suggestion' }));
    throw new Error(error.error || 'Failed to update suggestion');
  }
  
  const data = await res.json();
  return data.suggestion;
}

/**
 * Delete a suggestion
 */
export async function deleteSuggestion(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/suggestions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete suggestion' }));
    throw new Error(error.error || 'Failed to delete suggestion');
  }
}
