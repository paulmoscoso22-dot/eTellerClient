# Tasks: Refactor attesa-benefondo Page with Modernized Cleanup & Unit Tests

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~255 lines (4 test files ~185 lines + 4 implementation files ~70 lines) |
| 400-line budget risk | **Low** |
| Chained PRs recommended | No |
| Suggested split | Single PR (tests + implementation + models) |
| Delivery strategy | auto-chain |

**Guard lines:**
```
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low
```

---

## Implementation Overview

**TDD-First Approach**: Phase 1 (RED: write failing tests) → Phase 2 (GREEN: implement to pass) → Phase 3 (verify coverage).

**Key Changes**:
- Create `ReportSearchParams` interface (typed event contract)
- Remove manual `subscription` field from page component (cleanup simplification)
- Update filter to emit typed `ReportSearchParams` instead of `any`
- Add 4 test suites (~25 failing tests in RED phase)
- Ensure 80%+ coverage on all components

**Dependency Order**: models → grid → filter → facade → page (bottom-up testing ensures base layers tested first).

---

## Phase 1: RED — Write Failing Tests (~185 lines)

Test-first phase: create all spec files to define required behavior. All tests FAIL until Phase 2 implementation.

### 1.1 Create ReportSearchParams Interface
- **File**: `src/app/features/archivi/report/domain/report-search.models.ts` (NEW)
- **What**: Define `ReportSearchParams` interface with 5 fields
- **Scope**: NEW file, ~15 lines
- **Content**:
  - Export `ReportSearchParams` interface
  - Fields: `trxCassa: string | null`, `trxDataDal: Date | null`, `trxDataAl: Date | null`, `trxStatus: number | null`, `trxBraId: string | null`
  - JSDoc comments for each field
- **Verification**: `npm run lint` (no errors)
- **Commit**: `feat: define ReportSearchParams type contract`
- **Complexity**: Small

### 1.2 Write AttesaBenefondoGridComponent Tests
- **File**: `src/app/features/archivi/report/components/attesa-benefondo-grid/attesa-benefondo-grid.component.spec.ts` (NEW)
- **What**: 6 test scenarios for grid component signal reactivity
- **Scope**: NEW test file, ~45 lines
- **Test Scenarios**:
  1. Render with data: `transactions()` populated → grid displays rows
  2. Empty data message: `transactions()` empty → placeholder message shown
  3. Signal reactivity: Update transactions signal → grid re-renders
  4. Loading state visible: `isLoading = true` → spinner visible
  5. Error state visible: `error = 'error text'` → error message displayed
  6. Columns defined: Verify 10 columns with correct `dataField` values
- **Setup**: Fixture pattern, `signal()` helpers, MockComponent for grid
- **Verification**: `npm run test -- attesa-benefondo-grid` → 6 FAIL (RED)
- **Commit**: `test: add AttesaBenefondoGridComponent test scenarios`
- **Complexity**: Medium

### 1.3 Write ReportFilterComponent Tests
- **File**: `src/app/features/archivi/report/components/report-filter/report-filter.component.spec.ts` (NEW)
- **What**: 7 test scenarios for filter typed emission and validation
- **Scope**: NEW test file, ~50 lines
- **Test Scenarios**:
  1. Typed emission: `searchClick.emit()` accepts `ReportSearchParams` type (TypeScript compile check)
  2. Date normalization dal: Emitted `trxDataDal.getHours() === 0` (start of day)
  3. Date normalization al: Emitted `trxDataAl.getHours() === 23` (end of day)
  4. Empty dates → null: Form cleared → emitted dates are `null`
  5. Null coercion strings: Empty `trxCassa` → emitted as `null` (or empty, per form)
  6. Validation blocks emit: Form invalid → `searchClick.emit()` NOT called
  7. Reset form: Call `reset()` → form resets to default values and `statusDefaultValue`
- **Setup**: FormBuilder, spy on `searchClick.emit()`, fixture with reactive form
- **Verification**: `npm run test -- report-filter` → 7 FAIL (RED)
- **Commit**: `test: add ReportFilterComponent test scenarios`
- **Complexity**: Medium

