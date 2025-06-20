
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, DollarSign } from "lucide-react";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";
import { useDoctorWorkTypePrices, useUpdateDoctorWorkTypePrice } from "@/hooks/useDoctorWorkTypePrices";

interface DoctorWorkTypePricesSectionProps {
  doctorId: string;
}

export function DoctorWorkTypePricesSection({ doctorId }: DoctorWorkTypePricesSectionProps) {
  const { workTypes } = useWorkTypesData();
  const { data: prices = [] } = useDoctorWorkTypePrices();
  const updatePrice = useUpdateDoctorWorkTypePrice();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);

  const getDoctorPrice = (workTypeId: string) => {
    const price = prices.find((p: any) => p.doctor_id === doctorId && p.work_type_id === workTypeId);
    return price?.price || 0;
  };

  const handleEdit = (workTypeId: string, currentPrice: number) => {
    setEditingId(workTypeId);
    setEditingPrice(currentPrice);
  };

  const handleSave = async (workTypeId: string) => {
    try {
      await updatePrice.mutateAsync({
        doctorId,
        workTypeId,
        price: editingPrice
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating price:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingPrice(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          أسعار أنواع العمل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workTypes?.map((workType: any) => {
            const currentPrice = getDoctorPrice(workType.id);
            const isEditing = editingId === workType.id;

            return (
              <div key={workType.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-medium">{workType.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(Number(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-500">شيكل</span>
                      <Button
                        size="sm"
                        onClick={() => handleSave(workType.id)}
                        disabled={updatePrice.isPending}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="font-bold text-green-600 min-w-[60px] text-right">
                        {currentPrice} شيكل
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(workType.id, currentPrice)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
