---
title: Azure Network 製品について TLS 1.2 以降に移行するアナウンスの補足 (Tracking ID:7_8G-D8Z)
date: 2024-02-27 09:10:00 
tags:
  - Network
---

こんにちは、Azure テクニカル サポート チームです。  
「2024 年 10 月 31 日までに、各種 Azure サービスとの通信に TLS 1.2 を使用していることを確認してください。」（Ensure your resources that interact with Azure services are using TLS 1.2 by 31 October 2024）の通知について補足させて頂きます。

メールに記載されておりますとおり、セキュリティとコンプライアンスの観点からレガシー TLS 1.0/1.1 は既知の脆弱性が存在しており、Azure 上のマネージド サービス全般におきまして、2024 年 10 月 31 日以降は TLS 1.2 以上の接続が必須となるよう変更されるものです。

## TLS バージョンとは
TLS（Transport Layer Security）は、インターネット上でデータを安全に送受信するための暗号化する仕組みとして、主に TLS 1.0, TLS 1.1、TLS 1.2 及び TLS 1.3 バージョンが存在していますが、[RFC 8996](https://datatracker.ietf.org/doc/html/rfc8996) により、セキュリティ脆弱性の原因で、TLS 1.0 及び TLS 1.1 の使用は既に廃止されています。Azure サービスでは、互換性の理由で TLS 1.0 及び TLS 1.1 が引き続き動作できますが、早めに TLS 1.2 以降のバージョンへ移行するのは強く推奨しております。

## TLS 接続時のバージョン選定動作について
TLS のバージョンはお客様の IaaS 上の仮想マシン OS の設定、ならびにクライアント OS に依存します。こちらの設定確認をし、TLS 1.2 以上を使用できる状態としていただくことで、自動的に TLS の最上位バージョンでの接続を試みることとなります。

### Windows OS の場合
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/security/engineering/solving-tls1-problem#supported-versions-of-tls-in-windows)の記載通り、Windows 8/Windows Server 2012 以降では、既に TLS 1.2 をサポートしているため、基本的にご対応頂く必要はありません。
また、特定の TLS バージョンを有効化/無効化されたい場合は、[こちらの記事](https://jpwinsup.github.io/blog/2021/12/22/PublicKeyInfrastructure/SSLTLSConnection/tls-registry-settings/)の通りご対応ください。

Windows 2008/ Windows 7 などのレガシー OS でも更新プログラムを適用することで技術的には TLS 1.2 を使えるようになります。ただし、サポートの提供が終了している OS の場合には、TLS 1.2 を利用できるようになる更新プログラムの適用にかかわらず、技術的なご支援を Microsoft サポートからお届けすることはできません。自己責任の範疇でご利用ください。

参考として、Android など他のクライアント対応状況は[こちら](https://learn.microsoft.com/ja-jp/security/engineering/solving-tls1-problem#appendix-a-handshake-simulation)の公開ドキュメントに開示されています。 

### Chrome/Edge などのブラウザの場合
最新バージョンの各ブラウザでは、基本的に TLS 1.2 以降のバージョンが有効化されているため、ご対応頂く必要はありませんが、
特定の TLS バージョンを有効化/無効化されたい場合は、各ブラウザ観点でご確認頂く必要がございます。
Edgeの場合は[こちらの記事](https://learn.microsoft.com/en-us/answers/questions/487582/is-there-a-way-to-emable-tls-1-0-and-or-1-2-on-edg)の通り対応できます。

### それ以外の場合
上記以外に、Java などプログラミング言語でお客様が開発したアプリケーションで Azure サービスへ接続する場合は、Windows OS の TLS レジストリ設定を参照せず、独自の設定通り接続する場合がありますので、お客様側にアプリケーション観点で TLS の通信バージョンご確認及びご対応頂く必要があります。

### TLS チェッカー ツール
[こちら](https://clienttest.ssllabs.com:8443/ssltest/viewMyClient.html)のような外部の TLS チェッカー ツールをご活用いただき、想定されるクライアントからアクセスをして TLS バージョンを確認いただくということも有効です。

## Azure Network製品の対応状況及び推奨アクションについて
以下にて Azure Network 製品の対応状況、及びお客様に推奨なアクションをご紹介致します。 
もしご確認されたい製品が入っていなく、個別にご確認されたい場合は、各製品に対してサポート リクエストを起票してください。

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

また、現状の TLS インスペクション機能では TLS1.3 をサポートしておりません。

## Front Door
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/frontdoor/end-to-end-tls?pivots=front-door-standard-premium#supported-tls-versions)の記載通り、 Front Door ではカスタム ドメインを利用する場合は、最小 TLS バージョンを 1.0 または 1.2 を選択できます。 
> Azure Front Door では、TLS プロトコルの 4 つのバージョン (TLS バージョン 1.0、1.1、1.2、1.3) がサポートされています。 2019 年 9 月以降に作成されたすべての Azure Front Door プロファイルでは、TLS 1.3 が有効になっている既定の最小値として TLS 1.2 が使用されますが、TLS 1.0 と TLS 1.1 は下位互換性のために引き続きサポートされています。

Front Door では 2024 年 10 月 31 日以降も引き続き TLS 1.0 から TLS 1.3 まで利用できますが、セキュリティ強化のためには TLS 1.2 以上のご利用を推奨いたします。 

## Private Link Service または Private Endpoint  
Private Link Service と Private Endpoint のサービスでは、TLS プロトコルは終端しません。
Private Link Service と Private Endpoint を利用した通信の場合には、クライアントとサーバーの通信上の両端で TLS ネゴシエーションが実施されます。クライアントおよびサーバーとなるサービスの観点でご確認頂く必要があります。 

## Bastion
Bastion はお客様側で証明書の管理運用を意識する必要のないサービスとして、[以下の公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/bastion/bastion-overview#key)の記載通り、 TLS 1.2 のみをサポートしておりますので、お客様側の対処が不要です。 

> Bastion では、TLS 1.2 がサポートされています。 以前の TLS バージョンはサポートされません。

## Traffic Manager 
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/traffic-manager/traffic-manager-how-it-works#how-clients-connect-using-traffic-manager)の説明通り、TrafficManager は DNS レベルで動作するため、Traffic Manager 自身がクライアントからのリクエストを処理することはなく、クライアントは直接エンドポイントに接続します。このため、クライアント - Traffic Manager 間で TLS が使用されることはありませんので、Traffic Manager 側の対処が不要となります。

一方で、Traffic Manager はエンドポイントの監視方法として HTTPS を提供しているため、HTTPS で正常性プローブを送信するように構成した場合、Traffic Manager - エンドポイント間では TLS が使用されます。
TLS はクライアント (Traffic Manager) およびサーバー (エンドポイント) 間で使用可能な TLS バージョンのネゴシエイトを行います。エンドポイント側で TLS 1.0/1.1 が無効化されている限り Traffic Manager がTLS 1.0/1.1 でエンドポイントに接続することはありません。したがいまして、正常性プローブのプロトコルとして HTTPS を選択されている場合は、エンドポイントが TLS 1.2 以上で正常性プローブを受け取れるように構成いただく必要がございますが、具体的なエンドポイント側の TLS 設定状況、及び TLS 1.0/1.1 の無効化方法に関しましては、お客様に各サーバー (エンドポイント) 観点でご確認頂く必要があります。

## Load Balancer
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/load-balancer/load-balancer-faqs#azure-load-balancer---tls-ssl---------------)記載通り、Azure Load Balancer では、TLS 接続を終端せずにバックエンド サーバーへ転送する動作となりますので、本通知の対象外となります。 

## Virtual Network
Virtual Network が仮想化の IP アドレス空間を提供するサービスとして、TLS 通信を終端することはありませんので、本通知の対象外となります。
もし仮想ネットワーク上に稼働する他の Azure リソースの対処方法をご確認されたい場合は、各リソース観点でご確認頂く必要があります。
****