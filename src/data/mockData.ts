import {
  CandidateProfile,
  ConnectedAccount,
  JobFilterConfig,
  JobApplication,
  NotificationItem,
  DispatchLogEntry,
} from '../types/job';

// Blank initial candidate profile ready for the user to upload their resume
export const INITIAL_PROFILE: CandidateProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedInUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  targetTitles: [],
  summary: '',
  primarySkills: [],
  experienceYears: '',
  experienceHistory: [],
  education: '',
  rawResumeText: '',
  resumeFileName: '',
  resumeUploadedAt: '',
  resumeVersions: [],
  activeResumeId: '',
  screeningAnswers: {
    authorizedInUS: true,
    requiresSponsorship: false,
    noticePeriod: 'Immediate',
    desiredSalaryMin: 120000,
    desiredSalaryMax: 160000,
    remotePreference: 'remote_only' as const,
    yearsOfExperience: 3,
    willingToRelocate: false,
    clearanceLevel: 'None',
  },
};

// Initial accounts ready for the user to connect on their own
export const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc-linkedin',
    name: 'LinkedIn Easy Apply',
    type: 'linkedin',
    connected: false,
    usernameOrEmail: '',
    statusText: 'Not Connected',
    dailyQuota: 25,
    dailyUsed: 0,
    lastSyncAt: '',
  },
  {
    id: 'acc-greenhouse',
    name: 'Greenhouse & Lever Direct ATS',
    type: 'greenhouse',
    connected: false,
    usernameOrEmail: '',
    statusText: 'Not Connected',
    dailyQuota: 30,
    dailyUsed: 0,
    lastSyncAt: '',
  },
  {
    id: 'acc-indeed',
    name: 'Indeed Direct Apply',
    type: 'indeed',
    connected: false,
    usernameOrEmail: '',
    statusText: 'Not Connected',
    dailyQuota: 20,
    dailyUsed: 0,
    lastSyncAt: '',
  },
  {
    id: 'acc-email-sync',
    name: 'Google Mail Follow-up & Inbox Sync',
    type: 'direct_email',
    connected: false,
    usernameOrEmail: '',
    statusText: 'Not Connected',
    dailyQuota: 50,
    dailyUsed: 0,
    lastSyncAt: '',
  },
  {
    id: 'acc-workday',
    name: 'Workday Careers',
    type: 'workday',
    connected: false,
    usernameOrEmail: '',
    statusText: 'Not Connected',
    dailyQuota: 15,
    dailyUsed: 0,
    lastSyncAt: '',
  },
];

// Clean initial matching criteria
export const INITIAL_FILTER_CONFIG: JobFilterConfig = {
  targetTitles: [],
  locations: ['Remote'],
  remoteOnly: true,
  minMatchScore: 75,
  minSalary: 120000,
  whitelistedCompanies: [],
  blacklistedCompanies: [],
  blacklistedKeywords: [],
  onlyDirectCompanyEmails: true,
  autoSendFollowUp: true,
  followUpDaysAfter: 5,
};

