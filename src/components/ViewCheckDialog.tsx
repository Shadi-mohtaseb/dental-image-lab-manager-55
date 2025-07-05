
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Calendar, User, DollarSign, Hash, Building, UserCheck, FileText, Image as ImageIcon } from "lucide-react";

interface ViewCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  check: any;
}

export default function ViewCheckDialog({ open, onOpenChange, check }: ViewCheckDialogProps) {
  if (!check) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تفاصيل الشيك
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-sm text-gray-600">تاريخ الشيك</Label>
                <p className="font-medium">
                  {check.check_date ? new Date(check.check_date).toLocaleDateString('ar-EG') : '-'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <Label className="text-sm text-gray-600">تاريخ الاستلام</Label>
                <p className="font-medium">
                  {check.receive_date ? new Date(check.receive_date).toLocaleDateString('ar-EG') : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <Label className="text-sm text-gray-600">الطبيب</Label>
                <p className="font-medium">{check.doctors?.name || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <Label className="text-sm text-gray-600">المبلغ</Label>
                <p className="font-medium text-lg">{Number(check.amount).toFixed(2)} ₪</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="text-sm text-gray-600">رقم الشيك</Label>
                <p className="font-medium">{check.check_number || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <Label className="text-sm text-gray-600">البنك</Label>
                <p className="font-medium">{check.bank_name || '-'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <Label className="text-sm text-gray-600">المتصرف إليه</Label>
                <p className="font-medium">{check.recipient_name || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-sm text-gray-600">الحالة</Label>
                <div className="mt-1">
                  {getStatusBadge(check.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Images Section */}
          {(check.front_image_url || check.back_image_url) && (
            <div>
              <Label className="text-lg font-medium mb-3 block">صور الشيك</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {check.front_image_url && (
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      الوجه الأمامي
                    </Label>
                    <img 
                      src={check.front_image_url} 
                      alt="Front of check" 
                      className="w-full h-48 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(check.front_image_url, '_blank')}
                    />
                  </div>
                )}
                
                {check.back_image_url && (
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      الوجه الخلفي
                    </Label>
                    <img 
                      src={check.back_image_url} 
                      alt="Back of check" 
                      className="w-full h-48 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(check.back_image_url, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {check.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <Label className="text-sm text-gray-600">ملاحظات</Label>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">{check.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm text-gray-600">تاريخ الإنشاء</Label>
              <p className="text-sm">{new Date(check.created_at).toLocaleString('ar-EG')}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">آخر تحديث</Label>
              <p className="text-sm">{new Date(check.updated_at).toLocaleString('ar-EG')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
