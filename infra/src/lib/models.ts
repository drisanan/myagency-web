export type SubscriptionLevel = 'starter' | 'unlimited';

export const STARTER_USER_LIMIT = 25;

export type ProgramLevelConfig = {
  value: string;      // Internal key (e.g., 'bronze', 'tier1')
  label: string;      // Display name (e.g., 'Bronze', 'Basic Plan')
  color: string;      // Hex color for UI
};

export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  headerBg?: string;
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
  preferredSport?: string;
  // Program level customization
  programLevels?: ProgramLevelConfig[];
};

export type AgencyRecord = {
  PK: string;                          // AGENCY#<id>
  SK: string;                          // PROFILE
  GSI1PK: string;                      // EMAIL#<email>
  GSI1SK: string;                      // AGENCY#<id>
  GSI2PK?: string;                     // SLUG#<slug> for friendly name lookup
  GSI2SK?: string;                     // AGENCY#<id>
  id: string;
  name: string;
  email: string;
  slug?: string;                       // Friendly identifier (e.g., "myrecruiteragency")
  settings?: AgencySettings;
  subscriptionLevel?: SubscriptionLevel;  // Default: 'starter'
  deletedAt?: string;
  createdAt?: number;
};

export type SessionContext = {
  agencyId: string;
  agencyEmail?: string;
  email?: string;
  role: 'agency' | 'athlete' | 'admin' | 'client' | 'agent';
  userId?: string;
  clientId?: string;
  agentId?: string;          // Set when logged in as agent
  agentEmail?: string;       // Agent's email for audit
  firstName?: string;
  lastName?: string;
  agencyLogo?: string;
  agencySettings?: AgencySettings;
  subscriptionLevel?: SubscriptionLevel;
  currentUserCount?: number;
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
  // --- NEW CRM FIELDS ---
  programLevel?: ProgramLevel;    // Service tier: bronze, silver, gold, platinum
  accountStatus?: AccountStatus;  // active, paused, suspended
  pausedAt?: string;              // When account was paused
  pausedReason?: string;          // Why account was paused
  agentGmailLinked?: boolean;     // Agent's Gmail linked during setup
  lastActivityAt?: number;        // Last login/action timestamp
  profileViewCount?: number;      // Cached count of profile views
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type AgentRecord = {
  PK: string;         // AGENCY#<agencyId>
  SK: string;         // AGENT#<id>
  id: string;
  agencyId: string;
  agencyEmail?: string;
  firstName: string;
  lastName: string;
  email: string;           // Agent's email (used for login + sending)
  phone?: string;          // For login verification
  role?: string;           // e.g., "Recruiting Coordinator", "Head Coach"
  isAdmin?: boolean;       // Can this agent manage other agents?
  accessCodeHash?: string; // Hashed access code for login
  authEnabled?: boolean;   // Can this agent log in?
  lastLoginAt?: number;    // Track login activity
  deletedAt?: string;      // Soft delete
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

export type ListAssignmentRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // LIST_ASSIGN#<listId>#<clientId>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // LIST_ASSIGN#<listId>
  id: string;
  agencyId: string;
  listId: string;
  clientId: string;
  assignedBy?: string;
  assignedAt: number;
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
  assigneeClientId?: string | null;   // Assign to athlete/client
  assigneeAgentId?: string | null;    // Assign to agent
  agencyId: string;
  agencyEmail?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;
};

// ============================================
// Email Analytics & Link Tracking Types
// ============================================

export type EmailSendRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // EMAIL_SEND#<timestamp>#<uuid>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // EMAIL_SEND#<timestamp>
  clientId: string;
  clientEmail: string;
  recipientEmail: string;
  recipientName?: string;
  university?: string;
  subject?: string;
  draftId?: string;
  campaignId?: string;
  sentAt: number;
  createdAt: number;
};

export type EmailOpenRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // EMAIL_OPEN#<timestamp>#<uuid>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // EMAIL_OPEN#<timestamp>
  clientId: string;
  clientEmail: string;
  recipientEmail: string;
  university?: string;
  campaignId?: string;
  openedAt: number;
  userAgent?: string;
  ipAddress?: string;
  createdAt: number;
};

