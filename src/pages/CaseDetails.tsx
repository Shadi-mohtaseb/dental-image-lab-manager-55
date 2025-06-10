
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  User,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const caseData = {
    id: id || "A23",
    caseNumber: "1",
    patientName: "عبدالله محمد",
    doctorName: "د. أحمد محمد",
    workType: "زيركون",
    submissionDate: "2025-06-05",
    deliveryDate: "2025-06-15",
    toothNumbers: "28 27 26 25 24 23 22 21 11 12 13 14 15 17 18",
    currentStatus: "اختبار القوي",
    progress: 75,
  };

  const workflowSteps = [
    {
      id: 1,
      title: "تم التسليم",
      description: "تم استلام الحالة من الطبيب",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 2,
      title: "المراجعة الأولية",
      description: "مراجعة تفاصيل الحالة والمتطلبات",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 3,
      title: "قيد التنفيذ",
      description: "جاري العمل على تصنيع القطعة",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 4,
      title: "اختبار القوي",
      description: "فحص جودة العمل والتأكد من المطابقة",
      status: "current",
      icon: AlertCircle,
    },
    {
      id: 5,
      title: "تجميع العمل",
      description: "تجميع القطع النهائية وإعدادها للتسليم",
      status: "pending",
      icon: Circle,
    },
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "current":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-400 bg-gray-100";
    }
  };

  const getConnectorColor = (status: string) => {
    return status === "completed" ? "bg-green-500" : "bg-gray-300";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/cases")}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للقائمة
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل الحالة</h1>
          <p className="text-gray-600">رقم الحالة: {caseData.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                معلومات الحالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">اسم المريض</p>
                    <p className="font-semibold">{caseData.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">اسم الطبيب</p>
                    <p className="font-semibold">{caseData.doctorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإستلام</p>
                    <p className="font-semibold">{caseData.submissionDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ التسليم المتوقع</p>
                    <p className="font-semibold">{caseData.deliveryDate}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">نوع العمل</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    {caseData.workType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تفاصيل السن</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="grid grid-cols-9 gap-1 text-xs mb-2">
                        {caseData.toothNumbers.split(' ').slice(0, 9).map((tooth, index) => (
                          <div key={index} className="p-1 bg-blue-100 text-blue-700 rounded text-center">
                            {tooth}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-9 gap-1 text-xs">
                        {caseData.toothNumbers.split(' ').slice(9).map((tooth, index) => (
                          <div key={index} className="p-1 bg-blue-100 text-blue-700 rounded text-center">
                            {tooth}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle>مراحل العمل</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>حالة التقدم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {caseData.progress}%
                </div>
                <Progress value={caseData.progress} className="mb-3" />
                <Badge className="bg-blue-100 text-blue-700">
                  {caseData.currentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 ml-2" />
                جاهز للتسليم
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 ml-2" />
                تعديل الحالة
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Clock className="w-4 h-4 ml-2" />
                تحديث الحالة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
