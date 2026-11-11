# Architecture rules

- Doctor account pages reuse `EditCaseDialog` and `useUpdateCase` for case edits so the case form and query refresh behavior remain consistent across management pages; the public doctor permalink remains read-only.