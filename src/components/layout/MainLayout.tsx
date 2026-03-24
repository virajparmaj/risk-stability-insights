import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          <footer className="w-full text-center text-xs text-muted-foreground/50 py-3">
            © 2026 Risk Stability Analytics
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
