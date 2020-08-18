---
title: Azure CDN の各 SKU の特徴、トラブルシューティングの紹介
date: 2020-07-15 09:00:00 
tags: 
  - Network 
  - AzureCDN 
  - Troubleshooting
---

こんにちは、Azure テクニカル サポート チーム箕輪です。

Azure が提供している CDN サービスの Azure CDN において、ご利用いただける機能やよくあるお問合せ、各 SKU の特徴などを踏まえたトラブル シューティングの手順などをご紹介いたします。
Azure CDN は現在 4 つの SKU があり、3 社の CDN プロバイダー (Microsoft / Verizon / Akamai) で CDN サービスを提供しております。
本ブログは Azure CDN で提供している 4 つの SKU の特徴や、各 SKU における情報採取手順などをまとめたブログとなります。

<!-- more --> 

Azure CDN における共通的な事項については、以下のブログでまとめておりますのでご参照ください。
*  [Azure CDN の特徴やよくあるお問い合わせ、トラブル シューティングの紹介](https://jpaztech.github.io/blog/network/cdn-common/)

本ブログでは、Azure CDN の各 SKU の特徴についてご案内しております。
* Azure CDN における各 SKU の特徴
* ルール エンジンの設定
* エラー発生時の情報採取手順

<br>

<span id="feature-of-azure-cdn-sku"></span>

## <a href="#feature-of-azure-cdn-sku">Azure CDN における各 SKU の特徴</a>
Azure CDN における各 SKU の機能一覧については、[弊社公開情報](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-features) でご案内しております。
本ブログでは、[弊社公開情報](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-features) でご案内している内容をもとに、各 SKU の特徴について関連するドキュメントと紹介します。

<br>

<span id="standard-microsoft"></span>

#### <a href="#standard-microsoft">Standard Microsoft</a>
Standard Microsoft は、Microsoft のインフラストラクチャー上で構成された CDN プラットフォームを用いてサービスを提供しています。
Azure CDN の SKU としては最も新しく提供された SKU で、新規機能の追加などが随時行われております。
Azure CDN の中で、2020 年 7 月時点で唯一 WAF 機能を利用できる SKU となっており、配信元が Azure サービスであればデータ転送料の観点で他の SKU よりも優れています。
また、アクセス ログの取得の機能も実装されております。
動的コンテンツの最適化については [Azure Front Door](https://docs.microsoft.com/ja-jp/azure/frontdoor/front-door-overview) で機能を提供しています。


* ルール エンジンによるカスタマイズ設定
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine-reference](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine-reference)
* WAF 機能の追加 (プレビュー)
[https://docs.microsoft.com/ja-jp/azure/web-application-firewall/cdn/cdn-overview](https://docs.microsoft.com/ja-jp/azure/web-application-firewall/cdn/cdn-overview)
* アクセス ログの取得
[https://docs.microsoft.com/ja-jp/azure/cdn/enable-raw-logs](https://docs.microsoft.com/ja-jp/azure/cdn/enable-raw-logs)
* 独自証明書で指定の認証局 (CA) による制限
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-troubleshoot-allowed-ca](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-troubleshoot-allowed-ca)
* 配信元 (オリジン) が Azure サービスの場合、配信元から CDN へのデータ転送が無料
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-billing#which-origin-services-are-eligible-for-free-data-transfer-with-azure-cdn-from-microsoft](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-billing#which-origin-services-are-eligible-for-free-data-transfer-with-azure-cdn-from-microsoft)

<br>

<span id="standard-premium-verizon"></span>

#### <a href="#standard-premium-verizon">Standard / Premium Verizon</a>
Standard Verizon、Premium Verizon は Verizon Digital Media Services 社の CDN プラットフォームを用いて CDN サービスを提供しています。
Azure ポータルから Verizon のポータルに接続することで、CDN に関わるログをグラフ化して確認することができます。
Azure Media Service において、ストリーミング エンドポイントで CDN を用いた際に既定で選択される SKU であり、メディア ストリーミングの最適化に優れています。
Premium Verizon は他の SKU と価格が異なりますが、多機能のルール エンジンや詳細なレポートなどがご利用いただけます。


* 任意の認証局 (CA) が発行した証明書を利用可能
* キャッシュの事前読み込み機能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-preload-endpoint](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-preload-endpoint)
* 視覚化されたグラフ
(1) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-analyze-usage-patterns](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-analyze-usage-patterns)
(2) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-custom-reports](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-custom-reports)
* メディア ストリーミングの最適化に優れている (Azure Media Service の既定の SKU)
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-media-streaming-optimization#media-streaming-optimizations-for-azure-cdn-from-verizon](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-media-streaming-optimization#media-streaming-optimizations-for-azure-cdn-from-verizon)
* ルールエンジンによるカスタマイズ (Premium のみ)
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference)
* 詳細なレポート (Premium のみ)
(1) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-advanced-http-reports](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-advanced-http-reports)
(2) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-real-time-stats](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-real-time-stats)
(3) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-edge-performance](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-edge-performance)
(4) [https://docs.microsoft.com/ja-jp/azure/cdn/cdn-real-time-alerts](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-real-time-alerts)
* トークン認証 (Premium のみ)
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-token-auth](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-token-auth)

