
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
import { FileText } from "lucide-react";
import { AddCaseForm } from "./AddCaseForm";

export function AddCaseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileText className="w-4 h-4 mr-2" />
          إضافة حالة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة حالة جديدة</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الحالة الطبية الجديدة
          </DialogDescription>
        </DialogHeader>
        <AddCaseForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
