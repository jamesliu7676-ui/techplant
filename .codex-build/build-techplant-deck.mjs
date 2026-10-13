import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:\\James-opencode\\deliverplan";
const SKILL_DIR = "C:\\Users\\18762\\.codex\\plugins\\cache\\openai-primary-runtime\\presentations\\26.905.11957\\skills\\presentations";
const TMP_DIR = path.join(workspaceDir, ".codex-build");
const FINAL_PPTX = path.join(workspaceDir, "outputs", "techplant_台灣重大科技廠房_兩頁簡報_v6.pptx");
const RUNTIME_PYTHON = "C:\\Users\\18762\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const FONT = "Microsoft JhengHei";

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools", "artifact_tool_utils.mjs"),
).href);

const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const colors = {
  bg: "#F7FAFC",
  panel: "#FFFFFF",
  text: "#163246",
  muted: "#66808E",
  cyan: "#0E8798",
  green: "#0E8798",
  amber: "#E6A23C",
  red: "#FF6B6B",
  grid: "#24445A",
  row: "#0B2031",
};

function addText(slide, text, left, top, width, height, opts = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left, top, width, height },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: FONT,
    fontSize: opts.fontSize ?? 18,
    bold: opts.bold ?? false,
    color: opts.color ?? colors.text,
    autoFit: "shrinkText",
    verticalAlignment: opts.verticalAlignment ?? "middle",
    textAlignment: opts.textAlignment ?? "left",
  };
  return box;
}

function addMarker(slide, x, y, color, size = 15) {
  return slide.shapes.add({
    geometry: "ellipse",
    position: { left: x - size / 2, top: y - size / 2, width: size, height: size },
    fill: color,
    line: { fill: "#FFFFFF", width: 2 },
  });
}

function addNumberedMarker(slide, number, x, y, color, dx = 0, dy = 0) {
  const mx = x + dx;
  const my = y + dy;
  if (dx || dy) {
    slide.shapes.add({
      geometry: "line",
      position: { left: Math.min(x, mx), top: Math.min(y, my), width: Math.max(1, Math.abs(dx)), height: Math.max(1, Math.abs(dy)) },
      line: { fill: "#7A98A5", width: 1.2 },
    });
  }
  addMarker(slide, mx, my, color, 26);
  addText(slide, String(number), mx - 17, my - 10, 34, 20, { fontSize: number >= 10 ? 8.5 : 11, bold: true, color: "#FFFFFF", textAlignment: "center" });
}

function addSiteItem(slide, site, left, top, width) {
  addMarker(slide, left + 14, top + 15, site.plan ? colors.amber : colors.green, 28);
  addText(slide, String(site.n), left - 3, top + 5, 34, 20, { fontSize: site.n >= 10 ? 9 : 12, bold: true, color: "#FFFFFF", textAlignment: "center" });
  addText(slide, site.name, left + 40, top - 1, width - 40, 24, { fontSize: 15.5, bold: true, color: "#163F55" });
  addText(slide, site.loc, left + 40, top + 20, width - 40, 19, { fontSize: 11.5, color: "#66808E" });
  addText(slide, site.detail, left + 40, top + 38, width - 40, 27, { fontSize: 12.5, color: "#294D60" });
}

function addCallout(slide, heading, body, left, top, width, accent) {
  slide.shapes.add({
    geometry: "rect",
    position: { left, top: top + 5, width: 5, height: 60 },
    fill: accent,
    line: { fill: "none", width: 0 },
  });
  addText(slide, heading, left + 14, top, width - 14, 24, { fontSize: 17, bold: true, color: accent });
  addText(slide, body, left + 14, top + 23, width - 14, 44, { fontSize: 14.5, color: colors.text });
}

