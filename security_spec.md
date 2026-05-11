# Security Specification for RHDreams

## 1. Data Invariants
- Candidates must belong to a user (`userId` match).
- Jobs must belong to a user (`userId` match).
- Agents must belong to a user (`userId` match).
- Logs must belong to a user (`userId` match).
- All timestamps (`createdAt`) must be server-generated.
- All IDs must be valid (alphanumeric, size <= 128).
- Users can only read and write their own data.

## 2. The "Dirty Dozen" Payloads (Deny Cases)
1. **Identity Spoofing**: Attempt to create a Candidate with a different `userId`.
2. **Resource Poisoning**: Use a 10KB string as a Candidate ID.
3. **Identity Integrity**: Update a Candidate's `userId` to someone else's.
4. **Timestamp Bypass**: Create a Job with a hardcoded `createdAt` from 1990.
5. **State Shortcutting**: Directly set a Candidate's stage to "Contratado" from "Nuevo" without permission of the transition (actually, in this simple CRM, we allow transitions, but we check schema).
6. **Immutable Field Attack**: Try to change `createdAt` on an existing Job.
7. **Shadow Field Injection**: Add a `isVerified: true` field to an Agent that isn't in the schema.
8. **PII Leak**: Authenticated user trying to 'get' a candidate they don't own.
9. **Blanket Read**: Unauthenticated 'list' request to jobs.
10. **Resource Exhaustion**: Send an Agent `description` that is 2MB.
11. **Orphaned Writes**: Create a Log for an `agentId` that doesn't exist (verified via `exists`).
12. **System Field Modification**: Attempt to manually change `applicants` count on a Job (should be system-driven, but for now we'll just check for owner).

## 3. Test Runner (Conceptual)
All tests should verify `PERMISSION_DENIED` for the above payloads.
