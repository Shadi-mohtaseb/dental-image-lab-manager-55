import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoctorAccountPDFButton } from "@/components/doctors-log/DoctorAccountPDFButton";
import { EditDoctorDialog } from "@/components/EditDoctorDialog";
import type { Doctor } from "@/hooks/useDoctors";
import { useDeleteDoctor } from "@/hooks/useDoctors";
import { useUpdateDoctorAccessToken } from "@/hooks/useUpdateDoctorAccessToken";
import { Copy, RefreshCw, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { buildWhatsappLink } from "@/utils/whatsapp";
import AddPaymentDialog from "@/components/AddPaymentDialog";

interface Props {
  doctors: Doctor[];
  cases: any[];
  doctorPayments: any[];
}

function getDoctorFinancialSummary(doctorId: string, cases: any[], doctorPayments: any[]) {
  const doctorCases = cases.filter((c: any) => c.doctor_id === doctorId);
  const totalDue = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
  const totalPaid = doctorPayments
    .filter((t: any) => t.doctor_id === doctorId && t.transaction_type === "دفعة")
    .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
  const remaining = totalDue - totalPaid;
  return { totalDue, totalPaid, remaining, doctorCases };
}

export default function DoctorsAccountsTable({ doctors, cases, doctorPayments }: Props) {
  const deleteDoctor = useDeleteDoctor();
  const updateAccessToken = useUpdateDoctorAccessToken();

  const calcTotalTeeth = (doctor_id: string) => {
    const doctorCases = cases.filter((c) => c.doctor_id === doctor_id);
    let total = 0;
    doctorCases.forEach(c => {
      if (c?.teeth_count && Number(c.teeth_count) > 0) {
        total += Number(c.teeth_count);
      }
    });
    return total;
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف الطبيب؟")) {
      deleteDoctor.mutate(id);
    }
  };

  const handleCopyLink = (accessToken: string) => {
    const link = `${window.location.origin}/doctor-dashboard?token=${accessToken}`;
    navigator.clipboard.writeText(link);
    toast.success("تم نسخ الرابط بنجاح");
  };

  const handleRegenerateToken = (doctorId: string) => {
    if (window.confirm("هل أنت متأكد من تغيير رابط الطبيب؟ الرابط القديم سيتوقف عن العمل.")) {
      updateAccessToken.mutate(doctorId);
    }
  };

  const getPaymentMsg = (doc: any, remaining: number) => {
    return `مرحبًا ${doc?.name}\nنود تذكيركم بأن مبلغ المستحق المتبقي عليك هو: ${remaining.toFixed(2)}. إذا كان لديكم أي استفسار يرجى التواصل معنا. شكرًا لتعاملكم معنا`;
  };

  if (doctors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأطباء (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد أطباء مسجلين حتى الآن
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>قائمة الأطباء ({doctors.length})</CardTitle>
        <AddPaymentDialog />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم الطبيب</TableHead>
                <TableHead className="text-center">الأسنان</TableHead>
                <TableHead className="text-center">المستحق</TableHead>
                <TableHead className="text-center">المدفوع</TableHead>
                <TableHead className="text-center">الدين/المتبقي</TableHead>
                <TableHead className="text-center">الرابط</TableHead>
                <TableHead className="text-center">PDF</TableHead>
                <TableHead className="text-center">واتساب</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => {
                const { totalDue, totalPaid, remaining, doctorCases } =
                  getDoctorFinancialSummary(doctor.id, cases, doctorPayments);

                return (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-semibold text-primary text-right">
                      {doctor.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold">{calcTotalTeeth(doctor.id)}</span>
                    </TableCell>
                    <TableCell className="text-center">{totalDue.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{totalPaid.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={remaining > 0 ? "destructive" : "default"} className={remaining > 0 ? "bg-destructive text-destructive-foreground" : "bg-green-100 text-green-700"}>
                        {remaining > 0 ? `${remaining.toFixed(2)} دين` : "لا يوجد دين"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {doctor.access_token && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleCopyLink(doctor.access_token!)}
                            className="h-8 w-8"
                            title="نسخ الرابط"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleRegenerateToken(doctor.id)}
                          className="h-8 w-8 text-orange-600 hover:bg-orange-50"
                          title="تجديد الرابط"
                          disabled={updateAccessToken.isPending}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${updateAccessToken.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DoctorAccountPDFButton
                        doctorName={doctor.name}
                        summary={{ totalDue, totalPaid, remaining }}
                        doctorCases={doctorCases}
                        doctorId={doctor.id}
                        doctorPhone={doctor.phone}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {doctor.phone ? (
                        <a
                          href={buildWhatsappLink(doctor.phone, getPaymentMsg(doctor, remaining))}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="icon" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 h-8 w-8">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <EditDoctorDialog doctor={doctor} />
                        <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50 border-blue-200"
                          onClick={() => window.location.href = `/doctor/${doctor.id}`}>
                          تفاصيل
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(doctor.id)}>
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
