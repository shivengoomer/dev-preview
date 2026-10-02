import { parseCliArgs } from '../config/config.js';
import { resolvePort } from '../detection/port-detector.js';
import { CloudflareTunnelProvider } from '../tunnel/cloudflare.js';
import { TunnelManager } from '../tunnel/tunnel-manager.js';
import { ProcessManager } from '../process/process-manager.js';
import {
  renderHeader,
  renderStep,
  renderReady,
  renderError,
  renderHelp,
  renderVersion
} from './output.js';

export async function runDevPreview(args: string[] = process.argv.slice(2)): Promise<number> {
  const processManager = ProcessManager.getInstance();

  try {
    const options = parseCliArgs(args);

    if (options.help) {
      renderHelp();
      return 0;
    }

    if (options.version) {
      renderVersion();
      return 0;
    }

    renderHeader();

    // 1. Detect / verify local server
    const port = await resolvePort(options.port);
    renderStep(`Local server found on port ${port}`);

    // 2. Initialize provider and manager
    const provider = new CloudflareTunnelProvider();
    const manager = new TunnelManager(provider);

    // Register cleanup callback with process manager
    processManager.onCleanup(async () => {
      await manager.stop();
    });

    // 3. Start tunnel
    renderStep('Starting tunnel');
    const session = await manager.start({ port });

    // 4. Render ready state
    renderReady(session.url, port);

    // Keep process active until interrupt
    await new Promise<void>(() => {
      // Intentionally kept alive until SIGINT / SIGTERM triggers cleanup
    });

    return 0;
  } catch (err: unknown) {
    renderError(err);
    await processManager.cleanup('error');
    return 1;
  }
}
