
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Partner {
  id: string;
  name: string;
  partnership_percentage: number;
  total_amount: number;
  personal_balance: number;
  withdrawals: number;
  remaining_share: number;
}

interface Props {
  partner: Partner;
  onWithdraw: (partner: Partner) => void;
  onDelete: (id: string) => void;
  onWithdrawShare?: (partner: Partner) => void;
}

export default function PartnerCard({ partner, onWithdraw, onDelete, onWithdrawShare }: Props) {
  // التأكد من وجود البيانات مع قيم افتراضية آمنة
  const partnershipPercentage = Number(partner.partnership_percentage) || 0;
  const totalAmount = Number(partner.total_amount) || 0;
  const withdrawals = Number(partner.withdrawals) || 0;
  const remainingShare = Number(partner.remaining_share) || Math.max(0, totalAmount - withdrawals);

  console.log(`Partner ${partner.name}:`, {
    partnership_percentage: partnershipPercentage,
    total_amount: totalAmount,
    withdrawals: withdrawals,
    remaining_share: remainingShare
  });

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{partner.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {partnershipPercentage.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              نسبة الشراكة
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600 font-medium">حصة من صافي الربح:</span>
            <span className="font-bold text-green-600 text-lg">{totalAmount.toFixed(2)} ₪</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">المبلغ المسحوب:</span>
            <span className="text-orange-600 font-semibold">{withdrawals.toFixed(2)} ₪</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t pt-2">
            <span className="text-gray-600 font-medium">المتبقي من الحصة:</span>
            <span className="font-bold text-blue-800 text-lg">{remainingShare.toFixed(2)} ₪</span>
          </div>
          <div className="flex gap-2 mt-4 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 hover:bg-blue-50 border-blue-200 flex-1"
              onClick={() => onWithdrawShare && onWithdrawShare(partner)}
              disabled={remainingShare <= 0}
            >
              <Wallet className="w-4 h-4 ml-1" /> 
              {remainingShare > 0 ? "سحب من الحصة" : "لا يوجد رصيد"}
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-red-600 hover:bg-red-50 border-red-200"
              onClick={() => onDelete(partner.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
