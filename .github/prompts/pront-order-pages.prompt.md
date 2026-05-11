---
name: pront-order-pages
description: task for creating a GitHub issue to implement pagination and page ordering for the transactions list in the eTellerClient project.
---

<!-- Tip: Use /create-prompt in chat to generate content with agent assistance -->

Act as a software analyst and developer.

Task
Create a GitHub issue that outlines a clear, actionable plan to implement pagination and page ordering for the transactions list in the `eTellerClient` application. Do not write code; produce a complete issue body suitable for triage and scheduling.

repo: https://github.com/paulmoscoso22-dot/eTellerClient.git

Context
- Frontend: `eTellerClient` (Angular)
- Backend: `eTellerServer` API
- Current UI shows the transactions list without pagination or stable ordering which causes performance and usability problems when data grows.

Goals
- Add server-side and client-side pagination for the transactions list.
- Support stable ordering (e.g., newest-first, oldest-first, custom columns) and allow the client to request specific pages.
- Ensure efficient queries and minimal UI latency.

Steps to follow:
1. Define the Problem: describe user-facing symptoms and performance concerns.
2. Requirements: list UX requirements, query parameters, page size options, and sorting options.
3. API Design: propose query parameters, response format (items, page, pageSize, totalCount, next/prev links), and status codes.
4. Backend Changes: outline controller/service changes, DB query pagination (OFFSET/LIMIT or keyset pagination), indexing and performance considerations.
5. Frontend Changes: describe component updates, service calls, state handling, and UX for page controls and sorting.
6. Tests: list unit, integration, and e2e tests to add.
7. Migration/Rollout: data migration (if needed), backward compatibility, feature flag or API versioning plan.
8. Acceptance Criteria: measurable conditions for completion.
9. Estimate & Risks: rough effort estimate and potential pitfalls.

Output Checklist
- [ ] Issue title
- [ ] Problem statement
- [ ] Requirements
- [ ] API design (params + response example)
- [ ] Backend implementation plan (including DB/query guidance)
- [ ] Frontend implementation plan
- [ ] Testing plan
- [ ] Rollout/migration plan and flags
- [ ] Acceptance criteria
- [ ] Rough time estimate and risks
