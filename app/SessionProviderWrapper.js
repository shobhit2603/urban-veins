// This file must be a client component
'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({ children }) {
  // The SessionProvider shares the session data across all
  // components in your app that use 'useSession()'.
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}