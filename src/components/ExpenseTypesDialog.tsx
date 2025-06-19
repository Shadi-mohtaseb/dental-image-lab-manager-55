
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function ExpenseTypesDialog() {
  const [open, setOpen] = useState(false);
  const [newType, setNewType] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const queryClient = useQueryClient();

  // جلب أنواع المصروفات
  const { data: expenseTypes = [], isLoading } = useQuery({
    queryKey: ["expense_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // إضافة نوع مصروف جديد
  const addType = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("expense_types")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      setNewType("");
      toast({ title: "تم إضافة نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء إضافة نوع المصروف", variant: "destructive" });
    },
  });

  // تعديل نوع مصروف
  const updateType = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("expense_types")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      setEditingId(null);
      setEditingName("");
      toast({ title: "تم تحديث نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء تحديث نوع المصروف", variant: "destructive" });
    },
  });

  // حذف نوع مصروف
  const deleteType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expense_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      toast({ title: "تم حذف نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء حذف نوع المصروف", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (newType.trim()) {
      addType.mutate(newType.trim());
    }
  };

  const handleUpdate = () => {
    if (editingId && editingName.trim()) {
      updateType.mutate({ id: editingId, name: editingName.trim() });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      deleteType.mutate(id);
    }
  };

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
          {/* إضافة نوع جديد */}
          <div className="flex gap-2">
            <Input
              placeholder="اسم نوع المصروف الجديد"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={addType.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* قائمة الأنواع الحالية */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
            ) : expenseTypes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">لا توجد أنواع مصروفات مسجلة</div>
            ) : (
              expenseTypes.map((type: any) => (
                <div key={type.id} className="flex items-center gap-2 p-2 border rounded">
                  {editingId === type.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdate} disabled={updateType.isPending}>
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{type.name}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(type.id);
                          setEditingName(type.name);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
