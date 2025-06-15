
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
                <TableHead>التاريخ</TableHead>
                <TableHead>الشريك</TableHead>
                <TableHead>نوع المعاملة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(transactions ?? []).map((transaction) => {
                const partner = partners.find((p) => p.id === transaction.partner_id);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.transaction_date}</TableCell>
                    <TableCell>{partner?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === "deposit" ? "default" : "destructive"}>
                        {transaction.transaction_type === "deposit" ? "إيداع" : "سحب"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Number(transaction.amount).toFixed(2)} ₪
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transaction_source === "personal_withdrawal" ? "سحب شخصي" : 
                          transaction.transaction_source === "case_profit" ? "ربح حالة" : "يدوي"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
