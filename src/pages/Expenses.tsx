
import { useState, useMemo } from "react";
import { Receipt } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpensesSummaryCards } from "@/components/expenses/ExpensesSummaryCards";
import { ExpensesFilterBar } from "@/components/expenses/ExpensesFilterBar";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";

const Expenses = () => {
  const { data: expenses = [], isLoading, error } = useExpenses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // تصفية المصاريف بناءً على البحث والفلاتر
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // البحث في جميع الحقول
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          expense.expense_types?.name?.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query) ||
          expense.total_amount.toString().includes(query) ||
          expense.purchase_date.includes(query);
        
        if (!matchesSearch) return false;
      }

      // تصفية حسب نوع المصروف
      if (selectedType && expense.expense_type_id !== selectedType) {
        return false;
      }

      // تصفية حسب نطاق التاريخ
      if (startDate || endDate) {
        const expenseDate = new Date(expense.purchase_date);
        if (startDate && expenseDate < new Date(startDate)) return false;
        if (endDate && expenseDate > new Date(endDate)) return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedType, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل بيانات المصاريف...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-red-600">
            حدث خطأ أثناء تحميل بيانات المصاريف: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">المصاريف</h1>
            <p className="text-muted-foreground">إدارة وتسجيل المصاريف</p>
          </div>
        </div>
        <AddExpenseDialog />
      </div>

      {/* الملخص المالي */}
      <ExpensesSummaryCards expenses={expenses} />

      {/* شريط البحث والفلاتر */}
      <ExpensesFilterBar
        onSearch={setSearchQuery}
        onFilterByType={setSelectedType}
        onFilterByDateRange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
        searchQuery={searchQuery}
        selectedType={selectedType}
        startDate={startDate}
        endDate={endDate}
      />

      {/* جدول المصاريف */}
      <ExpensesTable expenses={filteredExpenses} />
    </div>
  );
};

export default Expenses;