<br>

<span id="standard-akamai"></span>

#### <a href="#standard-akamai">Standard Akamai</a>
Standard Akamai は Akamai 社の CDN プラットフォームを用いて CDN サービスを提供しております。
Akamai 社は世界最大規模の CDN プラットフォームで CDN サービスを提供しており、動的なサイトの最適化に優れています。
なお、Akamai 社が提供している Akamai Control Center (旧 Luna Control Center) は Azure CDN ではご利用いただけません。

* キャッシュ消去 (Purge) や設定変更の反映が迅速
* Let's Encrypt を用いたカスタムドメインの HTTPS 有効化
* 動的なサイトの最適化機能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-dynamic-site-acceleration](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-dynamic-site-acceleration)
* メディア ストリーミングの最適化機能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-media-streaming-optimization#media-streaming-optimizations-for-azure-cdn-from-akamai](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-media-streaming-optimization#media-streaming-optimizations-for-azure-cdn-from-akamai)


<br>

<span id="setting-of-rule-engine"></span>

## <a href="#setting-of-rule-engine">ルール エンジンの設定</a>
Azure CDN では 2020 年 7 月時点で Standard Microsoft と Premium Verizon でルール エンジンの機能を提供しています。
ルール エンジンは以下の項目においてカスタマイズが可能です。

* キャッシュ規則のカスタマイズ
* クライアント (ユーザー) からの要求をリダイレクト
* HTTP の要求ヘッダーや応答ヘッダーの変更
* (Premium Verizon のみ) クライアント (ユーザー) からの要求を拒否 (403 で応答) する

<br>

<span id="setting-of-rule-engine-standard-microsoft"></span>

#### <a href="#setting-of-rule-engine-standard-microsoft">Standard Microsoft におけるルール エンジンの設定</a>
Stnadard Microsoft のルール エンジンの設定は Azure ポータルから実施いただけます。
ルール エンジンの設定の考え方として、対象の通信を **一致条件** で指定し、対象の通信に対して実施したい **アクション** を設定することで動作します。
Standard Microsoft のルール エンジンの設定は、エンドポイント単位で管理、適応されております。

設定の一例として、Azure CDN はクライアント (ユーザー) から HTTP で接続された場合、配信元 (オリジン) に対して HTTP で接続します。
この通信経路をすべて HTTPS で暗号化されたいシナリオにおいて、[ルール エンジンを利用した HTTPS リダイレクト](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine) を設定することで、クライアント (ユーザー) から Azure CDN を介した通信経路がすべて HTTPS となります。
この設定においては、Azure CDN のエンドポイントで受け入れプロトコルを HTTP/HTTPS としていただく点と、カスタムドメインにおいては HTTPS 有効化を構成いただく必要がある点はご留意ください。

<br>

<span id="troubleshooting-setting-of-rule-engine"></span>

#### <a href="#troubleshooting-setting-of-rule-engine">Standard Microsoft におけるルール エンジンの設定のトラブルシューティング</a>
設定を保存されたルール エンジンは、世界中の POP に適応するため、設定後の反映にはおおよそ 10 分ほど時間が掛かることが想定された動作となります。
そのため、設定後は少しお時間をあけてから設定の反映をご確認ください。
また、ルール エンジンの設定を反映する間に短時間で何度も設定を変更し保存した場合、設定情報が意図しない状態となる可能性があるため、設定を変更さえる場合はお時間を空けて実施ください。

設定後も意図した動作にならないなどご確認されたい事項がございましたら、以下の情報をもとに弊社サポート担当までお問い合わせください。


**[ご提供いただきたい情報]**
* Azure CDN が構成されている 32 桁の サブスクリプションID
* Azure CDN のプロファイル名
* ルール エンジンを設定したエンドポイント名
* ルール エンジンの設定名
* 設定されたい要件の詳細

<br>

<span id="document-setting-of-rule-engine-standard-microsoft"></span>

#### <a href="#document-setting-of-rule-engine-standard-microsoft">Standard Microsoft のルール エンジンに関する弊社公開情報</a>

