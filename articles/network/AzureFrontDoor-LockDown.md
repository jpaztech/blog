---
title: Azure Front Door を用いた App Service などへのセキュアな接続の構成
date: 2021-04-02 00:00:00 
tags:
  - Network 
  - AzureFrontDoor
  - FAQ
---
こんにちは、Azure テクニカル サポート チーム 箕輪 です。

Azure Front Door は、世界中に展開された Microsoft のリソースを用いて、レイヤー 7 (HTTP/HTTPS 層) で動作する負荷分散サービスとなります。
このブログでは、Azure Front Door についてよくお問い合わせをいただく、App Service などへのセキュアな接続の構成についてご紹介します。

<!-- more --> 

<br>

## Azure Front Door の 概要

Azure でご利用いただける負荷分散サービスやご選択いただく考え方としては、公開情報の [Azure 負荷分散を理解する](https://docs.microsoft.com/ja-jp/azure/architecture/guide/technology-choices/load-balancing-overview) に記載があります。
この中で、Azure Front Door は、グローバル リージョンでご利用いただけるレイヤー 7 で動作する負荷分散サービスであり、公開情報では [Azure Front Door とは](https://docs.microsoft.com/ja-jp/azure/frontdoor/front-door-overview) に記載があります通り、下記の機能がご利用いただけます。

* スプリット TCP ベースの エニーキャスト プロトコル を使用したアプリケーションのパフォーマンスの高速化
* インテリジェントな 正常性プローブ によるバックエンド リソースの監視
* 要求の URL パス ベース のルーティング
* 効率的なアプリケーション インフラストラクチャを実現する、複数の Web サイトのホスティング
* Cookie ベースの セッション アフィニティ
* SSL オフロード と証明書管理
* 独自の カスタム ドメイン の定義
* Web Application Firewall (WAF) が統合されたアプリケーション セキュリティ
* URL リダイレクト による、HTTPS への HTTP トラフィックのリダイレクト
* URL 書き換え によるカスタム転送パス
* エンド ツー エンドの IPv6 接続と HTTP/2 プロトコル のネイティブ サポート

<br>

## Azure Front Door におけるセキュアな構成

Azure Front Door は上記の通り多くの機能を要しています。その中で、Azure Front Door の WAF (Web アプリケーション ファイアウォール) を利用いただければ、バックエンドに配置した Azure 仮想マシンや App Service 上の Web アプリケーションを、一般的な悪用や脆弱性を含んだリクエストから保護する構成がご利用いただけます。
<br>
Azure Front Door をご利用いただいているお客様からいただくご質問については、[Azure Front Door についてよく寄せられる質問](https://docs.microsoft.com/ja-jp/azure/frontdoor/front-door-faq) でご案内しておりますが、このブログではその中でもよくお問い合わせいただく、[バックエンドへのアクセスを Azure Front Door のみにされたい構成](https://docs.microsoft.com/ja-jp/azure/frontdoor/front-door-faq#how-do-i-lock-down-the-access-to-my-backend-to-only-azure-front-door) について、ご紹介いたします。

<br>

## Azure Front Door で用いられる IP アドレス FAQ

Azure Front Door では、クライアントがAzure Front Door に接続するためのパブリック IP アドレスと、Azure Front Door からバックエンドのリソースに接続する際に用いられるパブリック IP アドレスは異なります。
Azure Fornt Door で用いられるパブリック IP アドレスは、[Azure IP 範囲とサービス タグ](https://www.microsoft.com/en-us/download/details.aspx?id=56519) で公開されています。
Azure Front Door が、バックエンドに構成されたリソースに接続する際のパブリック IP アドレスは、「AzureFrontDoor.Backend」セクションで公開されており、このパブリック IP アドレスの範囲の中から任意の IP アドレスが用いられます。
<br>
そのため、例えばバックエンドに Azure 仮想マシンを配置されている構成であれば、NSG のサービス タグで「AzureFrontDoor.Backend」からの HTTP/HTTPS 通信のみ許可することで、Azure Front Door のパブリック IP アドレス以外からの HTTP/HTTPS 接続を許可しない構成が可能です。

<br>

## Azure Front Door の固有のリソース ID

Azure Front Door では、お客様のリソースに固有の ID 割り当てられており、バックエンドへの通信時の HTTP ヘッダーに "X-Azure-FDID" として追加されます。
IP アドレスでの制御に加えて、この HTTP ヘッダー "X-Azure FDID" を、バックエンドに配置したアプリケーション上でフィルター処理することで、構成いただいた Azure Front Door からの接続のみに限定することが可能です。
<br>
Azure Front Door のリソース ID は、Azure ポータルの Azure Front Door リソースの 概要 にある "フロント ドア ID" から確認できます。
コマンドであれば、下記のコマンドから "frontdoorId" を確認できます。
<br>

[Azure PowerShell (Get-AzFrontDoor)](https://docs.microsoft.com/ja-jp/powershell/module/az.frontdoor/get-azfrontdoor?view=azps-5.7.0)
<br>
[Azure CLI (az network front-door show)](https://docs.microsoft.com/ja-jp/cli/azure/ext/front-door/network/front-door?view=azure-cli-latest#ext_front_door_az_network_front_door_show)

<br>

## App Service における制限設定

Azure Front Door のバックエンドに App Service を配置している構成においては、上記で案内したパラメータを用いて、App Service の機能を用いてアクセス制限を構成することが可能です。
具体的な設定方法については、[Azure App Service のアクセス制限を設定する](https://docs.microsoft.com/ja-jp/azure/app-service/app-service-ip-restrictions#restrict-access-to-a-specific-azure-front-door-instance) で紹介しています。
<br>
設定値について抜粋すると下記の通りとなります。
<br>
* サービス タグにおいて、「AzureFrontDoor.Backend」を指定する
* X-Azure-FDIDにおいて、Azure Front Door の固有のリソース ID を指定する
<br>

![参考 : App Service での設定例](https://github.com/taminta/blog/blob/084f884cda60e0d9763f57cb419d7092d8b37b73/articles/network/AzureFronrtDoor-Lockdown/AzureFrontDoor-AppService-LockDown.png) 

<br>

## アプリケーション上のサンプル (IIS)

バックエンドの Web サーバー側での設定例として、web.config ファイルによる IIS (Internet Information Services) の構成設定例を以下にご案内いたします。お客様が構成された Web アプリケーションに適した形でご設定ください。
<br>
なお、Web サーバーやアプリケーション上での個別のフィルタリング方法については、お客様の構成範囲となりますため、Azure サポート担当では具体的なご支援ができない点はご理解いただきますようお願い申し上げます。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="Filter_X-Azure-FDID" patternSyntax="Wildcard" stopProcessing="true">
                    <match url="*" />
                    <conditions>
                        <add input="{HTTP_X_AZURE_FDID}" pattern="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" negate="true" />
                    </conditions>
                    <action type="AbortRequest" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

<br>

本ブログが皆様のお役に立てれば幸いです。