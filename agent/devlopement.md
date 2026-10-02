# DevPreview — Development Rules

## Before Coding

Always:

```text
1. Inspect repository
2. Read package.json
3. Inspect existing source
4. Inspect tests
5. Identify the smallest change
6. Implement
7. Test
8. Typecheck
9. Lint
```

Do not assume the repository structure.

## Commands

Use the project's existing package manager.

Do not switch:

```text
npm → pnpm
pnpm → yarn
npm → bun
```

unless explicitly requested.

Prefer existing scripts:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

If scripts do not exist, add them only when useful.

## TypeScript

Use strict TypeScript.

Prefer:

```ts
const port: number = 3000;
```

over untyped values.

Avoid:

```ts
any
```

unless there is a documented reason.

## Error Handling

Errors should provide:

1. What happened.
2. Why it happened when known.
3. What the user can do.

Example:

```text
✗ Port 3000 is not available.

Start your application first or specify another port:

  devpreview --port 5173
```

## External Commands

Treat external processes as unreliable.

Always handle:

* command missing
* command failure
* process exit
* malformed output
* timeout
* user interruption

Never assume the external process succeeds.

## Dependencies

Keep dependency count low.

Before installing a dependency, ask:

> Can this be implemented reliably using Node.js or existing dependencies?

If yes, prefer the existing solution.

## Documentation

Update README when changing:

* CLI commands
* installation
* flags
* user-facing behavior
* supported platforms
* requirements
