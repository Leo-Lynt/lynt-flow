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

// Listar TUDO no diretório raiz para debug
console.log('\n🔍 DEBUG: Listing all files/folders in root directory:');
try {
  const rootFiles = readdirSync(rootDir);
  console.log('Root contents:', rootFiles.join(', '));
  console.log('Total items in root:', rootFiles.length);

  // Verificar se dist está na lista
  if (rootFiles.includes('dist')) {
    console.log('✅ "dist" folder IS in root directory!');
  } else {
    console.log('❌ "dist" folder is NOT in root directory!');
  }
} catch (err) {
  console.error('Error listing root directory:', err);
}

// Verificar que a pasta existe
if (existsSync(distDir)) {
  console.log('\n✅ dist/ directory exists');
  console.log('📂 Absolute path:', distDir);

  // Listar conteúdo
  const files = readdirSync(distDir);
  console.log('📋 Contents:', files.join(', '));

  // Verificar se index.html existe
  const hasIndexHtml = files.includes('index.html');
  console.log(hasIndexHtml ? '✅ index.html found' : '❌ index.html NOT found');

  // Verificar se editor/ existe
  const hasEditorFolder = files.includes('editor');
  console.log(hasEditorFolder ? '✅ editor/ folder found' : '❌ editor/ folder NOT found');
} else {
  console.error('\n❌ ERROR: dist/ directory was NOT created!');
  console.error('Expected path:', distDir);
  process.exit(1);
}

// TAMBÉM copiar para .vercel/output/static (Vercel Build Output API)
console.log('\n📦 Creating Vercel Build Output API structure...');
const vercelOutputDir = join(rootDir, '.vercel', 'output', 'static');
try {
  mkdirSync(vercelOutputDir, { recursive: true });
  cpSync(distDir, vercelOutputDir, { recursive: true });
  console.log('✅ Copied to .vercel/output/static');
  console.log('📂 Path:', vercelOutputDir);
} catch (err) {
  console.warn('⚠️  Could not create Vercel output structure:', err.message);
}

console.log('\n📋 Expected structure:');
console.log('   dist/');
console.log('   ├── index.html (CMS)');
console.log('   ├── assets/ (CMS assets)');
console.log('   └── editor/');
console.log('       ├── index.html');
console.log('       └── assets/');
console.log('\n🚀 Ready for Vercel deployment!');
