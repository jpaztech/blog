---
title: Application Gateway からの 500 番台の HTTP 応答について
date: 2024-02-22 17:30:00
tags:
  - Network
  - Application Gateway
  - Error
  - 500
---
こんにちは、Azure サポート チームの間島です。

今回は、Application Gateway 経由で Web サイトへアクセスしている際に、Application Gateway からの HTTP 応答でエラーが発生した場合の原因や調査方法などについてご紹介させていただき、特にお客様よりお問い合わせをいただく機会が多い 500 番台の HTTP 応答について、お客様が問題判別を行う際の参考にしていただくことを目的としております。(なお、V1 SKU は廃止となることが発表されておりますので、当ブログの対象外とさせていただいております。)

## Application Gateway からの HTTP 応答の確認方法

Application Gateway からは、状況に応じて、様々な HTTP 応答コードが返されます。
[Application Gateway の HTTP 応答コード](https://learn.microsoft.com/ja-jp/azure/application-gateway/http-response-codes)
HTTP 応答コードの確認方法ですが、Azure ポータルより、関連するメトリックを参照することが可能です。
[Application Gateway メトリック](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-metrics#application-gateway-metrics)

> [!TIP]
> メトリックを確認する際には、上流側 (Up Stream = データ配信側 = バックエンド側) から先に確認してください。(下に記載した各項目は、上流から順に並べています)

#### - 異常なホストの数 (Unhealthy Host Count)
このメトリックは、正常性プローブによって異常であると判定されたバックエンドの数を表します。バックエンド プールごとにフィルター処理を行って、特定のバックエンド プールの異常なホストの数を表示することも可能です。Application Gateway が バックエンド プールにリクエストを転送するためには、該当のバックエンド プールへの正常性プローブが成功している必要があります。もし、想定外の「異常なホスト」が発生している場合には、下のリンク先を参照し、該当のバックエンド サーバーへの正常性プローブが成功するよう、問題判別を行ってください。
[Application Gateway のバックエンドの正常性に関する問題のトラブルシューティング](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-backend-health-troubleshooting)

#### - バックエンド応答の状態 (Backend Response Status)
バックエンド サーバーから Application Gateway に返された HTTP 応答コードの数を表します。(Application Gateway によって生成された HTTP 応答コードは含まれません。) HTTP 応答コードの分布をさらに分類し、2xx、3xx、4xx、5xx のカテゴリで応答を表示できます。Application Gateway は、基本的には、バックエンド サーバーによって返された HTTP 応答コードをクライアントに転送しますので、バックエンド サーバーが想定外の HTTP 応答コードを返している場合には、バックエンド サーバー側にて問題判別を行ってください。

> [!TIP]
> IIS がバックエンド サーバーの場合には、下のリンク先をご参照いただき、IIS ログをご確認ください。
> [IIS の調査に必要な基本的なログ情報について](https://jpdsi.github.io/blog/web-apps/LogCollection1/#2-IIS-%E3%83%AD%E3%82%B0)

#### - 応答の状態 (Response Status)
Application Gateway からクライアントに返された HTTP 応答コードの数を表します。応答状態コードの分布をさらに分類し、2xx、3xx、4xx、5xx のカテゴリで応答を表示できます。

#### - 失敗した要求 (Failed Requests)
Application Gateway が 5xx サーバー エラーコードで処理した要求の数です。これには、Application Gateway から生成された 5xx コードと、バックエンドから生成された 5xx のコードが含まれます。
要求の数をさらにフィルター処理することで、各々のまたは特定のバックエンド プール http 設定の組み合わせごとに数を表示できます。

> [!TIP]
> 上記のメトリックにて、バックエンド サーバーもしくは Application Gateway にて、どのような HTTP 応答コードを返しているかを確認した後に、下の HTTP 応答コード毎の発生原因 / 問題判別方法 に進んでください。
> また HTTP 応答コードは、「診断ログ」にてアクセス ログを有効化することにより確認することも可能です。

## 500 番台の HTTP 応答コード毎の発生原因 / 問題判別方法

500 から 599 の HTTP 応答コードは、クライアントからの要求の実行中に Application Gateway または バックエンド サーバーにおいて問題が発生したことを示しています。

#### - 502 - 無効なゲートウェイ (バックエンド サーバーが原因であることが多い)
Application Gateway が 502 エラーを返す理由はいくつかありますが、まずは前述のように、正常性プローブが成功しているかどうか確認してください。502 エラーは、お客様からのお問い合わせが最も多いエラーですが、前述のように Application Gateway から バックエンド プールへの正常性プローブが失敗しているため、発生しているケースが多く見受けられます。
[Application Gateway のバックエンドの正常性に関する問題のトラブルシューティング](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-backend-health-troubleshooting)

また、502 エラーの原因といたしましては、下記などもあげられます。
- ネットワーク セキュリティ グループ (NSG)、ユーザー定義ルート (UDR)、またはカスタム DNS に関する問題
- 既定の正常性プローブに関する問題
- カスタムの正常性プローブに関する問題
- 要求のタイムアウト
- 空の BackendAddressPool
- BackendAddressPool の異常なインスタンス

502 エラーにつきましては、過去にもブログにて取り上げておりますので、下のリンク先もご参照いただければと思います。
[Application Gateway における 502 Error について](https://jpaztech.github.io/blog/archive/application-gateway-502-error-info/)
[Application Gateway の散発的な 502 エラー](https://jpaztech.github.io/blog/network/appgw-502error/)

#### - 504 - ゲートウェイ タイムアウト (処理時間の長い Web アプリケーションで発生することが多い)
バックエンド サーバーからの応答時間が、「要求のタイムアウト」値 (既定値 : 20 秒) を超えた場合には、HTTP 504 エラーが発生します。問題判別の方法としては、
1. バックエンド サーバー側にて、ログをご確認いただき、Application Gateway からのリクエストに対して、バックエンド サーバーが「要求のタイムアウト」値を超えてレスポンスを返していないかどうか確認してください。
2. リクエスト受信からレスポンス送信までが 20 秒を超える場合には、「[要求のタイムアウト](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-troubleshooting-502#request-time-out)」の値を、アプリケーションの処理時間に合わせて、変更してください。(「要求のタイムアウト」の値は、1 ～ 86400 の範囲で設定可能) 

> [!TIP]
> IIS がバックエンド サーバーの場合には、下のリンク先をご参照いただき、IIS ログをご確認ください。
> [IIS の調査に必要な基本的なログ情報について](https://jpdsi.github.io/blog/web-apps/LogCollection1/#2-IIS-%E3%83%AD%E3%82%B0)

#### - 500 - 内部サーバー エラー (Application Gateway が原因)
この応答コードは、Application Gateway の内部でエラーが発生したことを示すものです。このコードが表示された場合は、サポート リクエストを起票してください。

> [!IMPORTANT]
> サポート リクエスト起票の際には、下記の情報を添えてお問い合わせいただければと思います。
> ・問題発生日時 (mm/dd hh:mm:ss)
> ・Application Gateway のリソース ID
> ・クライアントの情報 (パブリック IP アドレス等、仮想マシンの場合は リソース ID)
> ・アクセスした URL
> ・HTTP 応答コード
> ・お客様にて行った問題判別の内容や確認の結果 (例 : バックエンド サーバーのログの確認結果等)
> ・問題発生の前後にて Application Gateway やバックエンド サーバーにて行った設定変更内容 (もしあれば) 

当ブログが、お客様よりお問い合わせをいただくことが多い 500 番台の HTTP 応答が発生した場合に、お客様にて問題判別を行う際の手助けになりましたら、幸いです。