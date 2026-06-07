# ezchess

SvelteKit frontend for the ezchess AI chess learning app. This is the client UI — the backend is [pyezchess](https://github.com/zero-shubham/pyezchess).

> **Status:** Proof of Concept — validating the concept alongside the backend. Not production-ready.

## Run the POC locally

Requires Docker. Supports **OpenAI**, **Anthropic (Claude)**, **Gemini**, and **DeepSeek** — at least one LLM API key needed.

```bash
docker network create ezchess

docker run -d --network ezchess --name db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ezchess \
  postgres:15-alpine

docker run --network ezchess --name ezchess -p 3000:3000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/ezchess \
  -e OPENAI_API_KEY=sk-... \
  zeroshubham/ezchess:latest
```

App is now at `http://localhost:3000`. A guest account is auto-created (`guest@ezchess.app` / `Password!`).

> The POC may show a 502 nginx error initially while the Python backend is still starting up. Wait a few seconds and refresh.

### Run frontend dev server (without Docker)

Requires the backend running on `localhost:8080` (API + WebSocket proxy).

```bash
bun install    # or npm install
bun dev        # or npm run dev
```

App at `http://localhost:5173`.

## Stack

SvelteKit · Svelte 5 · TypeScript · chess.js · Vite
