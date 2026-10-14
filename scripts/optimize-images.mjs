import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// Optional developer tool. Sharp is supplied by the workspace runtime; not an app dependency.
// --inventory reads only. Conversion creates manifest derivatives, never overwrites originals.
const root = resolve(import.meta.dirname, '..');
const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const modulePath = option('--sharp-module');
const sharp = (await import(modulePath ? pathToFileURL(resolve(modulePath)).href : 'sharp')).default;
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)]);
const records = [];
if (process.argv.includes('--inventory')) {
  for (const file of [...walk(resolve(root, 'static/images')), ...walk(resolve(root, 'src/assets'))].filter(file => /\.(png|jpe?g|webp)$/i.test(file))) {
    const metadata = await sharp(file).metadata();
    records.push({ path: relative(root, file).replaceAll('\\', '/'), bytes: statSync(file).size, format: metadata.format, width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha });
  }
} else {
  const manifest = JSON.parse(readFileSync(resolve(root, 'src/data/imageDelivery.json'), 'utf8'));
  for (const asset of manifest.assets) {
    const source = resolve(root, asset.source), target = resolve(root, asset.target);
    if (!target.startsWith(root + '/') && !target.startsWith(root + '\\')) throw Error('Target outside repository');
    if (source === target) throw Error('Original must be preserved');
    const metadata = await sharp(source).metadata();
    let image = sharp(source);
    if (asset.width) image = image.resize({ width: asset.width, withoutEnlargement: true });
    const output = await image.webp({ quality: asset.quality, alphaQuality: 100, effort: 6 }).toFile(target);
    if (output.size > asset.maxBytes) throw Error('Review quality/budget exception for ' + asset.target);
    const converted = await sharp(target).metadata();
    if (!asset.width && (converted.width !== metadata.width || converted.height !== metadata.height)) throw Error('Geometry changed: ' + asset.target);
    if (converted.hasAlpha !== metadata.hasAlpha) throw Error('Alpha changed: ' + asset.target);
    records.push({ source: asset.source, target: asset.target, role: asset.role, before: statSync(source).size, after: output.size, originalWidth: metadata.width, originalHeight: metadata.height, width: output.width, height: output.height, alphaBefore: metadata.hasAlpha, alphaAfter: converted.hasAlpha });
  }
}
const report = option('--report');
if (report) writeFileSync(resolve(report), JSON.stringify(records, null, 2) + '\n');
console.log(JSON.stringify({ mode: process.argv.includes('--inventory') ? 'inventory' : 'derivatives', files: records.length, before: records.reduce((n, item) => n + (item.before || item.bytes), 0), after: records.reduce((n, item) => n + (item.after || item.bytes), 0) }));
