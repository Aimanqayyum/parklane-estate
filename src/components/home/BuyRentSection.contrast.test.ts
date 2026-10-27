import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/*
 * The Buy / Rent cards put text on solid theme surfaces. This reads the real
 * colour tokens from src/index.css and checks every foreground / background
 * pair the cards use against WCAG AA (4.5:1 for normal text), in light and
 * dark mode. If a theme colour changes and a pair drops below AA, this fails.
 */

const css = readFileSync(resolve(__dirname, '../../index.css'), 'utf-8');

const tokens = (selector: string): Record<string, [number, number, number]> => {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf('}', start);
  const block = css.slice(start, end);
  const out: Record<string, [number, number, number]> = {};
  for (const m of block.matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
};

const hslToRgb = ([h, s, l]: [number, number, number]): [number, number, number] => {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
};

const luminance = (hsl: [number, number, number]) => {
  const [r, g, b] = hslToRgb(hsl).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: [number, number, number], b: [number, number, number]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [text token, surface token, where it is used in BuyRentSection]
const pairs: [string, string, string][] = [
  ['foreground', 'card', 'title, count text'],
  ['muted-foreground', 'card', 'description'],
  ['foreground', 'background', 'category chips'],
  ['background', 'foreground', 'purpose tag, chip hover'],
  ['primary-foreground', 'primary', 'Browse all button'],
  ['foreground', 'background', 'section heading'],
  ['muted-foreground', 'background', 'section intro'],
];

describe.each([
  ['light', ':root'],
  ['dark', '.dark'],
])('Buy / Rent section contrast (%s mode)', (_name, selector) => {
  const t = tokens(selector);

  it.each(pairs)('%s on %s (%s) meets WCAG AA 4.5:1', (fg, bg) => {
    expect(t[fg], `missing token --${fg}`).toBeDefined();
    expect(t[bg], `missing token --${bg}`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
