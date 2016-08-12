# JavascriptでWrite once,run anywhere
Qiita:[JSでWrite once,run anywhere](http://qiita.com/teradonburi/items/a49967c9e67cbcced6f2)

下記環境で動作

* NodeJS(Rest API)       
* ブラウザ 
* スマホネイティブ(iOS,Android)
* デスクトップアプリ(Windows,OSX)

# インストール
ターミナルにてnpmモジュールインストール(nvmインストール前提)
Nodeのバージョンは4.3.2

```
$git clone http://code-dev.ark.pssol.jp/beauty_engine/menstruationSDK.git
$cd menstruationSDK
$nvm install v4.3.2
$nvm use v4.3.2
$npm install -g bower gulp grunt grunt-cli electron@1.3.2 electron-packager jasmine-node node-inspector
$npm install
$bower install
```

# 起動方法
下記gulpコマンドでサーバ、ブラウザ、アプリ起動

```
$gulp
```


# 共通ロジック
以下のファイルは共通処理（Rest API、関数）として使えます。  
原則としてパラメータ入力に対し、Objectデータを返却します。  

```
libs/common/index.js
```

返却データはRest APIと共通化するため、次のようなルールにします。

```
{code:レスポンスコード,msg:'エラーメッセージなど',data:返却データ}
```

# 単体テスト
gulp起動時にjasmine-nodeでspecフォルダ以下の単体テストを実行します。  
test.jsonにテストデータを入力します。  
共通ロジックファイル修正時にgulpにてテストデータの自動テストが走ります。  

```
spec/  
├── test.json  
└── test.spec.js
```

# レンダリング即時反映
gulp起動時に共通ロジックもしくはindex.htmlファイルに変更があった場合、  
ブラウザおよびアプリ(electron)を自動リロードします。

# APIドキュメント
gulp起動時に共通ロジックのAPIドキュメントをdocフォルダに作成します。  
共通ロジックのソースファイル変更時に再生成されます。  

# 自動コードレビュー
gulp起動時にソースコードの品質評価をreportフォルダに作成します。  
共通ロジックのソースファイル変更時に再生成されます。

* コード行数
* 循環的
* メンテナンス指数
* JSLint



# デスクトップアプリ生成
clientフォルダにWindows、OSXのアプリケーションを作成します。  
bridge-darwin-x64:Mac OSXアプリ  
bridge-win32-x64:Windowsアプリ  

```
$gulp package
```

# クリーンアップ
自動生成したファイルを削除します。(バージョン管理ツール用)


```
$gulp clean
```
