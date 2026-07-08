const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'Backend');
const frontendDir = path.join(rootDir, 'Frontend');

function start(command, args, options) {
  const child = spawn(command, args, {
    cwd: options.cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ...options.env }
  });

  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`${options.name} exited with code ${code} signal ${signal}`);
    }
  });

  return child;
}

console.log('Starting backend and frontend...');
const backend = start('npm', ['run', 'dev'], { cwd: backendDir, name: 'backend' });
const frontend = start('npx', ['http-server', 'Frontend', '-p', '3000', '-c-1'], { cwd: rootDir, name: 'frontend' });

function stopAll() {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
