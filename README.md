# Pokémon Arena

React + TypeScript web app and Express + TypeScript backend: browse the 898 Pokémon, filter them, and send two into an arena where a Virtual Brain chatbot streams the battle. The original brief is in [TECHNICAL_TEST.md](TECHNICAL_TEST.md).

## Getting started

Requirements: Node.js 26+ or Docker:

**With Node** (two terminals):

```sh
cd backend && npm install && npm run dev     # API on http://localhost:3001
cd web-app && npm install && npm run dev     # App on http://localhost:5173
```

**With Docker**:

```sh
docker compose up --build                    # API on http://localhost:3001, app on http://localhost:5173
```

API docs: <http://localhost:3001/docs>. More details in [backend/README.md](backend/README.md) and [web-app/README.md](web-app/README.md).

## What has been done

- **Backend**: Joi-validated routes, PokeAPI responses cached and trimmed, OpenAPI docs (Scalar).
  - `GET /pokemons` (paginated) and `GET /pokemons/:id`
  - `GET /contents/:id` returns one Pokémon as Markdown; `GET /contents/all` exports the 898 files into `backend/pokemons-ru/`, the folder imported into the brain
  - `POST /battles` builds the battle prompt and streams the chatbot answer; the chatbot session renews itself through its refresh token
- **Brain / chatbot**: brain created from the export, custom prompt that defines the battle rules and resists prompt injection.
- **Web app**: responsive grid with image and stats, in-memory name search and type filters, arena with live streamed battle, dark mode, paginated fetch of the pokemons. Uses axios + TanStack Query and the React Compiler.
- **Tooling**: TypeScript 7, oxlint/oxfmt, Vitest unit and endpoint tests on the backend, Dockerfiles and compose.

## Next steps

- Bonus turn-based battle: use chatbot sessions so the LLM only picks moves and the backend computes damage, HP and KO each round. The API already takes teams to prepare for this.
- Battles with more than two Pokémon or bigger teams (currently two teams of one but interface is easily extensible).
- Mock PokeAPI in the endpoint tests so they run offline; add web-app tests.
- Restrict CORS to the web-app origin.
- Add a search database to the backend so the web-app can search by name and type (elasticsearch).
