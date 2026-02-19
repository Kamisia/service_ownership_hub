export function servicesQuery(){
    return `
   fetch logs, from:-4d, to:now()
    | filter isNotNull(service.name)
    | fieldsKeep service.name
    | dedup service.name
    `;
}