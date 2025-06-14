
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CaseItem {
  date?: string;
  status: string;
  caseNumber: string;
  patient: string;
}

interface Doctor {
  id: string;
  name: string;
  caseCount: number;
  recentCases: CaseItem[];
}

interface DoctorDetailedLogProps {
  doctors: Doctor[];
  getStatusColor: (status: string) => string;
}

export function DoctorDetailedLog({ doctors, getStatusColor }: DoctorDetailedLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المرضى حسب الطبيب</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-primary">{doctor.name}</h3>
                <Badge variant="outline">{doctor.caseCount} زيارة</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {doctor.recentCases.length === 0 ? (
                  <div className="col-span-3 text-gray-400 text-center">
                    لا يوجد حالات حديثة لهذا الطبيب
                  </div>
                ) : (
                  doctor.recentCases.map((caseItem, caseIndex) => (
                    <div key={caseIndex} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">تاريخ الزيارة</div>
                      <div className="font-semibold">
                        {caseItem.date
                          ? new Date(caseItem.date).toLocaleDateString("en-GB")
                          : "-"}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">المريض: {caseItem.patient}</span>
                        <Badge className={getStatusColor(caseItem.status)} variant="outline">
                          {caseItem.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
