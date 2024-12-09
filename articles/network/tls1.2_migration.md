---
title: Azure Network 製品について TLS 1.2 以降に移行するアナウンスの補足 (Tracking ID:7_8G-D8Z)
date: 2024-09-26 19:27:00 
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
以下の URL にて、2025 年 8 月 31 日に TLS バージョン 1.0 および 1.1 のサポートが終了することが案内されました。こちらの URL 先のページでは英文で記載されておりますので、本ブログでは日本語にて内容をご案内いたします。  

[Retirement: Azure Application Gateway support for TLS 1.0 and TLS 1.1 will end by 31 August 2025 (microsoft.com)](https://azure.microsoft.com/en-us/updates/v2/Azure-Application-Gateway-support-for-TLS-10-and-TLS-11-will-end-by-31-August-2025)  
  
つきましては、2025 年 8 月 31 日までに以下の作業をご実施いただきますようお願いいたします。  

### クライアントから Application Gateway への接続について
~~現時点では、Application Gateway は2024 年 10 月 31 日以降にも引き続き TLS1.0 から TLS1.3 をサポートしており、TLS1.2 以下のバージョンをサポートしなくなる予定はございません。~~   
以下の設定方法を参考に Application Gateway の TLS ポリシーにて、定義済みの AppGwSslPolicy20220101S、AppGwSslPolicy20220101、または最小プロトコル バージョンが TLS 1.2 のカスタムポリシーに更新することをお勧めします（CustomV2 ポリシーは、デフォルトで最小プロトコルバージョンが 1.2 になっています）。  
  
#### 最小TLS バージョンの設定方法 
下図の通り、Azure ポータル → 対象 Application Gateway → 「リスナー」のタブにて、 「選択した SSL ポリシー」の「変更」ボタンをクリックし、「 SSL ポリシーの変更」より設定できます。 
![](./tls1.2_migration/appgw_tls_setting.png)

また、Application Gateway SKU v2 の場合は、[こちらの手順通り](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-configure-listener-specific-ssl-policy)、リスナー毎に異なる TLS バージョンを設定することも可能です。 

### Application Gateway からバックエンド サーバーへの接続について
2025 年 8 月 31 日以降、バックエンドサーバーへの接続は常に最小プロトコル TLS のバージョンは 1.2 となり、最大プロトコル TLS バージョンは 1.3 となります。バックエンド接続の TLS バージョンについて、Application Gateway 側で何かを設定する必要はありません。  
バックエンドのサーバーがこれらの更新されたプロトコル TLS バージョン （TLS 1.2 または 1.3）に対応していることをお客様にて確認し、必要に応じて 2025 年 8 月 31 日までに Application Gateway のバックエンドに指定しているサーバー側で最小プロトコル TLS バージョンが 1.2 以上となるよう、ご対応いただけますようお願いいたします。  

## Azure Firewall
Azure Firewall では、TLS バージョンが関わる部分は TLS インスペクションのみとなります。アプリケーション ルール、ネットワーク ルール、及び DNAT ルールで通信を許可する場合は本通知の対象外となります。

TLS インスペクション機能を使用する場合は、[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/firewall/premium-features#tls-inspection)の記載通り、現状及び 2024 年 10 月 31 日以降にも TLS1.0 及び TLS1.1 は互換性のために引き続き動作する予定ですが、早めに TLS 1.2 に移行することを強く推奨します。

> ヒント
> TLS 1.0 と 1.1 は非推奨になっていて、サポートされません。 TLS 1.0 と 1.1 のバージョンの TLS/SSL (Secure Sockets Layer) は脆弱であることが確認されています。現在、これらは下位互換性を維持するために使用可能ですが、推奨されていません。 できるだけ早く TLS 1.2 に移行してください。

また、現状の TLS インスペクション機能では TLS1.3 をサポートしておりません。

## Front Door
以下の URL にて、2025 年 3 月 1 日に TLS バージョン 1.0 および 1.1 のサポートが終了することが案内されました。
  
Azure Front Door でカスタム ドメインを利用する場合は、**2025 年 3 月 1 日以降に最小 TLS バージョン 1.0 および 1.1 のサポートは終了**するため、**最小 TLS バージョンを 1.2 以上に変更**いただく必要がございます。  
各 SKU における最小 TLS バージョンの更新方法は以下の通りです。  
  

- Azure Front Door を使用している場合は、「[カスタム ドメインに対して HTTPS を構成する - Azure Front Door | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/frontdoor/standard-premium/how-to-configure-https-custom-domain?tabs=powershell)」を使用して TLS 1.2 以上に設定します。
- Azure Front Door クラシックを使用している場合は、「[Front Door (クラシック) カスタム ドメインで HTTPS を構成する - Azure Front Door | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/frontdoor/front-door-custom-domain-https)」を使用して TLS 1.2 に設定します。
- Microsoft CDN を使用している場合は、「[チュートリアル:Azure CDN カスタム ドメインで HTTPS を構成する | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/cdn/cdn-custom-ssl?tabs=option-1-default-enable-https-with-a-cdn-managed-certificate)」を参照してください。Microsoft Learn
」を使用して TLS 1.2 に設定します。

## Private Link Service または Private Endpoint  
Private Link Service と Private Endpoint のサービスでは、TLS プロトコルは終端しません。
Private Link Service と Private Endpoint を利用した通信の場合には、クライアントとサーバーの通信上の両端で TLS ネゴシエーションが実施されます。クライアントおよびサーバーとなるサービスの観点でご確認頂く必要があります。 

## Bastion
Bastion はお客様側で証明書の管理運用を意識する必要のないサービスとして、[以下の公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/bastion/bastion-overview#key)の記載通り、 TLS 1.2 のみをサポートしておりますので、お客様側の対処が不要です。 

> Bastion では、TLS 1.2 がサポートされています。 以前の TLS バージョンはサポートされません。

## Traffic Manager 
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/traffic-manager/traffic-manager-how-it-works#how-clients-connect-using-traffic-manager)の説明通り、TrafficManager は DNS レベルで動作するため、Traffic Manager 自身がクライアントからのリクエストを処理することはなく、クライアントは直接エンドポイントに接続します。このため、クライアント - Traffic Manager 間で TLS が使用されることはありませんので、Traffic Manager 側の対処が不要となります。

一方で、Traffic Manager はエンドポイントの監視方法として HTTPS を提供しているため、HTTPS で正常性プローブを送信するように構成した場合、Traffic Manager - エンドポイント間では TLS が使用されます。
（Tracking ID: VSKS-DSG の通知は、この Traffic Manager - エンドポイント間の正常性プローブの通信において、TLS 1.0/1.1 のサポートが 2024 年 6 月 30 日より終了することをご案内しております。）

TLS はクライアント (Traffic Manager) およびサーバー (エンドポイント) 間で使用可能な TLS バージョンのネゴシエイトを行います。エンドポイント側で TLS 1.0/1.1 が無効化されている限り Traffic Manager がTLS 1.0/1.1 でエンドポイントに接続することはありません。したがいまして、正常性プローブのプロトコルとして HTTPS を選択されている場合は、エンドポイントが TLS 1.2 以上で正常性プローブを受け取れるように構成いただく必要がございますが、具体的なエンドポイント側の TLS 設定状況、及び TLS 1.0/1.1 の無効化方法に関しましては、お客様に各サーバー (エンドポイント) 観点でご確認頂く必要があります。

## Load Balancer
[こちらの公開ドキュメント](https://learn.microsoft.com/ja-jp/azure/load-balancer/load-balancer-faqs#azure-load-balancer---tls-ssl---------------)記載通り、Azure Load Balancer では、TLS 接続を終端せずにバックエンド サーバーへ転送する動作となりますので、本通知の対象外となります。 

## Virtual Network
Virtual Network が仮想化の IP アドレス空間を提供するサービスとして、TLS 通信を終端することはありませんので、本通知の対象外となります。
もし仮想ネットワーク上に稼働する他の Azure リソースの対処方法をご確認されたい場合は、各リソース観点でご確認頂く必要があります。
****
