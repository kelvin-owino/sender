import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client with provided key:', err);
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!aiClient,
    timestamp: new Date().toISOString(),
  });
});

// Resume parsing endpoint
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'resumeText is required' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are an expert resume parser for the job application tool Sendaway.
Parse the following candidate resume text into a strict JSON object with these exact keys:
- fullName (string)
- email (string)
- phone (string)
- location (string)
- targetTitles (array of strings, up to 4 titles)
- summary (string, 2-3 sentences)
- primarySkills (array of strings, 6-12 top technical & professional skills)
- experienceYears (number or string)
- experienceHistory (array of objects with { role: string, company: string, period: string, highlights: string[] })
- education (string)
- suggestedKeywords (array of strings for ATS job search)

Resume Text:
${resumeText.slice(0, 10000)}

Respond ONLY with valid JSON. No markdown code blocks, no backticks, no explanations.`,
        });

        let jsonText = response.text?.trim() || '{}';
        // Clean possible markdown code fences if model returned any
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(jsonText);
        return res.json({ success: true, profile: parsed, aiPowered: true });
      } catch (err) {
        console.warn('Gemini parse error, falling back to heuristics:', err);
      }
    }

    // Heuristic fallback
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);
    const fullName = lines[0] || 'Applicant';

    const fallbackProfile = {
      fullName,
      email: emailMatch ? emailMatch[0] : 'applicant@example.com',
      phone: phoneMatch ? phoneMatch[0] : '+1 (555) 234-5678',
      location: 'Remote / United States',
      targetTitles: ['Senior Software Engineer', 'Full-Stack Developer', 'Tech Lead'],
      summary: 'Experienced technology professional with extensive track record in building scalable cloud web applications, robust APIs, and modern user experiences.',
      primarySkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'AWS', 'GraphQL', 'Next.js', 'System Architecture'],
      experienceYears: '6+ years',
      experienceHistory: [
        {
          role: 'Senior Full-Stack Engineer',
          company: 'Acme Cloud Technologies',
          period: '2022 - Present',
          highlights: ['Led microservices migration reducing latency by 35%', 'Built real-time collaboration engine used by 100k+ MAU'],
        },
        {
          role: 'Software Engineer',
          company: 'HyperScale Apps',
          period: '2020 - 2022',
          highlights: ['Architected customer dashboard with modern React stack', 'Spearheaded automated CI/CD deployment pipelines'],
        },
      ],
      education: 'B.S. in Computer Science',
      suggestedKeywords: ['React', 'TypeScript', 'Node.js', 'Distributed Systems', 'Cloud Native'],
    };

    return res.json({ success: true, profile: fallbackProfile, aiPowered: false });
  } catch (error: any) {
    console.error('Parse resume error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume' });
  }
});

// Tailored Cover Letter Generator
app.post('/api/generate-cover-letter', async (req, res) => {
  try {
    const { company, jobTitle, jobDescription, candidateProfile } = req.body;
    if (!company || !jobTitle) {
      return res.status(400).json({ error: 'Company and jobTitle are required' });
    }

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Generate a concise, punchy, and compelling cover letter (max 3 short paragraphs) for the application tool Sendaway.
Company: ${company}
Job Title: ${jobTitle}
Job Requirements/Context: ${jobDescription || 'Innovative high-growth company looking for outstanding talent'}
Candidate Name: ${candidateProfile?.fullName || 'Candidate'}
Candidate Primary Skills: ${Array.isArray(candidateProfile?.primarySkills) ? candidateProfile.primarySkills.join(', ') : 'Software Engineering, Product Leadership'}
Candidate Summary: ${candidateProfile?.summary || 'Experienced professional with proven track record'}

Write directly in the voice of the candidate. Do not include placeholder brackets like [Your Name] - use the real values or omit. Make it confident, tailored, and ready to send to the hiring team.`,
        });

        const letter = response.text?.trim();
        if (letter) {
          return res.json({ success: true, coverLetter: letter, aiPowered: true });
        }
      } catch (err) {
        console.warn('Gemini cover letter error, using fallback:', err);
      }
    }

    // High quality template fallback
    const candidateName = candidateProfile?.fullName || 'Applicant';
    const skillsList = Array.isArray(candidateProfile?.primarySkills)
      ? candidateProfile.primarySkills.slice(0, 4).join(', ')
      : 'modern web development, scalable architecture, and engineering execution';

    const fallbackLetter = `Dear ${company} Hiring Team,

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${company}. With my background in ${skillsList}, I have spent recent years building reliable, high-impact products and solving complex challenges in fast-moving engineering environments.

What excites me most about ${company} is your commitment to high standard engineering and thoughtful user experiences. My experience aligns closely with your team's goals: architecting clean scalable systems, collaborating cross-functionally, and delivering high velocity without sacrificing code quality.

I would welcome the opportunity to discuss how my skill set and enthusiasm can contribute to the continued success of ${company}. Thank you for your time and consideration.

Warm regards,
${candidateName}`;

    return res.json({ success: true, coverLetter: fallbackLetter, aiPowered: false });
  } catch (error: any) {
    console.error('Cover letter generator error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate cover letter' });
  }
});

// Follow-up Generator
app.post('/api/generate-follow-up', async (req, res) => {
  try {
    const { company, jobTitle, appliedDaysAgo, recruiterName, candidateName } = req.body;
    const name = candidateName || 'Candidate';
    const recruiterGreeting = recruiterName ? `Hi ${recruiterName},` : `Hi ${company} Recruiting Team,`;

    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Draft a courteous, highly professional 2-paragraph follow-up email from ${name} to ${company} for the ${jobTitle} role applied ${appliedDaysAgo || 5} days ago.
Recruiter Greeting: ${recruiterGreeting}
Tone: Polite, proactive, concise, showing strong continued enthusiasm without being pushy.
Return only the email body text.`,
        });

        const text = response.text?.trim();
        if (text) {
          return res.json({ success: true, followUpText: text, aiPowered: true });
        }
      } catch (err) {
        console.warn('Gemini follow-up error, using fallback:', err);
      }
    }

    const fallback = `${recruiterGreeting}

I hope you are having a wonderful week! I wanted to briefly follow up on my recent application for the ${jobTitle} role at ${company} submitted a few days ago.

I remain very excited about what ${company} is building and would love to connect for a quick conversation regarding how my technical background and problem-solving skills could support your roadmap. Please let me know if any additional information or portfolio samples would be helpful.

Thank you again for your time and consideration!

Best regards,
${name}`;

    return res.json({ success: true, followUpText: fallback, aiPowered: false });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to generate follow up' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`Production build not found. Please run 'npm run build' first.`);
      }
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Sendaway server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
