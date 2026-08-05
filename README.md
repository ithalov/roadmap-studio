# Roadmap Studio

![Version](https://img.shields.io/badge/version-0.1.3-blue)
![Release](https://img.shields.io/github/v/release/ithalov/roadmap-studio)
![Workflow](https://img.shields.io/github/actions/workflow/status/ithalov/roadmap-studio/release.yml?branch=main)
![Tauri](https://img.shields.io/badge/tauri-2.x-24C8DB)
![React](https://img.shields.io/badge/react-19-61DAFB)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6)
![License](https://img.shields.io/badge/license-BSL-green)

Roadmap Studio is a local-first desktop application for professional roadmap planning.
It is built with Tauri 2, React, TypeScript, SQLite, and a release pipeline prepared for
GitHub Actions and updater-based distribution.

## Overview

The project is centered on structured planning data:

- roadmaps
- phases
- tasks
- subtasks
- tags
- notes
- attachments
- dependencies
- history
- settings
- sync queue
- backups

The application is designed to keep the core data local while preparing the codebase for
future sync, versioned releases, and long-term schema evolution.

## Current Scope

The repository currently includes:

- app shell, routing, and theme foundation
- SQLite persistence layer with migrations and repositories
- Kanban board with drag and drop
- phase editor and task management surfaces
- settings page
- JSON roadmap import
- toast feedback system
- release workflow for GitHub Actions
- updater integration for in-app version checks

## Tech Stack

- Tauri 2
- React 19
- TypeScript strict mode
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- React Router
- React Hook Form
- Zod
- dnd-kit
- Lucide React
- SQLite via the official Tauri SQL plugin
- Vitest
- ESLint
- Prettier

## Requirements

- Node.js 20 or newer
- npm
- Rust toolchain
- Windows 10 or newer for the desktop build used in this project

## Installation

```bash
npm install
```

## Development

Run the web app only:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run tauri:dev
```

## Build

Build the frontend:

```bash
npm run build
```

Build the desktop app and installers:

```bash
npm run tauri:build
```

## Testing

Run the test suite:

```bash
npm run test
```

Run lint:

```bash
npm run lint
```

## Project Structure

```text
src/
  app/
  components/
  config/
  database/
  features/
  hooks/
  layouts/
  pages/
  schemas/
  services/
  store/
  styles/
  tests/
  types/
  utils/

src-tauri/
  src/
  capabilities/
  icons/
  tauri.conf.json
```

## Release and Updates

Roadmap Studio is prepared for GitHub Releases and Tauri updater-based updates.

The release flow uses:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` when the key has a password
- GitHub Actions
- a `release.yml` workflow triggered by version tags such as `v0.1.1`

When a new version is published, the installed app can check GitHub Releases and prompt the
user with an update confirmation before downloading and restarting.

## Release Workflow

The expected versioning flow is:

1. update the app version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`
2. commit the changes
3. create a tag like `v0.1.2`
4. push the tag to GitHub
5. let GitHub Actions build the installers and publish the release

## Database Notes

The database layer is built around:

- SQLite
- migrations
- repositories
- Zod validation
- reusable service classes
- sync-ready entity metadata

The current schema is designed so future features can evolve without rewriting the foundation.

## Contributing

Keep changes modular, typed, and aligned with the local-first architecture.
Prefer repository methods for persistence, avoid direct SQL outside the database layer, and
keep migrations explicit.

## License

BSL
