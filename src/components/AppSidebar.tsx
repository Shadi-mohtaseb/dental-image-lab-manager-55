
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

// صورة الخلفية المرفوعة:
const sidebarBg = "/lovable-uploads/d177bd6f-d2eb-4db8-996a-e2a94b42a9da.png";

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
    <Sidebar
      className="border-r border-sidebar-border relative overflow-hidden"
      side="right"
      style={{
        backgroundImage: `url('${sidebarBg}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        height: "100svh",
        width: "100%",
      }}
    >
      {/* تغطية بلون أزرق شفاف حسب الهوية */}
      <div className="absolute inset-0 bg-blue-900/80 z-0" />
      {/* محتوى الشريط الجانبي فوق الخلفية بدون أي لون أبيض */}
      <div className="relative z-10 h-full flex flex-col bg-transparent">
        <SidebarHeader className="p-6 bg-transparent">
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
        
        <SidebarContent className="bg-transparent">
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

        <SidebarFooter className="p-4 mt-auto bg-transparent">
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
