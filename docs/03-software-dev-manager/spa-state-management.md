# SPA State Management & React Query Implementation Guide

> **Status:** Planning  
> **Priority:** High  
> **Impact:** User Experience - Eliminates perceived page reloads, instant UI feedback

---

## Executive Summary

This guide outlines the implementation strategy for converting the application to use React Query mutations with optimistic updates. The goal is to create a true Single Page Application (SPA) experience where UI updates occur instantly without waiting for server responses.

---

## Current State Analysis

### Problems Identified

| Issue | Description | User Impact |
|-------|-------------|-------------|
| **No `useMutation` hooks** | All mutations are raw `async/await` calls | No loading states, no automatic cache sync |
| **Manual refetch chains** | Components call `refetch()` or `refreshSession()` after operations | Delayed UI updates |
| **No optimistic updates** | User waits for server response before seeing changes | App feels sluggish |
| **Session is custom context** | Not integrated with React Query cache | Requires manual refresh after settings changes |

### Current Patterns (Anti-Patterns)

**Example 1: ClientsList.tsx - Delete Operation**
```typescript
// Current: Manual refetch after delete
onClick={async () => { 
  await deleteClient(p.row.id); 
  refetch();  // User sees loading, waits for server
}}
```

**Example 2: ProfileForm.tsx - Settings Update**
```typescript
// Current: Manual session refresh
await updateAgencySettings(session.agencyEmail, { ...settings });
setSportSuccess('Sport preference saved!');
await refreshSession();  // Another round trip
```

**Example 3: Session Context - Custom Implementation**
```typescript
// Current: Separate from React Query cache
const refreshSession = async () => {
  setLoading(true);
  const apiSession = await fetchSession();
  setSession(apiSession);
  setLoading(false);
};
```

---

## Target Architecture

### React Query Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                        QueryClient                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     Query Cache                              ││
│  │  ['session'] ─────────────────────────────────────────────── ││
│  │  ['clients', agencyEmail] ────────────────────────────────── ││
│  │  ['agency-settings', agencyId] ──────────────────────────── ││
│  │  ['tasks', agencyEmail] ─────────────────────────────────── ││
│  │  ['gmail-status', clientId] ─────────────────────────────── ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   Mutation Cache                             ││
│  │  useMutation → onMutate (optimistic) → onSettled (sync)     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Create Mutation Hooks Library

**File:** `hooks/useMutations.ts`

Create centralized mutation hooks for all CRUD operations:

#### 1.1 Client Mutations

```typescript
// useDeleteClient - with optimistic update
export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),
    
    // Optimistic update - runs immediately before server call
    onMutate: async (clientId) => {
      // Cancel in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      
      // Snapshot current state for rollback
      const previousClients = queryClient.getQueryData(['clients']);
      
      // Optimistically remove from cache
      queryClient.setQueryData(['clients'], (old: any[]) => 
        old?.filter(c => c.id !== clientId) ?? []
      );
      
      // Return context for rollback
      return { previousClients };
    },
    
    // Rollback on error
    onError: (_err, _clientId, context) => {
      queryClient.setQueryData(['clients'], context?.previousClients);
    },
    
    // Always refetch to ensure server consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// useCreateClient - with cache update
export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateClientInput) => upsertClient(data),
    
    onSuccess: (newClient) => {
      // Add to cache immediately
      queryClient.setQueryData(['clients'], (old: any[]) => 
        [newClient, ...(old ?? [])]
      );
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// useUpdateClient - optimistic update
export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateClientInput) => upsertClient(data),
    
    onMutate: async (updatedClient) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData(['clients']);
      
      queryClient.setQueryData(['clients'], (old: any[]) =>
        old?.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } : c) ?? []
      );
      
      return { previousClients };
    },
    
    onError: (_err, _data, context) => {
      queryClient.setQueryData(['clients'], context?.previousClients);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
```

