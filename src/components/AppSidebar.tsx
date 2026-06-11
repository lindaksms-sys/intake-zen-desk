import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, LayoutGrid, Users, ExternalLink, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentMembership } from "@/lib/clinic";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useCurrentMembership();
  const isAdmin = me.data?.role === "clinic_admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  };

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Overview">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    {!collapsed && <span>Overview</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/staff")} tooltip="Staff">
                    <Link to="/dashboard/staff" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {!collapsed && <span>Staff</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Public Intake Form">
                  <a href="/intake" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {!collapsed && <span>Public Intake Form</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
