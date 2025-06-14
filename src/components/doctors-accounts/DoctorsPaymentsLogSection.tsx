
import DoctorsPaymentsLogTable from "@/components/doctors-log/DoctorsPaymentsLogTable";

export default function DoctorsPaymentsLogSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold my-4">سجل دفعات الأطباء</h2>
      <DoctorsPaymentsLogTable />
    </div>
  );
}
