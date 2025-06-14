
import { AlertCircle, CheckCircle, Circle } from "lucide-react";

type WorkflowStep = {
  id: number;
  title: string;
  description: string;
  status: string;
  icon: any;
};

type Props = {
  status: string;
};

export const WorkflowSteps = ({ status }: Props) => {
  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      title: "قيد التنفيذ",
      description: "جاري العمل على تصنيع القطعة",
      status: status === "قيد التنفيذ" ? "current" : "completed",
      icon: status === "قيد التنفيذ" ? AlertCircle : CheckCircle,
    },
    {
      id: 2,
      title: "جاهز للتسليم",
      description: "تم الإنتهاء من العمل والحالة جاهزة للتسليم",
      status: status === "تم التسليم" ? "current" : status === "قيد التنفيذ" ? "pending" : "completed",
      icon: status === "تم التسليم"
        ? AlertCircle
        : status === "قيد التنفيذ"
        ? Circle
        : CheckCircle,
    },
  ];

  const getStepColor = (status_: string) => {
    switch (status_) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "current":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-400 bg-gray-100";
    }
  };

  const getConnectorColor = (stepStatus: string) => {
    return stepStatus === "completed" ? "bg-green-500" : "bg-gray-300";
  };

  return (
    <div className="relative">
      {workflowSteps.map((step, index) => (
        <div key={step.id} className="relative">
          <div className="flex items-center gap-4 pb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step.status)}`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
          {index < workflowSteps.length - 1 && (
            <div className={`absolute right-4 top-10 w-0.5 h-6 ${getConnectorColor(step.status)}`} />
          )}
        </div>
      ))}
    </div>
  );
};
