# 🌿 ケアログ - 糖尿病予防サポートアプリ

糖尿病予備軍の方のための健康管理・食事記録PWAアプリです。

## ✨ 主な機能

- **食事記録** — 和食中心の20種類のフードDB、GI値表示、カスタム入力対応
- **栄養管理** — カロリー・炭水化物・タンパク質・脂質を自動集計
- **健康データ** — 血糖値・体重・HbA1cの記録と推移グラフ
- **予防アドバイス** — ベジファースト、運動、睡眠など8つの実践的Tips
- **PWA対応** — ホーム画面追加、オフライン動作、ネイティブアプリ感覚

## 🚀 GitHub Pagesでの公開手順

### 1. GitHubにリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `carelog`）
4. **Public** を選択
5. 「Create repository」をクリック

### 2. ファイルをアップロード

#### 方法A: ブラウザから（簡単）

1. リポジトリのページで「uploading an existing file」をクリック
2. このフォルダ内の全ファイルをドラッグ＆ドロップ:
   ```
   index.html
   sw.js
   manifest.json
   icons/
     icon-192.png
     icon-512.png
   ```
3. 「Commit changes」をクリック

#### 方法B: Git コマンドライン

```bash
git init
git add .
git commit -m "ケアログ初回リリース"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/carelog.git
git push -u origin main
```

### 3. GitHub Pagesを有効にする

1. リポジトリの「Settings」タブを開く
2. 左メニューの「Pages」をクリック
3. Source を「Deploy from a branch」に設定
4. Branch を「main」、フォルダを「/ (root)」に設定
5. 「Save」をクリック

### 4. アクセス！

数分後、以下のURLでアプリが公開されます:

```
https://あなたのユーザー名.github.io/carelog/
```

## 📱 スマホへのインストール

### Android
1. Chromeでアプリを開く
2. 表示される「ホーム画面に追加」バナーをタップ
3. またはメニュー(⋮) →「アプリをインストール」

### iPhone
1. Safariでアプリを開く
2. 共有ボタン（□↑）をタップ
3.「ホーム画面に追加」をタップ

## 📁 ファイル構成

```
carelog/
├── index.html      ← メインアプリ
├── sw.js           ← Service Worker（オフライン対応）
├── manifest.json   ← PWAマニフェスト
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md       ← このファイル
```

## ⚠️ 注意事項

このアプリは一般的な健康管理の参考情報を提供するものであり、
医療アドバイスではありません。具体的な治療や食事療法については、
必ず医師や管理栄養士にご相談ください。