* [Azure CDN の Standard ルール エンジン リファレンス](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine-reference)
* [Azure CDN の Standard ルール エンジンの一致条件](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine-match-conditions)
* [Azure CDN の Standard ルール エンジンでのアクション](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine-actions)
* [Standard ルール エンジンの HTTPS リダイレクト設定](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-standard-rules-engine)

<br>

<span id="setting-of-rule-engine-premium-verizon"></span>

#### <a href="#setting-of-rule-engine-premium-verizon">Premium Verizon におけるルール エンジンの設定</a>
Premium Verizon のルール エンジンの設定は Azure ポータルからログインできる Verizon ポータルで実施いただけます。
概要としては、[弊社公開情報](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference) より確認いただけますが、ルール エンジンの設定の考え方として、対象の通信を **一致条件** で指定し、対象の通信に対して実施したい **機能** を設定することで動作します。
Premium Verizon のルール エンジンの設定は、プロファイル単位で管理されており、プロファイルのエンドポイントに対して設定を反映することができます。

Premium Verizon のルール エンジンは現在 v4 とよばれるバージョンで動作しており、ルール エンジンは **ポリシー** と呼ばれる単位で管理しています。
**ポリシー** から新規でルール エンジンを設定いただくと **Draft** が構成されます。
設定された **Draft** から設定を適応される場合、**Draft** の **Lock Draft as Policy** を選択後、**Deploy Request** から **Production** を選択いただき、**Create Deploy Request** と進めていただければ、**ポリシー** で設定いただいたルール エンジンが適応されます。
**Create Deploy Request** 後、ルール エンジンの設定は数分で完了いたしますが、実際の環境に適応されるまでは構成によりますが、少なくとも **20 分** はかかりますので、設定の反映を確認される場合はお時間を空けて動作をご確認ください。

<br>

<span id="troubleshooting-setting-of-rule-engine-premium-verizon"></span>

#### <a href="#troubleshooting-setting-of-rule-engine-premium-verizon">Premium Verizon におけるルール エンジンの設定のトラブルシューティング</a>
Premium Verizon のルール エンジンの設定においては、**Lock Draft as Policy** や **Create Deploy Request** において検証がされる動作となりますので、設定ができないパラメータなどがある場合は、設定時にエラー メッセージが表示される動作となります。
**Create Deploy Request** を実施いただいた後も、エラー メッセージが表示されずに設定が完了し、お時間を空けてご確認いただいたにも関わらず想定された動作とならない場合、Verizon 社のエンジニアと設定状況について調査いたしますので、以下の情報をもとに弊社サポート担当までお問い合わせください。

**[ご提供いただきたい情報]**
* Azure CDN が構成されている 32 桁の サブスクリプションID
* Azure CDN のプロファイル名
* ルール エンジンを設定されたい CDN のエンドポイント名
* ルール エンジン設定画面の右上に記載れた 5 桁の ID (Verizon Account ID)
* 設定されたルール エンジンの 画面キャプチャ
* 設定されたルール エンジンの XML 情報 (ルール エンジンの設定画面で確認いただけます)
* 設定されたい要件の詳細

<br>

<span id="document-setting-of-rule-engine-premium-verizon"></span>

#### <a href="#document-setting-of-rule-engine-premium-verizon">Premium Verizon のルール エンジンに関するドキュメント</a>

* [Azure CDN from Verizon Premium ルール エンジンのリファレンス](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference)
* [Azure CDN from Verizon Premium ルール エンジンの条件式](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference-conditional-expressions)
* [Azure CDN from Verizon Premium ルール エンジンの一致条件](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference-match-conditions)
* [Azure CDN from Verizon Premium ルール エンジンの機能](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-verizon-premium-rules-engine-reference-features)
* [Azure CDN from Verizon Premium ルール エンジンの HTTP 変数](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-http-variables)

<br>

<span id="setting-of-waf"></span>

## <a href="#setting-of-waf">WAF の設定</a>
WAF の機能は 2020 年 7 月時点で Standard Microsoft においてプレビュー提供をしています。
WAF では OWASP のルール セットに準拠した Azure で管理されたルール セットの他に、カスタム規則でルールを設定することができます。
Standard Microsoft で構成されたエンドポイントに対して 1 つの WAF が関連付けできます。

