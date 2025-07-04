
import { CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AutoDistributionIndicator() {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">توزيع تلقائي مفعل</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <RefreshCw className="w-4 h-4" />
          <span>يتم توزيع الحصص تلقائياً عند كل تغيير</span>
        </div>
      </CardContent>
    </Card>
  );
}
