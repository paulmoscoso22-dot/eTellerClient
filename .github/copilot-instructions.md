# eTellerClient Copilot Instructions

You are working on the eTellerClient Angular application. Provide concise, expert-level Angular solutions focusing on the specific patterns below.

## Architecture & Core Tools
- **Framework**: Angular v21+ with Standalone Components and Signals.
- **UI Framework**: DevExtreme
- **Styling**: SCSS, Bootstrap Icons
- **State Management**: Emphasize Angular Signals for reactive state.
- **Testing**: Vitest (`npm test`)
- **i18n**: Transloco (files in `public/assets/i18n/`)

## Project Structure & Conventions
The project mostly follows a feature-based, domain-driven architecture.
- **Features**: Create modules/routes in `src/app/features/` (e.g., `auth`, `manager`, `operations`). Favor lazy-loading for routing features.
- **Core Singleton Services**: Put API interceptors, guards, and core providers in `src/app/core/`.
- **Shared UI/Cross-Cutting**: Keep shared UI components, pipes, and directives in `src/app/shared/`.
- **API Communication**: Inject and use `ApiService` (`src/app/services/api.service.ts`) for data fetching.

## Primary Commands
- **Start Dev Server**: `npm start`
- **Build (Prod)**: `npm run build`
- **Tests**: `npm test`
- **Start SSR Server**: `npm run serve:ssr`

## Additional Internal Documentation
- See [src/general.md](src/general.md) for deeper architectural intent.