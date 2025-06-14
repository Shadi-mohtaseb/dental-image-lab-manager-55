
import { WorkTypeSelect } from "../WorkTypeSelect";
import { TeethCountField } from "./TeethCountField";
import { ShadeSelectField } from "./ShadeSelectField";
import { ZirconBlockTypeField } from "./ZirconBlockTypeField";

export function TeethDetailsFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WorkTypeSelect form={form} name="work_type" />
      <TeethCountField form={form} />
      <ShadeSelectField form={form} />
      <ZirconBlockTypeField form={form} />
    </div>
  );
}
