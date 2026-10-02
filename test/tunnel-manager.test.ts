import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { TunnelManager } from '../src/tunnel/tunnel-manager.js';
import { TunnelOptions, TunnelProvider, TunnelSession, TunnelStatus } from '../src/tunnel/tunnel-provider.js';

class MockTunnelProvider implements TunnelProvider {
  public readonly name = 'mock';
  public status: TunnelStatus = 'idle';
  public started = false;
  public stopped = false;
  public targetPort = 0;

  public getStatus(): TunnelStatus {
    return this.status;
  }

  public async start(options: TunnelOptions): Promise<TunnelSession> {
    this.started = true;
    this.targetPort = options.port;
    this.status = 'connected';

    return {
      url: `https://mock-tunnel-${options.port}.example.com`,
      localPort: options.port,
      provider: this.name,
      startedAt: new Date(),
      close: async () => {
        await this.stop();
      }
    };
  }

  public async stop(): Promise<void> {
    this.stopped = true;
    this.status = 'closed';
  }
}

describe('TunnelManager', () => {
  it('starts and stops a tunnel session through provider', async () => {
    const provider = new MockTunnelProvider();
    const manager = new TunnelManager(provider);

    assert.equal(manager.getStatus(), 'idle');

    const session = await manager.start({ port: 3000 });

    assert.equal(provider.started, true);
    assert.equal(provider.targetPort, 3000);
    assert.equal(session.url, 'https://mock-tunnel-3000.example.com');
    assert.equal(session.localPort, 3000);
    assert.equal(manager.getActiveSession(), session);
    assert.equal(manager.getStatus(), 'connected');

    await manager.stop();

    assert.equal(provider.stopped, true);
    assert.equal(manager.getActiveSession(), null);
    assert.equal(manager.getStatus(), 'closed');
  });

  it('stops existing session before starting a new one', async () => {
    const provider = new MockTunnelProvider();
    const manager = new TunnelManager(provider);

    await manager.start({ port: 3000 });
    assert.equal(manager.getActiveSession()?.localPort, 3000);

    await manager.start({ port: 8080 });
    assert.equal(manager.getActiveSession()?.localPort, 8080);
    assert.equal(provider.stopped, true);

    await manager.stop();
  });
});
