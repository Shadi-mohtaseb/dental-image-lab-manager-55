
import { Card, CardContent } from "@/components/ui/card";

interface DoctorStatsCardProps {
  count: number;
  label: string;
  color: string;
}

export function DoctorStatsCard({ count, label, color }: DoctorStatsCardProps) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className={`text-3xl font-bold ${color} mb-2`}>
          {count}
        </div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
}
