import { TunnelOptions, TunnelProvider, TunnelSession, TunnelStatus } from './tunnel-provider.js';

export class TunnelManager {
  private provider: TunnelProvider;
  private activeSession: TunnelSession | null = null;

  constructor(provider: TunnelProvider) {
    this.provider = provider;
  }

  public getProvider(): TunnelProvider {
    return this.provider;
  }

  public getActiveSession(): TunnelSession | null {
    return this.activeSession;
  }

  public getStatus(): TunnelStatus {
    return this.provider.getStatus();
  }

  public async start(options: TunnelOptions): Promise<TunnelSession> {
    if (this.activeSession) {
      await this.stop();
    }
    this.activeSession = await this.provider.start(options);
    return this.activeSession;
  }

  public async stop(): Promise<void> {
    if (this.activeSession) {
      try {
        await this.activeSession.close();
      } catch {
        // Fallback to provider stop
      }
      this.activeSession = null;
    }
    await this.provider.stop();
  }
}
