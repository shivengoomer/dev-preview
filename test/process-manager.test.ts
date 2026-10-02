import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { ProcessManager } from '../src/process/process-manager.js';

describe('ProcessManager', () => {
  it('executes cleanup handlers when cleanup is invoked', async () => {
    const manager = ProcessManager.getInstance();
    let cleanedUp = false;

    const unregister = manager.onCleanup(() => {
      cleanedUp = true;
    });

    await manager.cleanup('test');
    assert.equal(cleanedUp, true);
    unregister();
  });

  it('terminates registered child processes on cleanup', async () => {
    const manager = new ProcessManager();
    const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);']);

    manager.registerChild(child);
    assert.equal(child.killed, false);

    await manager.cleanup('test');
    assert.equal(child.killed, true);
  });
});
