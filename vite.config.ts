import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';

// Public artwork keeps stable URLs for saved demo state. Give every release its
// own offline cache even when only an image, rather than a JS bundle, changed.
function releaseCache(): Plugin {
  const root = resolve(import.meta.dirname, 'static');
  const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => entry.isDirectory() ? files(resolve(dir, entry.name)) : [resolve(dir, entry.name)]);
  return {
    name: 'vieworld-release-cache',
    apply: 'build',
    generateBundle(_options, bundle) {
      const hash = createHash('sha256');
      Object.keys(bundle).sort().forEach(name => { const item = bundle[name]; hash.update(name); hash.update(item.type === 'chunk' ? item.code : item.source); });
      files(root).forEach(file => { hash.update(relative(root, file).replaceAll('\\', '/')); hash.update(readFileSync(file)); });
      const source = readFileSync(resolve(root, 'sw.js'), 'utf8').replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'vieworld-pwa-${hash.digest('hex').slice(0, 12)}';`);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [react(), releaseCache()],
  publicDir: 'static',
  server: {
    port: 5173,
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    host: '127.0.0.1',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
