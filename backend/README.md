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

API docs: <http://localhost:3001/docs> (Scalar), OpenAPI document at `/openapi.json`. Routes are described in `@openapi` JSDoc blocks next to their handlers (swagger-jsdoc).

Docker: `docker build -t pokebattle-backend . && docker run -p 3001:3001 pokebattle-backend`
