#!/usr/bin/env node
/**
 * Script para combinar builds do CMS e Editor para deploy no Vercel
 *
 * Estrutura final:
 * dist/
 *   ├── index.html (CMS)
 *   ├── assets/ (CMS assets)
 *   └── editor/
 *       ├── index.html
 *       └── assets/
 */

import { cpSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use process.cwd() como rootDir (diretório onde o comando é executado)
// No Vercel, isso será /vercel/path0 (raiz do projeto)
const rootDir = process.cwd();

console.log('🔨 Merging CMS and Editor builds for Vercel...\n');
console.log('📍 Script directory:', __dirname);
console.log('📍 Root directory (process.cwd):', rootDir);
console.log('');

// Limpar dist antiga
const distDir = join(rootDir, 'dist');
if (existsSync(distDir)) {
  console.log('🗑️  Cleaning old dist directory...');
  rmSync(distDir, { recursive: true, force: true });
}

// Criar dist
mkdirSync(distDir, { recursive: true });

// Copiar CMS para raiz do dist
const cmsDistDir = join(rootDir, 'packages', 'cms', 'dist');
if (existsSync(cmsDistDir)) {
  console.log('📦 Copying CMS build to / (root)');
  cpSync(cmsDistDir, distDir, { recursive: true });
  console.log('   ✅ CMS copied successfully');
} else {
  console.error('   ❌ CMS dist not found at:', cmsDistDir);
  console.error('   Run: pnpm build:cms');
  process.exit(1);
}

// Copiar Editor para dist/editor
const editorDistDir = join(rootDir, 'packages', 'editor', 'dist');
const editorTargetDir = join(distDir, 'editor');
if (existsSync(editorDistDir)) {
  console.log('📦 Copying Editor build to /editor');
  cpSync(editorDistDir, editorTargetDir, { recursive: true });
  console.log('   ✅ Editor copied successfully');
} else {
  console.error('   ❌ Editor dist not found at:', editorDistDir);
  console.error('   Run: pnpm build:editor');
  process.exit(1);
}

console.log('\n✅ Build merge complete!');
console.log('📂 Output directory:', distDir);

// Verificar que a pasta existe
if (existsSync(distDir)) {
  console.log('✅ dist/ directory exists');
  console.log('📂 Absolute path:', distDir);

  // Listar conteúdo
  const files = readdirSync(distDir);
  console.log('📋 Contents:', files.join(', '));
} else {
  console.error('❌ ERROR: dist/ directory was NOT created!');
  process.exit(1);
}

console.log('\n📋 Expected structure:');
console.log('   dist/');
console.log('   ├── index.html (CMS)');
console.log('   ├── assets/ (CMS assets)');
console.log('   └── editor/');
console.log('       ├── index.html');
console.log('       └── assets/');
console.log('\n🚀 Ready for Vercel deployment!');
