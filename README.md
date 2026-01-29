### Setup Drive Auth

```
npx tsx scripts/drive-auth-once.ts
```

# CI / Build Stability Guidelines

Environment Variables & Secrets
• Never throw errors at module top-level for missing env vars.
• Do not require secrets during next build.
• Validate secrets inside functions, not on import.
• Fail at runtime, only when a feature is actually used.
• CI does not need Firebase Admin / Google Drive secrets.

⸻

Firebase (Client & Admin)
• Client Firebase SDK
• Initialize lazily (browser-only).
• Guard with typeof window !== 'undefined'.
• Avoid executing auth code during prerender.
• Firebase Admin SDK
• Use lazy import(), never static imports.
• Do not initialize Admin during build or page collection.
• Read service account env vars only when needed.

⸻

API Routes (App Router)
• API routes must be build-safe.
• Avoid executing DB / Firebase / Drive logic during page data collection.
• GET / POST / PATCH handlers should assume:
• No session
• No secrets
• No side effects at build time

⸻

Google Drive / External Services
• Never initialize SDKs at file load.
• Wrap service creation in functions (getCtx() pattern).
• Return safe defaults when config is missing.
• Log errors instead of crashing builds.

⸻

TypeScript & Linting
• Avoid any; prefer generics or shared domain types.
• Keep frontend and backend models in sync.
• Use full domain types instead of “lite” versions.
• Fix unused vars early (\_req, \_error, \_err).

⸻

React Hooks
• Respect react-hooks/exhaustive-deps.
• Use useCallback for async functions used in useEffect.
• Add dependencies explicitly instead of disabling lint.

⸻

Build & CI Best Practices
• next build must succeed without runtime secrets.
• CI = compile-time validation, not runtime behavior.
• Treat build warnings as signals, not blockers.
• Ignore non-breaking dependency warnings unless they fail CI.

⸻

Golden Rule 🟢

Build-time code must be pure.
Runtime code may depend on secrets.
