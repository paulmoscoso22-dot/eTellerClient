# Testing Capabilities — eTellerClient

**Strict TDD Mode**: Enabled  
**Detected**: 2026-05-26  
**Framework**: Angular 21 + Vitest

## Test Runner

- **Command**: `ng test` or `npm test`
- **Framework**: Vitest 4.0.8
- **Config**: `vitest.config.ts`
- **Environment**: jsdom
- **Special config**: DevExtreme packages inlined (CJS mode)

## Test Layers

| Layer       | Available | Tool        |
| ----------- | --------- | ----------- |
| Unit        | ✅        | Vitest + TestBed + jsdom |
| Integration | ⚠️        | testing-library (available but limited setup) |
| E2E         | ❌        | Not configured (use Playwright/Cypress if needed) |

## Coverage

- **Available**: ✅
- **Command**: `ng test --coverage` or `vitest --coverage`
- **Tool**: Vitest built-in coverage via c8

## Quality Tools

| Tool         | Available | Command        |
| ------------ | --------- | -------------- |
| Linter       | ✅        | ESLint (project-specific setup) |
| Type checker | ✅        | TypeScript strict mode (`npx tsc --noEmit`) |
| Formatter    | ✅        | Prettier (`npx prettier --write .`) |

## Stack Details

### Testing Framework
- **Runner**: Vitest 4.0.8
- **Angular Integration**: `@angular/build:unit-test` builder
- **DOM**: jsdom (configured in vitest.config.ts)
- **Utilities**: TestBed, HttpClientTestingModule, HttpTestingController
- **Mocking**: Vitest spies, jest.fn() patterns

### Project Test Files
- **Existing tests**: 35 `.spec.ts` files across src/
- **Coverage baseline**: Needs measurement

### Conventions (from `.github/skills/angular-testing/SKILL.md`)
- **Structure**: `.spec.ts` files colocated with source
- **Pattern**: describe/it blocks with English scenario names
- **Setup**: TestBed for component/service tests
- **Cleanup**: `jest.clearAllMocks()` in afterEach
- **Assertions**: Vitest expect() or custom matchers

### DevExtreme Testing Notes
- Components tested via TestBed (standalone pattern)
- Form/grid testing via testing-library selectors
- Event simulation: fixture.debugElement.query()
- No special DevExtreme test library; use Angular patterns

### Signal Testing
- Computed signals via fixture.detectChanges() → component.signal()
- Effect testing: track side effects with spies
- Input signal updates: direct property assignment then detectChanges()

## Strict TDD Enforcements

- ✅ Test runner: Active and configured
- ✅ Type checking: TypeScript strict mode enabled
- ✅ Coverage tracking: Vitest coverage available
- ⚠️ Integration testing: Available but not all tests written
- ❌ E2E: Not yet implemented

**Next step**: Enforce test-first development for new features via branch/PR hooks and CI.

## Known Gaps

1. **Integration tests**: Not systematically used; testing-library available but underconfigured
2. **E2E**: No Playwright/Cypress setup; recommended for login/auth flows
3. **Coverage tracking**: No CI enforcement; recommend 70% target for new code
4. **Project skills**: `angular-testing` SKILL.md references Jest patterns (outdated—should reference Vitest)

## CI/CD Integration

- **Test command in CI**: `ng test --watch=false` (if Angular builder supports it)
- **Coverage report**: Vitest outputs to `coverage/` directory
- **Linting**: Recommend `npx eslint src/` in CI
