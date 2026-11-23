# Backend

Express 5 + TypeScript (ESM), Node >= 26.

```sh
npm install
npm run dev        # tsx watch on src/app.ts, http://localhost:3001
```

| Script           | What it does                                                |
| ---------------- | ----------------------------------------------------------- |
| `npm run dev`    | Run with hot reload (tsx)                                   |
| `npm run build`  | Bundle server + deps into a single `dist/app.js` (Rolldown) |
| `npm start`      | Run the bundle                                              |
| `npm run lint`   | Type-check (TypeScript 7) and lint (oxlint)                 |
| `npm run format` | Format (oxfmt), `format:check` to verify                    |

| Route                          | What it does                                                    |
| ------------------------------ | --------------------------------------------------------------- |
| `GET /pokemons?limit=&offset=` | One page of light Pokémon summaries (100 at most per page)      |
| `GET /pokemons/:id`            | One Pokémon in full, with its strongest moves                   |
| `GET /contents/:id`            | One Pokémon as a Markdown file                                  |
| `GET /contents/all`            | Export the 898 Markdown files into `pokemons-ru/`               |
| `POST /battles`                | Battle between Pokémon, streamed from the Virtual Brain chatbot |

Ids are Pokédex ids from 1 to 898. Every parameter and body is validated with Joi ([src/schemas.ts](src/schemas.ts)).

`src/types/pokemon.ts` is shared with the web-app, which holds an identical copy: change one, then copy it over the other.

Environment (`.env`, loaded by `npm run dev` and `npm start`):

- `CHATBOT_API_KEY`: API token of the Virtual Brain chatbot.
- `PORT`: port to listen on, 3001 by default.

API docs: <http://localhost:3001/docs> (Scalar), OpenAPI document at `/openapi.json`. Routes are described in `@openapi` JSDoc blocks next to their handlers (swagger-jsdoc); the schemas, parameters and responses they share are in [src/docs/components.ts](src/docs/components.ts).

Docker: `docker build -t pokebattle-backend . && docker run -p 3001:3001 pokebattle-backend`
