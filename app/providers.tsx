'use client';
import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { SessionProvider } from '@/features/auth/session';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        Sentry.captureException(error, {
          tags: { source: 'react-query' },
          extra: { queryKey: query.queryKey },
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        Sentry.captureException(error, {
          tags: { source: 'react-query-mutation' },
          extra: { mutationKey: mutation.options.mutationKey },
        });
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 60_000,           // 1 min default (standard tier)
        gcTime: 5 * 60_000,          // 5 min garbage collection
        refetchOnWindowFocus: false,  // Prevent noisy refetches
      },
    },
  }));
  
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}


