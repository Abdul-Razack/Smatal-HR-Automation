# Smatal HR System - Frontend Integration Guide

This guide outlines the architectural patterns frontend developers must follow when integrating with the Smatal HR System Backend.

## 1. The `ApiResponse<T>` Envelope

Every REST endpoint (except raw file downloads) returns data wrapped in a strict JSON envelope. 

### Structure
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
  meta: {
    timestamp: string;
    correlationId: string;
    pagination?: {
      page: number;
      size: number;
      total: number;
      items: number;
    }
  }
}
```

**Rule:** Always check `success === true`. Do not rely solely on HTTP status codes, though they are correctly mapped (200 OK, 400 Bad Request, etc.).

## 2. Authentication Flow
1. **Login:** Submit `POST /api/v1/auth/login`. 
2. **Token Storage:** Extract the `accessToken` from the `data` payload. Store it securely (in-memory or secure HttpOnly cookie wrapper).
3. **Authorization Header:** Pass `Authorization: Bearer <accessToken>` on all subsequent requests.
4. **Token Refresh:** When 401 Unauthorized occurs, call `POST /api/v1/auth/refresh` to transparently swap the expired token.

## 3. Pagination, Sorting, and Filtering
GET requests returning lists use query parameters.
- `?page=1&limit=20`
- `?sortBy=createdAt&sortOrder=DESC`
- `?search=John`

The backend reads these into a strict `PaginatedQueryDto`. The response `meta.pagination` block tells you how to render your data tables.

## 4. Error Handling
When `success === false`, inspect the `error` object.
- **400 Bad Request:** Usually `class-validator` failures. `error.details` will contain an array of constraint violations mapped by field.
- **403 Forbidden:** The authenticated user lacks the required RBAC `Role` or `Permission` for this endpoint.
- **404 Not Found:** `error.code` = `NOT_FOUND`. 
- **409 Conflict:** Optimistic Locking failure or duplicate data. E.g., `error.code` = `OPTIMISTIC_LOCK_EXCEPTION`.

## 5. File Uploads & Downloads
- **Uploads:** Use `multipart/form-data`. The backend validates MIME types and file sizes via NestJS Interceptors.
- **Downloads:** E.g., PDF generation endpoints (`/api/v1/documents/:id/download`). These return raw binary buffers with `Content-Type: application/pdf`. Do *not* expect an `ApiResponse` envelope here. Handle the blob directly via `window.URL.createObjectURL(blob)`.

## 6. Dynamic Fields Runtime
When editing a Candidate or Employee, they may possess custom fields.
- The UI must first query `GET /api/v1/field-definitions?entityType=CANDIDATE`.
- Render the form dynamically based on `fieldType` (TEXT, NUMBER, CHECKBOX, DROPDOWN).
- When submitting the Candidate creation/update, pass the dynamic fields under the `fieldValues` array payload object. The backend's `FieldRuntimeService` handles validation against regex and min/max constraints.