### 1.4 Write ReportFacade Tests
- **File**: `src/app/features/archivi/report/services/report.facade.spec.ts` (NEW)
- **What**: 5 test scenarios for facade Observable contract
- **Scope**: NEW test file, ~40 lines
- **Test Scenarios**:
  1. Search method contract: `getTransactionWaitingForBef(...)` returns `Observable<T[]>`
  2. HTTP POST to correct URL: `HttpTestingController` expects POST to `/api/Report/WaitingForBEF`
  3. Params normalization: Pass null/empty params → facade normalizes before HTTP (if applicable)
  4. Observable stream emits: Subscribe → emits data array successfully
  5. HTTP error handling: Mock HTTP error → Observable error channel receives error
- **Setup**: `HttpTestingController`, `HttpClientTestingModule`, spy on `http.post`
- **Verification**: `npm run test -- report.facade` → 5 FAIL (RED)
- **Commit**: `test: add ReportFacade integration test scenarios`
- **Complexity**: Medium

### 1.5 Write AttesaBenefondoComponent Tests
- **File**: `src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.spec.ts` (NEW)
- **What**: 7 test scenarios for page orchestration and cleanup
- **Scope**: NEW test file, ~50 lines
- **Test Scenarios**:
  1. Init state: `transactions()` empty, `isLoading` false, `error` null
  2. Filter → Facade call: Emit `ReportSearchParams` → `facade.getTransactionWaitingForBef()` called with correct args
  3. Observable → Signal: Mock facade returns `of([mockData])` → `transactions()` populated
  4. No manual subscription: Inspect component code → no `subscription` property exists
  5. Cleanup on destroy: Create component → trigger `ngOnDestroy()` → Observable unsubscribed (verify via spy)
  6. Error handling: Mock facade error → `error()` signal set, `isLoading` false
  7. Rapid filter changes: Emit `ReportSearchParams` twice quickly → only latest result used
- **Setup**: `MockProvider(ReportFacade)`, fixture pattern, `DestroyRef` injection, spy on observable subscription
- **Verification**: `npm run test -- attesa-benefondo.component` → 7 FAIL (RED)
- **Commit**: `test: add AttesaBenefondoComponent test scenarios`
- **Complexity**: Medium

**Status after Phase 1**: ~25 failing tests, clear RED state ✅

---

## Phase 2: GREEN — Implement to Pass Tests (~70 lines)

Bottom-up implementation order: grid → filter → facade → page. Minimal changes because signals already present.

### 2.1 Implement AttesaBenefondoGridComponent (Verify Compliant)
- **File**: `src/app/features/archivi/report/components/attesa-benefondo-grid/attesa-benefondo-grid.component.ts` (MODIFY)
- **What**: Verify signals already present; add minimal template guards if needed
- **Scope**: MODIFY file, ~5–10 lines (likely no changes needed)
- **Changes**:
  - Verify `@Input transactions: Signal<GetTransactionWaitingForBefResponse[]>`
  - Verify `@Input isLoading: Signal<boolean>`
  - Verify `@Input error: Signal<string | null>`
  - If template not present: ensure template uses signal() syntax without async pipe
- **Verification**: `npm run test -- attesa-benefondo-grid` → 6 PASS ✅
- **Commit**: `refactor: verify AttesaBenefondoGridComponent signals already present`
- **Complexity**: Small

### 2.2 Implement ReportFilterComponent Typed Emission
- **File**: `src/app/features/archivi/report/components/report-filter/report-filter.component.ts` (MODIFY)
- **What**: Type the output event; no other changes needed
- **Scope**: MODIFY file, ~5 lines
- **Changes**:
  - Import `ReportSearchParams` from `domain/report-search.models.ts`
  - Change `@Output() searchClick = new EventEmitter<any>()` → `new EventEmitter<ReportSearchParams>()`
  - Emit logic already handles date normalization and null coercion (no changes to `search()` method logic)
- **Verification**: `npm run test -- report-filter` → 7 PASS ✅; `npm run lint` (no warnings)
- **Commit**: `refactor: emit typed ReportSearchParams from filter (no longer any)`
- **Complexity**: Small

