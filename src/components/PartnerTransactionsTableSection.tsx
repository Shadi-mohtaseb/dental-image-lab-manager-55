
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import AddPartnerTransactionDialog from "./AddPartnerTransactionDialog";

interface PartnerTransactionsTableSectionProps {
  transactions: any[];
  partners: any[];
  showAddTransaction: boolean;
  setShowAddTransaction: (open: boolean) => void;
  handleEditTx: (tx: any) => void;
  handleDeleteTransaction: (id: string) => void;
}

export default function PartnerTransactionsTableSection({
  transactions,
  partners,
  showAddTransaction,
  setShowAddTransaction,
  handleEditTx,
  handleDeleteTransaction,
}: PartnerTransactionsTableSectionProps) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-700 flex gap-1 items-center">سجل المعاملات</h2>
        <Button
          onClick={() => setShowAddTransaction(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة معاملة
        </Button>
      </div>
      {/* شريط بحث بسيط وفلاتر */}
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <Input
          placeholder="بحث عن شريك/وصف"
          className="w-full max-w-xs"
        />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>جدول المعاملات المالية</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">التاريخ</TableHead>
                <TableHead className="text-center">الشريك</TableHead>
                <TableHead className="text-center">نوع المعاملة</TableHead>
                <TableHead className="text-center">المبلغ</TableHead>
                <TableHead className="text-center">المصدر</TableHead>
                <TableHead className="text-center">الوصف</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(transactions ?? []).map((transaction) => {
                const partner = partners.find((p) => p.id === transaction.partner_id);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-center">{transaction.transaction_date}</TableCell>
                    <TableCell className="text-center">{partner?.name || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={transaction.transaction_type === "deposit" ? "default" : "destructive"}>
                        {transaction.transaction_type === "deposit" ? "إيداع" : "سحب"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {Number(transaction.amount).toFixed(2)} ₪
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {transaction.transaction_source === "personal_withdrawal" ? "سحب شخصي" : 
                          transaction.transaction_source === "case_profit" ? "ربح حالة" : "يدوي"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{transaction.description}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="outline" onClick={() => handleEditTx(transaction)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600"
                          onClick={() => handleDeleteTransaction(transaction.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddPartnerTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
    </section>
  );
}