export type EmailClickRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // EMAIL_CLICK#<timestamp>#<uuid>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // EMAIL_CLICK#<timestamp>
  clientId: string;
  clientEmail: string;
  recipientEmail: string;
  destination: string;
  linkType?: 'profile' | 'hudl' | 'youtube' | 'instagram' | 'article' | 'other';
  university?: string;
  campaignId?: string;
  clickedAt: number;
  userAgent?: string;
  ipAddress?: string;
  createdAt: number;
};

export type EmailStatsRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // EMAIL_STATS#<clientId>#<YYYY-MM>
  clientId: string;
  period: string;                // YYYY-MM
  sentCount: number;
  clickCount: number;
  uniqueRecipients?: number;
  uniqueClickers?: number;
  topUniversities?: Array<{ name: string; sent: number; clicks: number }>;
  updatedAt: number;
};

// ============================================
// Program Levels & Account Status
// ============================================

export type ProgramLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AccountStatus = 'active' | 'paused' | 'suspended';

// ============================================
// Coach Notes - Associated with Coach/School
// ============================================

export type CoachNoteRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // COACH_NOTE#<noteId>
  GSI2PK?: string;               // COACH#<coachEmail> for coach lookup
  GSI2SK?: string;               // COACH_NOTE#<noteId>
  id: string;
  agencyId: string;
  agencyEmail?: string;
  coachEmail: string;            // Coach this note is about
  coachName?: string;
  university?: string;           // School/university name
  athleteId?: string;            // Optional: link to specific athlete context
  author: string;                // Agent email who created note
  title?: string;
  body: string;
  type?: 'call' | 'email' | 'meeting' | 'other';
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;            // Soft delete timestamp
};

// ============================================
// Task Templates - Reusable Task Groups
// ============================================

export type TaskTemplateItem = {
  title: string;
  description?: string;
  daysFromAssignment?: number;   // Due X days after template is applied
  priority?: number;             // 1-5, higher = more important
};

export type TaskTemplateRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // TASK_TEMPLATE#<templateId>
  id: string;
  agencyId: string;
  agencyEmail?: string;
  name: string;                  // e.g., "Gold Program Onboarding"
  description?: string;
  programLevel?: ProgramLevel;   // Auto-assign when client joins this level
  tasks: TaskTemplateItem[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;
};

// ============================================
// Communication Hub - Agent/Athlete/Coach
// ============================================

export type CommunicationType = 'agent_to_athlete' | 'athlete_to_agent' | 'agent_to_coach' | 'coach_to_athlete' | 'athlete_to_coach';

export type CommunicationRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // COMM#<timestamp>#<uuid>
  GSI2PK?: string;               // For thread lookups: THREAD#<threadId>
  GSI2SK?: string;               // COMM#<timestamp>
  GSI3PK?: string;               // CLIENT#<clientId> for athlete comm lookup
  GSI3SK?: string;               // COMM#<timestamp>
  id: string;
  agencyId: string;
  threadId?: string;             // Groups related messages
  type: CommunicationType;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  toName?: string;
  athleteId?: string;            // Link to athlete if applicable
  coachEmail?: string;           // Coach involved if applicable
  university?: string;
  subject?: string;
  body: string;
  isRead?: boolean;
  attachments?: string[];
  createdAt: number;
};

// ============================================
// Email Drip Campaigns
// ============================================

export type DripEmailStep = {
  id: string;
  dayOffset: number;             // Days from campaign start
  subject: string;
  body: string;
  templateId?: string;           // Reference to email template
};

export type EmailDripRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // EMAIL_DRIP#<dripId>
  id: string;
  agencyId: string;
  agencyEmail?: string;
  name: string;
  description?: string;
  isActive: boolean;
  senderClientId?: string;
  triggerEvent?: 'signup' | 'program_change' | 'manual';
  programLevel?: ProgramLevel;   // Auto-start for this program level
  steps: DripEmailStep[];
  createdAt: number;
  updatedAt: number;
};

