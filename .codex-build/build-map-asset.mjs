import fs from "node:fs/promises";
import sharp from "sharp";

const source = JSON.parse(await fs.readFile("D:\\James-opencode\\deliverplan\\data\\taiwan_counties.geojson", "utf8"));
const out = "D:\\James-opencode\\deliverplan\\assets\\presentation\\taiwan-counties-light.png";
const W = 620, H = 650;
const minLng = 119.90, maxLng = 122.05, minLat = 21.85, maxLat = 25.35;
const scale = Math.min(530 / (maxLng - minLng), 620 / (maxLat - minLat));
const ox = (W - (maxLng - minLng) * scale) / 2;
const oy = (H - (maxLat - minLat) * scale) / 2;
const project = ([lng, lat]) => [ox + (lng - minLng) * scale, oy + (maxLat - lat) * scale];
const ringPath = rings => rings.map(ring => ring.map((point, i) => {
  const [x, y] = project(point);
  return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
}).join(" ") + " Z").join(" ");

const paths = [];
for (const feature of source.features) {
  const geometry = feature.geometry;
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    paths.push(`<path d="${ringPath(polygon)}" fill="#DDECEF" stroke="#FFFFFF" stroke-width="1.4"/>`);
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${paths.join("")}</svg>`;
await fs.mkdir("D:\\James-opencode\\deliverplan\\assets\\presentation", { recursive: true });
await sharp(Buffer.from(svg)).resize(W * 2, H * 2).png().toFile(out);
console.log(out);
