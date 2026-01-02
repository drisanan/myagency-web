export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  buttonText?: string;
  textPrimary?: string;
  textSecondary?: string;
  linkColor?: string;
  contentBg?: string;
  cardBg?: string;
  navText?: string;
  navActiveText?: string;
  navHoverBg?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  borderColor?: string;
  dividerColor?: string;
  logoDataUrl?: string;
};

export type SessionContext = {
  agencyId: string;
  agencyEmail?: string;
  role: 'agency' | 'athlete' | 'admin' | 'client';
  userId?: string;
  clientId?: string;
  firstName?: string;
  lastName?: string;
  agencyLogo?: string;
  agencySettings?: AgencySettings;
};

export type ClientRecord = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI3PK?: string;  // USERNAME#<username> for vanity URL lookups
  GSI3SK?: string;  // CLIENT#<id>
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  agencyId: string;
  agencyEmail?: string;
  phone?: string;
  username?: string;        // Vanity URL slug (e.g., "drisanjames")
  galleryImages?: string[]; // Array of image URLs for profile gallery
  radar?: Record<string, unknown>; // Extended profile data
  accessCodeHash?: string;
  authEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AgentRecord = {
  PK: string;         // AGENCY#<agencyId>
  SK: string;         // AGENT#<id>
  id: string;
  agencyId: string;
  agencyEmail?: string;
  firstName: string;
  lastName: string;
  email: string;      // Agent's email (used for sending)
  role?: string;      // e.g., "Recruiting Coordinator", "Head Coach"
  createdAt: number;
  updatedAt: number;
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

