import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'analyst' | 'actuary' | 'executive';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('analyst');

  const canAccess = (requiredRoles: UserRole[]) => {
    return requiredRoles.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, canAccess }}>
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
