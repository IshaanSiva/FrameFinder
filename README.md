# FrameFinder

**Structured rhetorical analysis, powered by AI.**

FrameFinder lets students, debaters, and researchers paste any article, speech, or PDF and receive a structured framing report — not a chatbot summary, but a breakdown of loaded language, bias risk scores, logical fallacies, missing perspectives, and a neutral rewrite. Built for AP Lang, AP Gov, debate, and MUN research.

---

## Problem it solves

Reading critically is hard. Most AI tools summarize text — they don't help you interrogate it. FrameFinder does something different: it surfaces the *rhetorical mechanics* of a source. What loaded phrases is the author using? What perspectives are absent? What claims lack evidence? What logical fallacies appear?

The goal is structured critical thinking, not a verdict. FrameFinder identifies possible framing patterns and hands the judgment back to the reader.

---

## Screenshots

> Add your own screenshots to `public/screenshots/` and update the paths below.

| Analyzer workspace | Report — Framing scores | Report — Language heatmap |
|---|---|---|
| ![Analyzer](public/screenshots/analyzer.png) | ![Scores](public/screenshots/report-scores.png) | ![Language](public/screenshots/report-language.png) |

---

## Key features

- **Framing report** — topic detection, framing lens, likely stance, tone, main argument
- **4-axis framing risk scores** — loaded language, evidence quality, missing counterarguments, emotional framing (0–10 each)
- **Loaded language heatmap** — every flagged phrase highlighted inline with scroll-to behavior
- **Claims & evidence analysis** — each claim rated Supported / Weak / Unsupported / Fallacy
- **Logical fallacy detection** — labeled and explained
- **PDF upload & extraction** — client-side `pdfjs-dist` extraction, up to 50 pages for Pro
- **Missing perspectives** (Pro) — voices absent from the text
- **Neutral rewrite** (Pro) — side-by-side alternative phrasing
- **Socratic questions** (Pro) — prompts to deepen critical engagement
- **Saved reports** — all analyses persisted to Supabase, accessible from the sidebar
- **Usage limits** — Free (3 analyses/week, 1,200 words, 1 PDF/week) vs Pro (100/month, 10k words, 50-page PDFs)
- **Subscription billing** — Stripe Checkout + Customer Portal in test/prototype mode

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| Auth | Clerk v7 |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.5 Flash Lite |
| PDF parsing | pdfjs-dist (client-side, no server upload) |
| Payments | Stripe Checkout + Webhooks (test mode) |
| Animations | Framer Motion (via `motion` package) |
| Icons | lucide-react |
| Hosting target | Vercel |

---

## Architecture overview

```
Browser
  │
  ├── /                      Public landing page
  ├── /analyzer              Workspace (Paste Text / Upload PDF)
  ├── /analyzer/report       New report (reads sessionStorage)
  ├── /analyzer/report/[id]  Saved report (fetched from Supabase)
  ├── /pricing               Plans + Stripe checkout
  └── /sample-report         Static demo report
  
API routes (Next.js server)
  ├── /api/analyze           Calls Gemini → saves to Supabase → returns report
  ├── /api/analyses          Returns saved reports for authenticated user
  ├── /api/analyses/[id]     Returns single saved report
  ├── /api/usage             Returns current usage counts + plan for user
  ├── /api/stripe/checkout   Creates Stripe Checkout Session
  ├── /api/stripe/portal     Creates Stripe Customer Portal session
  └── /api/stripe/webhook    Handles subscription events → updates Supabase profiles
```

**Auth flow**: Clerk handles all authentication. The server uses `auth()` from `@clerk/nextjs/server` to get `userId` in API routes. No auth logic is duplicated client-side.

**Analysis flow**:
1. User pastes text or uploads PDF → client extracts PDF text via `pdfjs-dist`
2. Frontend calls `POST /api/analyze` with text + source type
3. Route calls Gemini with a structured prompt (source-type-aware framing rubric)
4. Result is saved to `public.analyses` in Supabase under the user's Clerk ID
5. Report JSON is stored in `sessionStorage` and the router pushes to `/analyzer/report`
6. Sidebar re-fetches `/api/analyses` on every pathname change to show the new card

