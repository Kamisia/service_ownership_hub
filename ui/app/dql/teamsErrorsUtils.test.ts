import type { Team } from "app/utils/teams/types";
import { escapeDqlString, formatTs, parseTeamsMap } from "./teamsErrorsUtils";

describe("dql/teamsErrorsUtils", () => {
  describe("formatTs", () => {
    test("returns localized datetime for valid timestamp", () => {
      const result = formatTs("2026-02-17T10:00:00.000Z");
      expect(typeof result).toBe("string");
      expect(result).not.toBe("2026-02-17T10:00:00.000Z");
    });

    test("returns original value as string for invalid timestamp", () => {
      expect(formatTs("not-a-date")).toBe("not-a-date");
      expect(formatTs(123)).toBe(new Date(123).toLocaleString());
    });
  });

  describe("escapeDqlString", () => {
    test("escapes backslashes and quotes", () => {
      expect(escapeDqlString(String.raw`a\b "c"`)).toBe(String.raw`a\\b \"c\"`);
    });

    test("replaces newlines with spaces", () => {
      expect(escapeDqlString("line1\nline2")).toBe("line1 line2");
    });
  });

  describe("parseTeamsMap", () => {
    test("returns fallback record when teams are undefined", () => {
      expect(parseTeamsMap(undefined)).toBe(
        `record(service.name = "__no_match__", team = "")`,
      );
    });

    test("returns fallback record when there are no services", () => {
      const teams: Team[] = [
        { id: "1", name: "A", services: [], version: "1" },
        { id: "2", name: "B", services: [], version: "1" },
      ];

      expect(parseTeamsMap(teams)).toBe(`record(service.name = "__no_match__", team = "")`);
    });

    test("deduplicates services and keeps first team mapping", () => {
      const teams: Team[] = [
        { id: "1", name: "Team A", services: ["svc-a", "svc-b"], version: "1" },
        { id: "2", name: "Team B", services: ["svc-b", "svc-c"], version: "1" },
      ];

      const out = parseTeamsMap(teams);

      expect(out).toContain(`record(service.name = "svc-a", team = "Team A")`);
      expect(out).toContain(`record(service.name = "svc-b", team = "Team A")`);
      expect(out).toContain(`record(service.name = "svc-c", team = "Team B")`);
      expect(out).not.toContain(`record(service.name = "svc-b", team = "Team B")`);
    });

    test("sorts output records by service name", () => {
      const teams: Team[] = [
        { id: "1", name: "Team A", services: ["z-service", "a-service"], version: "1" },
      ];

      const out = parseTeamsMap(teams);
      const idxA = out.indexOf(`service.name = "a-service"`);
      const idxZ = out.indexOf(`service.name = "z-service"`);

      expect(idxA).toBeGreaterThanOrEqual(0);
      expect(idxZ).toBeGreaterThanOrEqual(0);
      expect(idxA).toBeLessThan(idxZ);
    });

    test("escapes service and team names for DQL", () => {
      const teams: Team[] = [
        {
          id: "1",
          name: `Team "A"`,
          services: [String.raw`svc\name`, "line\nbreak"],
          version: "1",
        },
      ];

      const out = parseTeamsMap(teams);

      expect(out).toContain(String.raw`service.name = "svc\\name"`);
      expect(out).toContain(`team = "Team \\"A\\""`);
      expect(out).toContain(`service.name = "line break"`);
    });

    test("ignores empty service names", () => {
      const teams: Team[] = [
        { id: "1", name: "Team A", services: ["", "  ", "svc-ok"], version: "1" },
      ];

      const out = parseTeamsMap(teams);

      expect(out).toContain(`service.name = "svc-ok"`);
      expect(out).not.toContain(`service.name = ""`);
    });
  });
});
