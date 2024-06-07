import { vec3 } from "./glmatrix/next/index.js";

export function hsvToRgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return new vec3(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

export function getRainbowColor(time) {
    const hue = Math.sin(time) * .5 + .5
    return hsvToRgb(hue, 1, 1);
}

export function hexToRgb(hex) {
    hex = hex.replace(/^#/, '')

    let bigint = parseInt(hex, 16)
    let r = (bigint >> 16) & 255
    let g = (bigint >> 8) & 255
    let b = bigint & 255

    return new vec3(r, g, b)
}

export function rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))
    
    const hex = (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
    
    return `#${hex}`
}