**Subscription flow** (test mode):
1. Frontend calls `POST /api/stripe/checkout` → server creates a Checkout Session
2. User completes payment on Stripe-hosted page → redirects back to `/analyzer?checkout=success`
3. Stripe fires webhook events → `/api/stripe/webhook` verifies signature, syncs `plan`/`subscription_status` to Supabase `profiles` table
4. Usage limits are gated server-side by reading `profiles.plan` on every `/api/analyze` request

---

## AI analysis features

FrameFinder uses **Gemini 2.5 Flash Lite** with a carefully engineered system prompt. Key behaviors:

- **Source-type inference**: the model identifies whether text is academic/textbook, news, opinion/editorial, marketing, government, or literary — and calibrates scoring accordingly
- **Framing risk ≠ bias verdict**: the prompt explicitly instructs the model that strong evaluative language grounded in scholarly consensus (e.g., history textbooks) should not be scored the same as manipulative rhetoric
- **Loaded phrase rules**: phrases are only flagged if they carry emotional weight beyond evidence, assert certainty about contested claims, or are designed to manipulate rather than describe
- **Claim risk levels**: `Supported` | `Weak` | `Unsupported` | `Fallacy`
- **Output schema**: fully typed `MockReport` JSON — the model is prompted to return valid JSON matching the schema; a mock fallback is used if Gemini fails or returns malformed output

---

## PDF analysis behavior

