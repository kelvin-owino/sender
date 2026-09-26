# Sendaway - Automated Job Application & Tracking Dashboard

> **Sendaway** is a modern, full-stack automated job application pipeline and tracking cockpit. Upload and manage tailored resumes, connect job board accounts (LinkedIn, Greenhouse, Lever, Indeed, Workday), match requisitions with ATS compatibility scoring, generate tailored cover letters and follow-up emails, and export pipeline analytics.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js** v18.0.0 or higher (Node 20+ recommended)
- **npm** v9+ (or `pnpm` / `bun`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY` for AI-powered cover letter tailoring and smart resume parsing. If omitted, Sendaway automatically uses high-fidelity heuristic parsing and tailored letter fallbacks so the app works 100% offline out-of-the-box!)*

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Express full-stack development server with Vite middleware |
| `npm run build` | Compiles and bundles production client assets into `dist/` |
| `npm run preview` | Previews the compiled production build locally with Vite |
| `npm start` | Runs the production server (`NODE_ENV=production tsx server.ts`) |
| `npm run lint` | Type-checks all TypeScript source code (`tsc --noEmit`) |

---

## 🌐 Deploying to GitHub Pages, Vercel, or Netlify

### A. Deploy to GitHub Pages (2 Super Easy Options)

#### Option 1: Deploy from Branch (Recommended & Instant, No Actions setup required!)
1. In your GitHub repository, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, keep or select **Deploy from a branch**.
3. Under **Branch**:
   - Select **`main`** (or `master`).
   - Select **`/docs`** from the folder dropdown (Sendaway's `docs/` folder contains the ready-to-run pre-compiled production build).
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/` in ~30 seconds with 0 configuration!

#### Option 2: Deploy via GitHub Actions
1. In **Settings** → **Pages**, change **Source** to **GitHub Actions**.
2. The included `.github/workflows/deploy.yml` workflow will automatically run on every push, build the app, and deploy it to GitHub Pages.

### B. Deploy to Vercel
1. Import this repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. The included `vercel.json` ensures all client routes work smoothly.

### C. Deploy to Netlify
1. Connect repository in [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The included `public/_redirects` ensures seamless SPA routing.

### D. Deploy to Render / Railway / Heroku (Full-Stack Mode)
1. Build Command: `npm run build`
2. Start Command: `npm start`
3. Environment variables: `PORT=3000`, `NODE_ENV=production`

---

## 📦 What Was Fixed for GitHub Compatibility
1. **Resolved Peer Dependency Conflict**: Removed the incompatible `esbuild` constraint in `package.json` that prevented `npm install` from completing with `ERESOLVE` errors.
2. **Generated `package-lock.json`**: Guaranteed reproducible and conflict-free installation across all operating systems and CI/CD environments.
3. **Relative Asset Base Path (`base: './'`)**: Fixed 404 blank white screen issues when deployed to GitHub Pages subpaths (`https://username.github.io/repo/`).
4. **Vercel & Netlify Rewrite Configs**: Added `vercel.json` and `public/_redirects` to handle client-side routing.
5. **Automated GitHub Actions CI/CD**: Added `.github/workflows/deploy.yml` for 1-click GitHub Pages hosting.
