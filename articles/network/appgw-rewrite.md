--- 
title: Application Gateway 書き換え規則の事例集
date: 2024-07-04 07:00:00 
tags: 
  - Network
  - Application Gateway
---

こんにちは。Azure Networking サポート チームの三島です。  
Application Gateway v2 では HTTP ヘッダーなどのパラメーターを書き換える機能を提供しています。  
この記事は、Application Gateway 書き換え規則に関してよく寄せられるお問い合わせをもとに事例集として再構成したものです。

## はじめに

Application Gateway では書き換え規則をサポートしています (※Standard_v2 / WAF_v2 SKU のみ)。
書き換え規則を使用することで、要求および応答中のヘッダーや URL を書き換えることができます。
この機能により、事例集に記載したような様々なシナリオに対応することが可能です。

## 事例集
早速事例を紹介いたします。  
[Microsoft Learn でも書き換え規則のシナリオをご紹介](https://learn.microsoft.com/ja-jp/azure/application-gateway/rewrite-http-headers-url#common-scenarios-for-header-rewrite)しておりますので併せてご確認ください。

### 事例 1 - Location ヘッダーの書き換え
サポート チームにいただくお問い合わせの中で最も多いのが Location ヘッダーの書き換えです。  
Location ヘッダーの書き換えには複数のパターンがありますが、代表的なものは以下の 3 つです。  

- FQDN の書き換え: バックエンド サーバーが生成する URL の FQDN を、クライアント アクセス用の FQDN に書き換える (例: *https://contoso.azurewebsites.net* -> *https://www.contoso.com*、*https://192.168.0.4* -> *https://www.contoso.com*)
- URL スキームの書き換え: バックエンド サーバーが生成する URL のスキームを HTTP から HTTPS に書き換える (*http://www.contoso.com* -> *http**s**://www.contoso.com*)
- リダイレクト ポートの書き換え: バックエンド サーバーが生成する URL のリダイレクト ポートを Application Gateway で書き換える (*https://www.contoso.com* -> *https://www.contoso.com:8443*)

#### 事例 1-1 FQDN の書き換え
##### 代表的なシナリオ
よくあるシナリオとしては、Application Gateway の背後に App Service (認証なし) を配置している構成です。  
App Service においてカスタム ドメインが構成されていない場合、App Service が生成する Location ヘッダーのリダイレクト URL の FQDN は App Service 既定の FQDN `*.azurewebsites.net` が使用されます。  
Application Gateway は、App Service が生成した Location ヘッダーをそのままクライアントに応答するため、クライアントは受け取ったリダイレクト URL の FQDN `*.azurewebsites.net` に直接アクセス (Application Gateway をバイパス) します。  
App Service におけるアクセス制御の状態 (Application Gateway からのアクセスのみに限定しているなど) によっては、クライアントが App Service から接続を拒否され、リダイレクト URL にアクセスできないという結果になります。  
また、クライアントにバックエンド サーバーの URL を公開したくないというご要件がある場合もこのシナリオで対応可能です。  

##### 構成例
[Microsoft Learn でご案内しているとおり](https://learn.microsoft.com/ja-jp/azure/architecture/best-practices/host-name-preservation)、リバース プロキシ経由で Web アプリケーションにアクセスする構成では、Cookie やリダイレクト URL が正しく機能せず認証やセッションの問題が発生することがあるため、クライアントがリバース プロキシにアクセスする際に指定するホスト名とリバース プロキシがバックエンドにアクセスする際に指定するホスト名は、一致するように構成することが推奨されます。  
しかしながら、何からの制約でリバース プロキシ側で URL を書き換える必要がある場合、Application Gateway の書き換え規則が有効です。  
[こちらの例](https://learn.microsoft.com/ja-jp/azure/application-gateway/rewrite-http-headers-url#modify-a-redirection-url
)を参考に URL を書き換えます。

#### 事例 1-2 URL スキームの書き換え
##### 代表的なシナリオ
バックエンド サーバーが HTTP で動作しており、バックエンド サーバーが生成する Location ヘッダーの URL スキームが `http://` になってしまうという事例です。  
Location ヘッダーを受け取ったクライアントは、HTTP で Application Gateway にアクセスします。Application Gateway で HTTP リスナーが動作していない場合はアクセスが失敗し、HTTP リスナーでリダイレクトが構成されている場合は不要なリダイレクトが発生するといった結果になります。

##### 構成例
以下のような書き換え規則を作成します。

###### If  
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  チェックする変数の型  |  HTTP ヘッダー  |  -  |
|  ヘッダーの種類  |  応答ヘッダー  |  -  |
|  ヘッダー名  |  共通ヘッダー  |  -  |
|  共通ヘッダー  |  Location  |  -  |
|  大文字と小文字を区別する  |  いいえ  |  -  |
|  演算子  |  等しい (=)  |  -  |
|  一致させるパターン  |  http:\\/\\/(.*)  | http:// で始まり、任意の文字列が 1 回以上で構成される URL を正規表現で表しています。<br>バックエンド サーバーが生成する URL に応じて任意の正規表現が構成可能です。<br>`\`は環境によっては円マークが表示されますがバックスラッシュです。|
  

###### 結果
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  書き換えの種類  |  応答ヘッダー  |  -  |
|  アクション タイプ  |  設定  |  -  |
|  ヘッダー名  |  共通ヘッダー  |  -  |
|  共通ヘッダー  |  Location  |  -  |
|  ヘッダー値  |  https://{http_resp_Location_1} |  書き換え後のヘッダー値は「`https://` で始まり、応答の Location ヘッダーを正規表現によりキャプチャした 1 番目のグループで構成される URL」を返却するように構成しています。<br>If 条件において URL パスも含めてグループ 1 としてキャプチャするように正規表現を構成しているため、この正規表現でスキーム以降の URL パスが維持されます。<br>ほかの要件がある場合は If 条件の正規表現を修正し、{http_resp_Location_n} を組み合わせて応答 URL を構成することができます。|

#### 事例 1-3 リダイレクト ポートの書き換え
##### 代表的なシナリオ
バックエンド サーバーが HTTPS (デフォルト ポートの 443) で動作しており、Application Gateway がカスタム ポート (例として 8443) でリクエストをリッスンしている構成を考えます。  
バックエンド サーバーは、Location ヘッダーの URL を HTTPS のデフォルト ポート (443) `https://www.contoso.com` で生成します。  
Location ヘッダーを受け取ったクライアントは、HTTPS:443 で Application Gateway にアクセスします。しかしながら、Application Gateway がリッスンしているポートはカスタム ポートのため、リダイレクト先にアクセスできないという結果となります。  

##### 構成例
以下のような書き換え規則を作成します。

###### If  
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  チェックする変数の型  |  HTTP ヘッダー  |  -  |
|  ヘッダーの種類  |  応答ヘッダー  |  -  |
|  ヘッダー名  |  共通ヘッダー  |  -  |
|  共通ヘッダー  |  Location  |  -  |
|  大文字と小文字を区別する  |  いいえ  |  -  |
|  演算子  |  等しい (=)  |  -  |
|  一致させるパターン  |  https:\\/\\/www.contoso.com(.*)  | `https://www.contoso.com` で始まる任意の URL パスを正規表現でキャプチャしています。<br>バックエンド サーバーが生成する URL に応じて任意の正規表現が構成可能です。<br>`\`は環境によっては円マークが表示されますがバックスラッシュです。|
  

###### 結果
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  書き換えの種類  |  応答ヘッダー  |  -  |
|  アクション タイプ  |  設定  |  -  |
|  ヘッダー名  |  共通ヘッダー  |  -  |
|  共通ヘッダー  |  Location  |  -  |
|  ヘッダー値  |  https://www.contoso.com:8443{http_resp_Location_1} |  書き換え後のヘッダー値は「`https://www.contoso.com:8443` で始まり、応答の Location ヘッダーを正規表現によりキャプチャした 1 番目のグループで構成される URL」を返却するように構成しています。<br>If 条件において URL パス部分をグループ 1 としてキャプチャするように正規表現を構成しているため、カスタム ポートを追加した状態のリダイレクト URL に書き換えることが可能です。<br>ほかの要件がある場合は If 条件の正規表現を修正し、{http_resp_Location_n} を組み合わせて応答 URL を構成することができます。|


### 事例 2 - ルーティング時に先頭パスを削除する
パスベース ルーティングを構成して複数のバックエンド サーバーに要求を振り分けているものの、複数のバックエンド サーバーが同一のパス階層を持つシナリオです。  
具体例として以下のようなシナリオを考えます。  

- 多言語対応のために、言語ごとにバックエンド サーバーを用意する
- クライアントの要求 URL の先頭パスに応じて振り分けるバックエンド サーバーを制御する
- クライアントの要求 URL の先頭パスが `/ja-jp/` のときは日本語コンテンツを提供するバックエンド サーバーに、`/en-us/` のときは英語コンテンツを提供するバックエンド サーバーに振り分けるようにパス ベース ルーティングを構成
- ただし、バックエンド サーバーでは言語設定を制御する `/ja-jp/` や `/en-us/` のパス配下では動作しておらず、すべてのバックエンド サーバーが同一のパス階層を持っている

#### 書き換え規則が必要な理由
既定の Application Gateway の設定では、Application Gateway はクライアントから受け取った要求 URL パスをそのままバックエンド サーバーにルーティングします。  
パスベース ルーティングを使用して要求 URL の先頭パスに応じてバックエンド サーバーを振り分ける場合には、先頭パスも含めてバックエンド サーバーにルーティングされます。(*https://www.contoso.com/ja-jp/contents/example.html* への要求は *https://<バックエンド サーバーのホスト名>/ja-jp/contents/example.html* にルーティングされます。)  
一方で、このシナリオの場合、バックエンド サーバーは `/ja-jp/` 配下でコンテンツを提供しておらず `/contents/` 配下でコンテンツを提供しているため、パスの不一致によりリクエストしたコンテンツが存在しない (404 エラー) という結果になります。  
このため、Application Gateway の書き換え規則を用いて `/ja-jp/` や `/en-us/` のパスを削除します。

#### 構成例
以下のような書き換え規則を作成し、パスベースの規則に関連付けます。

###### If (バックエンド URL から /ja-jp/ を削除)  
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  チェックする変数の型  |  サーバー変数  |  -  |
|  サーバー変数  |  request_uri  |  -  |
|  大文字と小文字を区別する  |  いいえ  |  -  |
|  演算子  |  等しい (=)  |  -  |
|  一致させるパターン  |  (.\*)\\/ja-jp(.\*)  |  シナリオ例では先頭パスが `/ja-jp/` ですが、`/ja-jp/` の前に `(.*)` を追加することでパスの途中に `/ja-jp/` が存在するパターンにも対応させています。  |
  

###### 結果 (バックエンド URL から /ja-jp/ を削除)  
|  設定値  |  値&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  |  説明  |
| ---- | ---- | ---- |
|  書き換えの種類  |  URL  |  -  |
|  アクション タイプ  |  設定  |  -  |
|  コンポーネント  |  URL パス  |  -  |
|  URL パスの値  |  {var_request_uri_1}{var_request_uri_2} | If 条件の正規表現でキャプチャしたサーバー変数 request_uri のグループ 1 およびグループ 2 を抽出することでパス `/ja-jp/` の削除を実現しています。<br>`/ja-jp/` が先頭パスの場合はグループ 1 は空の文字列となります。|
|  パス マップの再評価  |  チェックしない |  バックエンド プールの選択は Application Gateway に着信した URL パス (/ja-jp/ を含むもの) に基づいて行われるため再評価は不要です。  |

###### If (バックエンド URL から /en-us/ を削除)  
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  チェックする変数の型  |  サーバー変数  |  -  |
|  サーバー変数  |  request_uri   |  -  |
|  大文字と小文字を区別する  |  いいえ  |  -  |
|  演算子  |  等しい (=)  |  -  |
|  一致させるパターン  |  (.\*)\\/en-us(.\*)  |  シナリオ例では先頭パスが `/en-us/` ですが、`/en-us/` の前に `(.*)` を追加することでパスの途中に `/en-us/` が存在するパターンにも対応させています。  |
  

###### 結果 (バックエンド URL から /en-us/ を削除)  
|  設定値  |  値&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |  説明  |
| ---- | ---- | ---- |
|  書き換えの種類  |  URL  |  -  |
|  アクション タイプ  |  設定  |  -  |
|  コンポーネント  |  URL パス  |  -  |
|  URL パスの値  |  {var_request_uri_1}{var_request_uri_2} | If 条件の正規表現でキャプチャしたサーバー変数 request_uri のグループ 1 およびグループ 2 を抽出することでパス `/en-us/` の削除を実現しています。<br>`/en-us/` が先頭パスの場合はグループ 1 は空の文字列となります。 |
|  パス マップの再評価  |  チェックしない |  バックエンド プールの選択は Application Gateway に着信した URL パス (/en-us/ を含むもの) に基づいて行われるため再評価は不要です。  |

### 事例 3 - X-Forwarded-For ヘッダーの値をもとにルーティングを行う
少し複雑なシナリオですが、パスベース ルーティングと書き換え規則を組み合わせることで、X-Forwarded-For ヘッダーに含まれるクライアント IP アドレスをもとに特定のバックエンド サーバーにルーティングすることが可能です。    
具体例として以下のようなシナリオを考えます。  

- 特定のクライアントからのアクセスは特定のバックエンド サーバーにルーティングしたい
- ただし、クライアントはプロキシ経由で Application Gateway にアクセスしており、Application Gateway が認識するクライアント IP アドレスはプロキシの IP アドレスとなる
- このため、X-Forwarded-For ヘッダーに含まれる元のクライアント IP アドレスをもとにルーティングしたい

[こちらのシナリオ](https://learn.microsoft.com/ja-jp/azure/application-gateway/rewrite-http-headers-url#parameter-based-path-selection)のパラメーターとして、クエリ文字列の代わりに X-Forwarded-For ヘッダーを使用しているとお考えください。

#### 構成例
以下のようなパスベース ルーティングおよび書き換え規則を作成します。

###### パスベース ルーティング
2 種類のバックエンド プールを用意し、既定のルーティング先をバックエンド プール#1、パスベース ルーティングに合致した場合のルーティング先をバックエンド プール#2 とします。

- パックエンド プール#1
バックエンド サーバー： VM#1
 
- パックエンド プール#2
バックエンド サーバー： VM#2
 
- 要求ルーティング規則  
種類：パスベース  
既定のバックエンド プール： パックエンド プール#1  
パスベースの規則： /path2 -> パックエンド プール#2  

###### 書き換え規則 (If)  
|  設定値  |  値&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  |  説明  |
| ---- | ---- | ---- |
|  チェックする変数の型  |  サーバー変数  |  -  |
|  サーバー変数  |  add_x_forwarded_for_proxy  |  -  |
|  大文字と小文字を区別する  |  いいえ  |  -  |
|  演算子  |  等しい (=)  |  -  |
|  一致させるパターン (例 1)  |  192\\.0\\.2\\.1(.*)  | add_x_forwarded_for_proxy サーバー変数の先頭に、元の IP アドレスが含まれる (つまり、「IP1, IP2, IP3・・・」のカンマ区切りのうち IP1 がマッチ対象) 場合の正規表現例です。複数の IP アドレスをマッチ対象としたい場合は、IP アドレスごとに書き換え規則を作成します。<br>※192.0.2.1 は例示用の IP アドレスです。実際には元のクライアント IP アドレスを入力します。|
|  一致させるパターン  (例 2)  |  192\\.0\\.2\\.(2[0-4]\d\|25[0-5]\|[01]?\d\d?)(.*)  | マッチ対象の IP アドレスがプレフィックス単位で特定可能な場合は、プレフィックスに含まれる全 IP アドレスにマッチさせるように正規表現を構成することも可能です。<br>これは 192.0.2.0/24 のアドレス プレフィックス (第 4 オクテットが 0 -255 の IP アドレス) にマッチさせる場合の正規表現例です。|
  

###### 書き換え規則 (結果)  
|  設定値  |  値  |  説明  |
| ---- | ---- | ---- |
|  書き換えの種類  |  URL  |  -  |
|  アクション タイプ  |  設定  |  -  |
|  コンポーネント  |  URL パス  |  -  |
|  URL パスの値  |  /path2 | パスベース ルーティングに一致させたいパスを入力します。 |
|  パス マップの再評価  |  チェックする |  URL を書き換えた後のパスを再評価することで、/path2 に合致するパスベース ルーティングが機能しパックエンド プール#2 にルーティングされます。  |

## おわりに
サポート担当にお寄せいただいたお問い合わせをもとに Application Gateway v2 の書き換え規則の事例をご紹介しました。  
Application Gateway の書き換え規則は様々なパラメーターの書き換えをサポートしていることに加えて、ほかの機能と組み合わせることで対応可能となるシナリオもございます。  
本稿が、お客様が Application Gateway を活用する際の参考となれば幸いです。