import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  Settings,
  Coffee,
  LogOut
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logoImage from '@/assets/login-cafe-logo.png';

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Categories", url: "/admin/categories", icon: Tags },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (active: boolean) =>
    active 
      ? "bg-coffee-dark text-white font-medium" 
      : "text-coffee-medium hover:bg-coffee-light/20 hover:text-coffee-dark";

  return (
    <Sidebar
      className={`border-r border-coffee-light/20 ${collapsed ? "w-14" : "w-64"}`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-coffee-light/20">
        <div className="flex items-center space-x-3 p-4">
          <img 
            src={logoImage} 
            alt="Login Cafe" 
            className="h-8 w-8 rounded-full shadow-warm"
          />
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-coffee-dark">Admin Panel</h2>
              <p className="text-xs text-coffee-medium">Login Cafe</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-coffee-medium">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className={getNavCls(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-coffee-light/20">
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-start text-coffee-medium hover:text-coffee-dark hover:bg-coffee-light/20"
          >
            <NavLink to="/">
              <Coffee className="h-4 w-4" />
              {!collapsed && <span>View Cafe</span>}
            </NavLink>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-coffee-medium hover:text-coffee-dark hover:bg-coffee-light/20"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}