// Slide 1
{
  const slide = pres.slides.add();
  slide.background.fill = colors.bg;
  addText(slide, "台灣主要科學園區與科技廠房", 58, 30, 1164, 48, { fontSize: 34, bold: true, color: "#12384F" });
  addText(slide, "依專案資料中的縣市、行政區與經緯度定位", 60, 77, 900, 28, { fontSize: 16, color: colors.muted });
  slide.shapes.add({ geometry: "rect", position: { left: 60, top: 112, width: 1160, height: 2 }, fill: "#CFE1E8", line: { fill: "none", width: 0 } });

  const mapBytes = await fs.readFile(path.join(workspaceDir, "assets", "presentation", "taiwan-counties-light.png"));
  slide.images.add({
    blob: mapBytes,
    contentType: "image/png",
    alt: "依內政部縣市界資料呈現的台灣行政區地圖",
    fit: "contain",
    position: { left: 408, top: 128, width: 464, height: 486 },
  });

  const sites = [
    { n: 1, name: "北投士林科技園區", loc: "台北市北投區", detail: "NVIDIA AI研發中心", lat: 25.11, lng: 121.51, plan: true },
    { n: 2, name: "龍潭科學園區", loc: "桃園市龍潭區", detail: "台積電新廠區，待官方確認", lat: 24.867, lng: 121.196, plan: true },
    { n: 3, name: "竹科寶山二期", loc: "新竹縣寶山鄉", detail: "台積電 P8 2奈米廠", lat: 24.725, lng: 120.995 },
    { n: 4, name: "銅鑼科學園區", loc: "苗栗縣銅鑼鄉", detail: "美光銅鑼廠", lat: 24.46, lng: 120.79 },
    { n: 5, name: "中科后里園區", loc: "台中市后里區", detail: "美光 A3 廠區擴建", lat: 24.31, lng: 120.72 },
    { n: 6, name: "中科二期", loc: "台中市大雅區", detail: "台積電 1.4奈米廠", lat: 24.228, lng: 120.605 },
    { n: 7, name: "台中工業區", loc: "台中市西屯／南屯區", detail: "大立光光通訊、CPO基地", lat: 24.15, lng: 120.63 },
    { n: 8, name: "嘉義科學園區", loc: "嘉義縣太保市", detail: "台積電 AP6／AP7", lat: 23.495, lng: 120.326 },
    { n: 9, name: "台南科學園區", loc: "台南市新市區", detail: "台積電與日月光擴建", lat: 23.107, lng: 120.282 },
    { n: 10, name: "楠梓產業園區", loc: "高雄市楠梓區", detail: "台積電高雄 P1 至 P3", lat: 22.724, lng: 120.318 },
    { n: 11, name: "橋頭科學園區", loc: "高雄市橋頭區", detail: "台積電先進製程廠區，規劃中", lat: 22.75, lng: 120.313, plan: true },
    { n: 12, name: "屏東科技園區", loc: "屏東縣長治鄉", detail: "半導體材料與設備供應鏈", lat: 22.70, lng: 120.54, plan: true },
  ];
  sites.slice(0, 6).forEach((site, i) => addSiteItem(slide, site, 62, 136 + i * 79, 322));
  sites.slice(6).forEach((site, i) => addSiteItem(slide, site, 900, 136 + i * 79, 320));

  const mapLeft = 408, mapTop = 128, mapWidth = 464, mapHeight = 486;
  const minLng = 119.90, maxLng = 122.05, minLat = 21.85, maxLat = 25.35;
  const mapScale = Math.min(530 / (maxLng - minLng), 620 / (maxLat - minLat));
  const ox = (620 - (maxLng - minLng) * mapScale) / 2;
  const oy = (650 - (maxLat - minLat) * mapScale) / 2;
  const mapPoint = site => ({
    x: mapLeft + (ox + (site.lng - minLng) * mapScale) / 620 * mapWidth,
    y: mapTop + (oy + (maxLat - site.lat) * mapScale) / 650 * mapHeight,
  });
  sites.forEach(site => {
    const p = mapPoint(site);
    const offsets = site.n === 6 ? { dx: -12, dy: -5 }
      : site.n === 7 ? { dx: 10, dy: 12 }
      : site.n === 10 ? { dx: -10, dy: 12 }
      : site.n === 11 ? { dx: 10, dy: -12 }
      : { dx: 0, dy: 0 };
    addNumberedMarker(slide, site.n, p.x, p.y, site.plan ? colors.amber : colors.green, offsets.dx, offsets.dy);
  });

  addText(slide, "● 施工、已動工或土地取得      ● 規劃中或待官方確認", 60, 650, 650, 22, { fontSize: 12.5, color: colors.muted });
  addText(slide, "位置為園區／建案定位，資料截至2026年9月7日", 760, 650, 460, 22, { fontSize: 12, color: colors.muted, textAlignment: "right" });
  slide.speakerNotes.textFrame.setText("位置來源：techplant data/taiwan_tech_factory.json 的 lat／lng 欄位，更新日期2026-09-07。行政區底圖來源：專案內 data/taiwan_counties.geojson，原始說明指向內政部統計地理資訊應用系統。高雄楠梓與橋頭位置相近，標號以短引線錯開顯示。地圖代表園區／建案定位，不代表地籍界線或廠區範圍。");
}

