
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface RecentSubmissionsProps {
  submissions: { doctor: string; case: string; date: string; status: string }[];
  getStatusColor: (status: string) => string;
}

export function RecentSubmissions({ submissions, getStatusColor }: RecentSubmissionsProps) {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          آخر التسليمات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">{submission.doctor}</div>
                <div className="text-sm text-gray-500">
                  {submission.case} - آخر زيارة {submission.date}
                </div>
              </div>
              <Badge className={getStatusColor(submission.status)}>
                {submission.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
