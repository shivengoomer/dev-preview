import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import * as net from 'node:net';
import {
  isPortListening,
  findActivePorts,
  resolvePort
} from '../src/detection/port-detector.js';
import { DevPreviewError } from '../src/config/config.js';

describe('Port Detector', () => {
  it('detects a listening port and handles inactive port', async () => {
    // 1. Create a temporary server on an ephemeral port
    const server = net.createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address() as net.AddressInfo;
    const listeningPort = address.port;

    try {
      const isListening = await isPortListening(listeningPort, '127.0.0.1');
      assert.equal(isListening, true);

      // Verify a port that definitely isn't listening (e.g. listeningPort + 1 after closing if needed, or 64999)
      const inactive = await isPortListening(64999, '127.0.0.1', 100);
      assert.equal(inactive, false);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('findActivePorts finds the active ports among candidates', async () => {
    const server = net.createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address() as net.AddressInfo;
    const listeningPort = address.port;

    try {
      const candidates = [64998, listeningPort, 64999];
      const active = await findActivePorts(candidates, '127.0.0.1');
      assert.deepEqual(active, [listeningPort]);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('resolvePort succeeds with explicit port when listening', async () => {
    const server = net.createServer();
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address() as net.AddressInfo;
    const listeningPort = address.port;

    try {
      const resolved = await resolvePort(listeningPort, '127.0.0.1');
      assert.equal(resolved, listeningPort);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('resolvePort throws actionable DevPreviewError when explicit port is unavailable', async () => {
    await assert.rejects(
      async () => {
        await resolvePort(64997, '127.0.0.1');
      },
      (err: unknown) => {
        assert.ok(err instanceof DevPreviewError);
        assert.match(err.message, /Port 64997 is not reachable/);
        assert.match(err.suggestion || '', /Start your local application first/);
        return true;
      }
    );
  });
});
