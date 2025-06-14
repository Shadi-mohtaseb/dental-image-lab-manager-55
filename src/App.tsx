
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PartnershipAccounts from "./pages/PartnershipAccounts";
import DoctorsAccounts from "./pages/DoctorsAccounts";
import Expenses from "./pages/Expenses";
import DoctorsLog from "./pages/DoctorsLog";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import NotFound from "./pages/NotFound";
import React from "react";

// مكون للمحتوى الرئيسي يأخذ بعين الاعتبار عرض السايدبار
function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar(); // متغير حالة السايدبار (مفتوح أو مغلق)
  return (
    <main
      className={`flex-1 min-h-screen bg-gray-50 relative transition-all duration-300 ${
        open ? "mr-[260px]" : "mr-0"
      }`}
      // المسافة من اليمين تساوي عرض السايدبار بالبيكسل إذا كانت مفتوحة
    >
      <div className="p-6">{children}</div>
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
          {/* زر إظهار/إخفاء السايدبار أعلى يمين الشاشة ويبقى دائمًا في الأعلى */}
          <div className="fixed top-4 right-4 z-[100]">
            <SidebarTrigger />
          </div>
          <div className="min-h-screen flex w-full relative">
            {/* السايدبار ثابت في جهة اليمين ويكون فوق كل شيء (منفصل عن الـ flow) */}
            <div className="fixed top-0 right-0 h-screen z-50">
              <AppSidebar />
            </div>
            {/* المحتوى الرئيسي يتحرك يساراً عند فتح السايدبار */}
            <MainContent>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/partnership-accounts" element={<PartnershipAccounts />} />
                <Route path="/doctors-accounts" element={<DoctorsAccounts />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/doctors-log" element={<DoctorsLog />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/case/:id" element={<CaseDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainContent>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
