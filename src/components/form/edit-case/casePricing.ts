export function getInitialUnitPrice(price: number | null, teethCount: number | null): number | "" {
  if (price === null) return "";
  return price / (teethCount && teethCount > 0 ? teethCount : 1);
}

export function calculateEditedTotal(unitPrice: number | string, teethCount: number | string | undefined): number | "" {
  if (unitPrice === "") return "";
  const count = Number(teethCount) || 1;
  return Number(unitPrice) * count;
}