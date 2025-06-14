
import DoctorsPaymentsTable from "@/components/doctors-log/DoctorsPaymentsTable";

/** هذا المكون لـ عرض دفعات الأطباء (إجمالي المستحقات وإضافة دفعة) */
export default function DoctorsPaymentsTableSection() {
  return (
    <div className="my-6">
      <DoctorsPaymentsTable />
    </div>
  );
}
