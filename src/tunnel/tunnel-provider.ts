export interface TunnelOptions {
  /** The local port to expose */
  port: number;
  /** The local host target (default: 'localhost') */
  host?: string;
}

export type TunnelStatus = 'idle' | 'starting' | 'connected' | 'closed' | 'error';

export interface TunnelSession {
  /** The public HTTPS URL where the tunnel is accessible */
  readonly url: string;
  /** The local port being tunneled */
  readonly localPort: number;
  /** Name of the provider (e.g. 'cloudflare') */
  readonly provider: string;
  /** When the tunnel was started */
  readonly startedAt: Date;
  /** Closes this specific tunnel session */
  close(): Promise<void>;
}

export interface TunnelProvider {
  /** Provider identifier */
  readonly name: string;

  /**
   * Starts a new tunnel session for the given options.
   * Throws an error with actionable guidance if tunnel creation fails.
   */
  start(options: TunnelOptions): Promise<TunnelSession>;

  /**
   * Stops any active tunnel created by this provider.
   */
  stop(): Promise<void>;

  /**
   * Retrieves the current provider status.
   */
  getStatus(): TunnelStatus;
}
