# Proposal: Refactor attesa-benefondo Page with Modernized Cleanup & Unit Tests

## Intent

The attesa-benefondo report page uses a mixed cleanup pattern (manual `Subscription` + `takeUntilDestroyed`) and lacks unit tests. This refactor modernizes lifecycle management to a single pattern, converts subscriptions to reactive signal flow, adds type safety for filters, and establishes 80%+ test coverage — creating a template for 3 identical report pages in follow-up refactors.

## Scope

### In Scope
- `src/app/features/archivi/report/pages/attesa-benefondo/` — component refactor
- `src/app/features/archivi/report/components/report-filter/` — type filter output
- `src/app/features/archivi/report/components/attesa-benefondo-grid/` — no changes (already signals)
- Unit tests for all three layers + facade isolation tests
- New `ReportSearchParams` interface for typed filter events

### Out of Scope
- giornale-cassa, operazioni-annullate, totali-cassa pages (separate refactors)
- ReportFacade API consolidation (separate cleanup)
- Transaction model consolidation (domain layer task)
- E2E tests (unit + manual verification only)

## Capabilities

### New Capabilities
- `report-filter-typed-search`: Filter component emits `ReportSearchParams` instead of `any`; enforces date normalization and null-coercion rules at filter layer

### Modified Capabilities
None — refactor only; no spec-level behavior changes.

## Approach

**Phase 1: Tests First (TDD RED)**  
Write all `.spec.ts` files with failing tests defining required behavior (4 test suites: page, filter, grid, facade).

**Phase 2: Code Refactor (TDD GREEN)**  
- Remove manual `Subscription` field; keep only `takeUntilDestroyed()`
- Convert to `toSignal()` for reactive Observable → Signal flow
- Create `ReportSearchParams` interface; Filter emits typed event
- Tests pass with 80%+ coverage

**Phase 3: Verify (TDD REFACTOR)**  
Run full test suite, check coverage, manual E2E load/filter verification, commit.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attesa-benefondo.component.ts` | Modified | Remove `Subscription` field; use `toSignal()` for reactive data flow |
| `report-filter.component.ts` | Modified | Emit `ReportSearchParams` (typed) instead of `any` |
| `report-search.models.ts` | New | Define `ReportSearchParams` interface with 5 required fields |
| `*.component.spec.ts` | New | 4 test suites (~180 lines total) covering all layers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| async pipe template changes | Low | Write tests first; manual E2E verifies grid renders same data |
| Mock complexity (Facade) | Medium | Use `MockProvider` + Vitest fixtures; isolate HTTP layer |
| Coverage target unmet | Low | Tests written before refactor; 80% built into design |
| Other pages break | Medium | git grep imports; no breaking changes to filter/facade signatures |

## Rollback Plan

If tests fail or regressions found:
1. `git reset --hard` to HEAD (no data changed; component code only)
2. Revert `ReportSearchParams` interface (no consumer code depends on it yet)
3. Restore manual `Subscription` pattern from git history

## Dependencies

- Vitest configured and running (✅ present; see `vitest.config.ts`)
- Angular 21 `takeUntilDestroyed` + `toSignal` available (✅ present)
- TypeScript strict mode enabled (✅ required by config)

## Success Criteria

- ✅ 0 TypeScript errors or warnings
- ✅ All unit tests pass (page, filter, grid, facade)
- ✅ Code coverage ≥ 80% for this module
- ✅ Only `takeUntilDestroyed()` used for cleanup (no manual Subscription)
- ✅ Filter emits typed `ReportSearchParams` (no `any`)
- ✅ Page behavioral regression: NONE (grid renders same data before/after)
- ✅ Code review approved with no significant comments
