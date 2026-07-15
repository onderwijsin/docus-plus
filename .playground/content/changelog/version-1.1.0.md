---
name: Version 1.1.0
tag: v1.1.0
publishedAt: 07-10-2025
---

Improvements to the Version 1 candidate creation endpoint, error responses, and documentation.

## New features

- **Upsert support for `/create-user`:** The endpoint now uses the candidate’s email address to update an existing record instead of creating a duplicate.

## Fixes

- **Improved error responses:** Error and validation responses are more consistent and provide clearer, more actionable feedback.

## Maintenance

- **Improved documentation:** Expanded and clarified guidance on schema usage, authentication, and integration.
- **Versioned base URL:** The API is now available at `https://onderwijsregio.onderwijsin.nl/api/v1`. The previous `/api` base URL remains available for the foreseeable future, but will be deprecated after Version 2 is released.
