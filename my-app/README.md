# TaskFlow · Dev 2 design preview

From this folder: `npm ci`, then `npm run dev`. Start at [/workspaces](http://localhost:3000/workspaces).

- `src/app`: small Next.js route files. Workspace screens live under `w/[slug]`, project screens under `p/[projectId]`.
- `src/features`: one visual module each for workspaces, projects, planning and notifications.
- `src/shared`: the shell, sidebar, topbar and shared visual components. Tailwind tokens are in `src/app/globals.css`.

The example workspace is `taskflow`; the project is `web`. Buttons that would write data are disabled. No backend, authentication or issue implementation is included.
