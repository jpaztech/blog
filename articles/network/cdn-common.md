---
title: Azure CDN の特徴やよくあるお問い合わせ、トラブル シューティングの紹介
date: 2020-07-15 09:00:00 
tags:
  - Network 
  - AzureCDN 
  - Troubleshooting 
---
こんにちは、Azure テクニカル サポート チーム箕輪です。

Azure が提供している CDN サービスの Azure CDN において、ご利用いただける機能やよくあるお問合せ、各 SKU の特徴などを踏まえたトラブル シューティングの手順などをご紹介いたします。
Azure CDN は現在 4 つの SKU があり、3 社の CDN プロバイダー (Microsoft / Verizon / Akamai) で CDN サービスを提供しています。
本ブログは Azure CDN における共通的な事項をまとめたブログとなります。

<!-- more --> 

各 SKU の特徴や、各 SKU における情報採取の手順については、以下のブログでまとめていますのでご参照ください。
*  [Azure CDN の各 SKU の特徴、トラブルシューティングの紹介](https://jpaztech.github.io/blog/network/cdn-specific-sku/)

本ブログでは、Azure CDN の共通的な機能として、以下の項目についてご案内しています。

* Azure CDN の特徴
* Azure CDN のよくあるお問合せ
* 構築・設定変更時のエラーのトラブルシューティング
* 接続エラーなどが発生した際のトラブルシューティング

<br>

<span id="feature-of-azure-cdn"></span>

## <a href="#feature-of-azure-cdn">Azure CDN の特徴</a>
Azure CDN は 3 社の CDN プロバイダー (Microsoft / Verizon / Akamai)  で CDN サービスを提供しています。
各社の CDN プラットフォームによりご利用いただける機能が異なり、各 SKU の比較は [弊社公開情報](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-features) でご案内しています。
Azure CDN の 4 つの SKU で共通して利用できる機能について、弊社公開情報のリンクとあわせてご紹介します。

* 固定費用がかからない、転送量に応じた課金体系
[https://azure.microsoft.com/ja-jp/pricing/details/cdn/](https://azure.microsoft.com/ja-jp/pricing/details/cdn/)
* 任意のリソース名でプロファイルとエンドポイントが構成でき、既定のエンドポイントは HTTPS に対応
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-create-new-endpoint](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-create-new-endpoint)
* お客様に管理された任意のドメイン (カスタムドメイン) を利用可能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-map-content-to-custom-domain](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-map-content-to-custom-domain)
* Azure CDN で管理された無料の SSL 証明書を用いたカスタムドメインの HTTPS 接続を提供
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-custom-ssl?tabs=option-1-default-enable-https-with-a-cdn-managed-certificate](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-custom-ssl?tabs=option-1-default-enable-https-with-a-cdn-managed-certificate)
* キャッシュされたコンテンツのキャッシュ消去 (Purge)
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-purge-endpoint](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-purge-endpoint)
* コンテンツのキャッシュ期間の設定
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-caching-rules](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-caching-rules)
* キャッシュされたコンテンツのファイル圧縮機能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-improve-performance](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-improve-performance)
* リクエストやキャッシュ ヒット数などのログ確認機能
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-azure-diagnostic-logs](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-azure-diagnostic-logs)
* 国/地域別のアクセス制御
[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-restrict-access-by-country](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-restrict-access-by-country)

<br>

<span id="qa-of-azure-cdn"></span>

## <a href="#qa-of-azure-cdn">Azure CDN のよくあるお問合せ</a>
Azure CDN において、お客様よりよくお問い合わせいただく内容についてご紹介いたします。

<br>

<span id="q1"></span>

#### <a href="#q1">Azure CDN のリソースのリージョンを指定したい / Azure CDN のリソースを日本だけに固定したい</a>
Azure CDN では、世界中で構成された CDN の POP からサービスを提供しており、リージョン単位でのサービス提供はしていません。
Azure CDN のプロファイルを構成される場合、既定では global というリージョンでリソースが構成され、特定のリージョンだけにお客様の構成情報を適応するといった機能はありません。
Azure CDN の構成方法によっては Azure CDN のリージョンが global 以外となる場合がありますが、いずれのリージョンであっても動作や機能に違いはありません。

