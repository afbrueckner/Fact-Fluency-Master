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
    
    console.log('✅ Static build complete! Ready for hosting on GitHub Pages, Netlify, or Vercel.');
    console.log('📁 Built files are in the ./dist directory');
    console.log('🔧 Added GitHub Pages SPA support (404.html and .nojekyll)');
    console.log('');
    console.log('🚀 Deploy instructions:');
    console.log('   GitHub Pages: Push to your repo and enable Pages from the dist folder');
    console.log('   Netlify: Drag and drop the dist folder to netlify.com/drop');
    console.log('   Vercel: Import your repo and set build output to "dist"');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildStatic();