
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DoctorSelect } from "@/components/form/DoctorSelect";
import { WorkTypeSelect } from "@/components/form/WorkTypeSelect";
import { ShadeSelectField } from "@/components/form/add-case/ShadeSelectField";
import { ZirconBlockTypeField } from "@/components/form/add-case/ZirconBlockTypeField";
import { StatusSelect } from "@/components/form/StatusSelect";

interface EditCaseFieldsProps {
  control: any;
  setValue: any;
}

export function EditCaseFields({ control, setValue }: EditCaseFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Patient name */}
      <FormField
        control={control}
        name="patient_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>اسم المريض *</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Doctor */}
      <DoctorSelect form={{ control, setValue }} name="doctor_id" />

      {/* Work type */}
      <WorkTypeSelect form={{ control, setValue }} name="work_type" />

      {/* Number of teeth */}
      <FormField
        control={control}
        name="number_of_teeth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>عدد الأسنان</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                placeholder="مثال: 3"
                {...field}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  field.onChange(value ? Number(value) : "");
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price */}
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>السعر (شيكل) - يتم حسابه تلقائياً</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                {...field}
                readOnly
                className="bg-gray-50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Shade */}
      <ShadeSelectField form={{ control, setValue }} />

      {/* Zircon block type */}
      <ZirconBlockTypeField form={{ control, setValue }} />

      {/* Tooth numbers */}
      <FormField
        control={control}
        name="tooth_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>أرقام الأسنان</FormLabel>
            <FormControl>
              <Input placeholder="مثال: 12 11 21" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="submission_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ التسليم *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="delivery_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الاستلام</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Status */}
      <StatusSelect form={{ control, setValue }} name="status" />

      {/* Notes */}
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ملاحظات</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
