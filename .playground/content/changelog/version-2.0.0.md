---
name: Version 2.0.0
tag: v2.0.0
publishedAt: 03-24-2026
---

Introducing the Mutation Engine, a fully expanded candidate API, and a sandbox-ready foundation.

## Overview

Version 2 is a major evolution of the Onderwijsregio API. While most integrations can migrate with minimal effort, this release introduces a new execution model and a significantly expanded API surface.

The most important conceptual change—though not strictly a breaking change—is the introduction of the **Mutation Engine**. All write operations are now asynchronous and processed via queued mutations. This improves reliability and predictability, but requires changes for integrations that previously assumed synchronous writes.

We strongly recommend reviewing the **Mutation Engine documentation** and **Migration Guide** before upgrading.

**Key themes in this release:**

- **Asynchronous, resilient writes:** Create, update, and delete operations are queued, rate-limited, and completed asynchronously.
- **Expanded candidate management:** Full CRUD support for candidates, interactions, and attachments.
- **Standards-based schema and validation:** `/schema` now returns JSON Schema that matches runtime validation.
- **Improved developer experience:** Sandbox support, consistent responses, explicit authentication rules, and clearer errors.

Read the [Migration Guide](https://docs.onderwijsregio.onderwijsin.nl/version-2/guide/migration-guide) for the complete list of breaking and non-breaking changes.

---

## New features

This release introduces various new features, too many to individually document in this changelog. We recommend exploring all available endpoints in the [Interactive API Reference](/version-2/api-reference). We’ll highlight the most important new features below.

### Mutation Engine

All write operations in v2 are handled asynchronously by the Mutation Engine.

- All mutations return **202 Accepted**.
- Writes are processed asynchronously.
- Results are delivered through `callbackUrl` or eventual consistency.
- Queuing, rate limiting, and idempotency are built in.

This replaces the synchronous write behavior of v1 and eliminates timeouts caused by Airtable latency.

### Expanded candidate endpoints

Version 2 introduces a complete candidate management API:

- List candidates with cursor-based pagination.
- Retrieve candidates by ID.
- Find candidates by email or phone.
- Create candidates in bulk.
- Upsert or update candidates.
- Archive or permanently delete candidates.

Fields returned can be explicitly selected, and interactions can be optionally included.

### Interactions API

Interactions are now first-class resources.

You can:

- List interactions for a candidate.
- Create interactions in bulk.
- Retrieve, update, and delete individual interactions.

### Attachment handling

Attachments are now fully supported in the API:

- Upload CVs and other attachments during candidate creation.
- Add attachments to existing candidates.
- Remove attachments by attachment ID.
- Use public URLs or base64 uploads.

Attachments are processed asynchronously and safely transferred to Airtable.

### Candidate email verification & session authentication

Introduced candidate-facing authentication flows:

- Request email verification for a candidate.
- Authenticate candidates through session tokens.
- Retrieve candidate records linked to an authenticated session.

This enables secure candidate-facing experiences without exposing region API keys.

### Sandbox environment

You can now safely test integrations without touching production data.

Sandbox mode can be enabled by:

- Prefix endpoints with `/sandbox`.
- Or set the `x-api-sandbox: true` header.

Sandbox status is explicitly returned in response metadata.

### Region and API key management

Regions are now first-class API resources.

New capabilities include:

- List, create, and update regions (admin-only).
- Retrieve authenticated region details.
- Create and revoke API keys programmatically.
- Receive an API key in full **only once**.

Admin-scoped API keys can override region context for testing and debugging.

### Domain-based API structure

Endpoints are now clearly grouped by responsibility:

- Auth
- Regions
- Admin
- Schema
- Candidates
- Interactions
- Attachments
- Webhooks

This improves discoverability and clarifies authentication scope per endpoint.

---

## 🔄 Schema overhaul

The `/schema` endpoint has been completely redesigned.

- Returns a **standards-compliant JSON Schema**

- Generated directly from runtime validation logic

- Fully compatible with OpenAPI tooling and JSON Schema validators

- Eliminates drift between documentation and actual validation

This replaces the proprietary schema format used in v1.

---

## 🛠️ Fixes & improvements

Along with all new features, various fixes have been implemented for issues that were present in the v1 API.

### Explicit authentication per endpoint

Authentication requirements are now defined per operation instead of implicitly at the API root. This prevents accidental exposure of public or candidate-facing endpoints.

### Consistent response envelopes

All endpoints now return standardized success and error responses, making client-side handling predictable and uniform.

### Field naming consistency

Candidate and interaction field names have been standardized and translated to English across all endpoints. Input and output field names now always match the schema.

---

## ⚠️ Breaking & notable changes

- **Hard API versioning**\
  Introduced `/api/v2` as a strict version boundary. v1 integrations must explicitly migrate.

- **Asynchronous write model**\
  All write operations are now async. Integrations relying on immediate write results must update their flow.

- **Authentication header change**\
  Use `x-api-key` instead of the deprecated `api-key` header.

- **Schema format change**\
  Clients parsing the old `/schema` format must update to JSON Schema parsing.

---

## 📘 Next steps

- Review the [**Migration Guide**](/version-2/guide/migration-guide) for a step-by-step upgrade path

- Read the [**Mutation Engine documentation**](/version-2/guide/mutations/mutation-engine) to understand async behavior

- Explore the new endpoints using the [**Interactive API Reference**](/version-2/api-reference)
