import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  CloudflareTunnelProvider,
  CLOUDFLARE_URL_REGEX
} from '../src/tunnel/cloudflare.js';
import { DevPreviewError } from '../src/config/config.js';

describe('Cloudflare Tunnel Provider', () => {
  it('extracts trycloudflare.com URL from output', () => {
    const output = `
2026-10-02T18:00:00Z INF Your quick Tunnel has been created!
2026-10-02T18:00:00Z INF https://fancy-developer-preview.trycloudflare.com
2026-10-02T18:00:00Z INF Tunnel ready
`;
    const match = output.match(CLOUDFLARE_URL_REGEX);
    assert.ok(match);
    assert.equal(match[0], 'https://fancy-developer-preview.trycloudflare.com');
  });

  it('throws actionable DevPreviewError when binary is not found', async () => {
    const provider = new CloudflareTunnelProvider('/non/existent/cloudflared/path');
    await assert.rejects(
      async () => {
        await provider.start({ port: 3000 });
      },
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        assert.match(err.message, /cloudflared was not found/);
        assert.match(err.suggestion || '', /brew install cloudflared/);
        return true;
      }
    );
  });

  it('successfully starts session with mock cloudflared script and cleans up', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpreview-test-'));
    const mockBinary = path.join(tempDir, 'mock-cloudflared.js');

    // Create a mock script that outputs the trycloudflare URL to stderr and hangs until killed
    fs.writeFileSync(
      mockBinary,
      `#!/usr/bin/env node
console.error("INF Starting tunnel...");
console.error("INF +--------------------------------------------------------------------------------------------+");
console.error("INF |  https://unit-test-app.trycloudflare.com                                                  |");
console.error("INF +--------------------------------------------------------------------------------------------+");
setInterval(() => {}, 1000);
`,
      { mode: 0o755 }
    );

    const provider = new CloudflareTunnelProvider(mockBinary);

    try {
      const session = await provider.start({ port: 3000 });
      assert.equal(session.url, 'https://unit-test-app.trycloudflare.com');
      assert.equal(session.localPort, 3000);
      assert.equal(session.provider, 'cloudflare');
      assert.equal(provider.getStatus(), 'connected');

      await session.close();
      assert.equal(provider.getStatus(), 'closed');
    } finally {
      await provider.stop();
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup error in temp
      }
    }
  });

  it('rejects with error if process exits before producing URL', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devpreview-test-'));
    const mockBinary = path.join(tempDir, 'mock-failure.js');

    fs.writeFileSync(
      mockBinary,
      `#!/usr/bin/env node
console.error("ERR Failed to authenticate tunnel");
process.exit(1);
`,
      { mode: 0o755 }
    );

    const provider = new CloudflareTunnelProvider(mockBinary);

    try {
      await assert.rejects(
        async () => {
          await provider.start({ port: 3000 });
        },
        (err: unknown) => {
          assert.ok(err instanceof DevPreviewError);
          assert.match(err.message, /cloudflared exited unexpectedly/);
          return true;
        }
      );
    } finally {
      await provider.stop();
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore
      }
    }
  });
});
