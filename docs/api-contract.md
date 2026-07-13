# Smatal HR System - API Contract

This document provides the canonical reference for the Smatal HR System REST API boundaries. All responses follow the `ApiResponse<T>` envelope.

## 1. Authentication
* **POST `/api/v1/auth/login`**: Authenticates a user and returns a JWT pair.
* **POST `/api/v1/auth/refresh`**: Refreshes an expired access token using a refresh token.
* **POST `/api/v1/auth/register`**: Registers a new IdentityUser and creates an associated Company (for root tenant creation).
* **GET `/api/v1/auth/me`**: Returns the current authenticated IdentityUser and their Profile.

## 2. Organization & Identity
* **GET `/api/v1/companies`**: Lists companies (Super Admin) or current company.
* **POST `/api/v1/branches`**: Creates a new branch for the current company.
* **GET `/api/v1/departments`**: Lists active departments with pagination.
* **POST `/api/v1/designations`**: Creates a new designation.
* **GET `/api/v1/roles`**: Lists tenant-specific RBAC roles.
* **GET `/api/v1/permissions`**: Lists available system permissions.

## 3. Master Setup & Dynamic Fields
* **POST `/api/v1/field-definitions`**: Defines a new dynamic field (Text, Number, Date, Checkbox, Dropdown) tied to an entity (e.g., `CANDIDATE`).
* **GET `/api/v1/field-definitions`**: Retrieves all field definitions for a specific `entityType`.
* **POST `/api/v1/field-groups`**: Creates a field group for UI organization.

## 4. Candidate Lifecycle
* **POST `/api/v1/candidates`**: Creates a candidate application, automatically computing default `FieldValues`.
* **GET `/api/v1/candidates/:id`**: Fetches candidate details including expanded polymorphic dynamic fields.
* **PATCH `/api/v1/candidates/:id`**: Updates core details and `FieldValues`.

## 5. Employee Lifecycle
* **POST `/api/v1/employees`**: Hires a candidate, migrating them to an active Employee, mapping `reportsTo` hierarchy.
* **GET `/api/v1/employees`**: Paginated search of active employees.
* **PATCH `/api/v1/employees/:id/promote`**: Dispatches an employee promotion workflow event.
* **PATCH `/api/v1/employees/:id/terminate`**: Triggers offboarding workflow.

## 6. Workflow Engine
* **GET `/api/v1/workflow-definitions`**: Lists available workflows (e.g., Onboarding, Appraisal).
* **POST `/api/v1/workflow-instances`**: Starts a new workflow for a specific entity (`entityType`, `entityId`).
* **PATCH `/api/v1/workflow-instances/:id/transition`**: Moves a workflow to a new stage.
* **GET `/api/v1/workflow-instances/:id/history`**: Retrieves the immutable timeline of state changes.

## 7. Document Engine
* **POST `/api/v1/document-types`**: Defines a new document category (e.g., "Offer Letter").
* **POST `/api/v1/templates`**: Creates a new HTML template with `{placeholders}`.
* **POST `/api/v1/documents/generate`**: Resolves placeholders against the `FieldRuntimeService`, captures an immutable JSON `snapshot`, and returns a GeneratedDocument ID.
* **GET `/api/v1/documents/:id/download`**: Streams the compiled PDF buffer for a GeneratedDocument.

## 8. Audit & Analytics
* **GET `/api/v1/audit-logs`**: Retrieves paginated, filtered system audit trails.
* **GET `/api/v1/global-search`**: Executes a high-performance cross-table query against Employees, Candidates, and Documents.
* **GET `/api/v1/notifications`**: Retrieves active user notifications.
