export const PI = Math.PI;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const isMobile = () => Math.min(innerWidth, innerHeight) < 700;
