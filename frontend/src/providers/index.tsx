'use client';

import * as React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { LoadingProvider } from './LoadingProvider';
import { ModalProvider } from './ModalProvider';

export function Providers({ children }: { children: any }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <LoadingProvider>
            <ModalProvider>
              {children}
              <ToastProvider />
            </ModalProvider>
          </LoadingProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
