import { runDevPreview } from './commands.js';

runDevPreview().then((exitCode) => {
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}).catch((err) => {
  console.error('Unexpected fatal error:', err);
  process.exit(1);
});
