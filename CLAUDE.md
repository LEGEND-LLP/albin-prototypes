# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Legend** is a visual codebase exploration tool prototype that creates interactive architecture diagrams. This is a **visual prototype** with hardcoded demo data - no backend integration. Built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS.

## Development Commands

```bash
# Install dependencies
npm i

# Start dev server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Run linter
npm lint

# Run tests (one-time)
npm test

# Run tests in watch mode
npm test:watch

# Preview production build
npm preview
```

## Architecture Overview

### Application Flow
1. **Landing Page** (`/`) - Entry point with hero section
2. **Repo Selection** (`/repos`) - Mock GitHub repository selection
3. **Loading Animation** (`/loading/:repoId`) - Transition screen
4. **Graph View** (`/graph/:repoId`) - Main interactive graph visualization

### Key Architectural Patterns

**React Flow Integration**: The graph visualization is built on `@xyflow/react`. The `GraphView` component orchestrates the entire visualization:
- Custom node types: `GraphNode` (individual nodes) and `GroupNode` (background groupings)
- Custom edge type: `AnimatedEdge` for connection visualization
- Three zoom levels: system, module, and file views
- Dynamic node positioning based on system groups (frontend, api, database, integrations, shared)

**State Management**: Uses React Query (`@tanstack/react-query`) for data fetching patterns (even though data is static), with local state managed via hooks for UI interactions.

**Data Architecture**: All graph data lives in `src/data/demoData.ts`:
- `GraphNode` and `GraphEdge` types define the structure
- Nodes are categorized by type (component, api, utility, data, config, problem)
- Nodes are grouped into system groups for layout organization
- Edges represent different relationship types (import, export, call, data)

**Component Organization**:
- `src/components/ui/` - shadcn-ui components (autoconfigured, generally don't modify)
- `src/components/graph/` - Graph-specific components (nodes, edges, panels, sidebar)
- `src/components/landing/` - Landing page components
- `src/components/repos/` - Repository selection UI
- `src/components/loading/` - Loading animations

### Graph View Architecture

The `GraphView` component is the most complex part:
- **Node Layout**: Calculated by `getNodePosition()` which clusters nodes by system group using `groupConfig`
- **Group Backgrounds**: `GroupNode` components render behind regular nodes using z-index layering
- **Filtering**: Edge filters (imports/exports/calls/data) dynamically hide/show connections
- **Search**: Dims non-matching nodes/edges without removing them
- **Detail Panel**: Slides in from right when node is selected, shows detailed info
- **Onboarding**: Tour component overlays on first visit

### Styling System

Custom Tailwind configuration extends the base theme:
- CSS variables for theming (defined in `src/index.css`)
- Custom colors for node types (`node-component`, `node-api`, etc.)
- Custom shadow utilities (`legend-shadow-*`) using CSS variables
- Framer Motion for animations
- Custom keyframes for flow animations and transitions

### Path Aliases

The project uses `@/` as an alias for `src/`:
```typescript
import { Button } from "@/components/ui/button"
import { demoData } from "@/data/demoData"
```

## Testing

Tests use Vitest with jsdom environment:
- Setup file: `src/test/setup.ts`
- Test pattern: `src/**/*.{test,spec}.{ts,tsx}`
- Testing Library React for component tests

## Important Notes

- This is a **prototype** - all data is mocked in `demoData.ts`
- No real GitHub API integration exists
- The `lovable-tagger` plugin runs in development mode for Lovable.dev integration
- Server runs on IPv6 (`::`) port 8080 with HMR overlay disabled