[https://docs.microsoft.com/ja-jp/azure/web-application-firewall/cdn/cdn-overview](https://docs.microsoft.com/ja-jp/azure/web-application-firewall/cdn/cdn-overview)

2020 年 7月時点の動作として、WAF がエンドポイントに関連付けられた状態において、カスタム規則の変更は一部制限がかかる場合があります。
WAF のカスタム規則において意図した設定が追加できない場合は、一度エンドポイントとの関連付けを解除した上で設定の変更をお試しください。

<br>

<span id="collect-information"></span>

## <a href="#collect-information">エラー発生時の情報採取手順</a>
Azure CDN では Microsoft 以外に Verizon 社と Akamai 社の CDN プラットフォームで CDN サービスを提供していることから、事象に応じて各社と連携して調査を実施する必要があります。
SKU によって情報採取の手順が一部異なりますので、弊社サポート担当にお問い合わせいただく際に以下をご確認いただき、情報採取にご協力いただければ幸いです。

<br>

<span id="collect-information-standard-microsoft"></span>

#### <a href="#collect-information-standard-microsoft">Standard Microsoft においてエラー発生時にご提供いただきたい情報</a>
Standard Microsoft では、CDN を介した通信における HTTP ヘッダの **x-azure-ref** が、サポート担当が Azure 基盤のログを確認するために必要な情報となります。
情報採取の際は以下の情報に加えて、事象が発生した際の HTTP ヘッダの **x-azure-ref** を取得いただき、お問合せ時にご共有いただけますと幸いです。

**[ご提供いただきたい情報]**
* Azure CDN が構成されている 32 桁の サブスクリプションID
* Azure CDN のプロファイル名
* Azure CDN のエンドポイント名
* 事象が発生している URL (FQDN) 
* 事象の概要
* HTTP ヘッダの x-azure-ref の結果 (画像ではなくテキスト ベースでご共有願います)


HTTP ヘッダの **x-azure-ref** は以下の方法でご確認いただけます。

1. [Web プラウザにおけるネットワーク トレース (F12)](https://docs.microsoft.com/ja-jp/azure/azure-portal/capture-browser-trace) で確認する
2. curl コマンドで確認する。

```bash
curl -I  https://www.contoso.com/path/pic.png

(https://www.contoso.com/path/pic.png の箇所は CDN にアクセスする際の URL に変えて実施ください)
```

<br>

<span id="collect-information-standard-verizon-premium-verizon"></span>

#### <a href="#collect-information-standard-verizon-premium-verizon">Standard Verizon / Premium Verizon においてエラー発生時にご提供いただきたい情報</a>
Standard Verizon、Premium Verizon は Verizon 社の CDN プラットフォームでサービスを提供しているため、調査は Verizon 社のエンジニアと共同で実施いたします。
Verizon 社のエンジニアとスムーズに連携して調査をするため、情報採取の際は以下の情報をお問合せ時にご共有いただけますと幸いです。


**[ご提供いただきたい情報]**
* Azure CDN が構成されている 32 桁の サブスクリプションID
* Azure CDN のプロファイル名
* Azure CDN のエンドポイント名
* 事象が発生している URL (FQDN) 
* 事象の概要
* [Web プラウザにおけるネットワーク トレース (F12) の結果](https://docs.microsoft.com/ja-jp/azure/azure-portal/capture-browser-trace)

<br>

<span id="collect-information-standard-akamai"></span>

#### <a href="#collect-information-standard-akamai">Standard Akamai においてエラー発生時にご提供いただきたい情報</a>
Standard Akamai は Akamai 社の CDN プラットフォームでサービスを提供しているため、調査は Akamai 社のエンジニアと共同で実施いたします。
Standard Akamai では、CDN からエラーメッセージを応答された場合に、画面上に **Reference** と呼ばれるエラー コードが記載されます。
この  **Reference**  のエラー コードを元に調査することが可能となりますので、お問合せ時にご共有いただけますと幸いです。

![参考 : Reference のエラー コード](./cdn-specific-sku/reference-error-code.png)  


また、Standard Akamai では Web プラウザにおけるネットワーク トレース (F12) では十分な情報が取得できない場合があります。
そのため、Akamai 社のエンジニアとスムーズに連携して調査をするため、情報採取の際は以下の情報に加えて、以下の curl コマンドの実行結果をお問合せ時にご共有いただけますと幸いです。


```bash
curl -H \
 "Pragma: akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no" \
 -IXGET https://www.contoso.com/path/pic.png
 
(https://www.contoso.com/path/pic.png の箇所は CDN にアクセスする際の URL に変えて実施ください)
```


**[ご提供いただきたい情報]**
* Azure CDN が構成されている 32 桁の サブスクリプションID
* Azure CDN のプロファイル名
* Azure CDN のエンドポイント名
* 事象が発生している URL (FQDN) 
* 事象の概要
* Reference のエラー コード(画像ではなくテキスト ベースでご共有願います)
* 以下の curl コマンドの実行結果

<br>

本ブログが皆様のお役に立てれば幸いです。