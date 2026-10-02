import { parseArgs } from 'node:util';

export interface CliOptions {
  port?: number;
  help?: boolean;
  version?: boolean;
  provider?: string;
}

export class DevPreviewError extends Error {
  public readonly suggestion?: string;

  constructor(message: string, suggestion?: string) {
    super(message);
    this.name = 'DevPreviewError';
    this.suggestion = suggestion;
  }
}

/**
 * Validates whether a value is a valid TCP port (1 - 65535)
 */
export function isValidPort(port: unknown): port is number {
  if (typeof port !== 'number' || Number.isNaN(port)) {
    return false;
  }
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Parses raw port input from CLI string or number
 */
export function parsePort(input: string | number): number {
  const parsed = typeof input === 'number' ? input : Number.parseInt(input, 10);
  if (!isValidPort(parsed)) {
    throw new DevPreviewError(
      `Invalid port: "${input}".`,
      'Port must be an integer between 1 and 65535.'
    );
  }
  return parsed;
}

/**
 * Parses command-line arguments using Node.js util.parseArgs
 */
export function parseCliArgs(args: string[]): CliOptions {
  try {
    const { values } = parseArgs({
      args,
      options: {
        port: {
          type: 'string',
          short: 'p'
        },
        help: {
          type: 'boolean',
          short: 'h'
        },
        version: {
          type: 'boolean',
          short: 'v'
        },
        provider: {
          type: 'string'
        }
      },
      allowPositionals: false,
      strict: true
    });

    const options: CliOptions = {
      help: values.help,
      version: values.version,
      provider: values.provider
    };

    if (values.port !== undefined) {
      options.port = parsePort(values.port);
    }

    return options;
  } catch (err: unknown) {
    if (err instanceof DevPreviewError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new DevPreviewError(
      `Failed to parse command-line arguments: ${message}`,
      'Run "devpreview --help" for available options.'
    );
  }
}
