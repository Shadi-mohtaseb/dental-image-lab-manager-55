import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PartnershipAccounts from "./pages/PartnershipAccounts";
import DoctorsAccounts from "./pages/DoctorsAccounts";
import Expenses from "./pages/Expenses";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import React from "react";
import DoctorsPayments from "./pages/DoctorsPayments";

// مكون للمحتوى الرئيسي يأخذ بعين الاعتبار عرض السايدبار
function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <main
      className={`flex-1 min-h-screen bg-gray-50 relative transition-all duration-300 ${
        open ? "mr-[260px]" : "mr-0"
      }`}
    >
      {/* زر اظهار السايدبار في أعلى يسار الصفحة (محتوى الصفحة وليس نافذة التطبيق) */}
      <div className="flex justify-start items-center mb-4">
        <SidebarTrigger />
      </div>
      <div className="p-6 pt-0">{children}</div>
    </main>
  );
}

const App = () => (
  <QueryClientProvider client={new QueryClient()}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          {/* السايدبار ثابت في جهة اليمين ويكون فوق كل شيء (منفصل عن الـ flow) */}
          <div className="fixed top-0 right-0 h-screen z-50">
            <AppSidebar />
          </div>
          {/* المحتوى الرئيسي */}
          <MainContent>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/partnership-accounts" element={<PartnershipAccounts />} />
              {/* حذف صفحة سجل/إحصائيات الأطباء وتحويلها لقائمة الأطباء */}
              <Route path="/doctors-dashboard" element={<Navigate to="/doctors-accounts" replace />} />
              <Route path="/doctors-accounts" element={<DoctorsAccounts />} />
              <Route path="/doctors-log" element={<Navigate to="/doctors-accounts" replace />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/case/:id" element={<CaseDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/doctors-payments" element={<DoctorsPayments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainContent>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
