import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'researcher' | 'customer';
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
  const [role, setRole] = useState<UserRole>('researcher');
  const [mode, setMode] = useState<AppMode>('production');

  const canAccess = (requiredRoles: UserRole[]) => {
    return requiredRoles.includes(role);
  };

  // Customers only see Production Mode
  const handleSetMode = (newMode: AppMode) => {
    if (role === 'customer' && newMode === 'research') {
      return;
    }
    setMode(newMode);
  };

  // Reset to production mode when switching to customer
  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'customer') {
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