### 2.3 Implement ReportFacade (Verify Observable Contract)
- **File**: `src/app/features/archivi/report/services/report.facade.ts` (VERIFY)
- **What**: Verify `getTransactionWaitingForBef()` signature unchanged
- **Scope**: VERIFY file, ~0–5 lines (likely no changes)
- **Changes**:
  - Inspect method signature: `getTransactionWaitingForBef(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId): Observable<T[]>`
  - If not present: add minimal payload normalization (trim strings, coerce nulls)
  - No breaking signature changes
- **Verification**: `npm run test -- report.facade` → 5 PASS ✅; `git grep "getTransactionWaitingForBef"` (no breaking calls elsewhere)
- **Commit**: `refactor: verify ReportFacade Observable contract (backward compatible)`
- **Complexity**: Small

### 2.4 Implement AttesaBenefondoComponent Page Orchestration
- **File**: `src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.ts` (MODIFY)
- **What**: Remove manual subscription cleanup; keep only `takeUntilDestroyed()`
- **Scope**: MODIFY file, ~30 lines
- **Changes**:
  1. Remove lines 4, 26 (Subscription import, subscription field)
  2. Remove lines 35–44 (ngOnDestroy, destroy() method)
  3. Update onSearch() signature: `onSearch(params: ReportSearchParams)` (import type)
  4. Update onSearch() body: destructure params, call facade with typed params
  5. Update getTransactionWithFilters() call: pass destructured params directly
  6. Keep takeUntilDestroyed() in pipeline (line 71)
  7. Keep signal update logic (lines 73–81)
- **Verification**: `npm run test -- attesa-benefondo.component` → 7 PASS ✅; coverage ≥80%
- **Commit**: `refactor: modernize AttesaBenefondoComponent to single cleanup pattern`
- **Complexity**: Medium

**Status after Phase 2**: ~25 tests PASS ✅, implementation complete, no TypeScript errors

---

## Phase 3: Verify Coverage & E2E (~0 lines)

No implementation; verification only.

### 3.1 Coverage Check & Manual E2E Verification
- **What**: Run coverage check; perform manual page load test
- **Scope**: No file changes; verification only
- **Commands**:
  - `npm run test -- attesa-benefondo --coverage` → verify ≥80% lines and branches
  - Manual: Load page → set date filters → click search → verify grid updates with correct data
- **Verification**: Coverage ≥80%; no behavioral regressions vs. current behavior
- **Commit**: (No commit needed; results verified with test run)
- **Complexity**: Small

**Status after Phase 3**: All tests PASS, coverage ≥80%, behavior verified ✅

---

## Files Affected Summary

| File | Action | Lines |
|------|--------|-------|
| `src/app/features/archivi/report/domain/report-search.models.ts` | CREATE | ~15 |
| `src/app/features/archivi/report/components/attesa-benefondo-grid/attesa-benefondo-grid.component.spec.ts` | CREATE | ~45 |
| `src/app/features/archivi/report/components/report-filter/report-filter.component.spec.ts` | CREATE | ~50 |
| `src/app/features/archivi/report/services/report.facade.spec.ts` | CREATE | ~40 |
| `src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.spec.ts` | CREATE | ~50 |
| `src/app/features/archivi/report/components/attesa-benefondo-grid/attesa-benefondo-grid.component.ts` | MODIFY | ~5 |
| `src/app/features/archivi/report/components/report-filter/report-filter.component.ts` | MODIFY | ~5 |
| `src/app/features/archivi/report/services/report.facade.ts` | VERIFY | ~0 |
| `src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.ts` | MODIFY | ~30 |
| **TOTAL** | | **~255** |

---

## Execution Checklist

- [ ] 1.1: Create ReportSearchParams model
- [ ] 1.2: Write grid component tests (RED)
- [ ] 1.3: Write filter component tests (RED)
- [ ] 1.4: Write facade tests (RED)
- [ ] 1.5: Write page component tests (RED)
- [ ] 2.1: Verify grid component (GREEN)
- [ ] 2.2: Implement filter typed emission (GREEN)
- [ ] 2.3: Verify facade contract (GREEN)
- [ ] 2.4: Implement page cleanup pattern (GREEN)
- [ ] 3.1: Coverage check + E2E (VERIFY)

---

**Design Version**: 1.0  
**Tasks Version**: 1.0  
**Change**: refactor-report-pages-cleanup  
**Status**: Ready for Apply phase
