// Generates a halftone "waveform" image in the style of the Counterpoint logo.
// The same title always produces the same artwork.

const PALETTES = {
  paper: { bg: "#F5F4F2", dot: "#0A0A0A" },
  black: { bg: "#0A0A0A", dot: "#F5F4F2" },
  red: { bg: "#C4001A", dot: "#0A0A0A" },
  ruby: { bg: "#70000E", dot: "#F5F4F2" },
  gray: { bg: "#DCD7D4", dot: "#0A0A0A" },
};
const ORDER = ["paper", "black", "red", "gray", "ruby"];

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function halftone(title = "", variant) {
  const seed = hash(String(title));
  const rand = rng(seed);
  const { bg, dot } = PALETTES[variant] || PALETTES[ORDER[seed % ORDER.length]];

  const W = 1600;
  const H = 900;
  const COLS = 64;
  const ROWS = 36;
  const step = W / COLS;
  const maxR = step * 0.52;

  // A few overlapping peaks make up the outline of the waveform
  const peaks = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
    c: 0.5 + (rand() - 0.5) * 0.6,
    w: 0.05 + rand() * 0.14,
    h: 0.45 + rand() * 0.55,
  }));

  const dots = [];
  for (let i = 0; i < COLS; i++) {
    const x = (i + 0.5) / COLS;
    let amp = 0;
    for (const p of peaks) {
      amp = Math.max(amp, p.h * Math.exp(-((x - p.c) ** 2) / (2 * p.w * p.w)));
    }
    amp = amp * (0.55 + rand() * 0.45) + 0.03;
    for (let j = 0; j < ROWS; j++) {
      const dy = Math.abs((j + 0.5) / ROWS - 0.5) * 2;
      const t = 1 - dy / amp;
      if (t <= 0) continue;
      const r = maxR * Math.min(1, t ** 0.75);
      if (r < 0.9) continue;
      dots.push(
        `<circle cx="${(i + 0.5) * step}" cy="${(j + 0.5) * step}" r="${r.toFixed(1)}"/>`
      );
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="">` +
    `<rect width="${W}" height="${H}" fill="${bg}"/>` +
    `<g fill="${dot}">${dots.join("")}</g></svg>`
  );
}
