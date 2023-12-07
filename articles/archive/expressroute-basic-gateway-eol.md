---
title: ExpressRoute の Basic Gateway 提供終了について
date: 2016-12-08 13:25:21
tags:
  - Archive
  - Network
  - ExpressRoute
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは。Azure サポートの宇田です。

今回は先日アナウンスがありました、ExpressRoute の Basic Gateway の提供終了についてご案内いたします。

## ExpressRoute の Gateway について

Azure とオンプレミスを専用線で接続する ExpressRoute ですが、ネットワーク構成を図示すると以下のようになっています。

![](./expressroute-basic-gateway-eol/ExpressRoute.png)

図で MSEE (Microsoft Enterprise Edge) と書かれたルーターは、Azure データセンターの物理ルーターです。この MSEE については、通常お客様が意識する必要がありません。一方で VNet Gateway (VPN Gateway と記載する場合もあります) は、お客様の各仮想ネットワークに配置されるソフトウェア ルーターとなっており、実際には Azure 上の仮想インスタンスとして稼働しています。

この VNet Gateway ですが、ExpressRoute では性能によって以下 4 つのレベルが用意されています。

* Basic (基本): 既に新規作成いただくことは出来ません
* Standard (標準)
* High Performance (高性能)
* Ultra Performance

このうち最も低スペックの Basic レベル が今回提供を終了する対象となり、2016/10/15 以降から新規の作成が出来なくなっています。また 2017/10/15 をもってサポート終了となりますので、該当される方は後述の対処をご検討ください。

その他、ゲートウェイのレベル毎の性能や制限の具体的な差異については、以下ドキュメントをご確認ください。

* ExpressRoute 用の仮想ネットワーク ゲートウェイについて
https://docs.microsoft.com/ja-jp/azure/expressroute/expressroute-about-virtual-network-gateways

## Basic Gateway が提供終了となる背景

さて、本題の Basic レベル提供終了についてですが、これは同じく発表された ExpressRoute の SLA 向上 (99.9 % -> 99.95 %) と強く関連しています。

* ExpressRoute の SLA
https://azure.microsoft.com/ja-jp/support/legal/sla/expressroute/v1_1/

Azure では日々機能の追加を行っているだけではなく、内部的に細かな品質改善や修正を重ねており、そうした積み重ねを受けて、今回 ExpressRoute の SLA を 99.95 % へと引き上げるに至りました。ただ、アーキテクチャ上 Basic レベルについてのみは、Gateway が Active – Standby 構成であり、Standard 以上のレベルのように Active – Active 構成とはなっていません。(このため、価格が Standard 以上と比較して圧倒的に安くなっています)

こうした内部的なアーキテクチャの差異によって、Gateway のメンテナンス作業時などに Basic レベルでは Standard 以上のレベルをご利用の場合と比較して、長時間 (数分程度) の通信断が発生していました。しかしながら、数分に及ぶ通信断はお客様にとっては許容しづらいものであり、これまで私たちサポートへ多くお問い合わせをいただく要因ともなっておりました。

こうした経緯もあり、今回 ExpressRoute の SLA を向上させると同時に、多くのお客様により高い信頼性で ExpressRoute をご利用いただくため、Basic レベルが廃止されることとなりました。既に Basic レベルにて ExpressRoute をご利用中のお客様にはご心配とお手数をお掛けしますが、何卒ご理解をいただければと思います。

以下、現在ご利用中の Gateway レベルの確認方法ならびに、Basic レベルをご利用の場合の対処方法について、具体的にご案内します。

## 利用中の Gateway レベルを確認する方法

現在ご利用中の Gateway レベルを確認するには、Azure PowerShell より以下の通り実行ください。

### クラシック モデルでのレベル確認方法

<pre>1. Azure PowerShell を起動します。

2. 以下のコマンドで、管理者アカウントでサインインします。
Add-AzureAccount

3. 操作対象のサブスクリプションを明示的に指定します。
Select-AzureSubscription -SubscriptionId "<サブスクリプション ID>"

4. ゲートウェイの情報を取得します。
Get-AzureVNetGateway -VNetName "<仮想ネットワーク名>"

5. 実行結果の "GatewaySKU" より現在の Gateway レベルを確認します。

- 出力結果例

