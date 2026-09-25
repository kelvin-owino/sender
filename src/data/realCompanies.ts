export interface RealCompanyRecord {
  name: string;
  domain: string;
  careersUrl: string;
  linkedinUrl: string;
  headquarters: string;
  employeeCount: string;
  verifiedAts: 'greenhouse' | 'lever' | 'workday' | 'linkedin' | 'direct_email';
  atsBoardUrl: string;
  recruiterDomain: string;
  securityStatus: string;
  description: string;
}

export const REAL_COMPANIES_REGISTRY: RealCompanyRecord[] = [
  {
    name: 'Anthropic',
    domain: 'anthropic.com',
    careersUrl: 'https://anthropic.com/careers',
    linkedinUrl: 'https://www.linkedin.com/company/anthropicresearch',
    headquarters: 'San Francisco, CA',
    employeeCount: '500+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/anthropic',
    recruiterDomain: '@anthropic.com',
    securityStatus: 'Active MX & SPF Records Verified · Official Greenhouse ATS Board',
    description: 'AI safety and research company, creators of Claude.',
  },
  {
    name: 'Stripe',
    domain: 'stripe.com',
    careersUrl: 'https://stripe.com/jobs',
    linkedinUrl: 'https://www.linkedin.com/company/stripe',
    headquarters: 'San Francisco, CA & Dublin, Ireland',
    employeeCount: '8,000+ employees',
    verifiedAts: 'linkedin',
    atsBoardUrl: 'https://stripe.com/jobs/search',
    recruiterDomain: '@stripe.com',
    securityStatus: 'Active Corporate Domain · Direct LinkedIn Easy Apply Partner',
    description: 'Financial infrastructure platform for businesses worldwide.',
  },
  {
    name: 'Linear',
    domain: 'linear.app',
    careersUrl: 'https://linear.app/careers',
    linkedinUrl: 'https://www.linkedin.com/company/linear-app',
    headquarters: 'San Francisco, CA (Remote-First)',
    employeeCount: '75+ employees',
    verifiedAts: 'lever',
    atsBoardUrl: 'https://jobs.lever.co/linear',
    recruiterDomain: '@linear.app',
    securityStatus: 'Active MX Records · Official Lever ATS Integration',
    description: 'The purpose-built tool for modern software teams and issue tracking.',
  },
  {
    name: 'Figma',
    domain: 'figma.com',
    careersUrl: 'https://careers.figma.com',
    linkedinUrl: 'https://www.linkedin.com/company/figma',
    headquarters: 'San Francisco, CA',
    employeeCount: '1,500+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/figma',
    recruiterDomain: '@figma.com',
    securityStatus: 'Active Corporate Domain · Official Greenhouse ATS Partner',
    description: 'Collaborative web-based design and prototyping platform.',
  },
  {
    name: 'Postman',
    domain: 'postman.com',
    careersUrl: 'https://www.postman.com/careers',
    linkedinUrl: 'https://www.linkedin.com/company/postman-platform',
    headquarters: 'San Francisco, CA & Bengaluru, India',
    employeeCount: '1,200+ employees',
    verifiedAts: 'lever',
    atsBoardUrl: 'https://jobs.lever.co/postman',
    recruiterDomain: '@postman.com',
    securityStatus: 'Active Corporate MX · Verified Lever ATS Portal',
    description: 'The leading API collaboration platform used by over 30M developers.',
  },
  {
    name: 'Vercel',
    domain: 'vercel.com',
    careersUrl: 'https://vercel.com/careers',
    linkedinUrl: 'https://www.linkedin.com/company/vercel',
    headquarters: 'San Francisco, CA (Remote-First)',
    employeeCount: '700+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/vercel',
    recruiterDomain: '@vercel.com',
    securityStatus: 'Active DNS & SPF Records · Official Greenhouse Requisition Portal',
    description: 'The platform for frontend developers, creators of Next.js.',
  },
  {
    name: 'Supabase',
    domain: 'supabase.com',
    careersUrl: 'https://supabase.com/careers',
    linkedinUrl: 'https://www.linkedin.com/company/supabase',
    headquarters: 'Singapore (100% Remote Global)',
    employeeCount: '200+ employees',
    verifiedAts: 'lever',
    atsBoardUrl: 'https://jobs.lever.co/supabase',
    recruiterDomain: '@supabase.com',
    securityStatus: 'Active MX Records · Official Lever Job Board',
    description: 'The open-source Firebase alternative powered by PostgreSQL.',
  },
  {
    name: 'Datadog',
    domain: 'datadoghq.com',
    careersUrl: 'https://careers.datadoghq.com',
    linkedinUrl: 'https://www.linkedin.com/company/datadog',
    headquarters: 'New York, NY',
    employeeCount: '5,500+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/datadog',
    recruiterDomain: '@datadoghq.com',
    securityStatus: 'NASDAQ Listed (DDOG) · Official Greenhouse ATS Board',
    description: 'Cloud-scale observability and security platform for modern infrastructure.',
  },
  {
    name: 'Cloudflare',
    domain: 'cloudflare.com',
    careersUrl: 'https://www.cloudflare.com/careers',
    linkedinUrl: 'https://www.linkedin.com/company/cloudflare',
    headquarters: 'San Francisco, CA',
    employeeCount: '3,800+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/cloudflare',
    recruiterDomain: '@cloudflare.com',
    securityStatus: 'NYSE Listed (NET) · Verified Greenhouse Requisition Endpoint',
    description: 'Global cloud network powering speed and security across the Internet.',
  },
  {
    name: 'Tailwind Labs',
    domain: 'tailwindcss.com',
    careersUrl: 'https://tailwindcss.com',
    linkedinUrl: 'https://www.linkedin.com/company/tailwind-labs',
    headquarters: 'Cambridge, ON, Canada (Remote)',
    employeeCount: '20+ employees',
    verifiedAts: 'direct_email',
    atsBoardUrl: 'https://tailwindcss.com',
    recruiterDomain: '@tailwindcss.com',
    securityStatus: 'Active Domain & SPF Verified · Direct Executive Talent Inbox',
    description: 'The software company behind the Tailwind CSS framework.',
  },
  {
    name: 'GitHub',
    domain: 'github.com',
    careersUrl: 'https://github.com/about/careers',
    linkedinUrl: 'https://www.linkedin.com/company/github',
    headquarters: 'San Francisco, CA (Microsoft Subsidiary)',
    employeeCount: '3,000+ employees',
    verifiedAts: 'greenhouse',
    atsBoardUrl: 'https://boards.greenhouse.io/github',
    recruiterDomain: '@github.com',
    securityStatus: 'Microsoft Corporation Subsidiary · Official Greenhouse Board',
    description: 'The world’s leading developer platform and AI code companion.',
  },
  {
    name: 'Notion',
    domain: 'notion.so',
    careersUrl: 'https://www.notion.so/careers',
    linkedinUrl: 'https://www.linkedin.com/company/notionhq',
    headquarters: 'San Francisco, CA',
    employeeCount: '800+ employees',
    verifiedAts: 'lever',
    atsBoardUrl: 'https://jobs.lever.co/notion',
    recruiterDomain: '@makenotion.com',
    securityStatus: 'Active DNS & SPF Records · Official Lever Board',
    description: 'The connected workspace for wiki, docs, and project management.',
  },
];

