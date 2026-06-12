import { describe, expect, it } from "vitest";
import { COLUMNS, DEFAULT_COLUMNS } from "../src/types";

describe("default columns", () => {
  it("uses stable IDs with editable default labels", () => {
    expect(DEFAULT_COLUMNS).toEqual([
      { id: "highlights", label: "亮点", position: 0 },
      { id: "challenges", label: "挑战", position: 1 },
      { id: "questions", label: "提问", position: 2 },
      { id: "notes", label: "备忘", position: 3 },
    ]);
    expect(COLUMNS).toEqual(["highlights", "challenges", "questions", "notes"]);
  });
});
