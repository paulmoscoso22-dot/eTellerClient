# Specification: Refactor attesa-benefondo Page with Modernized Cleanup & Unit Tests

## Purpose

This specification defines the behavior of refactored report page components with single lifecycle cleanup pattern, reactive signal-based data flow, and typed filter parameters. Establishes a reusable template for 3 identical report pages (giornale-cassa, operazioni-annullate, totali-cassa) in follow-up work.

---

## ADDED Requirements

### Requirement: ReportSearchParams Type Contract

The filter layer SHALL emit a strictly typed `ReportSearchParams` interface instead of `any`, with date normalization rules enforced at filter emission time.

```typescript
interface ReportSearchParams {
  trxCassa: string | null;        // nullable string
  trxDataDal: Date | null;         // normalized to 00:00:00, null if empty
  trxDataAl: Date | null;          // normalized to 23:59:59, null if empty
  trxStatus: number | null;        // nullable number
  trxBraId: string | null;         // nullable string
}
```

#### Scenario: Filter emits typed ReportSearchParams with date normalization

- GIVEN ReportFilterComponent with form fields filled
- WHEN user clicks search button and form is valid
- THEN filter emits `ReportSearchParams` object with:
  - `trxDataDal` set to start-of-day (00:00:00) if date provided, else `null`
  - `trxDataAl` set to end-of-day (23:59:59) if date provided, else `null`
  - String fields (`trxCassa`, `trxBraId`) as entered or `null`
  - `trxStatus` as selected or `null`

#### Scenario: Empty dates coerce to null

- GIVEN ReportFilterComponent with cleared date fields
- WHEN user clicks search button
- THEN emitted `ReportSearchParams` has `trxDataDal: null` and `trxDataAl: null`
- AND no TypeScript type errors on consuming component

---

### Requirement: Reactive Signal-Based Page Data Flow

The report page component SHALL convert Observable responses from Facade into Signal values via `toSignal()`, eliminating manual subscription management and enabling reactive template binding.

#### Scenario: Page receives filter event and delegates to Facade

- GIVEN AttesaBenefondoComponent with injected ReportFacade
- WHEN ReportFilterComponent emits `ReportSearchParams`
- THEN page calls `facade.search(params)` or equivalent method
- AND page receives Observable<Transaction[]> response
- AND page converts Observable to Signal using `toSignal(destroyRef)`
- AND no manual Subscription field is retained

#### Scenario: Template renders grid via async pipe with signal data

- GIVEN page has `gridData: Signal<Transaction[]>` populated
- WHEN component renders template
- THEN `<app-grid [data]="gridData() | async">` (or signal-directly if using latest syntax)
- AND grid receives current transaction array
- AND re-renders only when signal value changes

#### Scenario: Component cleanup via takeUntilDestroyed eliminates leaks

- GIVEN component with `DestroyRef` injected
- WHEN Facade Observable is subscribed with `takeUntilDestroyed(destroyRef)`
- AND component is destroyed
- THEN Observable subscription is automatically unsubscribed
- AND no manual Subscription cleanup code required in ngOnDestroy

---

### Requirement: Facade Interface Contract Stability

The ReportFacade methods SHALL accept `ReportSearchParams`-compatible parameters and return Observable<GridData[]> with no signature changes to existing callers.

#### Scenario: Facade search method accepts individual parameters

- GIVEN ReportFacade.getTransactionWaitingForBef(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId)
- WHEN page calls with params mapped from `ReportSearchParams`
- THEN method executes without modification to existing signature
- AND returns Observable<GetTransactionWaitingForBefResponse[]>
- AND HTTP layer unchanged (no API contract break)

---

### Requirement: Loading and Error State Signals

The page component SHALL maintain loading and error state via signals with reactive template feedback.

#### Scenario: Loading state during API call

- GIVEN page initiates search via Facade
- WHEN Observable starts (async operation begins)
- THEN `isLoading` signal set to `true`
- AND filter button or grid shows loading indicator
- WHEN Observable completes or errors
- THEN `isLoading` signal set to `false`

#### Scenario: Error state on API failure

- GIVEN page calls Facade and HTTP request fails
- WHEN Observable error handler executes
- THEN `error` signal set to error message
- AND error message displayed in grid footer or toast
- WHEN next search initiated
- THEN error signal cleared (set to `null`)

---

## Test Scenarios Structure

### AttesaBenefondoComponent.spec.ts (Page Component Tests)

