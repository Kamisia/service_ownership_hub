import type { Service, ServiceId } from "./types";

export const now = () => new Date().toISOString();
export const normalize = (s: string) => s.trim();
export const key = (s: string) => normalize(s).toLowerCase();

export const makeId = (): string =>
  typeof crypto !== "undefined" &&
  "randomUUID" in crypto &&
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;

export function addServiceUnique(list: Service[], name: string): Service[] {
  const n = normalize(name);
  if (!n) return list;
  if (list.some((s) => key(s.name) === key(n))) return list;

  const ts = now();
  return [...list, { id: makeId(), name: n, createdAt: ts, updatedAt: ts }];
}

export function removeService(list: Service[], sid: ServiceId): Service[] {
  return list.filter((s) => s.id !== sid);
}

export function isTeamNameTaken(existing: string[], name: string): boolean {
  const n = key(name);
  return existing.some((x) => key(x) === n);
}
