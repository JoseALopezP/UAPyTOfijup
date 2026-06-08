import { execSync, spawn } from 'child_process';

const target = (process.env.BUILD_TARGET || 'admin').toLowerCase();
process.env.BUILD_TARGET = target;
process.env.NEXT_PUBLIC_BUILD_TARGET = target;
const args = process.argv.slice(2);
const isVercel = args.includes('--vercel') || target === 'vercel';

console.log(`[BUILD] Iniciando proceso para target: ${target}`);

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`El comando falló con código ${code}: ${command}`));
    });
  });
}

async function main() {
  try {
    // 1. Aplicar máscaras de páginas
    execSync(`node scripts/build-prepare.js`, {
      stdio: 'inherit',
      env: { ...process.env, BUILD_TARGET: target }
    });

    // 2. Ejecutar compilación
    if (isVercel) {
      await runCommand('next build');
    } else {
      await runCommand('next build');
      
      // Determinar archivo de configuración de electron-builder
      let configFlag = '';
      if (target !== 'admin') {
        configFlag = `--config electron-builder.${target}.yaml`;
      }
      await runCommand(`electron-builder ${configFlag}`);
    }
  } catch (error) {
    console.error('[BUILD] Error durante la compilación:', error.message);
    process.exitCode = 1;
  } finally {
    // 3. Restaurar archivos originales
    console.log('[BUILD] Restaurando archivos originales...');
    try {
      execSync('node scripts/build-prepare.js --restore', { stdio: 'inherit' });
    } catch (restoreError) {
      console.error('[BUILD] Error al restaurar:', restoreError.message);
    }
  }
}

// Escuchar señales para restaurar en caso de interrupción manual (Ctrl+C)
const handleSignal = () => {
  console.log('\n[BUILD] Interrupción recibida. Restaurando antes de salir...');
  try {
    execSync('node scripts/build-prepare.js --restore', { stdio: 'inherit' });
  } catch (e) {}
  process.exit(1);
};

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

main();
