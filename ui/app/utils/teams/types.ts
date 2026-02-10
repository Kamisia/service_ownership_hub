export type TeamId = string;
export type ServiceId = string;

export interface Service {
  id: ServiceId;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Team {
  id: TeamId;
  name: string;
  services: Service[];
  createdAt: string;
  updatedAt?: string;
}
