 export function buildQuery(recordsString: string) {
  return `
fetch logs, from:-1d, to: now()
| fieldsAdd service.name
| filter isNotNull(service.name)
| filter matchesValue(loglevel, "ERROR")
| fieldsKeep timestamp, content, service.name
| lookup [ data ${recordsString} ],
    sourceField:service.name,
    lookupField:service.name,
    fields:{team}
| sort timestamp desc
| limit 20
`;
}