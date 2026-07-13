# Smatal Enterprise ERP Platform

This repository contains the backend for the Smatal Enterprise ERP Platform, initially focused on HR Document Automation.

## Architecture
The system is a **Modular Monolith** built on **Clean Architecture, Domain-Driven Design (DDD), and CQRS**.

## Quick Start
1. Ensure you have Node.js LTS and `pnpm` installed.
2. Run `pnpm install` in the root directory.
3. Configure your `.env` variables based on `environments/`.
4. Run migrations: `npx prisma migrate dev` (from the `database/` directory).
5. Start the API: `pnpm --filter api run start:dev`

## Monorepo Layout
*   `apps/` - Deployable units (API, Worker, CLI)
*   `libs/modules/` - Business bounded contexts (Identity, Organization, Workflow, etc.)
*   `libs/kernel/` - Core abstractions (CQRS, Events, Security)
*   `libs/infrastructure/` - Physical provider implementations (S3, Redis, SES)
*   `database/` - Prisma schema, migrations, and seed data.
