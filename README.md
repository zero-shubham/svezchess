# ezchess

SvelteKit frontend for the ezchess AI chess learning app. This is the client UI — the backend is [pyezchess](https://github.com/zero-shubham/pyezchess).

> **Status:** Proof of Concept — validating the concept alongside the backend. Not production-ready.

## Run the POC locally

Requires the [pyezchess](https://github.com/zero-shubham/pyezchess) backend running on `localhost:8080` (API and WebSocket). Uses **Bun** or **npm**.

```bash
# Install dependencies
bun install

# Start dev server (proxies /api to localhost:8080)
bun dev
```

App is now at `http://localhost:5173`. A guest account is auto-created by the backend (`guest@ezchess.app` / `Password!`).

## Stack

SvelteKit · Svelte 5 · TypeScript · chess.js · Vite