| Scenario | Setup | Action | Assert |
|----------|-------|--------|--------|
| **init** | Create component, inject ReportFacade mock | - | `transactions.signal` is empty; `isLoading` false; `error` null |
| **filter→facade** | Emit ReportSearchParams from child filter | `onSearch(params)` called | `facade.search(params)` invoked once; loading set true |
| **observable→signal** | Facade returns Observable<Data[]> | Subscribe via `toSignal()` | Result signal populated; template renders via async pipe |
| **no manual sub** | Inspect component code | - | No `subscription` field; no manual `unsubscribe()` in ngOnDestroy |
| **cleanup on destroy** | Component initialized with subscription | Destroy component | Observable unsubscribed via `takeUntilDestroyed`; no memory leak |
| **error handling** | Facade returns error Observable | Error fires | `error` signal set; `isLoading` false; grid shows error message |
| **rapid filter changes** | Emit filter params twice quickly | - | Only latest Observable result used (switchMap behavior) |

**Assertion Details:**
- ✅ `fixture.componentInstance.transactions()` returns array (or empty for initial state)
- ✅ `fixture.debugElement.query(By.directive(AttesaBenefondoGridComponent))` rendered
- ✅ MockFacade.search called with `ReportSearchParams` (strict type check, not `any`)

---

### ReportFilterComponent.spec.ts (Filter Component Tests)

| Scenario | Setup | Action | Assert |
|----------|-------|--------|--------|
| **emit typed** | Form with valid inputs | Click search | `searchClick` emits `ReportSearchParams` (not `any`) |
| **date normalize dal** | Date field set to 2026-05-27 | Search | Emitted `trxDataDal` has time 00:00:00 |
| **date normalize al** | Date field set to 2026-05-27 | Search | Emitted `trxDataAl` has time 23:59:59 |
| **empty dates→null** | Date fields cleared | Search | Emitted `trxDataDal` and `trxDataAl` are `null` |
| **null coercion string** | trxCassa field cleared | Search | Emitted `trxCassa` is `null`, not empty string |
| **validation blocks emit** | Form invalid (required field missing) | Click search | No `searchClick` emitted; form.invalid = true |
| **reset form** | Form with values | Click reset | Form resets to defaults; status field = statusDefaultValue |

**Assertion Details:**
- ✅ Spy on `searchClick.emit()` and capture emitted value
- ✅ Assert emitted value type matches `ReportSearchParams` interface
- ✅ Date assertions: `emitted.trxDataDal.getHours() === 0 && emitted.trxDataDal.getMinutes() === 0`

---

### AttesaBenefondoGridComponent.spec.ts (Grid Component Tests)

| Scenario | Setup | Action | Assert |
|----------|-------|--------|--------|
| **render with data** | Create component; set @Input transactions signal | - | Grid displays rows matching signal data |
| **empty data message** | Create component; transactions() returns [] | - | Empty state message or placeholder shown |
| **signal reactivity** | Grid rendered; update transactions signal | `transactions.set([...newData])` | Grid re-renders with new data |
| **loading state** | Set isLoading = true | - | Loading spinner visible; grid disabled or dimmed |
| **error state** | Set error = 'Network failed' | - | Error message displayed; grid hidden or disabled |
| **columns defined** | Inspect component | - | Grid has 10 column definitions (trxId, trxAptId, etc.) |

**Assertion Details:**
- ✅ `getByTestId('grid')` or similar query finds grid element
- ✅ `getAllByRole('row')` count matches data array length + 1 header row
- ✅ No subscription leaks (ngOnDestroy logs or spy checks)

---

### ReportFacade.spec.ts (Facade Integration Tests with Mocked HTTP)

| Scenario | Setup | Action | Assert |
|----------|-------|--------|--------|
| **search method** | Inject HttpClient mock; create facade | Call `getTransactionWaitingForBef(...)` | HTTP POST to `/Report/WaitingForBEF`; returns Observable |
| **params normalization** | Pass ReportSearchParams mapped to method args | - | Facade calls HTTP with normalized payload (strings trimmed, nulls passed) |
| **observable stream** | Subscribe to facade result | - | Returns Observable<GetTransactionWaitingForBefResponse[]> |
| **http error** | Mock HTTP error response | Subscribe with error handler | Error Observable emitted; component error signal can catch |
| **null params** | Call with all nulls | - | HTTP payload has null values; API accepts |

**Assertion Details:**
- ✅ `httpClient.post` called with correct URL and payload structure
- ✅ Return value is Observable (not Promise; allows `toSignal()` wrapping)
- ✅ No memory leaks in facade (HttpClient manages subscriptions)

---

## Acceptance Criteria

### Code Quality
- ✅ Zero TypeScript errors in strict mode
- ✅ ESLint: zero warnings in component files
- ✅ No manual `Subscription` field in page component
- ✅ Only `takeUntilDestroyed()` used for Observable cleanup

