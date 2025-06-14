
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import PartnershipAccounts from "./pages/PartnershipAccounts";
import DoctorsAccounts from "./pages/DoctorsAccounts";
import Expenses from "./pages/Expenses";
import DoctorsLog from "./pages/DoctorsLog";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          {/* زر إظهار/إخفاء السايدبار أعلى يمين الشاشة ويبقى دائمًا في الأعلى */}
          <div className="fixed top-4 right-4 z-[100]">
            <SidebarTrigger />
          </div>
          <div className="min-h-screen flex flex-row-reverse w-full">
            {/* السايدبار بعرض ثابت دائم الظهور */}
            <div className="w-[260px] min-w-[220px] bg-sidebar-primary border-l border-sidebar-border flex-shrink-0">
              <AppSidebar />
            </div>
            {/* المحتوى الرئيسي يأخذ المساحة المتبقية */}
            <main className="flex-1 min-h-screen bg-gray-50 relative">
              <div className="p-6">
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
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

