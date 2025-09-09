// Build script for static deployment without backend
import { build } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

async function buildStatic() {
  try {
    // Build the client for static hosting
    await build({
      plugins: [react()],
      root: './client',
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "client", "src"),
          "@shared": path.resolve(process.cwd(), "shared"),
          "@assets": path.resolve(process.cwd(), "attached_assets"),
        },
      },
      build: {
        outDir: '../dist',
        emptyOutDir: true,
      },
      base: '/MathFactMaster/', // GitHub Pages repository path
    });
    
    // Create GitHub Pages specific files for SPA routing
    const fs = await import('fs');
    const distPath = './dist';
    
    // Copy index.html to 404.html for SPA routing on GitHub Pages
    await fs.promises.copyFile(`${distPath}/index.html`, `${distPath}/404.html`);
    
    // Create .nojekyll file to prevent Jekyll processing
    await fs.promises.writeFile(`${distPath}/.nojekyll`, '');
    
    console.log('✅ Static build complete! Files ready for GitHub Pages deployment.');
    console.log('📁 Built files are in the ./dist directory');
    console.log('🔧 Added SPA support (404.html and .nojekyll files)');
    console.log('🚀 Ready for deployment!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildStatic();