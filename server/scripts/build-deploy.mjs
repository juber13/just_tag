import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(__dirname, '..');
const distRoot = join(serverRoot, 'dist');
const distDir = join(distRoot, 'justtag-server');
const zipPath = join(distRoot, 'justtag-server.zip');

const FILES = [
    'server.js',
    'db.js',
    'package.json',
    'package-lock.json',
    'ecosystem.config.cjs',
    'start.sh',
    'Procfile',
    '.env.example',
    'DEPLOY.md',
];

const DIRS = ['src', 'public'];

function cleanDist() {
    if (existsSync(distRoot)) {
        rmSync(distRoot, { recursive: true, force: true });
    }
    mkdirSync(distDir, { recursive: true });
}

function copyBuildFiles() {
    for (const file of FILES) {
        const source = join(serverRoot, file);
        if (!existsSync(source)) {
            console.warn(`Skipping missing file: ${file}`);
            continue;
        }
        cpSync(source, join(distDir, file));
    }

    for (const dir of DIRS) {
        cpSync(join(serverRoot, dir), join(distDir, dir), { recursive: true });
    }
}

function installProductionDeps() {
    console.log('Installing production dependencies in build folder...');
    execSync('npm ci --omit=dev', { cwd: distDir, stdio: 'inherit' });
}

function createZip() {
    console.log('Creating zip archive...');
    const escapedDist = distDir.replace(/'/g, "''");
    const escapedZip = zipPath.replace(/'/g, "''");
    execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path '${escapedDist}' -DestinationPath '${escapedZip}' -Force"`,
        { stdio: 'inherit' },
    );
}

cleanDist();
copyBuildFiles();
installProductionDeps();
createZip();

console.log('');
console.log('Deploy package ready:');
console.log(`  Folder: ${distDir}`);
console.log(`  Zip:    ${zipPath}`);
console.log('');
console.log('Upload the zip to your server, unzip, add .env, then run:');
console.log('  node server.js');
console.log('  or: pm2 start ecosystem.config.cjs');
