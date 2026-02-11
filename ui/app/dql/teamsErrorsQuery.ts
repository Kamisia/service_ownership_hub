export const teamsErrorsQuery = `
fetch logs
| fieldsAdd service.name
| filter isNotNull(service.name)
| filter matchesValue(loglevel, "ERROR")
| fieldsKeep timestamp, content, service.name
| lookup [
    data record(service.name = "cartservice", team = "Carters"),
         record(service.name = "my.totalservicemeltdown", team = "Core system administrators (https://core.mycompany.com/contact")
    ],
    sourceField:service.name,
    lookupField:service.name,
    fields:{team}
| limit 20
`;
