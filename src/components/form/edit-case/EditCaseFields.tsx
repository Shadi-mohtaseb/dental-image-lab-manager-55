
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { DoctorSelect } from "@/components/form/DoctorSelect";
import { WorkTypeSelect } from "@/components/form/WorkTypeSelect";
import { ShadeSelectField } from "@/components/form/add-case/ShadeSelectField";
import { ZirconBlockTypeField } from "@/components/form/add-case/ZirconBlockTypeField";
import { StatusSelect } from "@/components/form/StatusSelect";

interface EditCaseFieldsProps {
  control: any;
  setValue: any;
  onRecalculatePrice?: () => void;
}

export function EditCaseFields({ control, setValue, onRecalculatePrice }: EditCaseFieldsProps) {
  return (
    <div className="space-y-6">
      {/* معلومات المريض الأساسية */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات المريض</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <DoctorSelect form={{ control, setValue }} name="doctor_id" />
          </div>
        </CardContent>
      </Card>

      {/* معلومات العمل */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تفاصيل العمل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkTypeSelect form={{ control, setValue }} name="work_type" />
            <StatusSelect form={{ control, setValue }} name="status" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="tooth_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أرقام الأسنان</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 12 11 21" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="teeth_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الأسنان</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="مثال: 3"
                      {...field}
                      value={field.value || ""}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShadeSelectField form={{ control, setValue }} />
            <ZirconBlockTypeField form={{ control, setValue }} />
          </div>
        </CardContent>
      </Card>

      {/* معلومات التسعير */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التسعير</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  السعر (شيكل)
                  {onRecalculatePrice && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onRecalculatePrice}
                      className="flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      إعادة حساب تلقائي
                    </Button>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                    onChange={e => {
                      const value = e.target.value;
                      field.onChange(value ? Number(value) : "");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* معلومات التواريخ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">التواريخ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="submission_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ التسليم *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
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
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ملاحظات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ملاحظات</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
