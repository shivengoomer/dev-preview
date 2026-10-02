import { DevPreviewError } from '../config/config.js';

// Safe ANSI escape codes
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  yellow: '\x1b[33m'
};

const supportsColor = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);

function color(text: string, code: string): string {
  return supportsColor ? `${code}${text}${ANSI.reset}` : text;
}

export const styles = {
  bold: (t: string) => color(t, ANSI.bold),
  dim: (t: string) => color(t, ANSI.dim),
  green: (t: string) => color(t, ANSI.green),
  cyan: (t: string) => color(t, ANSI.cyan),
  red: (t: string) => color(t, ANSI.red),
  yellow: (t: string) => color(t, ANSI.yellow)
};

export function renderHeader(): void {
  console.log(`\n${styles.bold('DevPreview')}\n`);
}

export function renderStep(message: string): void {
  console.log(`${styles.green('✓')} ${message}`);
}

export function renderReady(publicUrl: string, localPort: number): void {
  console.log(`${styles.green('✓')} Preview ready\n`);
  console.log(`  ${styles.bold(styles.cyan(publicUrl))}\n`);
  console.log(`  ${styles.dim('Local:')}  http://localhost:${localPort}`);
  console.log(`  ${styles.dim('Status:')} ${styles.green('Connected')}\n`);
  console.log(styles.dim('Press Ctrl+C to stop'));
}

export function renderError(error: unknown): void {
  console.error('');
  if (error instanceof DevPreviewError) {
    console.error(`${styles.red('✗')} ${styles.bold(error.message)}`);
    if (error.suggestion) {
      console.error(`\n${error.suggestion}\n`);
    } else {
      console.error('');
    }
  } else if (error instanceof Error) {
    console.error(`${styles.red('✗')} ${styles.bold(error.message)}\n`);
  } else {
    console.error(`${styles.red('✗')} ${styles.bold(String(error))}\n`);
  }
}

export function renderHelp(): void {
  console.log(`
${styles.bold('DevPreview')} — Share your localhost instantly

${styles.bold('USAGE')}
  $ npx devpreview [options]

${styles.bold('OPTIONS')}
  -p, --port <number>     Specify local port to expose (e.g. 3000, 5173)
  -h, --help              Show help information
  -v, --version           Show current version

${styles.bold('EXAMPLES')}
  $ npx devpreview
  $ npx devpreview --port 3000
  $ npx devpreview -p 5173
`);
}

export function renderVersion(version = '0.1.0'): void {
  console.log(`devpreview v${version}`);
}
