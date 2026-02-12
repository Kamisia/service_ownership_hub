![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![React](https://img.shields.io/badge/React-18+-61dafb)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Enabled-38bdf8)

# Service Ownership Hub

A small Dynatrace app for managing service ownership and visualizing error logs mapped to responsible teams.

The application allows defining teams and associated services, then correlating runtime log data (via DQL queries) with ownership information.

The main goal of this project was to build a clean, structured Dynatrace application focusing on:

- clear UI structure
- consistent component design
- pragmatic state management
- realistic platform integration (DQL, Strato components)

---

## Features

- Team management (create, edit, delete)
- Assign services to teams
- Persistent data using localStorage
- Error logs visualization using Dynatrace Query Language (DQL)
- Lookup-based team mapping inside queries
- Responsive UI using Strato components
- DataTable-based structured views

---

## Technical Highlights

- TypeScript-first approach with explicit domain models
- Clean separation between pages, components and utilities
- Minimal state management using useReducer
- DRY UI structure via shared layout patterns
- Dynatrace SDK integration (`useDql`)
- Consistent table layouts across application views
- Pragmatic architecture suitable for small-scale projects

---

## Tech Stack

- React
- TypeScript
- Dynatrace App Platform
- Dynatrace Query Language (DQL)
- Strato Components

---

## Data Flow

1. Teams and services are managed locally and persisted via localStorage.
2. DQL query fetches ERROR logs from Dynatrace Grail.
3. Lookup logic maps services to teams.
4. Results are rendered using DataTable components.

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
dt-app dev
```

---

## Future Improvements

- Replace localStorage with Dynatrace App State (when IAM permissions available)

---

## Author

 [Kamila Samczuk](https://github.com/Kamisia).


