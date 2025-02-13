# Table Export Chrome Extension

このChrome拡張機能は、ウェブページ上のテーブル（表）要素を簡単にExcelファイルとしてエクスポートすることができます。

## 機能
- ウェブページ上のテーブル要素の検出
- テーブルデータのcsv形式（.csv）へのエクスポート
- シンプルで使いやすいインターフェース

## インストール方法
1. このリポジトリをクローンまたはダウンロード
2. Chrome ブラウザで `chrome://extensions` を開く
3. 右上の「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. ダウンロードしたフォルダを選択

## 使用方法
1. エクスポートしたいテーブルがあるウェブページを開く
2. 拡張機能のアイコンをクリック
3. テーブル要素上にマウスカーソルを合わせる
4. 自動的にExcelファイルとしてダウンロードされます

## 動作要件
- Google Chrome ブラウザ（最新版）
- インターネット接続

## ライセンス
MIT License

## 開発者向け情報
プロジェクトの構成：
- `manifest.json`: 拡張機能の設定ファイル
- `background.js`: バックグラウンドスクリプト
- `content.js`: コンテンツスクリプト
- `popup.html/js`: ポップアップUI
- `styles.css`: スタイルシート 
