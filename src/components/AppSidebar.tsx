import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  ListChecks,
  Users,
  CalendarDays,
  PhoneCall,
  ExternalLink,
  GitBranch,
  Megaphone,
  BarChart3,
  Settings,
  Activity,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Item = {
  title: string;
  icon: typeof LayoutGrid;
  to?: string;
  href?: string;
  external?: boolean;
};

const operate: Item[] = [
  { title: "Overview", icon: LayoutGrid, to: "/dashboard" },
  { title: "Work Queue", icon: ListChecks },
  { title: "Patients", icon: Users, to: "/dashboard/staff" },
  { title: "Appointments", icon: CalendarDays },
  { title: "Intake Queue", icon: PhoneCall },
  { title: "Open Public Intake Form", icon: ExternalLink, href: "/intake", external: true },
];

const configure: Item[] = [
  { title: "Pathways", icon: GitBranch },
  { title: "Campaigns", icon: Megaphone },
  { title: "Reporting", icon: BarChart3 },
  { title: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (to?: string) =>
    !!to && (to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background">
            <Activity className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">Clinic Intake Copilot</div>
              <div className="text-[10px] font-medium tracking-wider text-muted-foreground">
                AI-TRIAGED INCOMING CASES
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>


      <SidebarContent>
        <NavSection label="OPERATE" items={operate} isActive={isActive} collapsed={collapsed} />
        <NavSection label="CONFIGURE" items={configure} isActive={isActive} collapsed={collapsed} />
      </SidebarContent>
    </Sidebar>
  );
}

function NavSection({
  label,
  items,
  isActive,
  collapsed,
}: {
  label: string;
  items: Item[];
  isActive: (to?: string) => boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            const content = (
              <>
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </>
            );
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  {item.to ? (
                    <Link to={item.to} className="flex items-center gap-2">
                      {content}
                    </Link>
                  ) : item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                      className="flex items-center gap-2"
                    >
                      {content}
                    </a>
                  ) : (
                    <button type="button" className="flex items-center gap-2">
                      {content}
                    </button>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
