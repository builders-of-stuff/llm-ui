# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev                # Start development server
npm run dev -- --open     # Start dev server and open browser
```

**Building:**
```bash
npm run build             # Build for production
npm run preview           # Preview production build
```

**Testing:**
```bash
npm run test             # Run all tests (unit + e2e)
npm run test:unit        # Run unit tests with Vitest
npm run test:e2e         # Run end-to-end tests with Playwright
```

**Code Quality:**
```bash
npm run lint             # Run Prettier check + ESLint
npm run format           # Format code with Prettier
npm run check            # Type check with svelte-check
npm run check:watch      # Type check in watch mode
```

## Architecture Overview

This is a **SvelteKit 5** application with TypeScript, using the modern Svelte 5 runes syntax (`$props`, `$state`, etc.).

**Key Technologies:**
- **SvelteKit 5** - Full-stack Svelte framework with file-based routing
- **TypeScript** - Type safety throughout
- **TailwindCSS 4** - Utility-first CSS framework  
- **shadcn-svelte** - Pre-configured component library setup (see `components.json`)
- **Vitest** - Unit testing with browser environment support
- **Playwright** - End-to-end testing
- **MDsveX** - Markdown in Svelte components

**Project Structure:**
- `src/routes/` - File-based routing (SvelteKit pages)
- `src/lib/` - Reusable library code
- `src/lib/components/ui/` - shadcn-svelte UI components
- `src/lib/utils.ts` - Utility functions (includes `cn()` for class merging)
- `src/lib/hooks/` - Custom Svelte hooks
- `e2e/` - Playwright end-to-end tests

**Testing Setup:**
- Unit tests use Vitest with browser environment (Playwright provider)
- Svelte component tests: `*.svelte.{test,spec}.{js,ts}` 
- Server-side tests: `*.{test,spec}.{js,ts}` (excluding Svelte component tests)
- E2E tests run against built application (`npm run build && npm run preview`)

**Import Aliases:**
- `$lib` - Maps to `src/lib/`
- Additional aliases configured in `components.json` for shadcn-svelte

**Key Files:**
- `svelte.config.js` - Svelte/SvelteKit configuration with MDsveX preprocessing
- `vite.config.ts` - Vite configuration with dual test projects (client/server)
- `components.json` - shadcn-svelte configuration with component aliases