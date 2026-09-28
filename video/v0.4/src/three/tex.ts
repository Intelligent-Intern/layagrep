// Every surface texture is drawn once on a 2D canvas: deterministic, no downloads,
// and the same fonts the HTML overlay uses (callers wait for fontsReady first).
import * as THREE from "three";
import { rand } from "../lib/anim";
import { MONO, SANS, SERIF } from "../lib/ui";

const cache = new Map<string, THREE.CanvasTexture>();

export function canvasTex(
  key: string,
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  { srgb = true, repeat = 1 }: { srgb?: boolean; repeat?: number } = {},
) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat !== 1) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  cache.set(key, t);
  return t;
}

/** Speckle + fibre noise, so paper and card never read as flat colour. */
function fibres(g: CanvasRenderingContext2D, w: number, h: number, seed: number, amt = 1) {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  let s = seed * 9973 + 1;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 14 * amt;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n * 0.9;
  }
  g.putImageData(img, 0, 0);
  g.globalAlpha = 0.05 * amt;
  g.strokeStyle = "#6b5a40";
  for (let i = 0; i < 260; i++) {
    const x = r() * w,
      y = r() * h,
      a = r() * Math.PI;
    g.lineWidth = 0.6 + r();
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10 + 4, x + Math.cos(a) * 22, y + Math.sin(a) * 22);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

export const INK = "#1A1917";
export const RED = "#EF5638";
export const REDDEEP = "#C73A20";
export const GREY = "#9A9387";

export type PageSpec = {
  seed: number;
  title?: string;
  lines?: number;
  hi?: number[];
  hiColor?: string;
  paper?: string;
  fade?: boolean; // greyed-out location lists
  kind?: "code" | "list" | "test" | "method";
};

/** A page of code drawn as bars, like the brand art, with an optional mono filename. */
export function pageTex(spec: PageSpec) {
  const { seed, title, lines = 14, hi = [], hiColor = RED, paper = "#F4EFE4", kind = "code" } = spec;
  return canvasTex(`page:${JSON.stringify(spec)}`, 512, 704, (g, w, h) => {
    g.fillStyle = paper;
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, seed);
    let y = 56;
    if (title) {
      g.fillStyle = INK;
      g.font = `700 26px ${MONO}`;
      g.fillText(title, 40, 62);
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.fillRect(40, 80, w - 80, 2);
      y = 116;
    }
    const gap = (h - y - 40) / lines;
    for (let i = 0; i < lines; i++) {
      const indent = kind === "list" ? (i % 3 ? 26 : 0) : rand(i, seed + 5) > 0.55 ? 34 : 0;
      const len = (w - 80 - indent) * (0.35 + 0.6 * rand(i, seed));
      g.fillStyle = hi.includes(i) ? hiColor : spec.fade ? "#B9B2A4" : GREY;
      roundRect(g, 40 + indent, y + i * gap, len, Math.min(14, gap * 0.45), 7);
      if (kind === "list" && i % 3 === 0) {
        g.fillStyle = spec.fade ? "#B9B2A4" : "#6E685E";
        roundRect(g, 40, y + i * gap, 18, 14, 3);
      }
    }
  });
}

/** Walnut desk top: long grain streaks with pores; also returns a matching roughness map. */
export function woodTex(rough = false) {
  return canvasTex(
    `wood:${rough}`,
    2048,
    2048,
    (g, w, h) => {
      g.fillStyle = rough ? "#9a9a9a" : "#3B2616";
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const y = rand(i, 1) * h,
          th = 1 + rand(i, 2) * 7;
        const c = rand(i, 3);
        g.strokeStyle = rough
          ? `rgba(${c > 0.5 ? 255 : 40},${c > 0.5 ? 255 : 40},${c > 0.5 ? 255 : 40},0.08)`
          : c > 0.5
            ? `rgba(120,78,46,${0.12 + rand(i, 4) * 0.2})`
            : `rgba(20,11,5,${0.15 + rand(i, 4) * 0.25})`;
        g.lineWidth = th;
        g.beginPath();
        for (let x = 0; x <= w; x += 32) {
          const yy = y + Math.sin(x * 0.002 + i) * 18 + Math.sin(x * 0.011 + i * 3) * 4;
          if (x === 0) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      }
      fibres(g, w, h, 3, rough ? 2 : 1.5);
    },
    { srgb: !rough, repeat: 3 },
  );
}