export type DripEnrollmentRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // DRIP_ENROLL#<dripId>#<clientId>
  dripId: string;
  clientId: string;
  agencyId: string;
  currentStepIndex: number;
  startedAt: number;
  lastSentAt?: number;
  nextSendAt?: number;
  completedAt?: number;
  pausedAt?: number;
};

// ============================================
// Profile Views Tracking
// ============================================

export type ProfileViewRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // PROFILE_VIEW#<timestamp>#<uuid>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // PROFILE_VIEW#<timestamp>
  id: string;
  agencyId: string;
  clientId: string;              // Athlete whose profile was viewed
  viewerEmail?: string;          // Coach email if known
  viewerName?: string;
  university?: string;
  position?: string;             // Coach position
  viewedAt: number;
  source?: 'email_link' | 'direct' | 'search';
  referrer?: string;
};

// ============================================
// Meeting Requests
// ============================================

export type MeetingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export type MeetingRequestRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // MEETING#<meetingId>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // MEETING#<scheduledAt>
  id: string;
  agencyId: string;
  clientId: string;              // Athlete involved
  requestedBy: 'agent' | 'athlete';
  agentEmail?: string;
  athleteEmail?: string;
  title: string;
  description?: string;
  scheduledAt?: number;          // Confirmed time
  proposedTimes?: number[];      // Options for scheduling
  duration?: number;             // Minutes
  meetingLink?: string;          // Zoom/Google Meet link
  status: MeetingStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

// ============================================
// Activity Logging
// ============================================

export type ActivityType = 
  | 'login'
  | 'profile_update'
  | 'task_completed'
  | 'email_sent'
  | 'email_opened'
  | 'profile_viewed_by_coach'
  | 'list_created'
  | 'meeting_requested'
  | 'form_submitted';

export type ActivityLogRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // ACTIVITY#<timestamp>#<uuid>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // ACTIVITY#<timestamp>
  id: string;
  agencyId: string;
  clientId?: string;             // Athlete if applicable
  agentId?: string;              // Agent if applicable
  actorEmail: string;
  actorType: 'agent' | 'athlete' | 'coach' | 'system';
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
};

// ============================================
// Campaigns
// ============================================

export type CampaignRecipient = {
  email: string;
  name?: string;
  university?: string;
};

export type CampaignRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // CAMPAIGN#<campaignId>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // CAMPAIGN#<timestamp>
  id: string;
  agencyId: string;
  clientId: string;
  agentId?: string;
  agentEmail?: string;
  agentName?: string;
  campaignName?: string;
  subject: string;
  html: string;
  recipients: CampaignRecipient[];
  senderClientId: string;
  personalizedMessage?: string;
  scheduledAt?: number;
  sentAt?: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: number;
  updatedAt: number;
};

// ============================================
// Automated Campaign Follow-ups
// ============================================

export type CampaignFollowupRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // CAMPAIGN_FOLLOWUP#<campaignId>
  id: string;
  agencyId: string;
  clientId: string;
  campaignName?: string;
  emailsSent: number;
  openRate?: number;
  clickRate?: number;
  profileViews?: number;
  scheduledFor: number;          // 48 hours after campaign
  sentAt?: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt: number;
};

// ============================================
// Update Form Submissions
// ============================================

export type UpdateFormRecord = {
  PK: string;                    // AGENCY#<agencyId>
  SK: string;                    // UPDATE_FORM#<timestamp>#<clientId>
  GSI3PK?: string;               // CLIENT#<clientId>
  GSI3SK?: string;               // UPDATE_FORM#<timestamp>
  id: string;
  agencyId: string;
  clientId: string;
  size?: {
    height?: string;
    weight?: string;
    wingspan?: string;
  };
  speed?: {
    fortyYard?: string;
    shuttle?: string;
    vertical?: string;
  };
  academics?: {
    gpa?: string;
    satScore?: string;
    actScore?: string;
    classRank?: string;
  };
  upcomingEvents?: Array<{
    name: string;
    date: string;
    location?: string;
  }>;
  highlightVideo?: string;
  schoolInterests?: string[];
  notes?: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
};