#### 1.2 Agency Settings Mutations

```typescript
export function useUpdateAgencySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, settings }: { email: string; settings: AgencySettings }) =>
      updateAgencySettings(email, settings),
    
    // Optimistically update session with new settings
    onMutate: async ({ settings }) => {
      await queryClient.cancelQueries({ queryKey: ['session'] });
      const previousSession = queryClient.getQueryData(['session']);
      
      queryClient.setQueryData(['session'], (old: any) => ({
        ...old,
        agencySettings: { ...old?.agencySettings, ...settings },
      }));
      
      return { previousSession };
    },
    
    onError: (_err, _data, context) => {
      queryClient.setQueryData(['session'], context?.previousSession);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}
```

#### 1.3 Task Mutations

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: CreateTaskInput) => createTask(task),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: UpdateTaskInput) => updateTask(task),
    
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: any[]) =>
        old?.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t) ?? []
      );
      
      return { previous };
    },
    
    onError: (_err, _data, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: any[]) =>
        old?.filter(t => t.id !== taskId) ?? []
      );
      
      return { previous };
    },
    
    onError: (_err, _taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previous);
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

---

### Phase 2: Convert Session to React Query

**File:** `features/auth/session.tsx`

#### Before (Current Implementation)
```typescript
// Custom context with manual state management
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);

const refreshSession = async () => {
  setLoading(true);
  const apiSession = await fetchSession();
  setSession(apiSession);
  setLoading(false);
};
```

#### After (React Query Integration)
```typescript
'use client';
import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@/features/auth/service';
import { fetchSession } from '@/features/auth/service';

type SessionContextType = {
  session: Session | null;
  loading: boolean;
  refreshSession: () => void;
  setSession: (s: Session | null) => void;
};

const SessionCtx = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: session, isLoading: loading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 30 * 60 * 1000,   // Keep in cache for 30 minutes
    retry: 1,
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  });

  const refreshSession = () => {
    queryClient.invalidateQueries({ queryKey: ['session'] });
  };

  const setSession = (s: Session | null) => {
    queryClient.setQueryData(['session'], s);
  };

  return (
    <SessionCtx.Provider value={{ 
      session: session ?? null, 
      loading, 
      refreshSession, 
      setSession 
    }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
```

---

### Phase 3: Update Components

#### 3.1 ClientsList.tsx

**Before:**
```typescript
<Button 
  size="small" 
  color="error" 
  onClick={async () => { 
    await deleteClient(p.row.id); 
    refetch(); 
  }}
>
  Delete
</Button>
```

**After:**
```typescript
import { useDeleteClient } from '@/hooks/useMutations';

export function ClientsList() {
  const { mutate: removeClient, isPending: isDeleting } = useDeleteClient();
  
  // ...
  
  <Button 
    size="small" 
    color="error" 
    disabled={isDeleting}
    onClick={() => removeClient(p.row.id)}
  >
    {isDeleting ? 'Deleting...' : 'Delete'}
  </Button>
}
```

#### 3.2 ProfileForm.tsx

**Before:**
```typescript
const handleSave = async () => {
  setSportLoading(true);
  try {
    await updateAgencySettings(session.agencyEmail, { ...settings });
    setSportSuccess('Sport preference saved!');
    await refreshSession();
  } catch (e) {
    setError(e?.message);
  } finally {
    setSportLoading(false);
  }
};
```

**After:**
```typescript
import { useUpdateAgencySettings } from '@/hooks/useMutations';

export function ProfileForm() {
  const { mutate: saveSettings, isPending } = useUpdateAgencySettings();
  
  const handleSave = () => {
    saveSettings(
      { email: session.agencyEmail, settings: { ...session.agencySettings, preferredSport } },
      {
        onSuccess: () => setSportSuccess('Sport preference saved!'),
        onError: (e) => setError(e?.message || 'Failed to save'),
      }
    );
  };
  
  // ...
  
  <Button
    variant="outlined"
    onClick={handleSave}
    disabled={isPending}
    startIcon={isPending ? <CircularProgress size={18} /> : null}
  >
    {isPending ? 'Saving...' : 'Save Preference'}
  </Button>
}
```

