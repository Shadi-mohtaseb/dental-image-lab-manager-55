
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Users,
  Receipt,
  FileText,
  Search,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    title: "لوحة التحكم",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "حسابات الشراكة",
    url: "/partnership-accounts",
    icon: Users,
  },
  {
    title: "حسابات الأطباء",
    url: "/doctors-accounts",
    icon: FileText,
  },
  {
    title: "إدارة المصاريف",
    url: "/expenses",
    icon: Receipt,
  },
  {
    title: "قائمة الحالات",
    url: "/cases",
    icon: Search,
  },
  {
    title: "الإعدادات",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-sidebar-border relative overflow-hidden" side="right">
      {/* خلفية الصورة مع تعتيم خفيف، وتغطية كاملة */}
      <div
        className="absolute inset-0 z-0 bg-black/50"
        style={{
          backgroundImage: "url('/lovable-uploads/1edcae13-e89d-4a66-bda4-57367db9f777.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col h-full">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">مختبر الأسنان</h2>
              <p className="text-sm text-sidebar-foreground/70">نظام الإدارة</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80 font-semibold">
              القوائم الرئيسية
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      className="transition-all duration-200 hover:bg-sidebar-accent"
                    >
                      <button
                        onClick={() => navigate(item.url)}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 w-full text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
