// Vercel Function entrypoint cuando este sub-directorio (`artifacts/api-server`)
// se usa como Root Directory del proyecto Vercel.
//
// Importamos el bundle ya compilado por esbuild (`dist/app.mjs`) en lugar
// del TypeScript de `src/app.ts`. Razones:
//   1. @vercel/node no resuelve los workspace links (`@workspace/db`,
//      `@workspace/api-zod`) cuando intenta compilar TS dentro de la function.
//   2. El bundle es self-contained y elimina cualquier dependencia de
//      symlinks pnpm en runtime.
//
// El `buildCommand` en `vercel.json` garantiza que `dist/app.mjs` exista
// antes de que esta function se cargue.
import app from "../dist/app.mjs";

export default app;
