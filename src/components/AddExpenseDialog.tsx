
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";


export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          إضافة مصروف
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مصروف جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المصروف الجديد
          </DialogDescription>
        </DialogHeader>
        <AddExpenseForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
