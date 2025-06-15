
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PartnershipAccounts from "./pages/PartnershipAccounts";
import DoctorsAccounts from "./pages/DoctorsAccounts";
import Expenses from "./pages/Expenses";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

// Lazy load DoctorDetails
const DoctorDetails = lazy(() => import("./pages/DoctorDetails"));

// مكون للمحتوى الرئيسي بدون الهامش — لأن الهيكل الجديد سيتعامل مع ترتيب السايدبار والمين تلقائياً
function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-h-screen bg-gray-50 relative transition-all duration-300">
      {/* زر اظهار السايدبار في أعلى content */}
      <div className="flex justify-start items-center mb-4 mt-6 mr-4">
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
          {/* بنية منطقية: الشريط والمحتوى داخل نفس Flex — السايدبار يمين، المحتوى يسار */}
          <div className="flex w-full min-h-screen">
            {/* السايدبار (على اليمين في الـrtl) */}
            <AppSidebar />
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
                {/* إعادة توجيه صفحة دفعات الأطباء إلى حسابات الأطباء */}
                <Route path="/doctors-payments" element={<Navigate to="/doctors-accounts" replace />} />
                {/* إصلاح اللودينج هنا باستخدام React.lazy و Suspense */}
                <Route
                  path="/doctor/:id"
                  element={
                    <Suspense fallback={<div className="p-8 text-center text-lg">جاري التحميل...</div>}>
                      <DoctorDetails />
                    </Suspense>
                  }
                />
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
