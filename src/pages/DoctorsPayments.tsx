
import DoctorsPaymentsLogTable from "@/components/doctors-log/DoctorsPaymentsLogTable";

const DoctorsPayments = () => {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4">سجل دفعات الأطباء</h1>
      <DoctorsPaymentsLogTable />
    </div>
  );
};

export default DoctorsPayments;
