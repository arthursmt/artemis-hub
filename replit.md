# Artemis Hunting MVP

## Overview

Artemis Hunting MVP is a commercial application for microfinance field agents (loan officers/credit agents). The app enables agents to manage their credit portfolio, track proposals through various pipeline stages, monitor KPIs, and originate new credit proposals on tablets in the field.

The application follows a full-stack architecture with a React frontend and Express.js backend, using PostgreSQL for data persistence. Currently, the frontend uses mock data for development purposes while the backend infrastructure is in place.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for the Artemis brand (blue primary, yellow secondary, green accent)
- **Form Handling**: React Hook Form with Zod validation
- **Target Device**: Optimized for tablet usage (~1024px width)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Layer
- **Schema Location**: `shared/schema.ts` - defines Drizzle tables and Zod insert schemas
- **Core Entities**:
  - Proposals: Credit applications with statuses (on_going, under_evaluation, completed)
  - Contracts: Active loans with statuses (active, renewal_due, delinquent)
- **Mock Data**: `client/src/mock/data.ts` provides development data for frontend testing
- **Database Migrations**: Managed via `drizzle-kit push` command

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and TypeScript types
- `routes.ts`: API route definitions with Zod schemas for type-safe API contracts

### Key Design Decisions
1. **Mock-first Development**: Frontend uses local mock data hooks that simulate API delays, enabling frontend development independent of backend
2. **Type Safety**: End-to-end type safety through shared Zod schemas between client and server
3. **Component Library**: shadcn/ui provides accessible, customizable components that follow Radix UI patterns
4. **Path Aliases**: TypeScript path aliases (`@/`, `@shared/`) for clean imports

## Artemis Hub Launcher

The application includes a launcher interface for accessing external Artemis applications (Hunt/Gate) via iframes.

### Routes
- `/` - Launcher home with buttons for Hunt and Gate, shows effective URLs and dev warnings
- `/hunt` - Embedded Hunt application with iframe + fallback buttons
- `/gate` - Embedded Gate application with iframe + fallback buttons
- `/config` - Configuration page showing URL status and setup instructions
- `/health` - Health check page showing JSON status with URLs
- `/dashboard` - Original dashboard for credit portfolio management
- `/api/health` - Backend health check endpoint

### Environment Variables
- `VITE_HUNT_URL` - Public URL for the Hunt application (optional, has default)
- `VITE_GATE_URL` - Public URL for the Gate application (optional, has default)

### Default URLs (Dev)
- Hunt: `https://40fad382-f5d0-41ed-8319-8b14ccbaa38f-00-1a4f4ivx6fwg5.worf.replit.dev/`
- Gate: `https://f89dbced-a4ab-49cf-a512-fa784ea45cca-00-3uhhyzamtriym.riker.replit.dev/`

### Fallback Behavior
- 8-second timeout for iframe loading
- If iframe fails: shows "Embedding Blocked" message with "Open in Same Tab" and "Open in New Tab" buttons
- Dev URL warning (.replit.dev) shown on home page and config page
- "Back to Hub" navigation always available

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component implementations
- **Tailwind CSS**: Utility-first styling

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database migration tooling

### Fonts
- **DM Sans**: Body text font
- **Outfit**: Display/heading font
- Loaded via Google Fonts CDN