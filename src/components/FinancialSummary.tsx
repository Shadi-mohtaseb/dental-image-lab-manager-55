
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

const dataKey = [
  { name: "الإيرادات", key: "totalRevenue", color: "#16a34a" },
  { name: "المصاريف", key: "totalExpenses", color: "#dc2626" },
  { name: "صافي الربح", key: "netProfit", color: "#2563eb" },
];

export default function FinancialSummary({ totalRevenue, totalExpenses, netProfit }: Props) {
  const chartData = [
    { name: "الإيرادات", value: totalRevenue, color: "#16a34a" },
    { name: "المصاريف", value: totalExpenses, color: "#dc2626" },
    { name: "صافي الربح", value: netProfit, color: "#2563eb" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="w-6 h-6 text-white" /> الإيرادات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} ₪</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-red-400 to-red-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowDown className="w-6 h-6 text-white" /> المصاريف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} ₪</div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ArrowUp className="w-6 h-6 text-white" /> صافي الربح
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="text-3xl font-semibold">{netProfit.toFixed(2)} ₪</div>
            {/* رسم بياني صغير يوضح الأرقام الثلاث */}
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb">
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
