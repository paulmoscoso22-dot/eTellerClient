# Design: Refactor attesa-benefondo Page with Modernized Cleanup & Unit Tests

## Technical Approach

This design modernizes the AttesaBenefondoComponent from a mixed cleanup pattern (manual \Subscription\ + \	akeUntilDestroyed\) to a **single, explicit pattern** using \	akeUntilDestroyed\ exclusively. The component converts Observable responses directly into signals via reactive subscription, eliminating manual subscription field management. 

Type safety is introduced at the filter emission layer with a new \ReportSearchParams\ interface, replacing the \ny\ type used in current code. This contract flows through the page → facade → API layer, with no signature changes to existing facade methods (backward compatible).

The refactor is driven by TDD: tests define required behavior before implementation, establishing a reusable template for 3 identical report pages (giornale-cassa, operazioni-annullate, totali-cassa) in follow-up work.

---

## Architecture Decisions

### Decision: Single Cleanup Pattern (\	akeUntilDestroyed\ Only)

| Aspect | Detail |
|--------|--------|
| **Choice** | Remove the manual \subscription\ field and \
gOnDestroy()\ cleanup; use only \	akeUntilDestroyed(destroyRef)\ in the Observable pipeline. |
| **Alternatives considered** | (a) Keep both patterns (mixed) — incurs cognitive load and potential memory leak risk; (b) Use \sync\ pipe directly in template — less testable, hides subscription logic from unit tests. |
| **Rationale** | Single pattern is clearer and more maintainable. Angular's \	akeUntilDestroyed\ is battle-tested and removes manual teardown code, reducing bugs. Tests verify cleanup by inspecting subscription lifecycle without mocking. |

### Decision: Observable → Signal Conversion via Direct Subscription

| Aspect | Detail |
|--------|--------|
| **Choice** | Page component subscribes to Facade Observable using \.subscribe()\ with a manual next/error handler; updates signals directly inside handlers. No \	oSignal()\ wrapper (see rationale). |
| **Alternatives considered** | (a) Use \	oSignal()\ wrapper from \@angular/core\ — creates an intermediate signal; adds abstraction layer; (b) Use only \sync\ pipe in template — untestable signal state. |
| **Rationale** | Current codebase uses direct \.subscribe()\ pattern extensively (confirmed in attesa-benefondo.component.ts). Staying consistent with existing code patterns reduces onboarding friction. Direct subscriptions with \	akeUntilDestroyed\ are explicit, testable, and familiar to the team. |

### Decision: Typed \ReportSearchParams\ Interface

| Aspect | Detail |
|--------|--------|
| **Choice** | Create \ReportSearchParams\ interface in new \eport-search.models.ts\ file; Filter emits typed event; page handler receives \ReportSearchParams\ instead of \ny\. |
| **Alternatives considered** | (a) Use inline type in filter component — scoped, but duplicated across other filter components; (b) Keep \ny\ type — loses type safety, fails spec requirement. |
| **Rationale** | Shared interface enables reuse across 3 report pages (giornale-cassa, operazioni-annullate, totali-cassa); enables type-safe facade calls; aligns with spec requirement for no \ny\ types in filter flow. |

### Decision: Facade Signature Stability (No Changes)

| Aspect | Detail |
|--------|--------|
| **Choice** | Existing \getTransactionWaitingForBef(trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId)\ signature unchanged; page maps \ReportSearchParams\ to individual parameters at call site. |
| **Alternatives considered** | (a) Refactor facade to accept \ReportSearchParams\ directly — breaks other pages; (b) Create new facade method — increases maintenance burden. |
| **Rationale** | Backward compatible. Other pages (giornale-cassa, operazioni-annullate, totali-cassa) already call this facade method; signature changes would require updates across multiple pages. Deferred to dedicated facade consolidation task. |

### Decision: Test-Driven Implementation (RED → GREEN → REFACTOR)

| Aspect | Detail |
|--------|--------|
| **Choice** | Write all \.spec.ts\ files first (RED phase); verify tests fail; implement code to pass tests (GREEN); ensure coverage ≥ 80% (REFACTOR). |
| **Alternatives considered** | (a) Implement first, test after — risks missing edge cases; (b) Manual testing only — no regression safety; high maintenance cost. |
| **Rationale** | TDD forces clarity about what each component should do before implementation. Tests document behavior; specs become living documentation. RED phase failures validate test quality; GREEN phase ensures implementation matches spec. |

---

## Data Flow

