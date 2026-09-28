import { closeSync, existsSync, openSync, readSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const errors = new Set();
const assets = new Set();
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)]);
}
// Literal public assets only; dynamic product/artist references are also covered by integration tests.
for (const file of [...walk(resolve(root, 'src')), resolve(root, 'index.html')].filter(file => !file.includes(`${process.platform === 'win32' ? '\\' : '/'}tests`) && /\.(?:tsx?|css|html)$/.test(file))) {
  for (const match of readFileSync(file, 'utf8').matchAll(/(?:["'`(])((?:\/images\/|\/fonts\/|\/media\/|\/vieworld-)[^"'`\s(){}$]+\.(?:png|jpe?g|webp|svg|woff2?|mp3|ogg|mp4))/g)) {
    const asset = match[1]; assets.add(asset);
    if (!existsSync(resolve(root, `static${asset}`))) errors.add(`${relative(root, file)} → missing ${asset}`);
  }
}
// Static files are copied verbatim to dist. An incorrect extension can make the host
// return the wrong MIME type even when a browser happens to decode the bytes.
const publicImages = walk(resolve(root, 'static/images')).filter(file => /\.(?:png|jpe?g|webp)$/.test(file));
for (const file of publicImages) {
  const fd = openSync(file, 'r');
  const header = Buffer.alloc(12);
  try { readSync(fd, header, 0, header.length, 0); } finally { closeSync(fd); }
  const extension = extname(file).toLowerCase();
  const actual = header[0] === 0x89 && header.toString('ascii', 1, 4) === 'PNG' ? '.png'
    : header[0] === 0xff && header[1] === 0xd8 ? '.jpg'
      : header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP' ? '.webp' : 'unknown';
  if (actual !== extension && !(actual === '.jpg' && extension === '.jpeg')) errors.add(`${relative(root, file)} has ${actual} bytes but ${extension} extension`);
}
const dist = resolve(root, 'dist');
if (!existsSync(resolve(dist, 'index.html'))) errors.add('No dist/index.html. Run npm run build first.');
else {
  const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/(?:assets\/[^"?#]+|images\/vieworld-logo.svg|manifest.json))"/g)) {
    if (!existsSync(resolve(dist, asset.slice(1)))) errors.add(`Built entry references missing ${asset}`);
  }
  for (const file of ['sw.js', 'manifest.json', 'images/vieworld-logo.svg']) if (!existsSync(resolve(dist, file))) errors.add(`dist/${file} missing`);
  const bundles = walk(resolve(dist, 'assets')).filter(file => file.endsWith('.js'));
  const total = bundles.reduce((sum, file) => sum + statSync(file).size, 0);
  console.log(`Built JS: ${bundles.length} files / ${(total / 1024).toFixed(0)} KiB uncompressed (route chunks included).`);
  // A guard against an accidental single multi-megabyte entry, not a Lighthouse performance claim.
  for (const file of bundles) if (statSync(file).size > 1024 * 1024) errors.add(`Oversized JS chunk: ${relative(dist, file)}`);
}
console.log(`Checked ${assets.size} unique literal public assets.`);
console.log(`Checked ${publicImages.length} public raster file signatures.`);
if (errors.size) { console.error([...errors].join('\n')); process.exitCode = 1; }
else console.log('Showcase asset/build checks passed. This does not replace browser, content-rights or production-security review.');
