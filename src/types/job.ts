export type ApplicationStatus =
  | 'queued'
  | 'applied'
  | 'viewed'
  | 'follow_up_scheduled'
  | 'follow_up_sent'
  | 'interview_request'
  | 'technical_interview'
  | 'offer'
  | 'rejected';

export type JobPlatform = 'linkedin' | 'indeed' | 'greenhouse' | 'lever' | 'workday' | 'glassdoor' | 'direct_email';

export interface ScreeningAnswers {
  authorizedInUS: boolean;
  requiresSponsorship: boolean;
  noticePeriod: string;
  desiredSalaryMin: number;
  desiredSalaryMax: number;
  remotePreference: 'remote_only' | 'hybrid' | 'any';
  yearsOfExperience: number;
  willingToRelocate: boolean;
  clearanceLevel: string;
}

export interface ResumeVersion {
  id: string;
  name: string; // e.g. "Full-Stack Specialist", "Engineering Manager", "Frontend & UI/UX"
  targetRole?: string;
  fileName: string;
  uploadedAt: string;
  rawText: string;
  skills: string[];
  summary?: string;
  isDefault?: boolean;
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  targetTitles: string[];
  summary: string;
  primarySkills: string[];
  experienceYears: string | number;
  experienceHistory: {
    role: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: string;
  rawResumeText?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  screeningAnswers: ScreeningAnswers;
  // Multiple resume versions support
  resumeVersions?: ResumeVersion[];
  activeResumeId?: string;
}

export interface ConnectedAccount {
  id: string;
  name: string;
  type: JobPlatform;
  connected: boolean;
  usernameOrEmail: string;
  statusText: string;
  dailyQuota: number;
  dailyUsed: number;
  lastSyncAt: string;
  requiresAttention?: boolean;
}

export interface JobFilterConfig {
  targetTitles: string[];
  locations: string[];
  remoteOnly: boolean;
  minMatchScore: number; // e.g. 75
  minSalary: number; // e.g. 120000
  whitelistedCompanies: string[];
  blacklistedCompanies: string[];
  blacklistedKeywords: string[];
  onlyDirectCompanyEmails: boolean;
  autoSendFollowUp: boolean;
  followUpDaysAfter: number; // e.g. 5 days
}

export interface ApplicationTimelineEvent {
  id: string;
  type: 'queued' | 'submitted' | 'viewed' | 'follow_up' | 'interview_invite' | 'status_change' | 'recruiter_note';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface JobApplication {
  id: string;
  company: string;
  companyDomain?: string;
  jobTitle: string;
  location: string;
  salaryRange?: string;
  platform: JobPlatform;
  jobUrl: string;
  appliedDate: string; // ISO string
  status: ApplicationStatus;
  matchScore: number; // 0 - 100
  matchedSkills: string[];
  missingSkills?: string[];
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterTitle?: string;
  tailoredCoverLetter: string;
  screeningAnswersUsed?: Partial<ScreeningAnswers>;
  atsConfirmationId?: string;
  resumeVersionId?: string;
  resumeVersionName?: string;
  followUpDueDate?: string;
  followUpSentDate?: string;
  notes: string;
  timeline: ApplicationTimelineEvent[];
  interviewDate?: string;
  rejectionReason?: string;
}

export interface NotificationItem {
  id: string;
  applicationId?: string;
  company: string;
  jobTitle: string;
  type: 'interview_request' | 'viewed' | 'follow_up_due' | 'rejection' | 'auto_applied';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  company: string;
  jobTitle: string;
  platform: JobPlatform;
  matchScore: number;
  status: 'success' | 'filtered_out' | 'in_progress' | 'queued' | 'failed';
  details: string;
}