### Test Coverage
- ✅ Unit tests pass: `npm run test -- attesa-benefondo`
- ✅ Coverage ≥ 80% for:
  - `AttesaBenefondoComponent` (page)
  - `ReportFilterComponent` (filter)
  - `AttesaBenefondoGridComponent` (grid)
- ✅ All 20+ test scenarios pass (see Test Scenarios table above)

### Type Safety
- ✅ ReportFilterComponent emits `ReportSearchParams` (typed event, no `any`)
- ✅ Page component receives typed `ReportSearchParams` in onSearch handler
- ✅ No `as any` casts in filter→page→facade flow

### Behavioral Regression
- ✅ Grid renders identical data before/after refactor
- ✅ Filter validation rules unchanged
- ✅ Date normalization rules preserved (start-of-day / end-of-day)
- ✅ API calls unchanged (facade signature stable)

### Observable Cleanup
- ✅ No subscription leaks on component destroy
- ✅ DestroyRef injection present in page component
- ✅ `takeUntilDestroyed(this.destroyRef)` applied to all Observables
- ✅ ngOnDestroy hook empty or only calls base cleanup (no manual unsubscribe)

---

## Edge Cases & Constraints

### Date Handling
- **Invalid date format**: Form validation prevents invalid dates from submission
- **Null/undefined dates**: Filter coerces to `null`; facade accepts `null` params
- **Date object persistence**: Dates in `ReportSearchParams` are JS Date objects; facade converts to ISO/backend format as needed

### Rapid Filter Changes
- Page SHALL use `switchMap` operator internally to cancel previous requests when new filter emitted
- Only latest request result updates grid; earlier results discarded
- Loading state managed per-request (each new request sets `isLoading = true`)

### Component Lifecycle
- Filter component destroyed → page still active (independent components)
- Page component destroyed → all Observables cleaned via `takeUntilDestroyed`
- Facade service never destroyed (singleton, HttpClient manages HTTP cleanup)

### Template Binding
- Async pipe on Signal: `(transactions() | async)` if using Observable-backed signal, OR `transactions()` for direct signal access
- Loading/error states: template guards render grid only when not loading and no error

### Memory Constraints
- No long-lived subscriptions retained after component destroy
- Facade HTTP calls cleaned up by HttpClient internals (no additional teardown needed)
- Signal values garbage-collected when component destroyed

---

## Scenarios for TDD Test-First Approach

### Phase 1: RED Tests (All Failing)

Write test suites for:
1. **AttesaBenefondoComponent** — page logic and signal flow
2. **ReportFilterComponent** — typed event emission and date normalization
3. **AttesaBenefondoGridComponent** — signal-driven grid rendering
4. **ReportFacade** — Observable contract and HTTP integration

All tests fail until implementation complete.

### Phase 2: GREEN Code (Make Tests Pass)

1. Extract `ReportSearchParams` interface (see type contract above)
2. Refactor ReportFilterComponent: emit `ReportSearchParams` (typed) instead of `any`
3. Refactor AttesaBenefondoComponent:
   - Remove `subscription` field
   - Use `toSignal(destroyRef)` to wrap Observable
   - Add `takeUntilDestroyed()` to Facade calls
4. Verify AttesaBenefondoGridComponent already uses signals (no changes needed)

### Phase 3: REFACTOR & Coverage

- Ensure coverage ≥ 80% for all 3 components
- Run full test suite: `npm run test -- attesa-benefondo`
- Manual E2E: load page, filter, verify grid updates without errors
- Commit with passing tests

---

## Measurement & Verification

| Criterion | Tool | Command | Passing Threshold |
|-----------|------|---------|-------------------|
| Unit tests | Vitest | `npm run test -- attesa-benefondo` | All pass (0 failures) |
| Code coverage | Vitest + c8 | `npm run test -- attesa-benefondo --coverage` | ≥ 80% lines, branches |
| Type errors | TypeScript | `ng build` or `npm run build` | 0 errors |
| Linting | ESLint | `ng lint` | 0 warnings in report files |
| Behavioral | Manual | Load page → filter → verify grid data | No regressions |

---

## Non-Functional Requirements

### Performance
- Filter event → grid render: < 500ms for typical datasets (200-500 rows)
- No additional memory overhead vs. current implementation

### Maintainability
- Code structure replicable for giornale-cassa, operazioni-annullate, totali-cassa refactors
- New developers can understand signal-based reactive flow in ~15 minutes
- Tests serve as living documentation

### Accessibility
- No changes to grid column labels or filter field semantics
- Existing ARIA labels and keyboard navigation preserved

---

**Spec Version**: 1.0  
**Change**: refactor-report-pages-cleanup  
**Written**: 2026-05-27  
**Status**: Ready for Design phase