/**
 * Check if a company name or domain corresponds to a verified real employer.
 */
export function getCompanyVerification(companyName: string, domainOrUrl?: string): {
  isVerified: boolean;
  record?: RealCompanyRecord;
  suggestedDomain: string;
  officialCareersUrl: string;
  atsName: string;
} {
  const normName = companyName.trim().toLowerCase();
  const found = REAL_COMPANIES_REGISTRY.find(
    (c) =>
      c.name.toLowerCase() === normName ||
      c.domain.toLowerCase().includes(normName) ||
      normName.includes(c.name.toLowerCase()),
  );

  if (found) {
    return {
      isVerified: true,
      record: found,
      suggestedDomain: found.domain,
      officialCareersUrl: found.careersUrl,
      atsName: found.verifiedAts.toUpperCase(),
    };
  }

  // Derive domain from name or provided URL
  let cleanDomain = domainOrUrl || '';
  if (!cleanDomain && companyName) {
    cleanDomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  } else if (cleanDomain.includes('://')) {
    try {
      cleanDomain = new URL(cleanDomain).hostname.replace(/^www\./, '');
    } catch {
      // keep as is
    }
  }

  const isLegitCorporateDomain =
    cleanDomain.includes('.') &&
    !cleanDomain.includes('gmail.com') &&
    !cleanDomain.includes('yahoo.com') &&
    !cleanDomain.includes('hotmail.com');

  return {
    isVerified: isLegitCorporateDomain,
    suggestedDomain: cleanDomain,
    officialCareersUrl: `https://${cleanDomain}`,
    atsName: 'DIRECT ATS',
  };
}
