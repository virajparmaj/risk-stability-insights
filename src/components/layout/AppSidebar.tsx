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
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Upload & Validate',
    url: '/upload',
    icon: Upload,
    roles: ['researcher'] as const
  },
  {
    title: 'Model Scoring',
    url: '/scoring',
    icon: Brain,
    roles: ['researcher'] as const
  },
  {
    title: 'Segmentation Explorer',
    url: '/segmentation',
    icon: PieChart,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Low-Risk Profile',
    url: '/low-risk',
    icon: Users,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Stability & Uncertainty Lab',
    url: '/risk-lab',
    icon: AlertTriangle,
    roles: ['researcher'] as const
  },
  {
    title: 'Pricing Simulator',
    url: '/pricing',
    icon: Calculator,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Fairness & Compliance',
    url: '/fairness',
    icon: Scale,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Reports & Exports',
    url: '/reports',
    icon: FileOutput,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Documentation',
    url: '/docs',
    icon: BookOpen,
    roles: ['researcher', 'customer'] as const
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    roles: ['researcher'] as const
  }
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { canAccess } = useRole();
  const isCollapsed = state === 'collapsed';

  const visibleItems = navigationItems.filter(item => 
    canAccess([...item.roles])
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/70 bg-sidebar">
      <SidebarHeader className="px-3 pb-2 pt-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-sidebar-border/60 bg-background/70 px-3 py-2",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight text-sidebar-foreground">
                Risk Stability
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Analytics workspace
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
              isCollapsed && "sr-only"
            )}
          >
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/72 transition-colors hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                      activeClassName="bg-primary/[0.08] text-sidebar-foreground"
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

      <SidebarFooter className="px-2 pb-3 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-full justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground"
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
