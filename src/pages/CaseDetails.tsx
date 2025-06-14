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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { WorkflowSteps } from "@/components/case/WorkflowSteps";
import { ActionButtons } from "@/components/case/ActionButtons";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // حالة تحميل وجلب بيانات الحالة الفعلية من القاعدة
  const [caseData, setCaseData] = useState<Tables<"cases"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const fetchCase = async () => {
      try {
        const { data } = await supabase
          .from("cases")
          .select("*")
          .eq("id", id)
          .single();
        setCaseData(data || null);
      } catch (error) {
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const handleUpdateCase = (updated: Tables<"cases">) => {
    setCaseData(updated);
  };

  // مراحل العمل مبسطة على مرحلتين فقط
  const workflowSteps = [
    {
      id: 1,
      title: "قيد التنفيذ",
      description: "جاري العمل على تصنيع القطعة",
      status: caseData?.status === "قيد التنفيذ" ? "current" : "completed",
      icon: caseData?.status === "قيد التنفيذ" ? AlertCircle : CheckCircle,
    },
    {
      id: 2,
      title: "جاهز للتسليم",
      description: "تم الإنتهاء من العمل والحالة جاهزة للتسليم",
      status: caseData?.status === "تم التسليم" ? "current" : caseData?.status === "قيد التنفيذ" ? "pending" : "completed",
      icon:
        caseData?.status === "تم التسليم"
          ? AlertCircle
          : caseData?.status === "قيد التنفيذ"
          ? Circle
          : CheckCircle,
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

  // إذا يقب تحميل بيانات الحالة
  if (loading) {
    return (
      <div className="p-12 text-center text-lg animate-fade-in">
        جاري تحميل تفاصيل الحالة...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-12 text-center text-red-600">
        لم يتم العثور على الحالة المطلوبة
      </div>
    );
  }

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
                    <p className="font-semibold">{caseData.patient_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">اسم الطبيب</p>
                    <p className="font-semibold">{caseData.doctor_id /* لاحقاً يمكن جلب اسم الدكتور */}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإستلام</p>
                    <p className="font-semibold">{caseData.submission_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ التسليم المتوقع</p>
                    <p className="font-semibold">{caseData.delivery_date || "-"}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">نوع العمل</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    {caseData.work_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تفاصيل السن</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="grid grid-cols-9 gap-1 text-xs mb-2">
                        {(caseData.tooth_number?.split(' ') || []).slice(0, 9).map((tooth, index) => (
                          <div key={index} className="p-1 bg-blue-100 text-blue-700 rounded text-center">
                            {tooth}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-9 gap-1 text-xs">
                        {(caseData.tooth_number?.split(' ') || []).slice(9).map((tooth, index) => (
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
              <WorkflowSteps status={caseData.status} />
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
                <Progress value={0} className="mb-3" />
                <Badge className="bg-blue-100 text-blue-700">
                  {caseData.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionButtons
                caseData={caseData}
                onEdit={() => setEditOpen(true)}
                onUpdate={handleUpdateCase}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <EditCaseDialog
        caseData={caseData}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={handleUpdateCase}
      />
    </div>
  );
};

export default CaseDetails;
