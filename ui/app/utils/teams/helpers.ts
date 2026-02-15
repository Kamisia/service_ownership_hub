export const now = () => new Date().toISOString();
export const normalize = (s: string) => s.trim();
export const key = (s: string) => normalize(s).toLowerCase();

export const makeId = (): string =>
  typeof crypto !== "undefined" &&
  "randomUUID" in crypto &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;

export function addServiceUnique(list: string[], name: string): string[] {
  const n = normalize(name);
  if (!n) return list;
  if (list.some((s) => key(s) === key(n))) return list;

  return [...list, name];
}

export function removeService(list: string[], service: string): string[] {
  return list.filter((s) => s !== service);
}

export function isTeamNameTaken(existing: string[], name: string): boolean {
  const n = key(name);
  return existing.some((x) => key(x) === n);
}
