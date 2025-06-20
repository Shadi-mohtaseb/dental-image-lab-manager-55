
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";
import { AddWorkTypeForm } from "@/components/work-types/AddWorkTypeForm";
import { WorkTypesList } from "@/components/work-types/WorkTypesList";

export function WorkTypesSection() {
  const { workTypes, isLoading } = useWorkTypesData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          إدارة أنواع العمل
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddWorkTypeForm />
        <WorkTypesList workTypes={workTypes} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
