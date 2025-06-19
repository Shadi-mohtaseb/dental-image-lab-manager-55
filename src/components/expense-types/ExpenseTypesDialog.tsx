
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useExpenseTypesData } from "./useExpenseTypesData";
import { ExpenseTypesList } from "./ExpenseTypesList";
import { AddExpenseTypeForm } from "./AddExpenseTypeForm";

export function ExpenseTypesDialog() {
  const [open, setOpen] = useState(false);
  const { expenseTypes, isLoading } = useExpenseTypesData();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          إدارة أنواع المصروفات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إدارة أنواع المصروفات</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AddExpenseTypeForm />
          <ExpenseTypesList expenseTypes={expenseTypes} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
