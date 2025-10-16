'use client';
import { User } from '@/types/user';
import { createContext, useContext, useState } from 'react';

const UserContext = createContext<{ user: User } | null>(null);

export function UserProvider({ initialUser, children }: { initialUser: User; children: React.ReactNode }) {
  const [user] = useState<User>(initialUser);
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
