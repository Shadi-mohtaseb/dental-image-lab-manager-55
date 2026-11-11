# Architecture rules

- Doctor account pages reuse `EditCaseDialog` and `useUpdateCase` for case edits so the case form and query refresh behavior remain consistent across management pages; the public doctor permalink remains read-only.
- Case edits derive the initial unit price from the stored total, recalculate only on user unit-price/quantity changes, and await case-query refresh before completion so opening an edit never overwrites a saved total and lists read back fresh data.