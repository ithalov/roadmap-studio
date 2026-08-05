# Roadmap Studio

Roadmap Studio is a local-first desktop application for professional roadmap planning, built with Tauri 2, React, TypeScript, Vite, Tailwind CSS, Zustand, and SQLite.

This repository contains only the foundation for Phase 1. The editor, roadmap domain workflows, import/export, and sync layer are intentionally not implemented yet.

## Technologies

- Tauri 2
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style component foundation
- Zustand
- React Router
- React Hook Form
- Zod
- dnd-kit
- Lucide React
- TanStack Query
- SQLite via the official Tauri SQL plugin
- ESLint
- Prettier
- Husky
- lint-staged
- Vitest

## Install

```bash
npm install
```

## Run

Frontend only:

```bash
npm run dev
```

Desktop app:

```bash
npm run tauri:dev
```

## Build

```bash
npm run build
npm run tauri:build
```

## Structure

```text
src/
  app/
  assets/
  components/
  config/
  database/
  features/
  hooks/
  layouts/
  pages/
  plugins/
  repositories/
  schemas/
  services/
  store/
  styles/
  tests/
  types/
  utils/
```

## Roadmap

Phase 1:
- Foundation only
- App shell
- Routing structure
- Theme system
- Store structure
- SQLite service layer
- Migration manager scaffold
- Quality tooling

Future phases:
- Roadmap editor
- Timeline view
- Dependencies graph
- Checklist workflows
- History and statistics
- Import/export
- Sync pipeline
- Release automation

## License

MIT

## Contribution

Contributions are welcome once the foundation is stable. Keep changes modular, typed, and aligned with the local-first architecture.
