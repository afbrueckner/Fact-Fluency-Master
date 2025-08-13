// Build script for static deployment without backend
import { build } from 'vite';
import path from 'path';

async function buildStatic() {
  try {
    // Build the client for static hosting
    await build({
      root: './client',
      build: {
        outDir: '../dist',
        emptyOutDir: true,
      },
      base: './', // Use relative paths for static hosting
    });
    
    console.log('✅ Static build complete! Ready for hosting on GitHub Pages, Netlify, or Vercel.');
    console.log('📁 Built files are in the ./dist directory');
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