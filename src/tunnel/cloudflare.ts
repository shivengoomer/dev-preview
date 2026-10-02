import { spawn, ChildProcess } from 'node:child_process';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { TunnelOptions, TunnelProvider, TunnelSession, TunnelStatus } from './tunnel-provider.js';
import { ProcessManager } from '../process/process-manager.js';
import { DevPreviewError } from '../config/config.js';

export const CLOUDFLARE_URL_REGEX = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/i;

/**
 * Checks if a binary exists at the specified file path and is executable.
 */
function isFileExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Discovers the path to the cloudflared executable in a cross-platform way.
 */
export function findCloudflaredBinary(): string | null {
  const envPath = process.env.PATH || '';
  const pathDirs = envPath.split(path.delimiter);
  const binaryNames = os.platform() === 'win32' ? ['cloudflared.exe', 'cloudflared'] : ['cloudflared'];

  // Check PATH first
  for (const dir of pathDirs) {
    for (const name of binaryNames) {
      const fullPath = path.join(dir, name);
      if (isFileExecutable(fullPath)) {
        return fullPath;
      }
    }
  }

  // Common fallbacks for macOS/Linux if PATH in non-interactive shell is limited
  const commonPaths = [
    '/opt/homebrew/bin/cloudflared',
    '/usr/local/bin/cloudflared',
    '/usr/bin/cloudflared',
    '/bin/cloudflared'
  ];

  for (const candidate of commonPaths) {
    if (isFileExecutable(candidate)) {
      return candidate;
    }
  }

  return null;
}

export class CloudflareTunnelProvider implements TunnelProvider {
  public readonly name = 'cloudflare';
  private status: TunnelStatus = 'idle';
  private childProcess: ChildProcess | null = null;
  private unregisterChild: (() => void) | null = null;
  private binaryPathOverride?: string;

  constructor(binaryPathOverride?: string) {
    this.binaryPathOverride = binaryPathOverride;
  }

  public getStatus(): TunnelStatus {
    return this.status;
  }

  public async start(options: TunnelOptions): Promise<TunnelSession> {
    const binary = this.binaryPathOverride || findCloudflaredBinary();

    if (!binary || !isFileExecutable(binary)) {
      this.status = 'error';
      throw new DevPreviewError(
        'Could not start cloudflared: cloudflared was not found.',
        `Please install cloudflared to use DevPreview:\n\n` +
          `  • macOS:   brew install cloudflared\n` +
          `  • Windows: winget install --id Cloudflare.cloudflared\n` +
          `  • Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n\n` +
          `After installation, run DevPreview again.`
      );
    }

    this.status = 'starting';
    const host = options.host || '127.0.0.1';
    const targetUrl = `http://${host}:${options.port}`;

    return new Promise((resolve, reject) => {
      let isResolved = false;
      const collectedLogs: string[] = [];

      // Spawn cloudflared tunnel
      const child = spawn(binary, ['tunnel', '--url', targetUrl], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      this.childProcess = child;
      const processManager = ProcessManager.getInstance();
      this.unregisterChild = processManager.registerChild(child);

      const timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          this.status = 'error';
          this.stop();
          reject(
            new DevPreviewError(
              'Timed out waiting for Cloudflare tunnel to connect (exceeded 30s).',
              'Check your internet connection and verify that Cloudflare services are accessible.'
            )
          );
        }
      }, 30000);

      const parseOutput = (data: Buffer | string) => {
        const text = data.toString();
        collectedLogs.push(text);

        const match = text.match(CLOUDFLARE_URL_REGEX);
        if (match && !isResolved) {
          isResolved = true;
          clearTimeout(timeoutId);
          this.status = 'connected';

          const publicUrl = match[0];
          const session: TunnelSession = {
            url: publicUrl,
            localPort: options.port,
            provider: this.name,
            startedAt: new Date(),
            close: async () => {
              await this.stop();
            }
          };

          resolve(session);
        }
      };

      if (child.stdout) {
        child.stdout.on('data', parseOutput);
      }

      if (child.stderr) {
        child.stderr.on('data', parseOutput);
      }

      child.on('error', (err: NodeJS.ErrnoException) => {
        clearTimeout(timeoutId);
        if (!isResolved) {
          isResolved = true;
          this.status = 'error';
          if (err.code === 'ENOENT') {
            reject(
              new DevPreviewError(
                'Could not start cloudflared: cloudflared was not found.',
                `Please install cloudflared to use DevPreview:\n\n` +
                  `  • macOS:   brew install cloudflared\n` +
                  `  • Windows: winget install --id Cloudflare.cloudflared\n` +
                  `  • Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n\n` +
                  `After installation, run DevPreview again.`
              )
            );
          } else {
            reject(
              new DevPreviewError(
                `Failed to start cloudflared process: ${err.message}`,
                'Check permissions and verify cloudflared is executable.'
              )
            );
          }
        }
      });

      child.on('exit', (code, signal) => {
        clearTimeout(timeoutId);
        if (!isResolved) {
          isResolved = true;
          this.status = 'error';
          const recentLogs = collectedLogs.slice(-10).join('').trim();
          reject(
            new DevPreviewError(
              `cloudflared exited unexpectedly with code ${code ?? signal}.`,
              recentLogs ? `Recent output:\n${recentLogs}` : 'Verify your local port is running and accessible.'
            )
          );
        } else {
          this.status = 'closed';
        }
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.childProcess) {
      if (!this.childProcess.killed && this.childProcess.pid) {
        try {
          this.childProcess.kill('SIGTERM');
        } catch {
          // Process already ended
        }
      }
      this.childProcess = null;
    }

    if (this.unregisterChild) {
      this.unregisterChild();
      this.unregisterChild = null;
    }

    this.status = 'closed';
  }
}
