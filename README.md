# SORAMO

天気 × 服装 × 星座占い × 寄り道提案の静的Webサイトです。

## GitHubへアップするファイル

このフォルダの中身を、リポジトリのルート直下にそのままアップしてください。

- `index.html`
- `style.css`
- `app.js`
- `looks/`
  - `look-1.webp` ～ `look-8.webp`

`README.md` は説明用なので、公開サイトの動作には必須ではありません。

## Vercelで公開する場合

GitHubにアップ後、VercelでそのリポジトリをImportすれば、
特別なBuild Commandなしで静的サイトとして公開できます。

Framework Preset: `Other`
Build Command: 空欄
Output Directory: 空欄

## 機能

- Open-Meteoから現在の天気を取得
- 現在地の天気取得
- 体感温度・雨・風に合わせた服装提案
- Casual / Minimal / Mode / Feminine の服装切り替え
- 服装イラストは常に1体ずつ表示
- 時間別予報
- 傘アドバイス
- 星座占い
- 好みをlocalStorageに保存
- レスポンシブ対応

## 注意

位置情報はブラウザ側で許可した場合のみ利用します。
天気取得には外部API（Open-Meteo）を使用します。
