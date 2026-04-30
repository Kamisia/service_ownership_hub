export const DEFAULT_SERVICE_SUGGESTIONS_LOOKBACK = "-7d";
export const DEFAULT_SERVICE_SUGGESTIONS_LIMIT = 250;

export function servicesQuery(
  lookback = DEFAULT_SERVICE_SUGGESTIONS_LOOKBACK,
  limit = DEFAULT_SERVICE_SUGGESTIONS_LIMIT,
) {
  return `
fetch logs, from:${lookback}, to:now()
| filter isNotNull(service.name)
| fieldsKeep service.name
| dedup service.name
| sort service.name asc
| limit ${limit}
`;
}