/** Leather desk blotter. */
export function blotterTex() {
  return canvasTex("blotter", 1024, 1024, (g, w, h) => {
    g.fillStyle = "#1F2A25";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, 7, 2.2);
    const grd = g.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.75);
    grd.addColorStop(0, "rgba(255,255,255,0.03)");
    grd.addColorStop(1, "rgba(0,0,0,0.25)");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }, { repeat: 2 });
}

export function manilaTex(key: string, draw?: (g: CanvasRenderingContext2D, w: number, h: number) => void, color = "#D9BF86") {
  return canvasTex(`manila:${key}`, 1536, 1024, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, 11, 1.4);
    draw?.(g, w, h);
  });
}

/** Rubber-stamp ink: text inside a rounded border, broken up so it reads as pressed ink. */
export function inkTex(label: string, color: string, mark: "check" | "cross" | "none" = "check") {
  return canvasTex(`ink:${label}:${color}:${mark}`, 1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = 16;
    g.beginPath();
    g.roundRect(14, 14, w - 28, h - 28, 34);
    g.stroke();
    const markW = mark === "none" ? 0 : 130;
    let size = 118;
    g.font = `600 ${size}px ${SANS}`;
    while (g.measureText(label).width + markW > w - 110 && size > 40) g.font = `600 ${(size -= 4)}px ${SANS}`;
    g.textBaseline = "middle";
    const tw = g.measureText(label).width;
    const x0 = (w - tw - markW) / 2;
    if (mark !== "none") {
      g.lineWidth = 20;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      if (mark === "check") {
        g.moveTo(x0 + 6, h / 2 + 4);
        g.lineTo(x0 + 40, h / 2 + 40);
        g.lineTo(x0 + 100, h / 2 - 42);
      } else {
        g.moveTo(x0 + 12, h / 2 - 38);
        g.lineTo(x0 + 88, h / 2 + 38);
        g.moveTo(x0 + 88, h / 2 - 38);
        g.lineTo(x0 + 12, h / 2 + 38);
      }
      g.stroke();
    }
    g.fillText(label, x0 + markW, h / 2 + 6);
    // Ink breakup: punch speckled holes.
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 1100; i++) {
      const r = rand(i, 17) * rand(i, 18) * rand(i, 33) * 6;
      g.globalAlpha = 0.3 + rand(i, 19) * 0.7;
      g.beginPath();
      g.arc(rand(i, 20) * w, rand(i, 21) * h, r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  });
}

/** The stamped jevgrep wordmark (dotless j; the dot is a separate red disc like the brand art). */
export function wordmarkTex() {
  return canvasTex("wordmark", 2048, 640, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = INK;
    g.font = `900 470px ${SERIF}`;
    g.textBaseline = "alphabetic";
    g.fillText("ȷevgrep", 40, 470);
    g.fillStyle = RED;
    g.beginPath();
    g.arc(40 + 118, 95, 62, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 1400; i++) {
      const r = rand(i, 27) * rand(i, 28) * rand(i, 32) * 7;
      g.globalAlpha = 0.25 + rand(i, 29) * 0.6;
      g.beginPath();
      g.arc(rand(i, 30) * w, rand(i, 31) * h, r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  });
}

/** Text on a transparent canvas: labels, receipts, cards. Lines are [text, font, color]. */
export function textTex(key: string, w: number, h: number, bg: string | null, lines: [string, string, string, number, number][]) {
  return canvasTex(`text:${key}`, w, h, (g) => {
    if (bg) {
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      fibres(g, w, h, key.length, 0.8);
    } else g.clearRect(0, 0, w, h);
    g.textBaseline = "alphabetic";
    for (const [text, font, color, x, y] of lines) {
      g.font = font;
      g.fillStyle = color;
      g.fillText(text, x, y);
    }
  });
}

export { MONO, SANS, SERIF };

/** Embossed label-maker tape: all letters drawn once; callers reveal a prefix via UV repeat. */
export const TAPE = { cw: 74, pad: 44, h: 128 };
export function tapeTex(text: string, color: string) {
  const w = text.length * TAPE.cw + TAPE.pad * 2;
  return canvasTex(`tape:${text}:${color}`, w, TAPE.h, (g) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, TAPE.h);
    fibres(g, w, TAPE.h, 5, 0.6);
    g.font = `700 92px ${MONO}`;
    g.textBaseline = "middle";
    g.textAlign = "center";
    Array.from(text).forEach((ch, i) => {
      const x = TAPE.pad + i * TAPE.cw + TAPE.cw / 2;
      g.fillStyle = "rgba(0,0,0,0.55)";
      g.fillText(ch, x, TAPE.h / 2 + 6);
      g.fillStyle = "#F4F0E8";
      g.fillText(ch, x, TAPE.h / 2 + 2);
    });
  });
}

