# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Bravo Mechanical (`artifacts/bravo-mechanical/`)
- **Type**: react-vite
- **Preview Path**: `/`
- **Description**: HVAC business website for Bravo Mechanical LLC serving Westchester County, NY
- **Tech**: React 18, React Router DOM, Tailwind CSS v3, shadcn/ui, Supabase (external), @tanstack/react-query
- **Key features**: Multi-page HVAC website with blog, CRM admin (Supabase-backed), contact/lead forms, SEO, Google Analytics, service area pages
- **Routing**: All public pages + admin routes at /admin/crm (requires Supabase auth)
- **Env vars needed**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (for admin/CRM features)

### API Server (`artifacts/api-server/`)
- **Type**: api (Express)
- **Preview Path**: `/api`
- **Description**: Shared backend API server (currently only health check; CRM uses Supabase directly)
