# 台灣科技廠房新建案資料庫（techplant）

科技廠房布局資料庫。記錄台灣科技公司在各縣市的土地布局與廠房興建案件，重點在於**土地坪數、建物/樓地板坪數、廠房類型與建設狀態**。

## 檔案結構

```
techplant/
├── index.html                      # 地圖儀表板（直接雙擊用瀏覽器開啟）
├── screening.html                  # 全台科技廠房海選清單（公司/據點/土地/廠房設定）
├── data/
│   ├── taiwan_tech_factory.json    # 主資料庫（人工維護的唯一真相來源）
│   └── data.js                     # 儀表板讀取用（由 JSON 自動產生，勿手改）
└── README.md
```

## 使用方式

1. 雙擊 `index.html` 用瀏覽器開啟，即可看到台灣地圖與各縣市案件分布。
2. 點右上角「開啟海選清單」，或直接開啟 `screening.html`，查看全台主要科技公司的營運廠區與布局據點。
3. 點地圖上的圓點＝某科技公司的廠房案；點大小反映土地/建物規模。
4. 右側可依「產業別／縣市／案件狀態」篩選，並有縣市案件熱度排序與 CSV 匯出。

首頁地圖的園區標籤採「臺灣科學工業園區分布圖2016」的資訊架構重新繪製，並疊加本資料庫的最新公司、廠區與建設案件；不是直接使用該張2016年靜態圖片。

## 如何新增一筆案件（核心流程）

1. 編輯 `data/taiwan_tech_factory.json`：
   - 若是新公司，先在 `companies` 增加一筆（id 需唯一）。
   - 在 `projects` 增加一筆，**必填**欄位：
     - `county` 縣市、`district` 區/鄉鎮、`park` 園區/聚落名稱
     - `type` 廠房類型（見 `meta.types`）
     - `status` 案件狀態（見 `meta.statuses`）
     - `land_area_ping` 土地坪數、`floor_area_ping` 建物/樓地板坪數
     - `lat` / `lng` 座標（地圖定位用）
     - `source_url` 新聞來源連結
2. 重新產生 `data.js`（在 repo 根目錄執行 PowerShell）：
   ```powershell
   $raw = [System.IO.File]::ReadAllText("data\taiwan_tech_factory.json")
   [System.IO.File]::WriteAllText("data\data.js", "window.TECH_DB = $raw;", (New-Object System.Text.UTF8Encoding($false)))
   ```
3. 重新整理瀏覽器即可看到新案件。

## 如何新增海選據點

在 JSON 的 `screening_sites` 陣列增加一筆資料，重點欄位如下：

- `company_id`：對應 `companies` 裡的公司。
- `county`、`district`、`park`：縣市、行政區、園區或工業區。
- `site_name`：廠區或基地名稱。
- `land_area_ping`：土地坪數；尚未查到時填 `null`，不要自行估值。
- `building_area_ping`：建物/樓地板坪數；尚未查到時填 `null`。
- `facility_setting`：例如晶圓廠、封裝廠、PCB廠、AI伺服器組裝、資料中心等。
- `site_status`：營運中、擴建中、取得既有廠房、規劃中等。
- `data_status`、`source_url`、`note`：記錄查證程度與來源。

海選資料和 `projects` 建設案件分開管理：同一個廠區可以同時出現在海選名冊與建設案件，前者描述「公司在哪裡有基地」，後者描述「目前是否有新建/改造工程」。

## 收案優先順序建議

1. **新建案**（新建晶圓廠/封裝廠/資料中心）優先於單純購置既有廠房
2. 買地後「幾乎馬上動工」的案件最優先追蹤（例：大立光台中）
3. 南部供應鏈走廊：台南 → 高雄 → 嘉義 → 屏東
4. AI 資料中心：選址常在工業區而非科學園區，容易漏掉

## 資料注意事項

- 標註「傳」的案件尚未經官方證實，僅列參考。
- 金額、坪數、時程請以新聞原文與官方公告為準，`source_url` 務必保留。
