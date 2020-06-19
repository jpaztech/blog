---
title: Application Gateway における 502 Error について
date: 2018-03-16 20:39:33
tags:
  - Archive
  - Application Gateway
  - WAF
---

皆さんこんにちは、Azure テクニカルサポートの平原です。
今回のトピックでは、比較的お問い合わせをいただくものである Application Gateway (Reverse Proxy) における 502 エラーについて解説させていただきます。
ご案内内容がお役に立てば幸いです。
 

## ■ Http Status Code 502 とは
Application Gateway を使っている過程で、HTTP ステータスコード 502 エラーに遭遇することがあります。
おそらく多くの人が、Application Gateway を使う過程でご覧いただいたことがあるものなのでは、と思います。
一番簡単に出す方法は、Application Gateway を作成して、バックエンドに何も入れずに、作ったサーバーにアクセスすれば、502 エラーが返ります。
まずは、502 エラーはどういうものなのかを見ていきます。

HTTP ステータスコード
[https://ja.wikipedia.org/wiki/HTTPステータスコード](https://ja.wikipedia.org/wiki/HTTPステータスコード)

Wikipedia ですと、以下のような記述があります。

>502 Bad Gateway : 不正なゲートウェイ。ゲートウェイ・プロキシサーバは不正な要求を受け取り、これを拒否した。

もう少し正確な情報で、RFC を見てみると、502 Bad Gateway に関する記述があります。

Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content
[https://tools.ietf.org/html/rfc7231#section-6.6.3](https://tools.ietf.org/html/rfc7231#section-6.6.3)

>6.6.3.  502 Bad Gateway
>The 502 (Bad Gateway) status code indicates that the server, while
>acting as a gateway or proxy, received an invalid response from an
>inbound server it accessed while attempting to fulfill the request.

すなわち、ゲートウェイなりプロキシなりの機能を有しているサーバーが接続先のサーバーに対して有効な情報を得られないときに症状が出るものになります。
そう考えると、Application Gateway もプロキシですので、何もバックエンドにサーバーを設定していないときや、バックエンドに接続できないときなどは、502 エラーを返すことになります。

 
## ■ Application Gateway における 502 エラー
では、どういうときに 502 エラーを返すのでしょうか？
Application Gateway の場合は、よくある症状として、以下の時に 502 エラーを返すことがあります。

- バックエンドサーバーに何もない時。
- バックエンドサーバーの正常性チェックで、すべてのサーバーがダウンしているとき。
- バックエンドサーバーが、リセットパケットを返すとき。
- バックエンドサーバーへの接続が、タイムアウトした時。
- バックエンドサーバーへの名前解決に失敗する場合

もし症状に遭遇した時には、この観点で見ていく必要があります。
とくに、今まで動いていたものが、急に 502 を返すようになったという症状の場合には、バックエンドの正常性を疑ってみてください。

 
## ■ トラブルシュート方法
トラブルシュート方法としては、マイクロソフトの用意しているドキュメントによくまとまっていますので、こちらをご参考ください。

Application Gateway での「無効なゲートウェイ」によるエラーのトラブルシューティング
[https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-troubleshooting-502](https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-troubleshooting-502)

よくある問題は以下の通りです。

- ネットワーク セキュリティ グループ、ユーザー定義ルート、またはカスタム DNS に関する問題
- 既定の正常性プローブに関する問題
- カスタムの正常性プローブに関する問題
- 要求のタイムアウト
- 空の BackendAddressPool
- BackendAddressPool の異常なインスタンス
 

## ■ 参考情報
これ以外の情報で、バックエンドに Apache にてリバースプロキシーを構築し、プロキシーの 2 段構成にした場合に、散発的に 502 エラーが発生することが報告されています。
これは、Apache をご利用の際に、他の環境でも 2 段構成にすると事象が発生することが報告されているようです。
もし遭遇された場合は、Apache 側の構成で Keep Alive を OFF にすることで事象回避の報告があるようですので、もし同じ事象に合われましたらお試しください。

Web 上を検索すると種々方法はあるようですので、Apache に関して検索をかけていただくと別の方法もある可能性があります。