LastEventData        :
LastEventTimeStamp   : 2016/11/10 16:51:41
LastEventMessage     : Maintenance completed for the gateway for the
following virtual network:
LastEventID          :
State                : Provisioned
VIPAddress           : XX.XX.XX.XX
DefaultSite          :
GatewaySKU           : Default <<<<< Default もしくは Basic の場合、今回の提供終了の対象です。
OperationDescription : Get-AzureVNetGateway
OperationId          : 763a7a7e-aeae-3487-8622-5db01ceccdf1
OperationStatus      : Succeeded</pre>

### リソース マネージャー モデルでのレベル確認方法

<pre>1. Azure PowerShell を起動します。

2. 以下のコマンドで、管理者アカウントでサインインします。
Login-AzureRmAccount

3. 操作対象のサブスクリプションを明示的に指定します。
Select-AzureRmSubscription -SubscriptionId "<サブスクリプション ID>"

4. 以下のコマンドでゲートウェイの状態を取得します。
Get-AzureRmVirtualNetworkGateway -Name "<ゲートウェイ名>" -ResourceGroupName "<リソース グループ名>"

5. 上述のコマンドで出力された結果にある SkuText にある、Name の値が Gateway レベルになります。

- 実行結果例 （抜粋）
==========================================================
SkuText                    : {
                               "Capacity": 2,
                               "Name": "Standard", <<<<< Default もしくは Basic の場合、今回の提供終了の対象です。
                               "Tier": "Standard"
                             }
===========================================================</pre>

## Basic レベルをご利用の場合に必要な対応

現在 Basic レベルをご利用の場合、2017/10/15 以降はサポートが提供されません。このため、Gateway を Standard 以上のレベルへ変更いただけますようお願いいたします。

### クラシックモデルでの Gateway レベル変更手順

<pre>1. Azure PowerShell を起動します。

2. 以下のコマンドで、管理者アカウントでサインインします。
Add-AzureAccount

3. 操作対象のサブスクリプションを明示的に指定します。
Select-AzureSubscription -SubscriptionId "<サブスクリプション ID>"

4. 以下のコマンドで Standard へ変更します。
Resize-AzureVNetGateway -VNetName "<仮想ネットワーク名>" -GatewaySKU Standard</pre>

## リソース マネージャー モデルでの Gateway レベル変更手順

<pre>1. Azure PowerShell を起動します。

2. 以下のコマンドで、管理者アカウントでサインインします。
Login-AzureRmAccount

3. 操作対象のサブスクリプションを明示的に指定します。
Select-AzureRmSubscription -SubscriptionId "<サブスクリプション ID">

4. 以下のコマンドでゲートウェイ情報を取得し、変数に格納します。
$gateway = Get-AzureRmVirtualNetworkGateway -Name "<ゲートウェイ名>" -ResourceGroupName "<リソース グループ名>"

5. 以下のコマンドで、レベルを Standard に変更します。（コマンド完了まで 数分程度お時間を要します）
Resize-AzureRmVirtualNetworkGateway -VirtualNetworkGateway $gateway -GatewaySku Standard</pre>

## その他、本件に関連する FAQ

本件に関連して、これまで弊社サポートにお問い合わせいただいたご質問と回答を以下にご案内いたします。

### Q1. Basic レベルを利用している場合、2017/10/15を過ぎたらどうなるの？

A1. 期日までに Standard レベルへ変更しない場合であっても、Basic レベルのまま動作する予定となります。ただし、2017/10/16 以降はサポート提供が終了し、SLA の提供も終了となります。このため、Standard 以上のレベルへの変更を強く推奨いたします。

### Q2. レベル変更を行う際の影響は？

A2. 前述の Azure PowerShell によるレベル変更にあたっては、Gateway インスタンスの再生成と切り替えが伴いますので、短時間 (数分程度) の通信断が発生いたします。

### Q3. Basic から Standard への変更に伴う費用は？

A3. VNet Gateway の価格については、以下をご参照ください。

* *VPN Gateway の価格
https://azure.microsoft.com/ja-jp/pricing/details/vpn-gateway/

### Q4. VPN の Basic レベルも提供終了するの？

A4. 今回の対象は ExpressRoute 用の Basic レベルのみです。VPN については引き続き Basic レベルをご利用いただけます。

本情報の内容（添付文書、リンク先などを含む）は、作成日時点でのものであり、予告なく変更される場合があります。
