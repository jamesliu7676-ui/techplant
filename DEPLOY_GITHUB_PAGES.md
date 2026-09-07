# GitHub Pages 部署

這是一個純靜態網站，不需要後端。首頁與海選清單都使用相對路徑，可以直接由 GitHub Pages 提供。

## 首次發布

在 `deliverplan` 目錄執行：

```powershell
gh auth login -h github.com
git init -b main
git add .
git commit -m "feat: add Taiwan tech factory dashboard"
gh repo create techplant --public --source=. --remote=origin --push
```

建立 repo 後，GitHub Actions 會自動部署 Pages。網址通常是：

```text
https://<GitHub帳號>.github.io/techplant/
```

## 兩個頁面

- `/index.html`：台灣科技產業布局地圖與建設案件
- `/screening.html`：全台科技廠房海選清單

兩個頁面已互相提供切換按鈕。

## 更新資料

1. 修改 `data/taiwan_tech_factory.json`。
2. 重新產生 `data/data.js`。
3. Commit 並 push，GitHub Actions 會自動更新網站。

```powershell
$raw = [System.IO.File]::ReadAllText("data\taiwan_tech_factory.json", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("data\data.js", "window.TECH_DB = " + $raw + ";", (New-Object System.Text.UTF8Encoding($false)))
git add .
git commit -m "data: update technology factory sites"
git push
```
