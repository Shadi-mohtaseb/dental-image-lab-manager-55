
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Trash2, Eye, Image } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AddCheckDialog from "@/components/AddCheckDialog";
import EditCheckDialog from "@/components/EditCheckDialog";
import ViewCheckDialog from "@/components/ViewCheckDialog";

const Checks = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);

  // جلب الشيكات
  const { data: checks = [], isLoading: loadingChecks, refetch } = useQuery({
    queryKey: ["checks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checks")
        .select(`
          *,
          doctors (
            name
          )
        `)
        .order("check_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // جلب الأطباء
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleDeleteCheck = async (checkId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الشيك؟")) {
      const { error } = await supabase
        .from("checks")
        .delete()
        .eq("id", checkId);

      if (!error) {
        toast({
          title: "تم حذف الشيك",
          description: "تم حذف الشيك بنجاح",
        });
        refetch();
      } else {
        toast({
          title: "خطأ في حذف الشيك",
          description: "حدث خطأ يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCheck = (check: any) => {
    setSelectedCheck(check);
    setEditDialogOpen(true);
  };

  const handleViewCheck = (check: any) => {
    setSelectedCheck(check);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      "مستلم": "bg-green-100 text-green-700",
      "في الانتظار": "bg-yellow-100 text-yellow-700",
      "مصروف": "bg-blue-100 text-blue-700",
      "مرتد": "bg-red-100 text-red-700",
    };
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-700"}>
        {status}
      </Badge>
    );
  };

  if (loadingChecks) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل الشيكات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">إدارة الشيكات</h1>
            <p className="text-gray-600">متابعة وإدارة شيكات الأطباء</p>
          </div>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة شيك جديد
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي الشيكات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{checks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">الشيكات المستلمة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {checks.filter(c => c.status === 'مستلم').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">في الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {checks.filter(c => c.status === 'في الانتظار').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي المبلغ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {checks.reduce((sum, c) => sum + Number(c.amount || 0), 0).toFixed(2)} ₪
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle>جدول الشيكات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاريخ الشيك</TableHead>
                  <TableHead>تاريخ الاستلام</TableHead>
                  <TableHead>الطبيب</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>رقم الشيك</TableHead>
                  <TableHead>البنك</TableHead>
                  <TableHead>المتصرف إليه</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الصور</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>
                      {new Date(check.check_date).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      {check.receive_date 
                        ? new Date(check.receive_date).toLocaleDateString('ar-EG')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {check.doctors?.name || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(check.amount).toFixed(2)} ₪
                    </TableCell>
                    <TableCell>{check.check_number || '-'}</TableCell>
                    <TableCell>{check.bank_name || '-'}</TableCell>
                    <TableCell>{check.recipient_name || '-'}</TableCell>
                    <TableCell>
                      {getStatusBadge(check.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {check.front_image_url && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            أمامي
                          </Badge>
                        )}
                        {check.back_image_url && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            خلفي
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCheck(check)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCheck(check)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCheck(check.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {checks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد شيكات مسجلة حتى الآن
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddCheckDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        doctors={doctors}
        onSuccess={refetch}
      />
      
      <EditCheckDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        check={selectedCheck}
        doctors={doctors}
        onSuccess={() => {
          refetch();
          setEditDialogOpen(false);
          setSelectedCheck(null);
        }}
      />
      
      <ViewCheckDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        check={selectedCheck}
      />
    </div>
  );
};

export default Checks;
