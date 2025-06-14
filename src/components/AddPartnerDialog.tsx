
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAddPartner } from "@/hooks/usePartners";

export default function AddPartnerDialog() {
  const [open, setOpen] = useState(false);
  const addPartner = useAddPartner();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await addPartner.mutateAsync({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      address: formData.get("address") as string || null,
      partnership_percentage: Number(formData.get("partnership_percentage")) || 33.33,
      personal_balance: Number(formData.get("personal_balance")) || 0,
    });
    
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 ml-2" />
          إضافة شريك جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة شريك جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم الشريك *</Label>
            <Input name="name" placeholder="أدخل اسم الشريك" required />
          </div>
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input name="phone" placeholder="أدخل رقم الهاتف" />
          </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input name="email" type="email" placeholder="أدخل البريد الإلكتروني" />
          </div>
          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input name="address" placeholder="أدخل العنوان" />
          </div>
          <div>
            <Label htmlFor="partnership_percentage">نسبة الشراكة (%)</Label>
            <Input 
              name="partnership_percentage" 
              type="number" 
              step="0.01" 
              min="0" 
              max="100" 
              defaultValue="33.33"
              placeholder="33.33" 
            />
          </div>
          <div>
            <Label htmlFor="personal_balance">الرصيد الشخصي الأولي</Label>
            <Input 
              name="personal_balance" 
              type="number" 
              step="0.01" 
              min="0" 
              defaultValue="0"
              placeholder="0" 
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={addPartner.isPending}>
              {addPartner.isPending ? "جاري الإضافة..." : "إضافة الشريك"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