// Completely empty collections for testing on your own
export const INITIAL_APPLICATIONS: JobApplication[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_DISPATCH_LOGS: DispatchLogEntry[] = [];

// Sample resumes available in the Resume Modal if the user wants quick test templates
export const SAMPLE_RESUMES = {
  fullstack: {
    label: 'Senior Full-Stack Engineer Sample',
    fileName: 'Alex_Chen_Staff_Engineer_Resume.pdf',
    text: `ALEX CHEN
San Francisco, CA | alex.chen.dev@gmail.com | (415) 890-2341 | linkedin.com/in/alexchen-eng

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 7+ years of building high-scale distributed web applications, developer platforms, and cloud infrastructure.

CORE COMPETENCIES & TECHNICAL SKILLS
- Frontend: TypeScript, React 19, Next.js, Vue, Tailwind CSS, GraphQL
- Backend & Cloud: Node.js, Go, Python, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS, GCP

EXPERIENCE
Staff Software Engineer | Nexus Cloud Platform (2022 - Present)
- Architected analytics engine processing 40M+ daily events with sub-100ms response times.
Senior Full-Stack Engineer | Quantum Analytics (2019 - 2022)
- Re-architected primary React web portal boosting conversion by 28%.`,
    parsed: {
      fullName: 'Alex Chen',
      email: 'alex.chen.dev@gmail.com',
      phone: '+1 (415) 890-2341',
      location: 'San Francisco, CA (Open to Remote)',
      linkedInUrl: 'https://linkedin.com/in/alexchen-eng',
      githubUrl: 'https://github.com/alexchen-dev',
      portfolioUrl: 'https://alexchen.dev',
      targetTitles: ['Senior Full-Stack Engineer', 'Staff Software Engineer', 'Lead Backend Engineer'],
      summary: 'Senior Full-Stack Engineer with 7+ years building high-scale distributed web applications, developer platforms, and cloud infrastructure.',
      primarySkills: ['TypeScript', 'React', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS'],
      experienceYears: '7+ years',
      experienceHistory: [
        {
          role: 'Staff Software Engineer',
          company: 'Nexus Cloud Platform',
          period: '2022 - Present',
          highlights: ['Architected analytics engine processing 40M+ daily events'],
        },
      ],
      education: 'B.S. in Computer Science, UC Berkeley',
      screeningAnswers: {
        authorizedInUS: true,
        requiresSponsorship: false,
        noticePeriod: '2 weeks',
        desiredSalaryMin: 155000,
        desiredSalaryMax: 195000,
        remotePreference: 'remote_only' as const,
        yearsOfExperience: 7,
        willingToRelocate: false,
        clearanceLevel: 'None',
      },
    },
  },
  product: {
    label: 'Senior Product Manager Sample',
    fileName: 'Sarah_Miller_Senior_PM.pdf',
    text: `SARAH MILLER
New York, NY | sarah.miller.pm@gmail.com | (212) 555-8910

PROFESSIONAL SUMMARY
Data-driven Senior Product Manager with 6+ years delivering growth and enterprise SaaS products.

CORE SKILLS
Product Strategy, Growth Experiments, Agile Scrum, SQL, Amplitude, Roadmapping, PRD Development.`,
    parsed: {
      fullName: 'Sarah Miller',
      email: 'sarah.miller.pm@gmail.com',
      phone: '+1 (212) 555-8910',
      location: 'New York, NY (Hybrid & Remote)',
      linkedInUrl: 'https://linkedin.com/in/sarahmiller-pm',
      targetTitles: ['Senior Product Manager', 'Lead PM', 'Director of Product'],
      summary: 'Data-driven Senior Product Manager with 6+ years delivering enterprise SaaS and growth products.',
      primarySkills: ['Product Strategy', 'Growth Experimentation', 'SQL & Analytics', 'Amplitude', 'Roadmapping'],
      experienceYears: '6+ years',
      experienceHistory: [
        {
          role: 'Lead Product Manager',
          company: 'Pulse Workspaces',
          period: '2022 - Present',
          highlights: ['Grew self-serve ARR from $4M to $11M in 18 months'],
        },
      ],
      education: 'B.A. in Economics & HCI, Columbia University',
      screeningAnswers: {
        authorizedInUS: true,
        requiresSponsorship: false,
        noticePeriod: '3 weeks',
        desiredSalaryMin: 160000,
        desiredSalaryMax: 200000,
        remotePreference: 'any' as const,
        yearsOfExperience: 6,
        willingToRelocate: false,
        clearanceLevel: 'None',
      },
    },
  },
  frontend: {
    label: 'Lead Frontend & UI/UX Specialist Sample',
    fileName: 'Jordan_Taylor_Lead_Frontend_Engineer.pdf',
    text: `JORDAN TAYLOR
Seattle, WA | jordan.taylor.ui@gmail.com | (206) 441-9082 | github.com/jordantaylor-ui

PROFESSIONAL SUMMARY
Staff Frontend Engineer & Design Technologist with 6+ years designing accessible, high-performance design systems, React web apps, and web applications.

CORE COMPETENCIES & TECHNICAL SKILLS
- Frontend: TypeScript, React 19, Next.js, Tailwind CSS, WebGL, Canvas, Vite, State Management, Accessibility (a11y)
- Tooling: Design Systems, Figma to Code, Performance Profiling, Jest, Playwright, Storybook`,
    parsed: {
      fullName: 'Jordan Taylor',
      email: 'jordan.taylor.ui@gmail.com',
      phone: '+1 (206) 441-9082',
      location: 'Seattle, WA (Remote US & Canada)',
      linkedInUrl: 'https://linkedin.com/in/jordantaylor-ui',
      githubUrl: 'https://github.com/jordantaylor-ui',
      targetTitles: ['Staff Frontend Engineer', 'Principal UI/UX Engineer', 'Design Technologist'],
      summary: 'Staff Frontend Engineer with 6+ years building world-class web applications, responsive component design systems, and fast client-side platforms.',
      primarySkills: ['TypeScript', 'React 19', 'Tailwind CSS', 'Next.js', 'Design Systems', 'Performance Optimization', 'Figma'],
      experienceYears: '6+ years',
      experienceHistory: [
        {
          role: 'Staff Frontend Engineer',
          company: 'Aura Interactive',
          period: '2021 - Present',
          highlights: ['Built global design system used across 14 product lines', 'Reduced bundle size by 44% and improved Core Web Vitals'],
        },
      ],
      education: 'B.S. in Human-Computer Interaction, University of Washington',
      screeningAnswers: {
        authorizedInUS: true,
        requiresSponsorship: false,
        noticePeriod: 'Immediate',
        desiredSalaryMin: 165000,
        desiredSalaryMax: 205000,
        remotePreference: 'remote_only' as const,
        yearsOfExperience: 6,
        willingToRelocate: false,
        clearanceLevel: 'None',
      },
    },
  },
};

// Available live jobs feed ready to be matched and auto-applied when the user triggers the engine
export const AVAILABLE_JOB_FEED = [
  {
    company: 'Anthropic',
    companyDomain: 'anthropic.com',
    jobTitle: 'Full-Stack Software Engineer, Claude Web Platform',
    location: 'Remote (US/Canada)',
    salaryRange: '$185,000 - $240,000 + Equity',
    platform: 'greenhouse' as const,
    jobUrl: 'https://anthropic.com/careers/fullstack-claude-web',
    matchScore: 95,
    matchedSkills: ['TypeScript', 'React', 'Next.js', 'Distributed Systems', 'Tailwind CSS', 'API Design'],
    missingSkills: ['PyTorch basics'],
    recruiterName: 'Julian Croft',
    recruiterEmail: 'julian.croft@anthropic.com',
  },
  {
    company: 'Postman',
    companyDomain: 'postman.com',
    jobTitle: 'Senior Engineer, API Workspaces & Tooling',
    location: 'Remote (US)',
    salaryRange: '$165,000 - $195,000',
    platform: 'lever' as const,
    jobUrl: 'https://postman.com/careers/senior-engineer-workspaces',
    matchScore: 92,
    matchedSkills: ['Node.js', 'TypeScript', 'API Design', 'PostgreSQL', 'Docker'],
    missingSkills: ['Electron internals'],
    recruiterName: 'Priya Sharma',
    recruiterEmail: 'priya.sharma@postman.com',
  },
  {
    company: 'Linear',
    companyDomain: 'linear.app',
    jobTitle: 'Senior Full-Stack Engineer, Core Workflows',
    location: 'Remote (Worldwide)',
    salaryRange: '$170,000 - $210,000 + Equity',
    platform: 'lever' as const,
    jobUrl: 'https://linear.app/careers/senior-fullstack',
    matchScore: 93,
    matchedSkills: ['TypeScript', 'React', 'Tailwind CSS', 'GraphQL', 'High Performance UI'],
    missingSkills: [],
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'elena@linear.app',
  },
  {
    company: 'Figma',
    companyDomain: 'figma.com',
    jobTitle: 'Senior Full-Stack Engineer, Collaboration',
    location: 'Remote (US)',
    salaryRange: '$175,000 - $215,000',
    platform: 'greenhouse' as const,
    jobUrl: 'https://careers.figma.com/jobs/senior-fullstack-collaboration',
    matchScore: 96,
    matchedSkills: ['TypeScript', 'React', 'WebSockets', 'Tailwind CSS', 'System Architecture'],
    missingSkills: [],
    recruiterName: 'Maya Thorne',
    recruiterEmail: 'mthorne@figma.com',
  },
  {
    company: 'Stripe',
    companyDomain: 'stripe.com',
    jobTitle: 'Software Engineer, Integrations & Platform',
    location: 'Remote (US / Canada)',
    salaryRange: '$180,000 - $230,000',
    platform: 'linkedin' as const,
    jobUrl: 'https://stripe.com/jobs/software-engineer-platform',
    matchScore: 91,
    matchedSkills: ['Node.js', 'TypeScript', 'PostgreSQL', 'API Design'],
    missingSkills: ['Ruby'],
    recruiterName: 'David Vance',
    recruiterEmail: 'dvance@stripe.com',
  },
  {
    company: 'Tailwind Labs',
    companyDomain: 'tailwindcss.com',
    jobTitle: 'Frontend & UI Framework Engineer',
    location: 'Remote (Worldwide)',
    salaryRange: '$160,000 - $200,000',
    platform: 'direct_email' as const,
    jobUrl: 'https://tailwindcss.com/jobs/framework-engineer',
    matchScore: 97,
    matchedSkills: ['Tailwind CSS', 'TypeScript', 'React', 'Developer Experience'],
    missingSkills: [],
    recruiterName: 'Adam Wathan',
    recruiterEmail: 'jobs@tailwindcss.com',
  },
];
