# Testing Conventions

This document outlines the testing strategy for the Smatal HR System platform. All business logic added in later phases MUST comply with these standards to maintain high coverage and predictable CI pipelines.

## 1. Testing Layers

We adhere strictly to the "Testing Pyramid":

- **Unit Tests (`*.spec.ts`)**: 80% of testing volume.
  - Test pure Domain Entities and Value Objects (no dependencies).
  - Test Command & Query Handlers using injected `MockFactory` stubs.
  - Assert that business rules return `Result.failure()` appropriately instead of crashing.
- **Integration Tests (`*.int-spec.ts`)**: 15% of testing volume.
  - Tests `PrismaRepository` maps correctly.
  - Test the `PrismaUnitOfWork` rollbacks on intentional errors.
  - Must spin up a real database (typically via Testcontainers or a designated test DB).
- **End-to-End Tests (`*.e2e-spec.ts`)**: 5% of testing volume.
  - Test the full HTTP cycle using Supertest.
  - Assert the `TransformInterceptor` successfully envelops the output.
  - Do NOT test deep business rules here. E2E tests are for routing, security, and global pipelines.

## 2. Mocking Guidelines

- DO NOT manually write `jest.fn()` mocks in individual test suites. 
- ALWAYS use `MockFactory.createRepository<T>()` or `MockFactory.createUnitOfWork()` from `backend/src/common/testing/`.
- This ensures that if the interface contract changes, we only need to update the mocks in one place.

## 3. CQRS & Event Asserts

- When a Command mutates an Aggregate, use `CqrsTestHelper.assertEventPublished` to verify that the domain effectively recorded the correct Side Effect intent.
- Do not attempt to test Event Subscribers directly within a Command Handler test; test the subscriber in isolation.

## 4. Test Data Factories

- Use a library (e.g. `faker` or a custom Builder pattern) to generate input DTOs.
- Never hardcode strings or IDs unless they specifically dictate logic flow.