接続制限という観点で特定のリージョンを指定されたい場合は、[国/地域別の Azure CDN コンテンツの制限](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-restrict-access-by-country) の機能をご検討ください。

<br>

<span id="q2"></span>

#### <a href="#q2">Azure CDN から更新されたコンテンツが配信されない</a>
Azure CDN はクライアント (ユーザー) からの要求 URL に対して、CDN 上でキャッシュされたコンテンツがあれば CDN から応答し、キャッシュされたコンテンツが無い場合やキャッシュの有効期間が過ぎている場合は、配信元に対象のコンテンツを取得した上で、クライアント (ユーザー) に応答する動作となります。

配信元のコンテンツを更新されたにもかかわらず、Azure CDN から更新される前のコンテンツが応答される場合は、Azure CDN 上のキャッシュを消去 (Purge) いただくことで、Azure CDN はクライアント (ユーザー) からの要求 URL に対して、配信元に更新されたコンテンツを取得し、クライアント (ユーザー)  に応答します。

<br>

<span id="q3"></span>

#### <a href="#q3">Azure CDN を利用した際に発生する費用の考え方について</a>
Azure CDN おいて発生する費用の考え方については、以下の弊社公開情報にてご案内しています。
実際に発生する費用や、お客様の固有のご環境における費用のご質問についてご確認されたい場合は、課金の観点で弊社サポート担当までお問い合わせください。

[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-billing](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-billing)

<br>

<span id="q4"></span>

#### <a href="#q4">新規でエンドポイントを設定したがエラーになる</a>
Azure CDN は世界中で構成された CDN の POP から CDN サービスを提供しているため、世界中で一意のリソース名で構成される必要があります。
設定されたいエンドポイント名が既に利用されている場合はエラーとなり設定ができないため、別のエンドポイント名をご利用ください。
(Azure CDN のプロファイル名は任意のリソース名を設定できます。)

