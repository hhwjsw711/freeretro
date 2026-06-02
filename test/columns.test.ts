import { describe, expect, it } from "vitest";
import { COLUMNS, DEFAULT_COLUMNS } from "../src/types";

describe("default columns", () => {
  it("uses stable IDs with editable default labels", () => {
    expect(DEFAULT_COLUMNS).toEqual([
      { id: "highlights", label: "Highlights", position: 0 },
      { id: "challenges", label: "Challenges", position: 1 },
      { id: "questions", label: "Questions", position: 2 },
      { id: "notes", label: "Notes", position: 3 },
    ]);
    expect(COLUMNS).toEqual(["highlights", "challenges", "questions", "notes"]);
  });
});