#### 3.3 TasksPanel.tsx

Apply similar patterns for task CRUD operations.

---

### Phase 4: Query Key Strategy

Establish consistent query key patterns for cache management:

```typescript
// Query Keys Convention
export const queryKeys = {
  // Session
  session: ['session'] as const,
  
  // Clients
  clients: (agencyEmail: string) => ['clients', agencyEmail] as const,
  client: (clientId: string) => ['client', clientId] as const,
  
  // Agency
  agencySettings: (agencyId: string) => ['agency-settings', agencyId] as const,
  
  // Tasks
  tasks: (agencyEmail: string) => ['tasks', agencyEmail] as const,
  task: (taskId: string) => ['task', taskId] as const,
  
  // Lists
  lists: (agencyEmail: string) => ['lists', agencyEmail] as const,
  list: (listId: string) => ['list', listId] as const,
  
  // Gmail Status
  gmailStatus: (clientId: string) => ['gmail-status', clientId] as const,
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `hooks/useMutations.ts` | **CREATE** - Centralized mutation hooks |
| `hooks/queryKeys.ts` | **CREATE** - Query key factory |
| `features/auth/session.tsx` | Convert to React Query |
| `features/clients/ClientsList.tsx` | Use `useDeleteClient` mutation |
| `features/clients/ClientWizard.tsx` | Use `useCreateClient`, `useUpdateClient` |
| `features/settings/ProfileForm.tsx` | Use `useUpdateAgencySettings` |
| `features/tasks/TasksPanel.tsx` | Use task mutation hooks |
| `app/(app)/lists/page.tsx` | Use list mutation hooks |

---

## Benefits After Implementation

| Aspect | Before | After |
|--------|--------|-------|
| **Delete Client** | 500-800ms perceived wait | Instant removal, background sync |
| **Save Settings** | Loading spinner, manual refresh | Instant update, auto-cache sync |
| **Create Client** | Form disabled until complete | Optimistic add to list |
| **Error Handling** | Manual try/catch everywhere | Centralized with auto-rollback |
| **Loading States** | Manual `useState` for each | Built-in `isPending` from hook |
| **Cache Consistency** | Manual `refetch()` calls | Automatic invalidation |

---

## Testing Strategy

### Unit Tests for Mutation Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteClient } from '@/hooks/useMutations';

describe('useDeleteClient', () => {
  it('optimistically removes client from cache', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['clients'], [
      { id: '1', name: 'Client 1' },
      { id: '2', name: 'Client 2' },
    ]);

    const { result } = renderHook(() => useDeleteClient(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    result.current.mutate('1');

    // Immediately check cache (before server response)
    const cached = queryClient.getQueryData(['clients']);
    expect(cached).toHaveLength(1);
    expect(cached[0].id).toBe('2');
  });

  it('rolls back on error', async () => {
    // Mock server error and verify rollback
  });
});
```

---

## Migration Checklist

- [ ] Create `hooks/useMutations.ts` with all mutation hooks
- [ ] Create `hooks/queryKeys.ts` for consistent key management
- [ ] Convert `SessionProvider` to use React Query
- [ ] Update `ClientsList.tsx` delete button
- [ ] Update `ClientWizard.tsx` save/update logic
- [ ] Update `ProfileForm.tsx` settings save
- [ ] Update `TasksPanel.tsx` task operations
- [ ] Update `ListsPage.tsx` list operations
- [ ] Add unit tests for mutation hooks
- [ ] Verify no regressions with existing Selenium tests
- [ ] Update Sentry tags for mutation errors

---

## References

- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [TanStack Query - Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- [TanStack Query - Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)

---

*Last Updated: January 2026*

