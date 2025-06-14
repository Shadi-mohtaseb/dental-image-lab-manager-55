
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// استلام البيانات من الصفحة الرئيسية
interface DoctorAccountTableProps {
  doctors: {
    id: string;
    name: string;
    zircon_price: number;
    temp_price: number;
  }[];
  cases: {
    id: string;
    doctor_id: string;
    price: number;
    status: string;
    delivery_date?: string;
    created_at: string;
  }[];
}

export function DoctorAccountTable({ doctors, cases }: DoctorAccountTableProps) {
  const [search, setSearch] = useState("");

  // تجهيز بيانات الأطباء مجمعة
  const doctorsSummary = useMemo(() => {
    return doctors.map((doc) => {
      const docCases = cases.filter((c) => c.doctor_id === doc.id);
      const totalAmount = docCases.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
      const completedCount = docCases.filter((c) => c.status && c.status.includes("تم")).length;
      const currentBalance = totalAmount; // مستقبلًا يمكن ربطه مع رصيد الطبيب الحقيقي
      const lastWorkDate = docCases.length > 0 ? docCases.sort((a, b) =>
        new Date(b.delivery_date || b.created_at).getTime() - new Date(a.delivery_date || a.created_at).getTime()
      )[0].delivery_date || docCases[0].created_at : null;

      return {
        id: doc.id,
        name: doc.name,
        totalCases: docCases.length,
        completedCount,
        totalAmount,
        currentBalance,
        lastWorkDate,
      };
    });
  }, [doctors, cases]);

  const filteredDoctors = doctorsSummary.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-lg">كشف حساب الأطباء</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="بحث باسم الطبيب..."
            className="w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* زر وهمي - سيفعل عند إضافة التصدير */}
          <Button variant="outline" disabled>
            <Download className="ml-1" /> تصدير الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الطبيب</TableHead>
                <TableHead>عدد الحالات</TableHead>
                <TableHead>الحالات المكتملة</TableHead>
                <TableHead>إجمالي المبالغ (د.ع)</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>آخر تسليم</TableHead>
                <TableHead>تصدير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    لا يوجد أطباء بهذه المواصفات
                  </TableCell>
                </TableRow>
              )}
              {filteredDoctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-semibold text-primary">{doc.name}</TableCell>
                  <TableCell>{doc.totalCases}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.completedCount}</Badge>
                  </TableCell>
                  <TableCell>{Number(doc.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-bold text-green-700">{Number(doc.currentBalance).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {doc.lastWorkDate ? new Date(doc.lastWorkDate).toLocaleDateString("ar-EG") : "-"}
                  </TableCell>
                  <TableCell>
                    {/* زر التصدير للطبيب - سيفعل مستقبلاً */}
                    <Button size="sm" variant="ghost" disabled>
                      <Download className="ml-1" />تصدير
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
