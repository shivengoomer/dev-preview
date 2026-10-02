# DevPreview

> **Share your localhost instantly.**

DevPreview is an open-source, CLI-first developer tool that turns your local development server into a temporary shareable HTTPS URL with zero configuration.

```bash
npx devpreview
```

```text
Detect local app ──► Create temporary tunnel ──► Print public HTTPS URL
```

---

## Features

- **Zero Configuration**: No account creation, API keys, custom domains, or DNS records required.
- **Automatic Port Detection**: Automatically scans common web dev ports (`3000`, `5173`, `8080`, `8000`, `4200`, etc.) or accepts an explicit port.
- **Fast & Lightweight**: Built on strict TypeScript with minimal dependencies and native Node.js APIs.
- **Provider Abstraction**: Decoupled tunnel architecture currently powered by Cloudflare Quick Tunnels.
- **Actionable UX**: Clean terminal UI with actionable guidance instead of raw stack traces.
- **Safe Process Lifecycle**: Gracefully terminates tunnels on `Ctrl+C` (`SIGINT`) or `SIGTERM` to prevent orphaned child processes.

---

## Requirements

- **Node.js**: `v18.0.0` or higher
- **cloudflared**: Required for tunnel creation.
  - **macOS**: `brew install cloudflared`
  - **Windows**: `winget install --id Cloudflare.cloudflared`
  - **Linux**: Follow the [Cloudflare Tunnel Package Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

---

## Quick Start

### 1. Start your local dev server
Start your dev server on your preferred framework (Vite, Next.js, Express, Astro, etc.):

```bash
npm run dev
# e.g. running on http://localhost:3000
```

### 2. Share with DevPreview

```bash
npx devpreview
```

Output:
```text
DevPreview

✓ Local server found on port 3000
✓ Starting tunnel
✓ Preview ready

  https://quick-tunnel-name.trycloudflare.com

  Local:  http://localhost:3000
  Status: Connected

Press Ctrl+C to stop
```

---

## CLI Usage & Options

```text
DevPreview — Share your localhost instantly

USAGE
  $ npx devpreview [options]

OPTIONS
  -p, --port <number>     Specify local port to expose (e.g. 3000, 5173)
  -h, --help              Show help information
  -v, --version           Show current version

EXAMPLES
  $ npx devpreview
  $ npx devpreview --port 3000
  $ npx devpreview -p 5173
```

---

## Programmatic API

DevPreview can also be used as a TypeScript / JavaScript module:

```typescript
import {
  TunnelManager,
  CloudflareTunnelProvider,
  resolvePort
} from 'devpreview';

// 1. Detect active dev port or verify specific port
const port = await resolvePort(3000);

// 2. Start tunnel session
const provider = new CloudflareTunnelProvider();
const manager = new TunnelManager(provider);

const session = await manager.start({ port });
console.log(`Public URL: ${session.url}`);

// 3. Stop tunnel when finished
await session.close();
```

---

## Architecture

```text
┌─────────────────────────┐
│      DevPreview CLI     │
│  command parsing        │
│  port detection         │
│  terminal UI            │
│  process management     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Tunnel Manager      │
│  session lifecycle      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  TunnelProvider (API)   │
│  CloudflareTunnel       │
└────────────┬────────────┘
             │
             ▼
      localhost:<port>
```

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run unit and integration tests
npm test

# Typecheck with TypeScript
npm run typecheck

# Lint with ESLint
npm run lint

# Build production bundle and CLI executable
npm run build
```

---

## License

[MIT](LICENSE)