\\\
┌─────────────────────────────────────────────────────────────────┐
│ User Filter Event                                               │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ User clicks "Search" button
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ ReportFilterComponent                                           │
│ ─────────────────────────────────────────────────────────────── │
│ 1. Form validation (required fields)                            │
│ 2. Date normalization:                                          │
│    - trxDataDal → 00:00:00 (start of day)                       │
│    - trxDataAl  → 23:59:59 (end of day)                         │
│ 3. Null coercion (empty strings/null dates → null)             │
│ 4. Emit ReportSearchParams (typed event)                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ @Output() searchClick: EventEmitter<ReportSearchParams>
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ AttesaBenefondoComponent.onSearch(params: ReportSearchParams)  │
│ ─────────────────────────────────────────────────────────────── │
│ 1. Set isLoading = true                                         │
│ 2. Clear error signal                                           │
│ 3. Call facade.getTransactionWaitingForBef(...)                │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Observable stream
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ ReportFacade.getTransactionWaitingForBef(...)                  │
│ ─────────────────────────────────────────────────────────────── │
│ 1. Normalize params (trim strings, coerce nulls)               │
│ 2. POST to /api/Report/WaitingForBEF                            │
│ 3. Return Observable<GetTransactionWaitingForBefResponse[]>    │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Observable pipeline
         ├─→ .pipe(takeUntilDestroyed(destroyRef))
         │
         ├─→ .subscribe({
         │     next: (data) → transactions.set(data),
         │     error: (err) → error.set(err.message)
         │   })
         │
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ Page Signals Updated                                            │
│ ─────────────────────────────────────────────────────────────── │
│ gridData: Signal<Transaction[]>  ← populated with API data      │
│ isLoading: Signal<boolean>       ← set false on complete       │
│ error: Signal<string | null>     ← set error or null           │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ Reactive template binding
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ AttesaBenefondoGridComponent                                    │
│ ─────────────────────────────────────────────────────────────── │
│ @Input() transactions: Signal<Transaction[]>                    │
│ @Input() isLoading: Signal<boolean>                             │
│ @Input() error: Signal<string | null>                           │
│                                                                 │
│ Template renders dxGrid with current signal data                │
│ Change detection triggered only when signals change             │
└─────────────────────────────────────────────────────────────────┘
\\\

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| \src/app/features/archivi/report/domain/report-search.models.ts\ | Create | Define \ReportSearchParams\ interface (5 fields: trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId); shared across all report pages |
| \src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.ts\ | Modify | Remove \subscription\ field and \destroy()\ method; keep only \	akeUntilDestroyed()\ in pipeline; update \onSearch()\ signature to accept \ReportSearchParams\ (typed) instead of \ny\ |
| \src/app/features/archivi/report/components/report-filter/report-filter.component.ts\ | Modify | Update \@Output() searchClick\ type from \ny\ to \ReportSearchParams\; ensure date normalization rules applied (already present) |
| \src/app/features/archivi/report/pages/attesa-benefondo/attesa-benefondo.component.spec.ts\ | Create | 7 test scenarios for page logic: init, filter→facade, observable→signal, no manual subscription, cleanup, error handling, rapid filter changes |
| \src/app/features/archivi/report/components/report-filter/report-filter.component.spec.ts\ | Create | 7 test scenarios for filter logic: typed emission, date normalization (dal/al), empty dates→null, null coercion, validation, reset |
| \src/app/features/archivi/report/components/attesa-benefondo-grid/attesa-benefondo-grid.component.spec.ts\ | Create | 6 test scenarios for grid: render with data, empty message, signal reactivity, loading/error states, columns defined |
| \src/app/features/archivi/report/services/report.facade.spec.ts\ | Create | 5 test scenarios for facade: search method contract, params normalization, observable stream, HTTP error, null params |

---

## Interfaces / Contracts

### \ReportSearchParams\ Interface

\\\	ypescript
/**
 * Typed contract for report filter search parameters.
 * Emitted by ReportFilterComponent; consumed by AttesaBenefondoComponent.
 */
export interface ReportSearchParams {
  /** Cash register identifier (nullable, trimmed) */
  trxCassa: string | null;

  /** Start date for transaction range (normalized to 00:00:00, nullable) */
  trxDataDal: Date | null;

  /** End date for transaction range (normalized to 23:59:59, nullable) */
  trxDataAl: Date | null;

  /** Transaction status filter (nullable) */
  trxStatus: number | null;

  /** Branch identifier (nullable, trimmed) */
  trxBraId: string | null;
}
\\\

### Page Component Event Handler

