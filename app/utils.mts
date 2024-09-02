export function addHexColors(hexWithHash1: string, hexWithHash2: string) {
    const int1 = parseInt(hexWithHash1.slice(1), 16);
    const int2 = parseInt(hexWithHash2.slice(1), 16);

    const r1 = (int1 >> 16) & 0xff;
    const g1 = (int1 >> 8) & 0xff;
    const b1 = int1 & 0xff;

    const r2 = (int2 >> 16) & 0xff;
    const g2 = (int2 >> 8) & 0xff;
    const b2 = int2 & 0xff;

    const r = Math.min(r1 + r2, 255);
    const g = Math.min(g1 + g2, 255);
    const b = Math.min(b1 + b2, 255);

    const sumHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

    return "#" + sumHex;
}