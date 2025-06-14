
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface MostActiveDoctorsProps {
  doctors: { id: string; name: string; caseCount: number }[];
}

export function MostActiveDoctors({ doctors }: MostActiveDoctorsProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          الأطباء الأكثر نشاطاً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doctors.slice(0, 3).map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {doctor.name?.split(' ')[1]?.[0] || doctor.name[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{doctor.name}</div>
                  <div className="text-sm text-gray-500">
                    {doctor.caseCount} حالة هذا الشهر
                  </div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {doctor.caseCount} حالة
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
