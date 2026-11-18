<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Tech Stack & Rules

- UI Library: shadcn/ui (components are located in `src/components/ui`).
- Always use existing shadcn/ui components or install missing ones via npx shadcn@latest add <component> before creating custom UI elements.
- Use src/ directory structure and App Router (`src/app`).
- Support clean, responsive design with Tailwind CSS.

## Internationalization & Theme

- i18n: next-intl supporting en, fr, and ar (with dir="rtl" for Arabic and dir="ltr" for English/French).
- All UI text must be extracted into translation files (`messages/en.json`, messages/fr.json, `messages/ar.json`).
- Theme: next-themes with shadcn/ui dark mode support.

## Core Dashboard Architecture (Locked & Protected)

- The core dashboard structure under src/app/[locale]/(dashboard)/dashboard/ and navigation configuration in src/config/dashboard-nav.ts are foundational and must NOT be overwritten, broken, or restructured by future prompts.
- All new mini-apps or modules must be integrated as independent plugins/routes under the existing dashboard layout without altering the core files (Users, Roles, Audit Logs, Settings, SEO, Security).
- Every newly added settings parameter or feature must include full localization keys in messages/en.json, messages/fr.json, and messages/ar.json.

## Core Dashboard & Database Architecture (Protected)

- The core dashboard structure under src/app/[locale]/(dashboard)/dashboard/ and navigation configuration in src/config/dashboard-nav.ts are foundational and must NOT be overwritten, broken, or restructured by future prompts.
- All new mini-apps or modules must be integrated as independent plugins/routes under the existing dashboard layout without altering the core files (Users, Roles, Audit Logs, Settings, SEO, Security).
- All database interactions must use the Prisma Client singleton (`src/lib/prisma.ts`) with MongoDB, and zero static/mock data is permitted.
- 100% of UI strings must be extracted into messages/en.json, messages/fr.json, and messages/ar.json with full RTL (`dir="rtl"`) support.