/** Thermal receipt: itemised Sol cost per task, then the total. */
export function receiptTex(key: string, title: string, rows: [string, string][], total: string) {
  const lh = 50,
    h = 150 + rows.length * lh + 200;
  return canvasTex(`receipt:${key}`, 560, h, (g, w) => {
    g.fillStyle = "#F6F3EC";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, 21, 0.6);
    g.fillStyle = INK;
    g.font = `700 34px ${MONO}`;
    g.textAlign = "center";
    g.fillText(title, w / 2, 70);
    g.font = `400 22px ${MONO}`;
    g.fillStyle = "#6E685E";
    g.fillText("Sol cost · 10 SWE-bench tasks", w / 2, 108);
    g.textAlign = "left";
    g.font = `500 30px ${MONO}`;
    rows.forEach(([a, b], i) => {
      const y = 170 + i * lh;
      g.fillStyle = "#3A3731";
      g.fillText(a, 34, y);
      g.textAlign = "right";
      g.fillText(b, w - 34, y);
      g.textAlign = "left";
    });
    const y = 170 + rows.length * lh;
    g.setLineDash([10, 8]);
    g.strokeStyle = "#6E685E";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(30, y - 10);
    g.lineTo(w - 30, y - 10);
    g.stroke();
    g.font = `700 62px ${MONO}`;
    g.fillStyle = INK;
    g.fillText("TOTAL", 34, y + 60);
    g.textAlign = "right";
    g.fillText(total, w - 34, y + 60);
  });
}

/** Self-healing cutting mat with a ruled grid. */
export function matTex() {
  return canvasTex("mat", 1600, 1000, (g, w, h) => {
    g.fillStyle = "#2F5A4B";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, 8, 1.2);
    for (let x = 0; x <= w; x += 40) {
      g.strokeStyle = x % 200 === 0 ? "rgba(230,240,230,0.45)" : "rgba(230,240,230,0.16)";
      g.lineWidth = x % 200 === 0 ? 2.5 : 1.2;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      g.strokeStyle = y % 200 === 0 ? "rgba(230,240,230,0.45)" : "rgba(230,240,230,0.16)";
      g.lineWidth = y % 200 === 0 ? 2.5 : 1.2;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.fillStyle = "rgba(230,240,230,0.55)";
    g.font = `500 22px ${MONO}`;
    for (let x = 200; x < w; x += 200) g.fillText(String(x / 40), x + 6, 26);
  });
}

