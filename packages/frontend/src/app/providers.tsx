'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/queryClient';
import { ReactNode } from 'react';
import { ChatWidget } from '@/components/chat/ChatWidget';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ChatWidget />
    </QueryClientProvider>
  );
}
