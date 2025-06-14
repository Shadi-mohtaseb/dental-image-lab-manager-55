
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
  onWithdrawShare?: (partner: Partner) => void; // جديد
}

export default function PartnerCard({ partner, onWithdraw, onDelete, onWithdrawShare }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{partner.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {partner.partnership_percentage?.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              نسبة من رأس المال
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">حصة من صافي الربح:</span>
            <span className="font-bold text-green-600">{Number(partner.total_amount).toFixed(2)} ₪</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">المبلغ المسحوب:</span>
            <span className="text-orange-600">{Number(partner.withdrawals).toFixed(2)} ₪</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">المتبقي من الحصة:</span>
            <span className="font-semibold text-blue-800">{Number(partner.remaining_share).toFixed(2)} ₪</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">الرصيد الشخصي:</span>
            <span className="font-semibold text-blue-600">{Number(partner.personal_balance || 0).toFixed(2)} ₪</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 flex-1"
              onClick={() => onWithdrawShare && onWithdrawShare(partner)}
            >
              <Wallet className="w-4 h-4 ml-1" /> سحب من الربح (الحصة)
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-blue-600 flex-1"
              onClick={() => onWithdraw(partner)}
            >
              <Wallet className="w-4 h-4 ml-1" /> سحب من الرصيد الشخصي
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="text-red-600"
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
