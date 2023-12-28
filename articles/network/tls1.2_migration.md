---
title: Azure Network 製品について TLS 1.2 以降に移行するアナウンスの補足 (Tracking ID:7_8G-D8Z)
date: 2023-12-28 14:30:00 
tags:
  - Network
---
こんにちは、Azure テクニカル サポート チームです。  
「2024 年 10 月 31 日までに、各種 Azure サービスとの通信に TLS 1.2 を使用していることを確認してください。」（Ensure your resources that interact with Azure services are using TLS 1.2 by 31 October 2024）の通知について、Azure Network 製品の対応状況、及びお客様に推奨なアクションをご紹介致します。 

> [!WARNING]
> 以下各製品の部分に案内する対処目処はあくまで目途であり、実際には日程が多少前後する可能性があります。予めご了承ください。

<!-- more -->

##  Application Gateway 
### クライアントから Application Gateway への接続について
Application Gateway では、SSL ポリシーを選択することで、クライアントが Application Gateway へ接続する際の最小 TLS バージョン（1.0 から 1.3 まで）を設定できます。 

現時点では、Application Gateway は2024 年 10 月 31 日以降にも引き続き TLS1.0 から TLS1.3 をサポートしており、TLS1.2 以下のバージョンをサポートしなくなる予定はございません。 

ただし、[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-configure-ssl-policy-powershell)の記載通り、セキュリティ強化のためには TLS1.2 のご利用を推奨いたします。 
> 注意
>Application Gateway でのセキュリティを強化するために、TLS プロトコルの最小バージョンとして TLS 1.2 を使用することをお勧めします。

#### 最小TLS バージョンの設定方法 
下図の通り、Azure ポータル → 対象 Application Gateway → 「リスナー」のタブにて、 「選択した SSL ポリシー」の「変更」ボタンをクリックし、「 SSL ポリシーの変更」より設定できます。 
![](./appgw_tls_setting.png)

また、Application Gateway SKU v2 の場合は、[こちらの手順通り](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-configure-listener-specific-ssl-policy)、リスナー毎に異なる TLS バージョンを設定することも可能です。 

### Application Gateway からバックエンド サーバーへの接続について
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-ssl-policy-overview#limitations)の記載通り、Application Gateway がバックエンド サーバーへ通信する際に TLS 1.0, 1.1, 1.2 をサポートしております。 

>バックエンド サーバーへの接続は、常に最小でプロトコル TLS v1.0、最大で TLS v1.2 までです。 そのため、バックエンド サーバーとのセキュリティで保護された接続を確立するには、TLS バージョン 1.0、1.1、1.2 のみがサポートされます。

具体的な TLS バージョンの選定は接続先のバックエンド サーバーに依存するため、もし最小 TLS バージョンを 1.2 に指定したい場合は、Application Gateway ではなく、バックエンド サーバー側の TLS 設定に対応して頂く必要があります。 


## Azure Firewall
Azure Firewall では、TLS バージョンが関わる部分は TLS インスペクションのみとなります。アプリケーション ルール、ネットワーク ルール、及び DNAT ルールで通信を許可する場合は本通知の対象外となります。

TLS インスペクション機能を使用する場合は、[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features#tls-inspection)の記載通り、現状及び 2024 年 10 月 31 日以降にも TLS1.0 及び TLS1.1 は互換性のために引き続き動作する予定ですが、早めに TLS 1.2 に移行することを強く推奨します。

> ヒント
> TLS 1.0 と 1.1 は非推奨になっていて、サポートされません。 TLS 1.0 と 1.1 のバージョンの TLS/SSL (Secure Sockets Layer) は脆弱であることが確認されています。現在、これらは下位互換性を維持するために使用可能ですが、推奨されていません。 できるだけ早く TLS 1.2 に移行してください。

また、現状の TLS インスペクション機能では TLS1.3 をサポートしておりませんが、2024 年 3 月頃にサポートする予定です。

## Front Door
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/frontdoor/end-to-end-tls?pivots=front-door-standard-premium#supported-tls-versions)の記載通り、 Front Door ではカスタム ドメインを利用する場合は、最小 TLS バージョンを 1.0 または 1.2 を選択できます。 
> Azure Front Door では、TLS プロトコルの 3 つのバージョン (TLS バージョン 1.0、1.1、1.2) がサポートされています。 2019 年 9 月以降に作成されたすべての Azure Front Door プロファイルでは、既定の最小バージョンとして TLS 1.2 が使用されますが、下位互換性を確保するために TLS 1.0 と TLS 1.1 も引き続きサポートされています。

Front Door では 2024 年 10 月 31 日以降にも引き続き TLS1.0 から TLS1.2 まで利用できますが、セキュリティ強化のためには TLS1.2 のご利用を推奨いたします。 
また、TLS1.3 のサポートに関しましては、2024 年 2 月 12 日より Front Door の全 SKU 及びAzure CDN Standard from Microsoft (classic) に順次サポートする予定です。

## Bastion
Bastion はお客様側で証明書の管理運用を意識する必要のないサービスとして、[以下の公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/bastion/bastion-overview#key)の記載通り、 TLS 1.2 のみをサポートしておりますので、お客様側の対処が不要です。 

> Bastion では、TLS 1.2 以降がサポートされています。 以前の TLS バージョンはサポートされません。

## Traffic Manager 
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/traffic-manager/traffic-manager-how-it-works#how-clients-connect-using-traffic-manager)の説明通り、TrafficManager は DNS レベルで動作する負荷分散サービスとして、クライアントからの通信は TrafficManager を経由しませんので、本通知の対象外となります。 

## Load Balancer
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/load-balancer/load-balancer-faqs#azure-load-balancer---tls-ssl---------------)記載通り、Azure Load Balancer では、TLS 接続を終端せずにバックエンド サーバーへ転送する動作となりますので、本通知の対象外となります。 

****