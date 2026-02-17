# Service Ownership Hub

Dynatrace app for mapping service ownership to teams and correlating runtime ERROR logs with responsible owners.

## Business Problem & Value

In many teams, logs show failing services but ownership is unclear.
This app centralizes team-to-service ownership and enriches error views with ownership context, making triage faster.

## Core Features

- Team management (create, edit, delete)
- Service assignment per team
- Error-log overview enriched with team ownership via DQL lookup
- Fast filtering by service, team, and log content
- Table-driven UI with Dynatrace Strato components

## Architecture Overview

- Frontend: React + TypeScript
- Platform integration:
  - `useSettingsObjectsV2` for team configuration storage
  - `useDql` for querying logs from Grail
- DQL pipeline:
  - fetch ERROR logs
  - lookup ownership mapping (service -> team)
  - sort and display latest results
- UI composition:
  - dedicated pages, modal-based CRUD, shared table patterns

## Routing

- `/` -> Teams Errors (default landing page)
- `/teams` -> Teams management
- `/data` -> Teams Errors (backward-compatible alias)

## Tech Stack

- React 18
- TypeScript
- Dynatrace App Toolkit (`dt-app`)
- Dynatrace SDK React Hooks
- Dynatrace Strato Design System
- Jest + Testing Library

## Run Locally

```bash
npm install
npm run start
```

## Testing & Quality

```bash
npm run test:ui
npx jest --config ui/jest.config.js --coverage
```

## Author

[Kamila Samczuk](https://github.com/Kamisia)