- PDF text is extracted **client-side** using `pdfjs-dist` — the raw file is never uploaded to any server
- Extracted text is passed to `/api/analyze` as a plain string
- Page limit: Free = 10 pages, Pro = 50 pages (enforced client-side before extraction)
- Character limit: up to 20,000 characters are sent to Gemini regardless of plan (longer text is truncated before the API call)

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account (free)
- A [Supabase](https://supabase.com) project (free)
- A [Google AI Studio](https://aistudio.google.com) API key (free)
- A [Stripe](https://stripe.com) account for payment features (optional — app runs without it)

### 1. Clone and install

```bash
git clone https://github.com/your-username/framefinder.git
cd framefinder
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials. See [Environment variables](#environment-variables) below.

The minimum required to run the app locally:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Stripe variables are optional — if omitted, the upgrade button will fail gracefully and all other features still work.

### 3. Set up Supabase

Run the following SQL in your Supabase project's SQL editor:

```sql
-- Analyses table: stores every report
create table public.analyses (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  report           jsonb,
  topic            text,
  source_type      text,
  word_count       integer,
  used_mock_fallback boolean default false,
  created_at       timestamptz default now(),
  input_text       text
);

-- Profiles table: tracks plan, usage, and Stripe state
create table public.profiles (
  id                    uuid primary key default gen_random_uuid(),
  clerk_user_id         text unique not null,
  plan                  text default 'free',
  subscription_status   text,
  stripe_customer_id    text,
  stripe_subscription_id text,
  trial_used            boolean default false,
  weekly_analysis_count  integer default 0,
  weekly_pdf_count       integer default 0,
  monthly_analysis_count integer default 0,
  week_start            timestamptz,
  month_start           timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Enable Row Level Security (recommended)
alter table public.analyses enable row level security;
alter table public.profiles enable row level security;
```

> **Note**: All database access in this app goes through the Supabase **service role key** on the server — RLS policies are a defense-in-depth measure and do not affect normal app operation.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (safe for client) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key (not currently used client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only, never exposed to client) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key (for future client-side Stripe.js use) |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key — Stripe features disabled if missing |
| `STRIPE_STUDENT_PRO_PRICE_ID` | Optional | Stripe price ID for the Student Pro subscription |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL — used for Stripe redirect URLs. Use `http://localhost:3000` locally |

Copy `.env.example` to `.env.local` and fill in your values. **Never commit `.env.local`** — it is gitignored.

---

## Stripe setup (test mode)

Stripe is implemented as a full subscription architecture but is configured for **test mode** by default. To run it locally:

1. Create a product called "Student Pro" in your Stripe test dashboard with a recurring monthly price
2. Copy the `price_test_...` ID to `STRIPE_STUDENT_PRO_PRICE_ID`
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the `whsec_...` secret printed by the CLI to `STRIPE_WEBHOOK_SECRET`

Required webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

Use Stripe test card `4242 4242 4242 4242` (any future expiry, any CVC) to complete test checkouts.

---

## Project structure

```
app/
  page.tsx                    Public landing page
  analyzer/
    layout.tsx                Shared workspace shell (sidebar + scroll layout)
    page.tsx                  Analyzer workspace
    report/
      page.tsx                New report (from sessionStorage)
      [id]/page.tsx           Saved report (from Supabase)
  pricing/page.tsx
  sample-report/page.tsx
  api/
    analyze/route.ts          Core analysis endpoint (Gemini + Supabase)
    analyses/route.ts         Fetch saved reports
    analyses/[id]/route.ts
    usage/route.ts            Usage limits endpoint
    stripe/
      checkout/route.ts
      portal/route.ts
      webhook/route.ts

components/
  analyzer/
    AnalyzerSidebar.tsx       Left sidebar — saved report history
    TextEditorWorkspace.tsx   Text input + submit
    PdfUploadPanel.tsx        PDF upload + client-side extraction
  report/
    ReportWorkspace.tsx       Split-screen report viewer (7 tabs)
  legal/
    LegalPageShell.tsx        Shared shell for legal pages
  landing/                    Public homepage components
  Footer.tsx
  Header.tsx

lib/
  analyzeText.ts              Gemini prompt logic
  mockData.ts                 MockReport type + fallback data
  supabase.ts                 Supabase service client (server-only)
  stripe.ts                   Stripe client (server-only)
  usageLimits.ts              Plan enforcement logic
```

---

## Limitations and future work

**Current limitations:**
- Gemini output is probabilistic — the same text may produce slightly different scores on different runs
- PDF character extraction is limited to 20,000 characters regardless of plan (truncates longer documents)
- No real-time streaming — analysis takes 3–8 seconds depending on text length
- Stripe is in test mode; no live payments are configured in this repository

**Planned features:**
- YouTube video transcript analysis (UI tab present, functionality coming)
- Side-by-side source comparison (UI tab present, functionality coming)
- PDF export of reports
- Educator Pack with classroom sharing and student dashboards
- Shareable report links

---

## AI disclaimer

> FrameFinder is an **educational AI analysis tool**. It identifies *possible* framing patterns and rhetorical indicators — outputs may be imperfect and should not be treated as definitive judgments about a source's credibility, accuracy, or intent.
>
> A "High Framing Risk" score does not mean a source is false or unreliable. Academic, historical, and analytical writing often uses strong evaluative language that reflects scholarly consensus rather than bias. FrameFinder is designed to recognize this distinction, but AI models are imperfect.
>
> Always apply your own critical thinking. Use FrameFinder as a starting point for analysis, not a conclusion.

---

## Resume bullet points

For use in college applications, resumes, or portfolio descriptions:

- Built **FrameFinder**, a full-stack AI rhetorical analysis tool using Next.js 16 (App Router), TypeScript, and Google Gemini 2.5 Flash Lite — processes arbitrary text and PDFs into structured framing reports with loaded language detection, claim analysis, and logical fallacy identification
- Designed a **source-type-aware AI prompt system** that calibrates framing risk scoring for academic, editorial, marketing, and news content, distinguishing scholarly evaluative language from manipulative rhetoric
- Implemented **Stripe subscription billing** with Checkout, Customer Portal, and webhook-driven plan sync to Supabase — including one-per-account trial enforcement and graceful `past_due` handling
- Built **client-side PDF extraction** using `pdfjs-dist`, with per-plan page limits enforced before any server call, keeping raw file data off the server entirely
- Architected a **multi-tier usage limit system** (weekly vs monthly, Free vs Pro) with server-side enforcement via a `profiles` table in Supabase, plan gating on every analysis request
- Designed a **split-screen report viewer** with inline phrase highlighting and scroll-to behavior, 7-tab insights panel, and blurred Pro-locked content with upgrade prompts
- Maintained strict **security boundaries**: Supabase service role key and Stripe secret key are server-only (enforced via `import "server-only"`), Clerk `auth()` is never called from client components, no secrets are logged or exposed

---

## License

MIT — see [LICENSE](LICENSE) for details.
