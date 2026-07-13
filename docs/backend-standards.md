# Backend Engineering Standards

This document enforces the foundational architectural rules for the Smatal HR System platform. All engineers must adhere to these constraints to maintain a pristine Domain-Driven Design (DDD) environment and Clean Architecture separation.

## 1. Architectural Boundaries

- **Kernel/Domain**: `backend/src/kernel/` must remain **100% Framework Independent**. 
  - ❌ NO imports from `@nestjs/*`.
  - ❌ NO imports from `@prisma/*` or any ORM.
  - ❌ NO dependencies on HTTP concepts (e.g. `Request`, `Response`).
- **Application Layer**: Contains generic execution buses, DTOs, and Handlers.
  - ✔️ Maps HTTP requests to Domain Operations.
  - ✔️ Implements CQRS generic dispatchers.
  - ❌ NO database queries or table mappings.
- **Persistence Layer**: `backend/src/infrastructure/database/` is the **only** layer allowed to depend on Prisma.
  - ✔️ Maps pure `DomainEntity` back and forth to Prisma ORM objects.

## 2. CQRS & Unit Of Work

- **Handlers**: Every Use Case must be encapsulated inside a `BaseCommandHandler` or `BaseQueryHandler`.
- **Result Monad**: Handlers must *never* throw errors for expected business invariant violations. Always return `Result.success(val)` or `Result.failure(DomainException)`.
- **Transactions**: All `Command` handlers executed by the `CommandDispatcher` are automatically wrapped in a `PrismaUnitOfWork`. If you throw an exception or a system crash occurs, the database will intrinsically roll back.

## 3. Identifiers & Soft Deletes

- **IDs**: Never use raw `string` or `number` for entities. Always wrap them in the `Identifier` class.
- **Deletions**: DO NOT hard delete records. If your Entity inherits from `SoftDeletableEntity`, the underlying `PrismaRepository.delete()` method will automatically intercept the destruction command and issue an `UPDATE { isDeleted: true }` instead.

## 4. API Standardization

- All successful HTTP responses are automatically wrapped in the standard envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "metadata": { "timestamp": "...", "correlationId": "..." }
  }
  ```
- Do not manually construct these objects in your controllers; just return the DTO and let the `TransformInterceptor` intercept and wrap the payload.

## 5. Persistence Base Contracts

Every business entity must extend one of the following base classes in `backend/src/kernel/domain/models/`:
- **`BaseBusinessEntity`**: For global entities (e.g., Profile, System Settings). It enforces `businessId`, `createdAt`, `updatedAt`, `isDeleted`, and `version` automatically.
- **`TenantIsolatedEntity`**: For tenant-specific entities (e.g., Employee, Candidate, Document). It extends `BaseBusinessEntity` but strictly requires `companyId` for multi-tenant data isolation.

## 6. Security & Rate Limiting

- The system operates under a strict Content Security Policy (`helmet`).
- Always propagate the `x-correlation-id` when dispatching external queues or REST calls to trace request lifecycles.

## 7. Identity Architecture (Profile vs User)
- **Profile**: The human being. Profiles are structurally independent and Global.
- **IdentityUser**: The login credentials. If a Profile is granted platform access, an `IdentityUser` is created. The mapping is `IdentityUser (1)` -> `Profile (0..1)`. A Profile can exist without a User (e.g., an applicant who hasn't logged in), and a System Admin User might exist without a human HR Profile.
