import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getTeethCount } from "./DoctorCasesTable";
import type { Tables } from "@/integrations/supabase/types";

const caseData: Tables<"cases"> = {
  id: "case-test", patient_name: "مريض", doctor_id: null,
  patient_age: null, patient_phone: null, price: 100,
  shade: null, status: "في الانتظار", submission_date: "2026-11-11",
  delivery_date: null, teeth_count: 12, tooth_number: "11 12",
  work_type: "زيركون", zircon_block_type: null, notes: null,
  created_at: "2026-11-11", updated_at: "2026-11-11", user_id: null,
};

describe("Doctor case tooth count", () => {
  test("prefers number_of_teeth over teeth_count", () => {
    assert.equal(getTeethCount({ ...caseData, number_of_teeth: 3 }), 3);
  });
  test("uses teeth_count when the newer count is missing", () => {
    assert.equal(getTeethCount(caseData), 12);
  });
  test("does not count symbolic tooth positions as quantities", () => {
    assert.equal(getTeethCount({ ...caseData, teeth_count: null }), 1);
  });
});