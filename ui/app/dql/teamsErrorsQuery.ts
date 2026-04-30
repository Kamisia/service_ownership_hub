export const DEFAULT_ERRORS_LOOKBACK = "-24h";
export const DEFAULT_ERRORS_LIMIT = 100;

export function buildQuery(
  recordsString: string,
  lookback = DEFAULT_ERRORS_LOOKBACK,
  limit = DEFAULT_ERRORS_LIMIT,
) {
  return `
fetch logs, from:${lookback}, to: now()
| fieldsAdd service.name
| filter isNotNull(service.name)
| filter matchesValue(loglevel, "ERROR")
| fieldsKeep timestamp, content, service.name
| lookup [ data ${recordsString} ],
    sourceField:service.name,
    lookupField:service.name,
    fields:{team}
| sort timestamp desc
| limit ${limit}
`;
}
