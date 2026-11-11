import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getInitialUnitPrice, calculateEditedTotal } from "./casePricing";

describe("Case edit pricing", () => {
  test("derives the unit price from the saved total instead of multiplying a 100 total by 12", () => {
    assert.equal(getInitialUnitPrice(100, 12), 100 / 12);
  });
  test("changing a unit price to 100 with 12 teeth calculates a 1200 total", () => {
    assert.equal(calculateEditedTotal(100, 12), 1200);
  });
  test("clearing the unit price leaves the total empty", () => {
    assert.equal(calculateEditedTotal("", 12), "");
  });
  test("a zero unit price can be saved as a zero total", () => {
    assert.equal(calculateEditedTotal(0, 12), 0);
  });
});