/** Index card with a finished jg run (format from apps/cli/src/render.ts). */
export function cardTex(command: string) {
  return canvasTex(`card:${command}`, 1100, 680, (g, w, h) => {
    g.fillStyle = "#FBF8F1";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, 13, 0.6);
    g.fillStyle = "rgba(94,134,184,0.28)";
    for (let y = 150; y < h; y += 62) g.fillRect(0, y, w, 2);
    g.fillStyle = RED;
    g.fillRect(0, 112, w, 4);
    g.font = `700 44px ${MONO}`;
    g.fillStyle = RED;
    g.fillText("$", 44, 78);
    g.fillStyle = INK;
    g.fillText(command, 88, 78);
    g.font = `500 36px ${MONO}`;
    const lines: [string, string][] = [
      ["Jevgrep: 3 relevant files.", INK],
      ['- "src/db/pool.py" — source below', "#4B4740"],
      ['- "src/db/engine.py" — source below', "#4B4740"],
      ['- "tests/test_pool.py" — locations only', "#4B4740"],
    ];
    lines.forEach(([l, c], i) => {
      g.fillStyle = c;
      g.fillText(l, 44, 200 + i * 62);
    });
    [0.72, 0.5, 0.64].forEach((f, i) => {
      g.fillStyle = i === 1 ? RED : GREY;
      roundRect(g, 44, 470 + i * 50, (w - 88) * f, 18, 9);
    });
  });
}

/** Section of a printed jg output: header, compact list, source, or declaration locations. */
export function stripTex(kind: "head" | "list" | "source" | "locations", label = "") {
  return canvasTex(`strip:${kind}:${label}`, 512, 640, (g, w, h) => {
    g.fillStyle = "#F4EFE4";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, kind.length * 3, 0.7);
    g.fillStyle = kind === "source" ? RED : "#6E685E";
    g.font = `700 30px ${MONO}`;
    const title = { head: label, list: "files", source: "source", locations: "locations" }[kind];
    g.fillText(title, 36, 64);
    const n = kind === "head" ? 4 : 11;
    for (let i = 0; i < n; i++) {
      const y = 110 + i * 46;
      const ind = kind === "locations" ? (i % 3 ? 30 : 0) : kind === "source" ? (rand(i, 31) > 0.5 ? 34 : 0) : 0;
      g.fillStyle = kind === "source" ? (i === 3 || i === 7 ? RED : "#8E877B") : "#BDB6A8";
      roundRect(g, 36 + ind, y, (w - 72 - ind) * (0.4 + 0.55 * rand(i, kind.length)), 16, 8);
    }
    if (kind === "source") {
      g.fillStyle = "rgba(239,86,56,0.95)";
      g.fillRect(0, 0, 16, h);
      g.fillRect(0, 0, w, 20);
    }
  });
}

/** Back of a test card: only its location shows (a reading lead, body not shown). */
export function backTex(label: string) {
  return canvasTex(`back:${label}`, 512, 704, (g, w, h) => {
    g.fillStyle = "#CFC6B4";
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, label.length, 1);
    g.strokeStyle = "rgba(0,0,0,0.18)";
    g.lineWidth = 3;
    for (let i = -h; i < w; i += 28) {
      g.beginPath();
      g.moveTo(i, h);
      g.lineTo(i + h, 0);
      g.stroke();
    }
    g.fillStyle = "#F1EBDD";
    g.fillRect(28, h / 2 - 56, w - 56, 112);
    g.fillStyle = INK;
    g.font = `700 34px ${MONO}`;
    g.textAlign = "center";
    g.fillText(label, w / 2, h / 2 + 12);
  });
}

/** Small printed label (row names, slips). */
export function labelTex(text: string, { color = INK, bg = "#F1EBDD", font = `700 64px ${MONO}`, w = 1024, h = 160 } = {}) {
  return canvasTex(`label:${text}:${color}:${bg}:${font}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    fibres(g, w, h, text.length, 0.7);
    g.fillStyle = color;
    g.font = font;
    g.textBaseline = "middle";
    g.fillText(text, 40, h / 2 + 4);
  });
}

/** Version stamp beside the wordmark: red serif ink, same breakup as the wordmark. */
export function versionTex(text: string) {
  return canvasTex(`version:${text}`, 1024, 400, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = REDDEEP;
    g.font = `900 300px ${SERIF}`;
    g.textBaseline = "alphabetic";
    g.fillText(text, 30, 300);
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 700; i++) {
      const r = rand(i, 41) * rand(i, 42) * rand(i, 43) * 7;
      g.globalAlpha = 0.25 + rand(i, 44) * 0.6;
      g.beginPath();
      g.arc(rand(i, 45) * w, rand(i, 46) * h, r, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  });
}
