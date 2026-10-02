# DevPreview — Project Roadmap

## Vision
An open-source, CLI-first developer tool that turns a local development server into a temporary shareable HTTPS URL with zero configuration.

---

## Phases Overview

### Phase 1: Project Setup & Tooling Foundation
- [x] Initialize `package.json` with npm, TypeScript, and minimal dependencies
- [x] Setup `tsconfig.json` (strict TypeScript configuration)
- [x] Setup build tooling (`tsup` for bundling executable CLI and library)
- [x] Setup testing framework (`node:test` + `tsx` with mock capabilities)
- [x] Setup linting and formatting (`eslint` with `typescript-eslint`)
- [x] Configure `.gitignore`
- [x] Establish package scripts: `build`, `test`, `typecheck`, `lint`

### Phase 2: Architecture Core & Provider Contracts
- [x] Define `TunnelProvider`, `TunnelSession`, `TunnelStatus` interfaces (`src/tunnel/tunnel-provider.ts`)
- [x] Define CLI configuration and command-line arguments data models (`src/config/config.ts`)
- [x] Implement Tunnel Manager abstraction (`src/tunnel/tunnel-manager.ts`)
- [x] Unit tests for contracts and configuration parsing (`test/config.test.ts`, `test/tunnel-manager.test.ts`)

### Phase 3: Port Detection & Local Server Verification
- [x] Implement port scanner / detector for common dev servers (3000, 5173, 8080, 8000, 4200, etc.) (`src/detection/port-detector.ts`)
- [x] Verify if a specified or detected port is actively accepting connections
- [x] Support explicit `--port <number>` / `-p <number>` override
- [x] Unit tests for port validation, detection, and edge cases (`test/port-detector.test.ts`)

### Phase 4: Cloudflare Tunnel Provider & Process Management
- [x] Check availability of `cloudflared` binary with actionable installation instructions
- [x] Spawn and manage `cloudflared` child process
- [x] Parse stdout/stderr to detect connection readiness and extract `trycloudflare.com` URL
- [x] Robust child process lifecycle management (`src/process/process-manager.ts`):
  - Handle `SIGINT` (Ctrl+C), `SIGTERM`, unhandled exceptions
  - Prevent orphaned child processes
- [x] Unit tests with mocked external processes (`test/cloudflare.test.ts`, `test/process-manager.test.ts`)

### Phase 5: Terminal UX & CLI Orchestration
- [x] Design developer-native, clean terminal output adhering to `AGENTS.md` guidelines (`src/cli/output.ts`)
- [x] Build CLI command parser (`--help`, `--version`, `--port`, flags) (`src/cli/commands.ts`)
- [x] Wire detection, tunnel manager, process manager, and CLI output into `src/cli/index.ts`
- [x] Provide clear, friendly, actionable error messages (no raw stack dumps)
- [x] Binary entrypoint (`bin/devpreview.js`) with appropriate executable permissions

### Phase 6: Automated Testing, Validation & Documentation
- [x] Comprehensive unit test suite (17/17 passing) covering:
  - Port parsing and validation
  - Port detection
  - Tunnel URL regex extraction
  - Graceful cleanup and signal handling
  - Error messages and failure states
- [x] Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (All passing with 0 errors)
- [x] Verify CLI end-to-end execution
- [x] Write comprehensive [README.md](../README.md)
