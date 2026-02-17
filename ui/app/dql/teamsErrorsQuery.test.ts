import { buildQuery } from "./teamsErrorsQuery";

describe("dql/teamsErrorsQuery", () => {
  test("buildQuery injects records string into lookup data section", () => {
    const recordsString =
      'record(service.name = "auth-service", team = "Platform Team")';

    const query = buildQuery(recordsString);

    expect(query).toContain(`lookup [ data ${recordsString} ],`);
  });

  test("buildQuery contains expected filters, sort, and limit 20", () => {
    const query = buildQuery('record(service.name = "__no_match__", team = "")');

    expect(query).toContain("fetch logs, from:-1d, to: now()");
    expect(query).toContain("| filter isNotNull(service.name)");
    expect(query).toContain('| filter matchesValue(loglevel, "ERROR")');
    expect(query).toContain("| fieldsKeep timestamp, content, service.name");
    expect(query).toContain("sourceField:service.name");
    expect(query).toContain("lookupField:service.name");
    expect(query).toContain("fields:{team}");
    expect(query).toContain("| sort timestamp desc");
    expect(query).toContain("| limit 20");
  });
});
