import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/styles/appearance.css', 'utf8');
const luminance = (hex: string) => {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const ratio = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
describe('Shared appearance token contrast (not a full page accessibility audit)', () => {
  for (const mode of ['light', 'dark']) it(`${mode}: ink, secondary text and links meet 4.5:1 on reading surfaces`, () => {
    const block = css.split(`.fan-shell[data-theme='${mode}'] {`)[1].split('}')[0];
    const token = (name: string) => block.match(new RegExp(`--appearance-${name}:\\s*(#[0-9a-f]{6})`))![1];
    for (const foreground of ['ink', 'muted', 'accent']) for (const background of ['bg', 'surface', 'soft', 'selected']) {
      expect(ratio(token(foreground), token(background)), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
