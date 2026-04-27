# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenClaw 101 is an open-source resource aggregation site for [OpenClaw](https://github.com/openclaw/openclaw) — a popular open-source AI personal assistant platform. The site provides tutorials, resources, and documentation in Chinese and English to help users get started with OpenClaw.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: MDX for markdown content, react-markdown for rendering
- **Deployment**: Cloudflare Pages

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

## Architecture

### Routing (App Router)

```
src/app/
├── page.tsx                    # Home page (Chinese)
├── layout.tsx                  # Root layout with i18n, analytics, SEO
├── globals.css                 # Global styles
├── resources/page.tsx          # Resources page
├── payment/page.tsx           # Payment page
├── day/[day]/page.tsx         # Day pages (1-7)
├── zh/                         # Chinese version pages
│   ├── page.tsx, resources/page.tsx, day/[day]/page.tsx
├── en/                         # English version pages
│   ├── page.tsx, resources/page.tsx, day/[day]/page.tsx
```

### Key Directories

- `src/components/` — Reusable UI components (Hero, Navbar, Footer, ResourcesSection, LearningPath, Skills, etc.)
- `src/data/resources.ts` — All curated resources with metadata
- `src/lib/` — Utilities (i18n, axios, utils)
- `src/locales/` — Translation JSON files (en.json, zh.json)
- `src/context/` — React context (AppConfigContext)
- `src/hooks/` — Custom hooks (usePayment)
- `src/api/` — API configuration for backend payment service
- `content/days-en/` — English day content (day2-day6.md)

### Internationalization

Two locales supported: `zh` (default) and `en`. The `src/lib/i18n.ts` handles translations. Routes are duplicated under `/zh/` and `/en/` prefixes.

### Resource Data Structure

Resources in `src/data/resources.ts` have:
```typescript
{
  title: string;
  desc: string;
  url: string;
  source: string;
  lang: 'zh' | 'en';
  category: ResourceCategory;
  featured?: boolean;
  tags?: string[];
}
```

Categories: `official`, `getting-started`, `channel-integration`, `skill-dev`, `video`, `deep-dive`, `tools`, `cloud-deploy`, `use-cases`

### Backend API

The site connects to a backend at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3080`). This is used for payment functionality.

### Environment Variables

- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:3080`)
