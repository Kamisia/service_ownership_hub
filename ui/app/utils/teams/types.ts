export type TeamId = string;
export type ServiceId = string;

export class Service {
  id: ServiceId;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export class Team {
  id: TeamId;
  name: string;
  services: string[];
  createdAt: string;
  updatedAt?: string;
}
