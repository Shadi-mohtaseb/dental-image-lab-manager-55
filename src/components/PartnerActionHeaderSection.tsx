
import { Users } from "lucide-react";
import AddPartnerDialog from "./AddPartnerDialog";

export default function PartnerActionHeaderSection() {
  return (
    <div className="flex items-center justify-between mt-6 mb-2">
      <h1 className="text-2xl font-bold text-gray-900 flex gap-2 items-center">
        <Users className="w-7 h-7 text-primary" /> الشركاء
      </h1>
      <AddPartnerDialog />
    </div>
  );
}
