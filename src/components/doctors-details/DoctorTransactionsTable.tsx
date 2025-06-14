
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number | string;
  payment_method?: string | null;
  transaction_date: string;
  notes?: string | null;
}

interface Props {
  transactions: Transaction[];
}

export function DoctorTransactionsTable({ transactions }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>النوع</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>طريقة الدفع</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead>ملاحظات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              لا توجد دفعات أو مستحقات لهذا الطبيب
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <Badge variant={tx.transaction_type === "دفعة" ? "default" : "destructive"}>
                  {tx.transaction_type}
                </Badge>
              </TableCell>
              <TableCell>{Number(tx.amount).toFixed(2)} ₪</TableCell>
              <TableCell>{tx.payment_method || "-"}</TableCell>
              <TableCell>{tx.transaction_date}</TableCell>
              <TableCell>{tx.notes || "-"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
