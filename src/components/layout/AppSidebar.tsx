import {
  LayoutDashboard,
  Upload,
  Brain,
  PieChart,
  Users,
  AlertTriangle,
  Calculator,
  Scale,
  FileOutput,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useRole } from '@/contexts/RoleContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Overview',
    url: '/',
    icon: LayoutDashboard,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Upload & Validate',
    url: '/upload',
    icon: Upload,
    roles: ['analyst', 'actuary'] as const
  },
  {
    title: 'Model Scoring',
    url: '/scoring',
    icon: Brain,
    roles: ['analyst', 'actuary'] as const
  },
  {
    title: 'Segmentation Explorer',
    url: '/segmentation',
    icon: PieChart,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Low-Risk Profile',
    url: '/low-risk',
    icon: Users,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Risk & Volatility Lab',
    url: '/risk-lab',
    icon: AlertTriangle,
    roles: ['analyst', 'actuary'] as const
  },
  {
    title: 'Pricing Simulator',
    url: '/pricing',
    icon: Calculator,
    roles: ['actuary'] as const
  },
  {
    title: 'Fairness & Compliance',
    url: '/fairness',
    icon: Scale,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Reports & Exports',
    url: '/reports',
    icon: FileOutput,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Documentation',
    url: '/docs',
    icon: BookOpen,
    roles: ['analyst', 'actuary', 'executive'] as const
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['analyst', 'actuary'] as const
  }
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { role, canAccess } = useRole();
  const isCollapsed = state === 'collapsed';

  const visibleItems = navigationItems.filter(item => 
    canAccess([...item.roles])
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">Risk Stability</span>
              <span className="text-xs text-muted-foreground">Analytics Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && 'sr-only')}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
