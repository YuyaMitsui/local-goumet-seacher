# local-goumet-seacher
ぐるなびのapiを使って現在地周辺のレストラン情報を取得するwebアプリケーションです.

## 言語
javascript(node.js) html/css  
※一部フロントエンドにjqueryを使用

## 開発環境 
Atom 1.49.0

## 動作環境 
- Windows10 Chrome  
- IOS Safari

## 実行方法
I: node.js,npm導入環境で下記のパッケージをインストールする  
II: ぐるなびAPIのアクセスキーを取得する  
III: アプリケーションファイル直下に.envファイルを作成、環境変数APIKEYを設定  

### 導入するnpmパッケージ
- dotenv
- ejs
### npmコマンド
```bash
  node i dotenv  
  node i ejs
```
### 実行コマンド
ターミナルでアプリケーションファイルがあるディレクトリに移動し、以下のコマンドで動作します。
```bash
  node index.js
```
### アクセスするurl
実行後ブラウザで以下のurlでアクセスするとwebアプリを開くことができます。
```bash
localhost:8080
```
ポート8080でローカルで実行します。競合している場合は
index.jsの最終行
```bash
server.listen(process.env.PORT || 8080);
```
の8080の部分を任意のポートに変更し  
localhost:任意のポート番号のurlにアクセスしてください。
