import * as net from 'node:net';
import { DevPreviewError } from '../config/config.js';

export const COMMON_DEV_PORTS: readonly number[] = [
  3000, 5173, 8080, 8000, 4200, 3001, 8888, 5000, 1234, 4000, 9000
];

/**
 * Checks if a TCP port on a given host is actively listening and accepting connections.
 */
export async function isPortListening(port: number, host = '127.0.0.1', timeoutMs = 400): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(true);
      }
    });

    socket.once('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(false);
      }
    });

    socket.once('error', () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

/**
 * Scans a list of candidate ports and returns all ports currently listening.
 */
export async function findActivePorts(
  candidatePorts: readonly number[] = COMMON_DEV_PORTS,
  host = '127.0.0.1'
): Promise<number[]> {
  const results = await Promise.all(
    candidatePorts.map(async (port) => {
      const active = await isPortListening(port, host);
      return active ? port : null;
    })
  );

  return results.filter((p): p is number => p !== null);
}

/**
 * Detects the port to use:
 * - If explicit port is provided, verifies it is listening.
 * - If not provided, scans common dev ports.
 */
export async function resolvePort(explicitPort?: number, host = '127.0.0.1'): Promise<number> {
  if (explicitPort !== undefined) {
    const isListening = await isPortListening(explicitPort, host);
    if (!isListening) {
      throw new DevPreviewError(
        `Port ${explicitPort} is not reachable on ${host}.`,
        `Start your local application first or specify another port:\n\n  devpreview --port <active-port>`
      );
    }
    return explicitPort;
  }

  // Scan common ports
  const activePorts = await findActivePorts(COMMON_DEV_PORTS, host);

  if (activePorts.length === 0) {
    throw new DevPreviewError(
      'No local development server detected on common ports.',
      `Make sure your development server is running, or specify your port directly:\n\n  devpreview --port 3000\n\nScanned ports: ${COMMON_DEV_PORTS.join(', ')}`
    );
  }

  // If one or more active ports found, use the first one
  const selectedPort = activePorts[0];
  if (selectedPort === undefined) {
    throw new DevPreviewError('Failed to resolve an active port.');
  }

  return selectedPort;
}
