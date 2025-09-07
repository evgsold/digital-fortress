'use client';

import { ReactNode } from 'react';

import {
   DatabaseProvider,
   UserProvider,
   ForumProvider,
   AdminProvider,
   BlogAdminProvider
   } from '@/contexts';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DatabaseProvider>
      <UserProvider>
        <ForumProvider>
          <AdminProvider>
            <BlogAdminProvider>
              {children}
            </BlogAdminProvider>
          </AdminProvider>
        </ForumProvider>
      </UserProvider>
    </DatabaseProvider>
  );
} 