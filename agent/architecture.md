# DevPreview — Architecture

## High-Level Architecture

```text
┌─────────────────────────┐
│      DevPreview CLI     │
│                         │
│  command parsing        │
│  port detection         │
│  terminal UI            │
│  process management     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│    Tunnel Provider      │
│                         │
│  start()                │
│  stop()                 │
│  status()               │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   Cloudflare Tunnel     │
│      cloudflared        │
└────────────┬────────────┘
             │
             ▼
      localhost:<port>
```

## Suggested Structure

```text
src/
├── cli/
│   ├── index.ts
│   ├── commands.ts
│   └── output.ts
│
├── tunnel/
│   ├── tunnel-provider.ts
│   ├── cloudflare.ts
│   └── tunnel-manager.ts
│
├── detection/
│   └── port-detector.ts
│
├── process/
│   └── process-manager.ts
│
├── config/
│   └── config.ts
│
└── index.ts
```

Keep modules small.

Do not create directories merely to follow this structure if they are not needed.

## Tunnel Provider

The rest of the application should depend on:

```ts
TunnelProvider
```

rather than:

```ts
cloudflared
```

This allows the underlying tunnel technology to change later.

## Data Flow

```text
CLI arguments
      ↓
Configuration
      ↓
Port detection
      ↓
TunnelManager
      ↓
TunnelProvider
      ↓
Public URL
      ↓
Terminal output
```

## State

The MVP should be mostly stateless.

Do not introduce a database.

Do not introduce Redis.

Do not introduce a backend service unless the feature genuinely requires one.

The CLI should do as much as possible locally.

## Future Backend

A backend may eventually be introduced for:

* persistent preview URLs
* authentication
* feedback
* analytics
* team collaboration
* preview history

That is future architecture, not MVP architecture.