設定されたいエンドポイント名が利用可能かは、[こちらの REST API](https://docs.microsoft.com/en-us/rest/api/cdn/checknameavailability) によりご確認いただけます。

```json
{
  "name": "contoso-cdn",
  "type": "Microsoft.Cdn/Profiles/Endpoints"
}

(contoso-cdn をお客様のご利用されたいリソース名に置き換えて Body に入力し、REST API を実行してください)
```
<br>

<span id="q5"></span>

#### <a href="#q5">カスタムドメインを別のエンドポイントに移行したい</a>
Azure CDN のエンドポイントに設定されたカスタムドメインの設定を維持したままエンドポイントの変更はできません。
カスタムドメインを別のエンドポイントに移行する場合、既存のカスタムドメインの設定を削除いただいた上で移行する必要があります。

<br>

<span id="q6"></span>

#### <a href="#q6">CORS に対応する方法を知りたい</a>
HTTP ヘッダの CORS (クロス オリジン リソース共有) の利用方法については、以下の弊社公開上でご案内しています。
CORS の設定後、意図した動作とならない場合は、一度キャッシュ消去 (Purge) を実行いただき、動作をご確認ください。

[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-cors](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-cors) 

<br>

<span id="q7"></span>

#### <a href="#q7">独自の証明書を利用したカスタムドメインの HTTPS 有効化について</a>
カスタムドメインの HTTPS 有効化において、Azure CDN で管理された証明書 (DigiCert 社の証明書) 以外に、独自の証明書 (お客様に準備いただいた証明書) がご利用できます。
独自の証明書がご利用いただけるのは Standard Microsoft と Standard Verizon、Premium Verizon となります。
Standard Akamai では独自の証明書はご利用いただけず、Let's Encrypt の証明書で HTTPS 接続が利用できます。
独自の証明書をご利用いただく際は、Azure CDN のリソースが構成された同じサブスクリプションに Azure Key Vault リソースを構成いただき、証明書をアップロードする必要があります。

なお、Standard Microsoft では [特定の認証局 (CA) で発行された証明書](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-troubleshoot-allowed-ca) をご利用いただく必要があります。
Standard Verizon、Premium Verizon においては、任意の認証局 (CA) で発行された証明書が利用できますが、自己署名証明書は利用できず、また Azure Key Vault にアップロードいただく証明書には認証局 (CA) の中間証明書を含めるように構成する必要があります。
以下の openssl コマンドで、中間 CA 証明書を含んだ PFX 形式の証明書を構成できますのでご参照ください。

```bash
openssl pkcs12 -export -in PublicSSLcert.cer -inkey PrivateKey.key -certfile IntermediateCAcert.cer -out PFXcert.pfx
 
* PublicSSLcert.cer : 認証局 (CA) より発行された SSL 証明書
* PrivateKey.key : 認証局 (CA) に送付した CSR を構成された際の秘密鍵
* IntermediateCAcert.cer : 認証局 (CA) の中間 CA 証明書
* PFXcert.pfx : openssl コマンドにより出力される PFX 形式のファイル
```

<br>

<span id="q8"></span>

#### <a href="#q8">Azure CDN で利用されている IP リストが知りたい</a>
Azure CDN で利用されている IP リストは、以下の弊社公開情報にて公開しています。
Standard Akamai においては、公開された IP リストはありません。
配信元 (オリジン) で Azure CDN からの接続を IP リストで制限されたい場合は、Standard Microsoft、Standard Verizon、Premium Verizon をご利用ください。

[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-pop-list-api](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-pop-list-api)

<br>

<span id="q9"></span>

#### <a href="#q9">配信元 (オリジン) に HTTPS だけ接続するようにしたい</a>
Azure CDN の動作として、クライアント (ユーザー) からの要求プロトコルを用いて配信元 (オリジン) に接続する動作となります。
クライアント (ユーザー) が HTTP で要求 URL を送信した場合、Azure CDN は配信元 (オリジン) に HTTP でコンテンツを取得します。

クライアント (ユーザー) からの HTTP の要求 URL を HTTPS にリダイレクトしたい場合、Standard Microsoft と Premium Verizon で提供しているルール エンジンを利用いただく必要があります。
Standard Akamai や Standard Verizon はルール エンジンが利用できないため、HTTPS リダイレクトは構成できません。
HTTPS リダイレクトを構成する方法は、以下の弊社公開情報でご案内しておりますのでご参照ください。
なお、Azure CDN のエンドポイントの設定で、HTTP を受け入れプロトコルとして許可していない場合、HTTPS へのリダイレクトは動作しない点はご注意ください。

[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-storage-custom-domain-https#http-to-https-redirection](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-storage-custom-domain-https#http-to-https-redirection)

<br>

<span id="q10"></span>

#### <a href="#q10">Azure CDN で認証機能を利用したい</a>
Premium Verizon では [トークン認証](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-token-auth) の機能を提供しておりますが、それ以外の認証機能 (基本認証、クライアント認証など) は Azure CDN では提供していません。
配信元 (オリジン) として Azure Storage をご利用されている環境では、Azure Storage の SAS (Shared Access Signature) の機能を利用し、以下の公開情報でご案内しておりますのでご参照ください。

[https://docs.microsoft.com/ja-jp/azure/cdn/cdn-sas-storage-support](https://docs.microsoft.com/ja-jp/azure/cdn/cdn-sas-storage-support)

<br>

<span id="q11"></span>

#### <a href="#q11">Azure CDN で対象の URL がキャッシュされているかを確認したい</a>
Azure ポータルなどの機能で、対象の URL のコンテンツが CDN 上にキャッシュされているかを確認する機能はありませんが、対象の URL への応答における HTTP ヘッダを確認することで、CDN 上に対象の URL のコンテンツがキャッシュされているかを確認できます。
確認方法として、HTTP ヘッダの x-cache が HIT や TCP_HIT となっている場合、Azure CDN 上でキャッシュされたコンテンツが応答されている状態となります。

HTTP ヘッダの x-cache の確認方法としては、[Web プラウザにおけるネットワーク トレース (F12) ](https://docs.microsoft.com/ja-jp/azure/azure-portal/capture-browser-trace) で、対象 URL の HTTP の x-cache の応答ヘッダを確認いただくか、以下の curl コマンドの結果で x-cache を確認できます。


```bash
 curl -H https://contoso-cdn.azureedge.net/xxx/xxx
 
 (http や https 以降を対象の URL に置き換えて実行ください)
```

Standard Akamai では、Web プラウザでは HTTP ヘッダの x-cache を確認できないため、以下の curl コマンドでご確認ください。

```bash
 curl -H "Pragma: akamai-x-cache-on" \
 -IXGET https://contoso-cdn.azureedge.net/xxx/xxx
 
 (http や https 以降を対象の URL に置き換えて実行ください)
```

<br>

<span id="troubleshooting-changing-settings"></span>

## <a href="#troubleshooting-changing-settings">構築・設定変更時のエラーのトラブルシューティング</a>
Azure CDN を新規で構築されている場合、または設定変更後に Azure CDN を介してコンテンツが取得できなくなった場合は以下をお試しください。

<br>

<span id="troubleshooting-1"></span>

#### <a href="#troubleshooting-1">Azure CDN を新規で構築した場合</a>
Azure CDN を新規で構築された場合、世界中にある POP に構成情報を展開するため、新規でリソースを構成いただいた後に反映までしばらくお時間を要します。
Azure CDN の SKU によって以下の通り反映に要する時間が異なります。
特に Verizon SKU をご利用いただいているご環境においては設定の反映に 90 分はお時間を要し、90 分以内に動作を確認されても想定された動作とならない可能性があります。
その場合は、90 分お待ちいただいた上で動作をご確認ください。

　Standard Microsoft : 10 分
　Standard Verizon / Premium Verizon : 90 分
　Standard Akamai : 1 分

<br>

<span id="troubleshooting-2"></span>

#### <a href="#troubleshooting-2">DNS 関連の変更をした場合</a>
DNS 関連の変更などをした場合、一般的に DNS の設定の反映にはしばらく時間を要するため、設定直後に確認された際には意図した結果とならない可能性があります。
例えば DNS の参照する先を変更した場合などは、クライアント環境においてキャッシュ DNS をクリアなどしてから状況が変わるかをお試しください。
また、[オンライン ツール](https://digwebinterface.com/) などをご利用いただき、DNS の最新の状況についてご確認ください。

<br>

<span id="troubleshooting-3"></span>

#### <a href="#troubleshooting-3">Azure CDN の設定反映</a>
Azure CDN は世界中にある POP の CDN のリソースに変更された構成情報を展開するため、Azure ポータルなどで変更された内容が各 POP に反映されるまで時間を要します。
目安としては 10 分ほどお待ちいただき、変更された内容が適応されているかをご確認ください。
また、既に CDN 上にキャッシュなどがある場合、意図した動作とならない可能性があるため、各設定の反映を確認するためにキャッシュの消去 (Purge) を一度実施いただくことをお勧めいたします。

なお、設定変更後に時間を空けずに別の変更を設定された場合、設定の反映に齟齬が発生し、意図した設定が適応されない事象が発生する可能性があります。
そのため、各設定変更の後は少なくとも 10 分はお時間を空けてからお試しください。

また、カスタムドメインやエンドポイントの削除を伴う変更については、短時間で削除、再生成をするとエラーとなる可能性があります。
同じカスタムドメインやエンドポイント名をご利用される場合は、削除後に目安として 2 時間ほど時間を空けてから再生成ください。

<br>

<span id="troubleshooting-connection-error"></span>

## <a href="#troubleshooting-connection-error">接続エラーなどが発生した際のトラブルシューティング</a>
設定変更などを実施されていないご状況において、Azure CDN を介してコンテンツが取得できなくなった場合は以下をお試しください。

**0. エラー状況の確認**

Azure CDN を介して対象の URL において、ライアント (ユーザー) からコンテンツが取得できないエラーなどが発生した場合、[Web プラウザのネットワーク トレース (F12) の機能](https://docs.microsoft.com/ja-jp/azure/azure-portal/capture-browser-trace) や curl を利用し、対象の URL の応答結果の確認をすることで、エラーの状況を確認することができます。

  *  **HTTP レスポンスが応答されない** <br>クライアント (ユーザー) から Azure CDN までのネットワークにおいて DNS レイヤーや TCP レイヤーに障害などが発生し接続ができていない可能性があります。<br>Azure CDN はパブリック ネットワークから接続ができるため、異なるクライアント環境やネットワーク環境から接続が可能かをご確認ください。<br>特定のネットワークからのみ接続ができない場合、ネットワーク管理者などにネットワーク状況をお問い合わせください。

  *  **いずれかの HTTP レスポンスが応答される** <br>Azure CDN か、Azure CDN と配信元 (オリジン) 間のネットワーク、または配信元 (オリジン) で障害などが発生している可能性があります。<br>次の手順で、Azure CDN と配信元 (オリジン) の被疑箇所を切り分けます。

**1. 配信元の状況確認** 

配信元 (オリジン) のエンドポイント (URL) にアクセスし、想定されるコンテンツが取得できるかをご確認ください。
配信元 (オリジン) から想定されたコンテンツが取得できない場合、配信元 (オリジン) の障害などの影響により Azure CDN からコンテンツが応答できていない可能性があります。
配信元 (オリジン) から想定されたコンテンツが取得でき、Azure CDN からコンテンツが取得できない場合は、次の手順で被疑箇所を切り分けます。

**2. 配信元の証明書の状態を確認する** 

Azure CDN はクライアント (ユーザー) からプロトコルで配信元 (オリジン) に転送してコンテンツを取得します。
HTTPS 接続においては、Azure CDN や配信元 (オリジン) の HTTPS 接続のための SSL/TLS 証明書の有効期限切れなどによりエラーが発生する場合があります。
この場合、HTTP 接続で Azure CDN を介してコンテンツの取得が可能かをご確認ください。

TLS/SSL 証明書の状態については、以下の openssl コマンドを用いて確認することが可能です。
以下の openssl コマンドで証明書の有効期限切れなどが確認できた場合、証明書の状況をご確認ください。
証明書に問題がなく、引き続き Azure CDN からコンテンツが取得できない場合は、次の手順で改善されるかお試しください。

```bash
[Azure CDN へのTLS 接続確認]
openssl s_client -connect <Azure CDN のエンドポイント (xxx..azureedge.net)>:443 -servername <FQDN> -showcerts

[バックエンドへの TLS 接続確認]
openssl s_client -connect <バックエンドのパブリック IP アドレスや FQDN>:443 -servername <FQDN> -showcerts
```

**3. キャッシュ消去 (Purge)** 

Azure CDN 上でクライアント (オリジン) からの要求 URL に対して意図しないコンテンツをキャッシュし、エラーが応答されている可能性があります。
一度、キャッシュ消去 (Purge) を実施いただいた上で、クライアント (ユーザー) から Azure CDN に再接続し、エラー状況をご確認ください。

**4. 情報採取**

上記を実施いただき、事象が改善されない場合は、ご利用いただいている SKU に応じて情報取得をいただき、弊社サポート担当までお問い合わせください。

* [Standard Microsoft においてエラー発生時にご提供いただきたい情報](https://jpaztech.github.io/blog/network/cdn-specific-sku/#collect-information-standard-microsoft)
* [Standard Verizon / Premium Verizon においてエラー発生時にご提供いただきたい情報](https://jpaztech.github.io/blog/network/cdn-specific-sku/#collect-information-standard-verizon-premium-verizon)
* [Standard Akamai においてエラー発生時にご提供いただきたい情報](https://jpaztech.github.io/blog/network/cdn-specific-sku/#collect-information-standard-akamai)

<br>

本ブログが皆様のお役に立てれば幸いです。