# Proposal: AML CRUD Components — TDD + Lifecycle Refactor

## Intent

Two AML CRUD components (`gestione-comparenti-ade`, `gestione-regole`) share identical code quality gaps: mixed subscription cleanup patterns (race condition risk), missing `ChangeDetectionStrategy.OnPush` despite heavy signal use, popup state as plain booleans, and zero test coverage. This work adds 80%+ test coverage via TDD, refactors lifecycle management to a single safe pattern, modernizes to signals, and establishes a template for the remaining 6 vigilanza CRUD pages.

## Scope

### In Scope
- `gestione-comparenti-ade.component.ts` — refactor + tests
- `gestione-regole.component.ts` — refactor + tests
- `GestioneComparentiAdeService` — service tests (insert, update, delete, search, history, getById)
- `GestioneRegoleService` — service tests
- `gestione-comparenti-ade.models.ts` — model + date utility tests
- `gestione-regole.models.ts` — model tests
- Extract shared date conversion utility with isolated unit tests
- 6 new `.spec.ts` files (~30 lines each for models, ~60 for services, ~100 for components)

### Out of Scope
- Other vigilanza CRUD pages (giornale-cassa, operazioni-annullate, etc.) — future refactors
- Backend API changes (no scope change)
- E2E tests (unit + manual E2E verification only)
- State management consolidation (separate architecture task)

## Capabilities

### New Capabilities
- `aml-crud-lifecycle-pattern`: Component cleanup via `takeUntilDestroyed()` only (no manual Subscription); `ChangeDetectionStrategy.OnPush` enforced; popup state as signals; date conversions tested in isolation

### Modified Capabilities
None — refactor only; no spec-level behavior changes.

## Approach

**Phase 1: Tests First (TDD RED)**  
Write all 6 `.spec.ts` files defining required behavior: component search/add/edit/delete flows, service API calls, model validation, date edge cases. Tests fail until code refactored.

**Phase 2: Code Refactor (TDD GREEN)**  
- Remove `Subscription` field; replace all cleanup with `takeUntilDestroyed()`
- Add `ChangeDetectionStrategy.OnPush` to both components
- Convert popup booleans → signals
- Extract date utility to shared helper, test round-trip conversions
- All tests pass with 80%+ coverage

**Phase 3: Verify (TDD REFACTOR)**  
Run full suite, validate coverage, manual grid/form behavior check, commit.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/features/vigilanza/gestione/pages/gestione-comparenti-ade/` | Modified | Remove Subscription field; OnPush + takeUntilDestroyed + popup signals |
| `src/app/features/vigilanza/gestione/pages/gestione-regole/` | Modified | Remove Subscription field; OnPush + takeUntilDestroyed + popup signals |
| `src/app/features/vigilanza/gestione/services/gestione-comparenti-ade.service.ts` | Modified | Add request/response serialization (date handling) |
| `src/app/features/vigilanza/gestione/services/gestione-regole.service.ts` | Modified | Add request/response serialization (date handling) |
| `src/app/features/vigilanza/gestione/domain/` | New | Shared date utility + model validation tests |
| `*.component.spec.ts`, `*.service.spec.ts`, `*.models.spec.ts` | New | 6 test files (~500 LOC total) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Race condition in search() reassignment | Med | Fix in refactor; tests verify cleanup works |
| Signal syntax in templates | Low | Angular 21 handles getter syntax natively; tests verify bindings |
| DevExtreme grid test setup complexity | Med | Mock via TestBed + HttpClientTestingModule; test simple cases |
| Date edge cases (timezone, locale) | Med | Extract utility; unit tests cover round-trip conversions |
| Coverage unmet (80% target) | Low | Tests written first; coverage is part of design |

## Rollback Plan

If tests fail or regressions found:
1. `git reset --hard` to HEAD (code only; no data affected)
2. Restore manual `Subscription` pattern from git history
3. Remove signal conversions; revert to boolean state

## Dependencies

- Vitest + TestBed configured (✅ present; `.atl/testing-capabilities.md`)
- Angular 21 `takeUntilDestroyed`, `signal()`, `computed()` available (✅ present)
- HttpClientTestingModule available (✅ standard in Angular test setup)
- TypeScript strict mode enabled (✅ required by config)
- AuthStore mockable with `vi.fn()` (✅ standard pattern)

## Success Criteria

- ✅ All 6 test suites pass (Vitest)
- ✅ Unit test coverage ≥ 80% (branches, lines, functions)
- ✅ Manual Subscription field removed from both components
- ✅ `ChangeDetectionStrategy.OnPush` applied to both components
- ✅ `takeUntilDestroyed()` used for all subscription cleanup
- ✅ Popup state converted to signals (no plain booleans)
- ✅ Date utility extracted and tested in isolation
- ✅ HTML templates bind correctly to signal getters (no syntax errors)
- ✅ No functional changes (refactoring only — same inputs/outputs)
- ✅ No breaking changes to service API contracts
