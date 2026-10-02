import { ChildProcess } from 'node:child_process';

export class ProcessManager {
  private static instance: ProcessManager | null = null;
  private childProcesses = new Set<ChildProcess>();
  private cleanupHandlers = new Set<() => Promise<void> | void>();
  private isShuttingDown = false;
  private signalListenersAttached = false;

  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager();
    }
    return ProcessManager.instance;
  }

  constructor() {
    this.attachSignalListeners();
  }

  /**
   * Tracks a child process to guarantee termination upon exit.
   */
  public registerChild(child: ChildProcess): () => void {
    this.childProcesses.add(child);

    const onExit = () => {
      this.childProcesses.delete(child);
    };

    child.once('exit', onExit);
    child.once('close', onExit);

    return () => {
      child.removeListener('exit', onExit);
      child.removeListener('close', onExit);
      this.childProcesses.delete(child);
    };
  }

  /**
   * Registers a cleanup callback to run on shutdown.
   */
  public onCleanup(handler: () => Promise<void> | void): () => void {
    this.cleanupHandlers.add(handler);
    return () => {
      this.cleanupHandlers.delete(handler);
    };
  }

  /**
   * Attaches signal listeners to the Node process.
   */
  private attachSignalListeners(): void {
    if (this.signalListenersAttached) return;
    this.signalListenersAttached = true;

    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];

    for (const signal of signals) {
      process.once(signal, async () => {
        await this.cleanup(signal);
        process.exit(130);
      });
    }

    process.once('beforeExit', async () => {
      await this.cleanup('beforeExit');
    });
  }

  /**
   * Executes cleanup of all child processes and registered handlers.
   */
  public async cleanup(_reason?: string): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    // Run registered cleanup handlers
    for (const handler of Array.from(this.cleanupHandlers)) {
      try {
        await handler();
      } catch {
        // Suppress errors during shutdown cleanup
      }
    }

    // Terminate all remaining child processes
    for (const child of Array.from(this.childProcesses)) {
      try {
        if (!child.killed && child.pid) {
          child.kill('SIGTERM');
        }
      } catch {
        // Child might already have exited
      }
    }

    this.childProcesses.clear();
    this.cleanupHandlers.clear();
  }
}
