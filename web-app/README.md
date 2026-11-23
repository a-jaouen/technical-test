# Web app

React 19 + Vite 8 + Tailwind CSS 4 + TypeScript. Data fetching with axios and TanStack Query.

```sh
npm install
npm run dev        # http://localhost:5173 (expects the backend on :3001)
```

| Script              | What it does                             |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Vite dev server                          |
| `npm run build`     | Type-check then build to `dist/`         |
| `npm run preview`   | Serve the production build               |
| `npm run typecheck` | Type-check (TypeScript 7)                |
| `npm run lint`      | Lint (oxlint)                            |
| `npm run format`    | Format (oxfmt), `format:check` to verify |

The backend URL defaults to `http://localhost:3001`. Set `VITE_API_URL` to point somewhere else, for example `VITE_API_URL=http://localhost:4000 npm run dev`.

Docker: `docker build -t pokebattle-web . && docker run -p 8080:8080 pokebattle-web`
