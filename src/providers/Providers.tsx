'use client';

import { ReactNode } from 'react';

import {
   DatabaseProvider,
   UserProvider,
   ForumProvider,
   AdminProvider,
   BlogAdminProvider,
   GameProvider,
   GameAdminProvider
   } from '@/contexts';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DatabaseProvider>
      <UserProvider>
        <ForumProvider>
          <AdminProvider>
            <BlogAdminProvider>
              <GameProvider>
                <GameAdminProvider>
                  {children}
                </GameAdminProvider>
              </GameProvider>
            </BlogAdminProvider>
          </AdminProvider>
        </ForumProvider>
      </UserProvider>
    </DatabaseProvider>
  );
} 