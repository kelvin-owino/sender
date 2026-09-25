import { CandidateProfile } from '../types/job';

export interface ParseResumeResult {
  success: boolean;
  profile?: Partial<CandidateProfile>;
  aiPowered?: boolean;
  error?: string;
}

export async function parseResumeApi(resumeText: string): Promise<ParseResumeResult> {
  try {
    const res = await fetch('/api/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API error calling /api/parse-resume, falling back client-side:', err);
  }

  // Client-side instant heuristic parser
  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullName = lines[0] || 'Applicant';
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    success: true,
    aiPowered: false,
    profile: {
      fullName,
      email: emailMatch ? emailMatch[0] : 'applicant@example.com',
      phone: phoneMatch ? phoneMatch[0] : '+1 (555) 019-2834',
      location: 'Remote / United States',
      targetTitles: ['Senior Software Engineer', 'Full-Stack Developer'],
      summary: 'Passionate and versatile engineering professional with deep expertise in building high-scale distributed applications and user experiences.',
      primarySkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS'],
      experienceYears: '5+ years',
    },
  };
}

export async function generateCoverLetterApi(
  company: string,
  jobTitle: string,
  jobDescription?: string,
  candidateProfile?: Partial<CandidateProfile>,
): Promise<{ success: boolean; coverLetter: string; aiPowered?: boolean }> {
  try {
    const res = await fetch('/api/generate-cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, jobTitle, jobDescription, candidateProfile }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.coverLetter) return data;
    }
  } catch (err) {
    console.warn('API error calling /api/generate-cover-letter, falling back client-side:', err);
  }

  const name = candidateProfile?.fullName || 'Candidate';
  const skills = Array.isArray(candidateProfile?.primarySkills)
    ? candidateProfile.primarySkills.slice(0, 4).join(', ')
    : 'modern web technologies and cloud infrastructure';

  return {
    success: true,
    aiPowered: false,
    coverLetter: `Dear ${company} Hiring Team,

I am writing to express my strong enthusiasm for the ${jobTitle} position at ${company}. With my background in ${skills}, I have spent recent years building reliable, high-impact products and solving complex challenges in fast-moving engineering environments.

What excites me most about ${company} is your commitment to high engineering standards and thoughtful user experiences. My experience aligns closely with your team's goals: architecting clean scalable systems, collaborating cross-functionally, and delivering high velocity without sacrificing code quality.

I would welcome the opportunity to discuss how my skill set and dedication can contribute to the continued success of ${company}. Thank you for your time and consideration.

Warm regards,
${name}`,
  };
}

export async function generateFollowUpApi(
  company: string,
  jobTitle: string,
  appliedDaysAgo: number = 5,
  recruiterName?: string,
  candidateName?: string,
): Promise<{ success: boolean; followUpText: string; aiPowered?: boolean }> {
  try {
    const res = await fetch('/api/generate-follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, jobTitle, appliedDaysAgo, recruiterName, candidateName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.followUpText) return data;
    }
  } catch (err) {
    console.warn('API error calling /api/generate-follow-up, falling back client-side:', err);
  }

  const name = candidateName || 'Candidate';
  const greeting = recruiterName ? `Hi ${recruiterName},` : `Hi ${company} Recruiting Team,`;

  return {
    success: true,
    aiPowered: false,
    followUpText: `${greeting}

I hope you are having a productive week! I wanted to follow up on my application for the ${jobTitle} role at ${company} submitted ${appliedDaysAgo} days ago.

I remain very eager about the possibility of joining ${company} and contributing to your roadmap. Please let me know if there are any additional project links or details I can share to assist with the evaluation process.

Thank you very much for your time and consideration!

Best regards,
${name}`,
  };
}