\\\	ypescript
onSearch(params: ReportSearchParams): void {
  const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = params;
  
  this.isLoading.set(true);
  this.error.set(null);
  
  this.reportFacade.getTransactionWaitingForBef(
    trxCassa,
    trxDataDal,
    trxDataAl,
    trxStatus,
    trxBraId
  ).pipe(
    takeUntilDestroyed(this.destroyRef)
  ).subscribe({
    next: (data) => {
      this.transactions.set(data);
      this.isLoading.set(false);
    },
    error: (error: any) => {
      this.error.set(error.message || 'Errore nel recupero transazioni');
      this.isLoading.set(false);
    }
  });
}
\\\

---

## Testing Strategy

### Layer 1: Unit — Filter Component

| What | How |
|-----|-----|
| Form validation blocks emit | Spy on \searchClick.emit()\; verify NOT called when form invalid |
| Date normalization (start/end of day) | Assert emitted value has \getHours() === 0\ and \getHours() === 23\ |
| Empty dates → null coercion | Assert emitted \	rxDataDal === null\ when date field cleared |
| String null coercion | Assert emitted \	rxCassa === null\ when field empty |
| Typed emission (no \ny\) | TypeScript compile-time check: \mit()\ accepts only \ReportSearchParams\ type |
| Form reset | Assert form resets to defaults; status field = statusDefaultValue |

### Layer 2: Unit — Page Component

| What | How |
|-----|-----|
| Init state | Assert \	ransactions()\ empty; \isLoading\ false; \rror\ null |
| Filter → Facade call | Emit ReportSearchParams; spy \acade.getTransactionWaitingForBef()\; verify called with correct params |
| Observable → Signal | Mock facade to return \of([mockData])\; verify \	ransactions()\ populated |
| No manual subscription field | Inspect component code: no \subscription\ property |
| Cleanup on destroy | Create component; trigger destroy; verify Observable unsubscribed |
| Error handling | Mock facade error; assert \rror()\ signal set; \isLoading\ false |
| Rapid filter changes | Emit ReportSearchParams twice quickly; verify only latest result used |

### Layer 3: Unit — Grid Component

| What | How |
|-----|-----|
| Render with data | Set \@Input transactions\ signal; verify grid rows rendered |
| Empty data message | Set \	ransactions()\ to []; assert placeholder shown |
| Signal reactivity | Update transactions signal; assert grid re-renders |
| Loading state | Set \isLoading = true\; assert loading spinner visible |
| Error state | Set \rror = 'Network failed'\; assert error message displayed |
| Columns defined | Verify 10 columns with correct dataFields |

### Layer 4: Integration — Facade

| What | How |
|-----|-----|
| Search method contract | Call method; verify returns Observable |
| HTTP POST to correct URL | Use \HttpTestingController\; expect POST to \/api/Report/WaitingForBEF\ |
| Params normalization | Pass null/empty params; assert facade normalizes before HTTP |
| Observable stream | Subscribe to result; assert emits data array |
| HTTP error | Mock HTTP error; assert Observable error handler can catch |

**Coverage Target**: ≥ 80% for each component (lines, branches, functions)

---

## Implementation Sequence (Test-First Order)

### Phase 1: RED (Write Failing Tests)
1. Create \eport-search.models.ts\ — new interface (no tests)
2. Write all \.spec.ts\ files (4 test suites, ~180 lines, ~25 failing tests)

### Phase 2: GREEN (Implement to Pass Tests)
1. Update \ttesa-benefondo-grid.component.ts\ — verify no changes needed
2. Update \eport-filter.component.ts\ — type the output event
3. Update \eport.facade.ts\ — no changes needed (signature stable)
4. Update \ttesa-benefondo.component.ts\ — remove subscription field; use takeUntilDestroyed only

### Phase 3: REFACTOR & Coverage
1. Run coverage check: \
pm run test -- attesa-benefondo --coverage\
2. Manual E2E: load page, filter, verify grid updates
3. Commit with passing tests

---

## Change Detection & Performance

- **Strategy**: All 3 components use \ChangeDetectionStrategy.OnPush\
- **Signal updates**: Trigger change detection automatically
- **Performance**: Filter → grid render < 500ms for typical datasets; no additional memory overhead

---

## Open Questions

- [ ] Should filter null-coerce **before** emitting or page handle it? **(Answer: Filter handles it per spec)**
- [ ] Should page use \switchMap\ internally for rapid filter changes? **(Answer: Subscribe directly; Facade pattern handles it)**

---

**Design Version**: 1.0  
**Change**: refactor-report-pages-cleanup  
**Written**: 2026-05-27  
**Status**: Ready for Tasks phase
