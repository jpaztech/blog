---
title: Application Gateway V1 SKU から V2 SKU への移行に関するよくあるお問い合わせ
date: 2026-02-13 12:00:00 
tags: 
  - Network
  - Application Gateway
---

こんにちは。Azure テクニカル サポート チームの加藤です。

本記事では、Application Gateway V1 SKU から V2 SKU への移行に関するよくあるお問い合わせについてご紹介します。

<!-- more -->


なお、[Application Gateway V1 につきましては、2026 年 4 月 28 日にリタイアすることが決まっております](https://learn.microsoft.com/ja-jp/azure/application-gateway/v1-retirement)。この日以降、ご利用の Application Gateway V1のリソースはすべて停止される見込みとなります。
つきましては、期日までに計画的に Application Gateway V2 への移行をご実施いただけますよう、何卒お早めにご検討をいただけますと幸いでございます。


Application Gateway V2 への移行のガイドは[こちら](https://learn.microsoft.com/ja-jp/azure/application-gateway/migrate-v1-v2)をご参照ください。

<br>

## 目次

- [移行スクリプトに関するよくあるお問い合わせ](#移行スクリプトに関するよくあるお問い合わせ)
  - [移行スクリプトを使用してプライベートのフロントエンド IP のみを構成する Application Gateway V2 に移行可能か](#mq1)
  - [移行スクリプトを実行中にサブネット delegation エラーが表示される](#mq2)
  - [プライベート Application Gateway 利用時に PublicIpResourceId は不要か](#mq3)
  - [拡張複製スクリプトと従来スクリプトの違い](#mq4)
  - [V1 と V2 の証明書設定の違いについて](#mq5)
  - [移行時の WAF 構成について](#mq6)
  - [作成される WAF ポリシーの CRS バージョンとアップグレード可否](#mq7)
  - [バックエンドサーバーを V1/V2 両方に関連付けても問題ないか](#mq8)
  - [移行スクリプト実行中に V1 の設定変更が可能か](#mq9)
  - [移行スクリプト実行中にバックエンドサーバーを変更してよいか](#mq10)
  - [移行スクリプト実行中の通信影響について](#mq11)

- [トラフィックの移行に関するよくあるお問い合わせ](#トラフィックの移行に関するよくあるお問い合わせ)
  - [DNS 切り替え後に完全に V2 へ切り替わるまでの時間](#tq1)
  - [V1 と V2 の並行稼働は可能か](#tq2)
  - [移行後に V2 を経由していることを確認する方法](#tq3)

- [V1 と V2 の仕様差分に関するよくあるお問い合わせ](#v1-と-v2-の仕様差分に関するよくあるお問い合わせ)
  - [V1 と V2 の機能差分について](#sq1)
  - [NSG/UDR など通信要件の違いについて](#sq2)
  - [V2 の推奨サブネットサイズについて](#sq3)
  - [停止時の課金の違い](#sq4)

- [その他](#その他)
  - [V1 と同じプライベート IP を V2 で利用できるか](#oq1)
  - [V1 から V2 への料金比較方法](#oq2)

<br>

## 移行スクリプトに関するよくあるお問い合わせ
<a id="mq1"></a>

### 移行スクリプトを使用してプライベートのフロントエンド IP のみを構成する Application Gateway V2 に移行することは可能ですか？

A. はい、可能です。
Application Gateway V2 のフロントエンド IP アドレスをプライベートのみとする構成は
プライベート Application Gateway と呼ばれ、事前に以下の作業を行うことでご利用いただけます。

- 事前にサブスクリプションに対してプレビュー機能で  EnableApplicationGatewayNetworkIsolation を有効化する。

- 事前にプライベート Application Gateway (V2) をデプロイするサブネットに Microsoft.Network/applicationGateways の委任設定を追加する。

詳細は[こちら](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-private-deployment?tabs=portal)の公開技術情報をご確認ください。<br> ※ EnableApplicationGatewayNetworkIsolation 機能はお客様に任意で登録いただく機能のため、サブスクリプションの [プレビュー機能] のページに配置されておりますが、プライベート デプロイ機能自体はすでに GA (General Availability)  済みの機能です。

-----
<a id="mq2"></a>

### 移行スクリプトを実行中に「 Application Gateway deployments must have subnet delegation configured to Microsoft.Network/applicationGateways」というエラーが表示されました。どうすればいいですか？

A.
サブスクリプションに対して EnableApplicationGatewayNetworkIsolation 機能を有効化した状態で V2 を作成する場合、フロントエンド IP アドレスがパブリック IP のみ関連づいているか、プライベート IP のみ関連づいているかを問わず、移行先のサブネットで「Microsoft.Network/applicationGateways」へのサブネット委任の設定が必要となります。<br>
そのため、移行スクリプト実行前に V2 を作成予定のサブネットに対してサブネットの委任の設定をすることで回避できます。なお、移行元の V1 のサブネットではサブネット委任の設定は必要ございません。

-----
<a id="mq3"></a>

### プライベート Application Gateway を利用する場合、「拡張複製スクリプト」（AzureAppGWClone.ps1）のパラメーターにある PublicIpResourceId は記載不要でしょうか？

A.
はい、「拡張複製スクリプト」のパラメーター「PublicIpResourceId」については、省略可能なパラメーターであり、プライベート Application Gatewayとしてご利用いただく場合、このパラメーターは不要です。

-----
<a id="mq4"></a>

### 「拡張複製スクリプト」（AzureAppGWClone.ps1）と「従来の複製スクリプト」（AzureAppGWMigration.ps1）の違いは何でしょうか？
A.
拡張複製スクリプトでは以下の対応が可能となりました。


- パブリック IP アドレスの取り扱い：
プライベート Application Gateway 環境の移行にあたりパブリック IP アドレスを一時的に付与する必要がなくなりました。
（従来の複製スクリプトでは作成時に一時的にパブリック IP アドレスを付与、作成後に手動で削除する必要がありました）
 <p>
- HTTPS リスナーで利用する TLS 証明書の取り扱い：
従来の複製スクリプトで必須であった TLS 証明書の手動指定が不要となりました。拡張複製スクリプトでは既存の V1 環境にアップロードされている TLS 証明書が自動で V2 環境に反映される動作になりました。
 <p>
- HTTP 設定で利用するバックエンド接続用の信頼されたルート証明書の取り扱い：
Application Gateway とバックエンド サーバー間を HTTPS で通信し、かつ自己署名証明書のように、既知の証明書認証局から発行されていないサーバー証明書をバックエンド側で利用している場合、V2 では HTTP 設定の箇所でルート証明書をアップロードする必要があり、従来の移行スクリプト実行時に明示的に指定する必要がありました。
先日 Application Gateway V2 とバックエンド サーバー間を HTTPS で通信する構成において、[証明書の検証をスキップさせる機能](https://learn.microsoft.com/ja-jp/azure/application-gateway/configuration-http-settings?tabs=backendhttpsettings#backend-https-validation-settings)が登場しました。拡張複製スクリプトではこの機能に対応しているため、バックエンド用の証明書を手動指定する必要がなくなりました。

-----
<a id="mq5"></a>

### 「拡張複製スクリプト」（AzureAppGWClone.ps1）を用いて Application Gateway V1 から V2 へ移行したところ、Application Gateway V1 ではバックエンド設定の証明書設定にて認証証明書が設定されていましたが、Application Gateway V2 では、該当の設定が見当たりません。V1/V2 で同じ設定となっているのでしょうか？

A.
Application Gateway V1 では認証証明書そのものをバックエンド設定に登録する構成であったのに対して、V2 では信頼されたルート証明書を登録する構成に変更になりました。
このため、Application Gateway V1 と V2 では以下の通り証明書検証の動作が異なります。

- [V1 の提供終了に関する FAQ](https://learn.microsoft.com/ja-jp/azure/application-gateway/retirement-faq#how-are-backend-certificate-behaviors-different-between-application-gateway-v1-and-v2-skus-how-should-i-manage-the-migration-with-the-differences-in-behavior-of-backend-certificate-validations-between-v1-and-v2-skus)

>Application Gateway での証明書検証の動作
>
>V1 SKU - Application Gateway V1 は認証証明書を使用します。 このメカニズムは、Application Gateway で構成された証明書と、バックエンド サーバーによって提示される証明書との完全一致を実行します。 さらに、V1 では、TLS ハンドシェイク中にサーバー名表示 (SNI) を使用できない場合は、既定またはフォールバック証明書の使用がサポートされます。
>
>V2 SKU - 既定では、Application Gateway V2 はより包括的な検証を実行します。 完全な証明書チェーンと、バックエンド サーバー証明書のサブジェクト名が検証されます。詳細情報



また、V1 と V2 の証明書検証動作の互換性を維持するため、拡張複製スクリプトを実行した後の Application Gateway V2 では、バックエンド サーバー側の証明書チェーン、有効期限、SNI などの検証が無効化された状態となっています。これは拡張複製スクリプトを用いて Application Gateway を移行した際の想定された動作です。
バックエンド サーバーから提示される証明書の検証が必要な場合には、Application Gateway V2 への移行後、改めて、バックエンド設定へルート証明書をアップロードくださいますようお願いいたします。


- [Azure Application Gateway と Web Application Firewall を V1 から V2 に移行する](https://learn.microsoft.com/ja-jp/azure/application-gateway/migrate-v1-v2#recommendations) <br>※ 「1. 拡張複製スクリプト」の "推奨事項" の箇所をご参照ください。
>・このスクリプトは、複製中に既定でバックエンド TLS 検証を緩和します (証明書チェーン、有効期限、SNI 検証なし)。 より厳密な TLS 検証または認証証明書が必要な場合、お客様は Application Gateway V2 の作成後に更新して、信頼されたルート証明書を追加し、要件に従ってこの機能を有効にすることができます。

-----

<a id="mq6"></a>

###  移行スクリプトを実行して Application Gateway V1 をV2 に移行した場合、WAF はどのように構成されるでしょうか？
A.
Application Gateway V2 の WAF 設定には現在以下の ２種類の管理方式があります。
- 従来の WAF 構成： WAF ポリシーを利用せず、Application Gateway リソース自体に WAF 設定を保持する方式（V1 はこの方式のみ対応しています。）
- WAF ポリシー構成： 専用リソースとして WAF ポリシーを作成し、Application Gateway に関連付ける方式

移行スクリプトを実行して Application Gateway V2 を作成した場合、WAF ポリシー構成として作成されます。このとき V1 で設定していた構成を元にした WAF ポリシーが自動で作成され 、Application Gateway に関連付けられます。

-----

<a id="mq7"></a>

### 「拡張複製スクリプト」（AzureAppGWClone.ps1）を使用した場合、スクリプトで作成された WAF ポリシーには既定のルールセット として CRS 3.0 が設定されていますがアップグレードする必要はあるでしょうか？
A.
はい、移行スクリプトを実行して Application Gateway V2 を作成した場合、作成される WAF ポリシーは CRS 3.0 となります。 CRS 3.0 は既に非推奨となっていますので、以下の公式ドキュメントの手順により WAF ポリシーのアップグレードをお願いいたします。
 - [CRS または DRS ルールセットのバージョンをアップグレードする](https://learn.microsoft.com/ja-jp/azure/web-application-firewall/ag/upgrade-ruleset-version)

なお、今回のように古いバージョンから最新のバージョンへルールセットを変更する場合、マネージド ルールの内容も最新のセキュリティ状況に即した内容にアップデートされます。<br>
そのため、診断ログを有効にしたうえで、まずは「検知モード」でしばらくご利用いただき、お客様にて診断ログをご確認後、誤検知がある場合はルールの無効化等でチューニングをご実施いただいたえで、「防止モード」への変更をされることを推奨いたします。
 
WAF のチューニングにつきましては、以下のブログ記事もご参照いただけますと幸いでございます。

 - [Application Gateway WAF の誤検知対応](https://jpaztech.github.io/blog/network/handle-waf-false-positive/)

-----

<a id="mq8"></a>

### Application Gateway V2 を作成した時点で、バックエンドサーバーが Application Gateway V1 および V2 の両方に関連付けられる構成となりますが、バックエンド サーバーが複数のバックエンドプールへ関連付けられていても問題はないでしょうか？
A.
はい、1 つのバックエンド サーバーを、V1 および V2 の両方の Application Gateway のバックエンド プールとして指定することは問題ございません。

-----

<a id="mq9"></a>

### 移行スクリプト実行中に移行元の Application Gateway V1に対して設定変更や再起動などを行うことは可能でしょうか？
A.
移行スクリプト実行中には、移行元の Application Gateway V1 に対して操作を行うことは推奨されません。公式ドキュメントにも下記の通り記載がございます。

- [V1 から V2 に移行する - 注意事項](https://learn.microsoft.com/ja-jp/azure/application-gateway/migrate-v1-v2#caveats)

>移行中は、V1 ゲートウェイまたは関連付けられているリソースに対して他の操作を試みないでください。

-----

<a id="mq10"></a>

### 移行スクリプト実行中に移行元の Application Gateway V1に関連付けされているバックエンド サーバーに対して設定変更や再起動などを行うことは可能でしょうか？
A.
移行スクリプト実行中にバックエンド サーバー側の設定変更や再起動を実施しても、移行への影響は想定されませんが、予期せぬ問題を防ぐ意味合いでも、移行スクリプト実行中の操作は控えていただくことをお勧めいたします。

-----

<a id="mq11"></a>

### 移行スクリプト実行中に通信影響はあるでしょうか？
A.
いいえ。「拡張複製スクリプト」および「従来の複製スクリプト」の実行中に通信影響はございません。また、移行スクリプトを実行中も、移行元の Application Gateway V1 を経由してバックエンド サーバーに通信することが可能ですのでご安心ください。

-----
<br>

## トラフィックの移行に関するよくあるお問い合わせ

<a id="tq1"></a>

### DNS レコードの更新で通信を切り替える場合、DNS の設定を変更してから Application Gateway V2 経由での通信に完全に切り替わるまでどの程度の時間がかかるでしょうか？
A. 
切り替わるまでの時間につきましては DNS レコードの TTL に大きく依存いたしますが、明確な目安などはございません。切り替わり時間は TTL 値 ＋ マージンが必要とご理解いただけますようお願いいたします。

 - [V1 から V2 に移行する - Traffic Migrationに関する推奨事項](https://learn.microsoft.com/ja-jp/azure/application-gateway/migrate-v1-v2#traffic-migration-recommendations)

>Standard V1 または WAF V1 ゲートウェイに (A レコードを使って) 関連付けられているフロントエンド IP アドレスを指すカスタム DNS ゾーン (例: contoso.com)。 Standard_V2 アプリケーション ゲートウェイに関連付けられているフロントエンド IP または DNS ラベルを指すように、DNS レコードを更新できます。 DNS レコードに構成されている TTL によっては、すべてのクライアント トラフィックが新しい V2 ゲートウェイに移行するまでに時間がかかる場合があります。

なお、DNS 切り替えの際、Application Gateway V1・V2 がともに稼働している状態であれば、トラフィック移行中でも継続して Application Gateway からサービスが提供されますので基本的には通信影響はございません。

ただし、お客様のバックエンド アプリケーションにおいてセッション管理を行っている場合、セッション維持の実装方法によってはトラフィックの移行時に通信影響が発生することがありますので、十分な検証のうえ移行作業を進めていただくことをお勧めします。

-----

<a id="tq2"></a>

### トラフィックを移行するまでの間、Application Gateway V1 と V2 のリソースを並行稼働できるでしょうか？
A.
はい、Azure の観点では Application Gateway V1 と V2 のリソースを並行稼働することに問題はございません。トラフィックを移行するまでの間は Application Gateway V1 を経由してバックエンド サーバーに通信が行われます。

-----

<a id="tq3"></a>

### トラフィックを移行した後、通信が Application Gateway V2 を経由していることを確認できるでしょうか？
A.
はい、診断ログを有効にした上でアクセス ログをご確認いただくことで、通信が Application Gateway V2 を経由していることを確認できます。
なお、Application Gateway V1 で診断ログを有効にしていても、移行スクリプトを実行するだけでは Application Gateway V2 で診断ログは有効になりませんため、個別に設定を追加いただく必要があります。
診断ログの設定方法に関しましては、以下の公式ドキュメントを参考にしていただければ幸いです。

 - [診断ログ - Azure portal を使用してログを有効にする](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-diagnostics#enable-logging-through-the-azure-portal)


-----
<br>
<a id="specification"></a>

## V1 と V2 の仕様差分に関するよくあるお問い合わせ

<a id="sq1"></a>

### Application Gateway V1 と V2 の機能の差分はありますか？
A.
[こちら](https://learn.microsoft.com/ja-jp/azure/application-gateway/overview-v2#feature-comparison-between-v1-sku-and-v2-sku)のドキュメントに V1 と V2 で利用できる機能の差異についてまとめられておりますのでご確認ください。


-----

<a id="sq2"></a>

### Application Gateway V1 と Application Gateway V2 の通信要件(NSG/ UDR) の違いはあるでしょうか？
A.
Application Gateway V1 と Application Gateway V2 では、 Azure 基盤サービスとの通信要件や、NSG/UDR の要件が一部異なります。そのため、NSG や UDR による通信制御を行っている環境では、V2 への移行時に設定の見直しが必要となる場合があります。

NSG につきまして、 基盤サービス（GatewayManager）との通信で使用されるポート範囲が SKU ごとに異なります。詳細については、以下の公開ドキュメントをご参照ください。 
 - [Azure Application Gateway インフラストラクチャの構成 - ネットワーク セキュリティ グループ](https://learn.microsoft.com/ja-jp/azure/application-gateway/configuration-infrastructure#network-security-groups)

>インフラストラクチャ ポート: GatewayManager サービス タグと "任意" の宛先として、ソースからの受信要求を許可します。 宛先ポートの範囲は、SKU によって異なります。これは、バックエンド正常性の状態を通信するために必要です。 これらのポートは、Azure 証明書によって保護 (ロックダウン) されます。 適切な証明書が設定されていない外部エンティティは、そのようなエンドポイントに対する変更を開始できません。
>
>V2: ポート 65200 から 65535
>V1: ポート 65503 から 65534

UDR につきまして、 V1 では、エンド ツー エンドの通信経路が維持されることを前提として、Application Gateway サブネットに UDR を設定する構成がサポートされています。
一方で V2 では、すべての管理/コントロール プレーン トラフィックが、仮想アプライアンス経由ではなく、インターネットに直接送信されるようにする必要があり、0.0.0.0/0 トラフィックをインターネットに向けるよう設定する必要があります。(お客様でご利用中の個別のアドレス プレフィックス宛のルートを設定いただく分には問題ございません)

- [Azure Application Gateway インフラストラクチャの構成 - サポートされているユーザー定義ルート](https://learn.microsoft.com/ja-jp/azure/application-gateway/configuration-infrastructure#supported-user-defined-routes)

>v1: v1 SKU の場合、UDR は、エンド ツー エンドの要求/応答の通信が変更されなければ、Application Gateway サブネットでサポートされます。 たとえば、パケットの検査のためにファイアウォール アプライアンスを指すように Application Gateway サブネットの UDR を設定できます。 ただし、検査後にパケットが目的の宛先に到達できることを確認する必要があります。 これに失敗すると、不適切な正常性プローブやトラフィック ルーティング動作が発生する場合があります。 これには仮想ネットワークの Azure ExpressRoute や VPN ゲートウェイによってプロパゲートされる学習済みのルートまたは既定の 0.0.0.0/0 ルートが含まれます。
>
>v2: v2 SKU の場合、サポートされるシナリオとサポートされないシナリオがあります。

なお、プライベート Application Gateway の場合は、NSG と UDR の通信要件が緩和されております。詳細については以下のドキュメントをご確認ください。
 - [プライベート アプリケーション ゲートウェイのデプロイ](https://learn.microsoft.com/ja-jp/azure/application-gateway/application-gateway-private-deployment?tabs=portal)

-----

<a id="sq3"></a>

### Application Gateway V1の最小サブネット サイズは /26 でしたが Application Gateway V2で推奨のサブネット サイズはあるでしょうか？
A.
Application Gateway V2 は、インスタンスを最大 125 までスケール アウトすることが可能です。そのため、最大 131 個の IP アドレス (※) が必要となり、/24 のサブネット サイズを推奨しております。
※ 125 のインスタンス IP アドレス + 1 つのプライベート フロントエンド IP 構成 + 5 つの Azure 予約 IP アドレス

なお、お客様環境のご要件にてインスタンスのスケール アウトが最大 125 まで必要とされない場合、スケール アウトする最大インスタンス数の上限を決めることで、サブネット サイズを調整いただくことは可能ですが、拡張性を考慮して /24 のサブネット サイズでデプロイいただくことを強くお勧めいたします。

- [Azure Application Gateway インフラストラクチャの構成 - 仮想ネットワークと専用サブネット](https://learn.microsoft.com/ja-jp/azure/application-gateway/configuration-infrastructure#virtual-network-and-dedicated-subnet)

-----

<a id="sq4"></a>

### Application Gateway V1 と V2 を停止した際に、課金の差異はあるでしょうか？
A.
V2 につきましては、Application Gateway 自体の固定コスト/容量ユニットコスト/データ転送はすべて課金されなくなりますが、パブリック IP アドレスの課金は停止中も発生します。
V1 につきましては、関連付けているパブリック IP アドレスを含めすべての課金が停止いたします。


-----
<br>

## その他


<a id="oq1"></a>

### Application Gateway V2 のフロントエンド IP として Application Gateway V1 で利用していたプライベート IP アドレスを設定することは可能でしょうか？
A.
Application Gateway V1 と Application Gateway V2 を同じサブネットに共存させることは叶いませんため、Application Gateway V1 を先に削除いただき、Application Gateway V2 を作成する際に Application Gateway V1 で使用していたプライベート IP アドレスを設定することで設定が可能です。

-----

<a id="oq2"></a>

### Application Gateway V1 から V2 への移行に向けて、料金差分を確認したいです。大まかな料金を確認したいのですが、どのように計算したらよいでしょうか？
A.
Application Gateway の V1 と V2 では料金体系が大きく異なっております。
V1 では、インスタンス数とインスタンスのサイズに基づく固定料金と、処理データ量に応じた従量課金が発生します。

一方で、V2 では、従来のインスタンス単位ではなく、利用状況に応じて課金される消費ベースのモデルへと切り替わっており、容量ユニット コスト使用状況に応じて料金が変動する仕組みとなっています。詳細については、以下の公開ドキュメントをご参照ください。

 - [Azure Application Gateway と Web Application Firewall の価格について](https://learn.microsoft.com/ja-jp/azure/application-gateway/understanding-pricing)


料金差分を確認される際には、以下の料金計算ツール上で V1 に相当する「Basic V1」と V2 の「Standard v2」をそれぞれ選択し、現在ご利用中のトラフィック量や接続数に合わせて試算いただくことになります。
V1 と V2 は料金構造そのものが異なるため、単純にインスタンス数を並べて比較するのではなく、利用量をもとに試算していただくことが必要となります。

 - [料金計算ツール](https://azure.microsoft.com/ja-jp/pricing/calculator/?service=application-gateway)

-----
<br>

以上、Application Gateway V1  SKU から V2 SKU への移行に関するよくあるお問い合わせについてご紹介しました。移行のご参考になれば幸いです。
