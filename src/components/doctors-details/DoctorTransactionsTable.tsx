
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
          <TableHead className="text-center w-[90px]">النوع</TableHead>
          <TableHead className="text-center w-[100px]">المبلغ</TableHead>
          <TableHead className="text-center w-[100px]">طريقة الدفع</TableHead>
          <TableHead className="text-center w-[120px]">التاريخ</TableHead>
          <TableHead className="text-center w-[150px]">ملاحظات</TableHead>
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
              <TableCell className="text-center w-[90px]">
                <Badge variant={tx.transaction_type === "دفعة" ? "default" : "destructive"}>
                  {tx.transaction_type}
                </Badge>
              </TableCell>
              <TableCell className="text-center w-[100px]">{Number(tx.amount).toFixed(2)} ₪</TableCell>
              <TableCell className="text-center w-[100px]">{tx.payment_method || "-"}</TableCell>
              <TableCell className="text-center w-[120px]">{tx.transaction_date}</TableCell>
              <TableCell className="text-center w-[150px]">{tx.notes || "-"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
