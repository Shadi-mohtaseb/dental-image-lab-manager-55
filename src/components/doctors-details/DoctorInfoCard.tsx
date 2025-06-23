
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Doctor {
  name: string;
  phone?: string | null;
  casesLength: number;
  totalTeeth: number;
}

export function DoctorInfoCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>بيانات الطبيب: {doctor.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">الاسم:</span> {doctor.name}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">رقم الهاتف:</span> {doctor.phone || "-"}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">إجمالي عدد الحالات:</span> {doctor.casesLength}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">إجمالي عدد الأسنان:</span> {doctor.totalTeeth}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
