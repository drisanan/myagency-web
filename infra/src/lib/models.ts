export type SessionContext = {
  agencyId: string;
  agencyEmail?: string;
  role: 'agency' | 'athlete' | 'admin' | 'client';
  userId?: string;
  clientId?: string;
  firstName?: string;
  lastName?: string;
  agencyLogo?: string;
  agencySettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
};

export type ClientRecord = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  agencyId: string;
  agencyEmail?: string;
  phone?: string;
  accessCodeHash?: string;
  authEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CoachListRecord = {
  PK: string;
  SK: string;
  id: string;
  name: string;
  agencyId: string;
  agencyEmail?: string;
  clientId?: string;
  type?: 'CLIENT_INTEREST' | 'AGENCY_LIST';
  items: any[];
  createdAt: number;
  updatedAt: number;
};

export type FormSubmissionRecord = {
  PK: string;
  SK: string;
  id: string;
  agencyId: string;
  agencyEmail?: string;
  data: any;
  createdAt: number;
  consumed?: boolean;
  ttl?: number;
};

export type GmailTokenRecord = {
  PK: string;
  SK: string;
  clientId: string;
  agencyId: string;
  tokens: any;
  createdAt: number;
};

export type TaskRecord = {
  PK: string;
  SK: string;
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueAt?: number;
  assigneeClientId?: string | null;
  agencyId: string;
  agencyEmail?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;
};

