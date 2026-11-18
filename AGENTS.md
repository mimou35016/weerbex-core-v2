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

## 🚀 Completed Core Architecture & System State (PROTECTED - DO NOT RE-INITIALIZE)

The following systems are **fully implemented, database-driven (Payload CMS + MongoDB), and operational**. Never overwrite or revert these components:

### 1. Backend & CMS Infrastructure

- **Payload CMS 3 & MongoDB:** Installed and active (`payload`, `@payloadcms/next`, `@payloadcms/db-mongodb`, `@payloadcms/richtext-lexical`).
- **Configuration:** Initialized in `src/payload.config.ts`, with `withPayload` integrated safely in `next.config.mjs` alongside `next-intl`.
- **API & Admin Routes:** Active at `/admin` and `src/app/api/[...payload]/route.ts`. All legacy Prisma or mock database code has been completely replaced by Payload Local API.

### 2. Strapi-Like Granular RBAC & Permission Engine

- **Dynamic Database Roles & Permissions:** Roles and permissions are 100% dynamic, stored in MongoDB via Payload, and evaluated in real-time (`depth: 1`, `saveToJWT: false`).
- **Superadmin Absolute Control:** Only users with the `superadmin` role have unrestricted wildcard access and exclusive permission to create/edit roles and manage permissions for other users.
- **Granular Module & Action Safeguards:** Permissions span every single resource and sub-section (Users, Roles, Audit Logs, SEO, Security, System Settings, and all mini-apps) covering CRUD + custom actions (`find`, `read`, `create`, `update`, `delete`, `export`, etc.).
- **Backend & Frontend Shielding:** Enforced via Payload access control hooks, Next.js route protection, and dynamic UI rendering.

### 3. Real Dynamic Site Settings & SEO Engine

- **Payload Globals & Collections:**
  - `site-settings` (Global): Stores dynamic site name, tagline, contact info, maintenance mode, localized (`en`, `fr`, `ar`) fields, and media uploads (Logo/Favicon).
  - `seo-settings` (Global & Page-level): Stores global meta defaults, OpenGraph images, Twitter card formats, robots rules, and per-page/route custom SEO fields.
- **Dynamic Next.js Metadata (`generateMetadata`):** Fully dynamic metadata generation across the entire App Router, pulling live data from Payload Globals/Collections based on current locale and slug.
- **Dynamic Sitemap & Robots:** Live `sitemap.ts` and `robots.ts` driven entirely by database records.

## 🛡️ Mandatory Rules for All Future Prompts

1. **Preserve Existing Integrations:** Extend `src/payload.config.ts` or add new features incrementally without touching existing Auth, RBAC, Globals, or SEO logic.
2. **Zero UI Redesign:** Never modify, replace, or break existing `src/components/ui/` elements, layout wrappers, or `src/config/dashboard-nav.ts`.
3. **Strict Localization:** Every newly added label or field must include complete localization keys across `messages/en.json`, `messages/fr.json`, and `messages/ar.json` with full RTL (`dir="rtl"`) support for Arabic.