// Slide 2
{
  const slide = pres.slides.add();
  slide.background.fill = "#FBFCFD";
  addText(slide, "重大科技廠房建案明細", 58, 30, 1164, 48, { fontSize: 34, bold: true, color: "#102A3A" });
  addText(slide, "科學園區與重要科技產業聚落，依目前公開資訊整理", 60, 77, 900, 28, { fontSize: 16, color: "#526D7C" });

  const values = [
    ["區域／園區", "公司", "重大廠房／建案", "狀態", "公開規模", "資料備註"],
    ["北士科", "NVIDIA", "AI研發中心 T17／T18", "規劃中", "待查", "地上權案"],
    ["龍潭科學園區", "台積電", "龍潭新廠區", "規劃中", "待查", "待官方確認"],
    ["竹科寶山二期", "台積電", "寶山2奈米晶圓廠 P8", "施工中", "土地15,000坪\n樓地板70,000坪", "2奈米主力廠區"],
    ["新竹／台南科學園區", "聯電", "新竹晶圓廠群、台南12吋廠", "營運／擴建", "待查", "待拆分具名建案"],
    ["中科二期", "台積電", "台中1.4奈米晶圓廠", "已動工", "土地27,000坪\n樓地板80,000坪", "已取得第一期建照"],
    ["中部科學園區", "美光", "台中A3廠區擴建", "施工中", "待查", "記憶體擴產"],
    ["銅鑼科學園區", "美光", "美光銅鑼廠", "改造中", "樓地板60,000坪", "原力積電廠區"],
    ["台中工業區", "大立光", "光通訊／CPO產能基地", "土地取得", "土地13,500坪\n建物13,000坪", "後續動工待追蹤"],
    ["嘉義科學園區", "台積電", "AP6／AP7先進封裝廠", "施工中", "土地12,000坪\n樓地板60,000坪", "CoWoS／SoIC"],
    ["台南科學園區", "台積電／日月光", "製程與封裝擴建／南科封裝基地", "施工／已動工", "台積電樓地板80,000坪\n日月光35,000坪", "供應鏈同步擴建"],
    ["楠梓產業園區", "台積電", "高雄2奈米廠 P1至P3", "施工中", "土地36,000坪\n樓地板100,000坪", "三期建設"],
    ["橋頭科學園區", "台積電", "橋頭先進製程廠區", "規劃中", "土地約15,000坪", "待官方確認"],
    ["高雄科技聚落", "鴻海", "高雄AI資料中心", "已動工", "待查", "AI基礎設施"],
  ];

  const table = slide.tables.add({
    rows: values.length,
    columns: values[0].length,
    left: 54,
    top: 116,
    width: 1172,
    height: 510,
    columnWidths: [170, 112, 278, 132, 215, 265],
    values,
  });
  table.borders.assign({ style: "solid", fill: "#B8C7D0", width: 1 });
  table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: 6 }).assign({
    fill: "#12384F",
    textStyle: { typeface: FONT, fontSize: 15, bold: true, color: "#FFFFFF" },
    margins: { left: 7, right: 7, top: 4, bottom: 4 },
    verticalAlignment: "middle",
  });
  table.cells.block({ row: 1, column: 0, rowCount: values.length - 1, columnCount: 6 }).assign({
    textStyle: { typeface: FONT, fontSize: 11.5, color: "#173344" },
    margins: { left: 6, right: 6, top: 2, bottom: 2 },
    verticalAlignment: "middle",
  });
  for (let r = 1; r < values.length; r++) {
    const fill = r % 2 === 0 ? "#E8F0F4" : "#FFFFFF";
    table.cells.block({ row: r, column: 0, rowCount: 1, columnCount: 6 }).fill = fill;
  }
  for (const r of [2, 12]) {
    table.getCell(r, 3).fill = "#FFF1D6";
    table.getCell(r, 3).text.style = { typeface: FONT, fontSize: 11.5, bold: true, color: "#875B00" };
  }
  for (const r of [3, 5, 6, 9, 10, 11, 13]) {
    table.getCell(r, 3).fill = "#DDF4EA";
    table.getCell(r, 3).text.style = { typeface: FONT, fontSize: 11.5, bold: true, color: "#17643F" };
  }
  table.getCell(8, 0).fill = "#DFF4F7";
  table.getCell(8, 1).fill = "#DFF4F7";
  table.getCell(8, 2).fill = "#DFF4F7";
  table.getCell(8, 3).fill = "#DFF4F7";
  table.getCell(8, 4).fill = "#DFF4F7";
  table.getCell(8, 5).fill = "#DFF4F7";

  addText(slide, "資料截至2026年9月7日；未公開坪數保留待查；規劃案以官方公告為準", 55, 650, 1170, 25, { fontSize: 12, color: "#607B8A", textAlignment: "center" });
  slide.speakerNotes.textFrame.setText("來源：techplant data/taiwan_tech_factory.json 與 presentation_sources/techplant_major_factories_2026-09-07.md。表格將營運／擴建追蹤與具名新建案分開，未公開坪數不作推估。");
}

await fs.mkdir(path.join(workspaceDir, ".codex-finalizer"), { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const candidatePath = path.join(workspaceDir, ".codex-finalizer", "techplant-candidate.pptx");
await (await PresentationFile.exportPptx(pres)).save(candidatePath);

for (let i = 0; i < pres.slides.items.length; i++) {
  const slide = pres.slides.items[i];
  const preview = await pres.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, `techplant-slide-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(TMP_DIR, `techplant-slide-${i + 1}.layout.json`), await layout.text());
}

const result = await finalizePresentation({
  explicitTotalSlideCount: 2,
  requiredNativeTableOwnerSlides: [2],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "2",
  ],
  requiredNativeTableOwnerSlides: [2],
  fontPolicy: { basis: "design", families: [FONT] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(workspaceDir, ".codex-finalizer", "techplant_兩頁簡報_v6.validation.json"),
});

console.log(JSON.stringify({ finalPath: FINAL_PPTX, result }, null, 2));
