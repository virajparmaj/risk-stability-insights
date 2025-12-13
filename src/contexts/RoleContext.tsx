import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'analyst' | 'actuary' | 'executive';
export type AppMode = 'production' | 'research';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('analyst');
  const [mode, setMode] = useState<AppMode>('production');

  const canAccess = (requiredRoles: UserRole[]) => {
    return requiredRoles.includes(role);
  };

  // Executives only see Production Mode
  const handleSetMode = (newMode: AppMode) => {
    if (role === 'executive' && newMode === 'research') {
      return; // Executives cannot access research mode
    }
    setMode(newMode);
  };

  // Reset to production mode when switching to executive
  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'executive') {
      setMode('production');
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole: handleSetRole, mode, setMode: handleSetMode, canAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
