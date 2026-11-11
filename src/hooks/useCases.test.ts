import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { QueryClient, QueryObserver } from "@tanstack/react-query";

describe("Case query refresh after saving", () => {
  test("refreshes active doctor cases and marks the cached main table stale", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
    const mainKey = ["cases"];
    const doctorKey = ["cases", { doctor_id: "doctor-test" }];
    let saved = { id: "case-test", doctor_id: "doctor-test", price: 100, notes: "before" };
    client.setQueryData(mainKey, [saved]);
    client.setQueryData(doctorKey, [saved]);
    const observer = new QueryObserver(client, { queryKey: doctorKey, queryFn: async () => [saved] });
    const unsubscribe = observer.subscribe(() => {});
    try {
      saved = { ...saved, price: 500, notes: "after" };
      await client.invalidateQueries({ queryKey: ["cases"] });
      assert.deepEqual(client.getQueryData(doctorKey), [saved]);
      assert.equal(client.getQueryState(mainKey)?.isInvalidated, true);
      const mainReadback = await client.fetchQuery({ queryKey: mainKey, queryFn: async () => [saved] });
      assert.equal(mainReadback[0].price, 500);
      assert.equal(mainReadback[0].notes, "after");
    } finally {
      unsubscribe();
      client.clear();
    }
  });
});