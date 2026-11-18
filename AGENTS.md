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

## ✅ Completed Architecture & Protected State (DO NOT OVERWRITE OR RE-INITIALIZE)

The following backend and security integrations are **ALREADY COMPLETED AND WORKING**. Do NOT re-install, reset, or overwrite these implementations:

1. **Payload CMS 3 Backend (MongoDB):**
   - Installed and configured (`payload`, `@payloadcms/next`, `@payloadcms/db-mongodb`, `@payloadcms/richtext-lexical`).
   - Core configuration is active in `src/payload.config.ts` connected to `DATABASE_URI`, with `withPayload` safely integrated in `next.config.mjs` alongside `next-intl`.
   - Payload Admin (`/admin`) and API routes (`src/app/api/[...payload]/route.ts`) are active. Prisma/mock data has been replaced.

2. **Authentication & Session Management:**
   - The `users` collection in `src/payload.config.ts` has `auth: true` enabled.
   - All frontend authentication flows (Login, Logout, Current Session verification) are wired directly to Payload CMS (`payload.login`, `payload.auth`, Local API / Server Actions).

3. **User Management & RBAC (Role-Based Access Control):**
   - Full CRUD operations for Users and Roles in the custom dashboard (`src/app/[locale]/(dashboard)/dashboard/`) are connected to Payload CMS Local API.
   - Route protection, middleware, and feature/mini-app guards are enforced based on user roles retrieved from Payload.

## 🛡️ Rules for All Future Tasks

- **Preserve Existing Integrations:** Whenever adding new collections, mini-apps, or features, extend `src/payload.config.ts` incrementally without altering existing `users` auth logic, RBAC guards, or core dashboard files.
- **Zero UI Redesign:** Keep all existing `shadcn/ui` components, layouts, `src/config/dashboard-nav.ts`, and `messages/*.json` structures intact.
