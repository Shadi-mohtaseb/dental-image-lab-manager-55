
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PartnershipChartsProps {
  cases: Array<{ submission_date: string; price?: number | null; teeth_count?: number | null; tooth_number?: string | null }>;
  expenses: Array<{ purchase_date: string; total_amount: number }>;
  doctorTransactions: Array<{ transaction_date: string; amount: number; transaction_type: string }>;
}

type ViewMode = "monthly" | "yearly";

function getTeethCount(c: { teeth_count?: number | null; tooth_number?: string | null }) {
  if (c.teeth_count && Number(c.teeth_count) > 0) return Number(c.teeth_count);
  if (c.tooth_number) return c.tooth_number.split(" ").filter(Boolean).length;
  return 1;
}

export default function PartnershipCharts({ cases, expenses, doctorTransactions }: PartnershipChartsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  const chartData = useMemo(() => {
    const map = new Map<string, { label: string; teeth: number; expenses: number; payments: number }>();

    const getKey = (dateStr: string) => {
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      if (viewMode === "yearly") return d.getFullYear().toString();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };

    const getLabel = (key: string) => {
      if (viewMode === "yearly") return key;
      const [y, m] = key.split("-");
      const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return `${months[parseInt(m) - 1]} ${y}`;
    };

    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { label: getLabel(key), teeth: 0, expenses: 0, payments: 0 });
      return map.get(key)!;
    };

    cases.forEach((c) => {
      const key = getKey(c.submission_date);
      if (!key) return;
      ensure(key).teeth += getTeethCount(c);
    });

    expenses.forEach((e) => {
      const key = getKey(e.purchase_date);
      if (!key) return;
      ensure(key).expenses += Number(e.total_amount) || 0;
    });

    doctorTransactions
      .filter((tx) => tx.transaction_type === "دفعة")
      .forEach((tx) => {
        const key = getKey(tx.transaction_date);
        if (!key) return;
        ensure(key).payments += Number(tx.amount) || 0;
      });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [cases, expenses, doctorTransactions, viewMode]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">تحليل الأداء المالي</CardTitle>
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">شهري</SelectItem>
            <SelectItem value="yearly">سنوي</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد بيانات كافية لعرض الرسم البياني</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ direction: "rtl", textAlign: "right" }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    teeth: "عدد الأسنان",
                    expenses: "المصاريف (₪)",
                    payments: "الدفعات (₪)",
                  };
                  return [name === "teeth" ? value : `${value.toFixed(0)} ₪`, labels[name] || name];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    teeth: "عدد الأسنان",
                    expenses: "المصاريف",
                    payments: "الدفعات",
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="teeth" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="payments" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
