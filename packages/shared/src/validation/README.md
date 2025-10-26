# Validation Schemas

This directory contains Zod validation schemas for the almost all API routes. These schemas ensure that the **request data** being processed to ensure the expected structure and types.

each file has some stuff for each API route:

- schema
  - Zod schema for validating request data and are used in the _ValidateRequest middleware_.
- TS type
  - _TypeScript type_ inferred from the Zod schema for use in the application code (controllers, services, etc.).

## Naming Conventions

- Schema naming:

  - `<action><Resource><For>Schema`
  - `<action>` like `create`, `update`, `get`, `delete`
  - `<Resource>` like `User`, `Block`, `Project`
  - `<For>` is to specify the context and where the data will actually be located, like `Body`, `Params`, `Query` (no other options)

- Input type naming
  - `<Action><Resource><For>Input`
  - Follows almost the same conventions as schema naming with:
    - `<Action>` instead of `<action>`
    - `Input` instead of `Schema`
