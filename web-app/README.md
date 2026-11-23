# Web app

React 19 + Vite 8 + Tailwind CSS 4 + TypeScript.

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

Docker: `docker build -t pokebattle-web . && docker run -p 8080:8080 pokebattle-web`
