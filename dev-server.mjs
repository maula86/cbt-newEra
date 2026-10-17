import { spawn } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const nextArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    nextArgs.push('-H');
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      nextArgs.push(rawArgs[++i]);
    } else {
      nextArgs.push('0.0.0.0');
    }
  } else if (arg.startsWith('--host=')) {
    nextArgs.push('-H', arg.slice('--host='.length));
  } else {
    nextArgs.push(arg);
  }
}

const child = spawn('npx', ['next', 'dev', ...nextArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
