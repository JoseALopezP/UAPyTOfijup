import fs from 'fs';
import path from 'path';

// Define which routes are allowed for each build target.
// Public routes (always allowed): 'tablero', 'Manual', 'signin', 'signup', 'celular', 'menu'
const TARGET_ROUTES = {
  admin: null, // null means all routes are allowed
  unc: [
    'Agregar-Audiencia',
    'Carga-Juicio',
    'Oficios',
    'audienciasUAC',
    'Solicitudes-Audiencia',
    'Situacion-Corporal'
  ],
  uga: [
    'Agregar-Audiencia',
    'Minuta-Juicio',
    'Centro-UGA',
    'Registro-Audiencia',
    'Situacion-Corporal',
    'Sorteo-Operador',
    'Gestion-Usuarios'
  ],
  ual: [
    'Pumba',
    'tablero',
    'Gestion-Usuarios'
  ],
  vercel: null // Vercel can build all routes or a subset if desired
};

const PUBLIC_ROUTES = [
  '',
  'tablero',
  'Manual',
  'signin',
  'signup',
  'celular',
  'menu'
];

const backupDir = path.join(process.cwd(), '.temp_backup');
const appDir = path.join(process.cwd(), 'src', 'app');

// Recursively find all page.jsx or page.js files under a directory, ignoring components/api folders.
function findPages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip api routes, components, ui, and navBar folders
      if (file === 'api' || file === 'components' || file === 'ui' || file === 'navBar') {
        continue;
      }
      findPages(filePath, fileList);
    } else if (file === 'page.jsx' || file === 'page.js') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Restore original files from backup
function restoreBackup() {
  if (!fs.existsSync(backupDir)) {
    console.log('No backup directory found. Nothing to restore.');
    return;
  }

  const restoreFolder = (src, dest) => {
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        restoreFolder(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  try {
    restoreFolder(backupDir, appDir);
    // Remove the temp backup directory
    fs.rmSync(backupDir, { recursive: true, force: true });
    console.log('Original page files successfully restored.');
  } catch (error) {
    console.error('Error restoring original files:', error);
  }
}

// Main function to apply masks
function applyMasks(target) {
  const allowed = TARGET_ROUTES[target];
  if (allowed === undefined) {
    console.error(`Invalid build target: "${target}". Choose one of: ${Object.keys(TARGET_ROUTES).join(', ')}`);
    process.exit(1);
  }

  // If the target has null, it means keep all routes (no masking needed)
  if (allowed === null) {
    console.log(`Target "${target}" allows all routes. Skipping masking.`);
    return;
  }

  console.log(`Preparing build for target: "${target}"...`);

  // Ensure backup directory is clean
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.mkdirSync(backupDir, { recursive: true });

  const allPagePaths = findPages(appDir);
  let maskedCount = 0;

  for (const pagePath of allPagePaths) {
    // Determine the relative path from src/app
    const relativePath = path.relative(appDir, pagePath);
    // Get the top-level route directory name (e.g. "Registro-Audiencia")
    const routeParts = relativePath.split(path.sep);
    const routeName = routeParts[0];

    // If it's the root page or in public/allowed list, keep it.
    const isPublic = PUBLIC_ROUTES.includes(routeName) || routeParts.length === 1;
    const isAllowed = allowed.includes(routeName);

    if (!isPublic && !isAllowed) {
      // Backup the original file
      const backupPath = path.join(backupDir, relativePath);
      const backupFileDir = path.dirname(backupPath);
      
      if (!fs.existsSync(backupFileDir)) {
        fs.mkdirSync(backupFileDir, { recursive: true });
      }
      
      fs.copyFileSync(pagePath, backupPath);

      // Overwrite with a minimal placeholder
      const placeholderContent = `'use client';
export default function PlaceholderPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      color: '#666',
      backgroundColor: '#f5f5f5'
    }}>
      <div>Módulo no disponible en esta compilación.</div>
    </div>
  );
}
`;
      fs.writeFileSync(pagePath, placeholderContent, 'utf8');
      maskedCount++;
    }
  }

  console.log(`Masking complete. Replaced ${maskedCount} pages with placeholders.`);
}

// Check arguments
const args = process.argv.slice(2);
if (args.includes('--restore')) {
  restoreBackup();
} else {
  const target = process.env.BUILD_TARGET || 'admin';
  applyMasks(target.toLowerCase());
}
