---
title: ExpressRoute の Public Peering と Microsoft Peering に関するアナウンス
date: 2018-03-02 09:45
tags:
  - Archive
  - Network
  - ExpressRoute
---

> [!WARNING]
> 本記事は、投稿より時間が経過しており、<strong>内容が古い可能性があります。</strong>
>
> 最新の情報については、<strong>以下の公式ドキュメントをご参照ください。</strong>
>
> [パブリック ピアリングを Microsoft ピアリングに移行する](https://learn.microsoft.com/ja-jp/azure/expressroute/how-to-move-peering)


ExpressRoute の Public Peering と Microsoft Peering に関するアナウンスが発表されました。

今回アナウンスされたのは、2018 年 4 月 1 日以降に Public Peering を新規に構築する際の、手順や構成の変更についてです。ピアリングの種別にかかわらず、既存でご利用の ExpressRoute 回線に対する影響は現時点で予定されておりません。突然、英語でアナウンスが送信されたため、なにか対処しなければならないのかと、ご心配いただいているお客様もいらっしゃるかと思いますが、その点はご安心ください。

今回アナウンスされた内容について、もう少し噛み砕いてご説明させていただきますので、参考にしていただければと思います。

<!-- more -->

## アナウンスの背景

従来、Public Peering と Microsoft Peering は以下のとおり役割が分かれており、互いに包含関係はありませんでした。

- Public Peering: Azure PaaS (SQL Database、Azure Storage など) へのアクセス
- Microsoft Peering: Office 365、Dynamics 365 へのアクセス

しかし、中長期的なアーキテクチャを検討する中で、Public Peering については、Microsoft Peering へ統合する方針となりました。統合を進めるにあたっては、以下の 2 つの課題をクリアする必要がありました。

#### 1. そもそも Microsoft Peering は PaaS へのアクセスに対応していない

上記のとおり、従来は Public Peering とMicrosoft Peering で対応サービスが分かれておりましたので、まずは、Microsoft Peering でも PaaS へアクセスをカバーできるようにする必要がありました。しかし、Microsoft Peering で PaaS 向けの経路情報も広報してしまうと、経路数が多くなりすぎるなどの問題があり、そのままの仕組みでは実現ができませんでした。

これを受けて、ルート フィルターという機能が、先日新たにリリースされました。ルート フィルターは、Microsoft Peering において、マイクロソフト側からプロバイダーのルーターに対して、どのサービス・どのリージョンへの経路を広報するかを、選択できるようにする機能です。ルート フィルターによって、たとえば Office 365 の中でも、Exchange Online のみ、Skype for Business のみ、など経路を選択できるようになり、Microsoft Peering 自体の機能も強化されましたが、この仕組みをさらに拡張し、PaaS 向けの経路も選択できるようになりました。

ルート フィルターによって Microsoft Peering で PaaS へのアクセスを実現する構成は、すでに可能になっています。Public Peering も引き続き構成可能なため、つまり 2018 年 3 月 2 日現在、PaaS へのアクセスを実現するピアリングとしては、Public Peering と Microsoft Peering の両方が選択できる状況です。

#### 2. Microsoft Peering を利用するには Premium Add-on が必要

Microsoft Peering には、「Premium Add-on が有効な回線でのみ構成できる」という制約があります。Public Peering では、このような制約はありません。

この制約を残したまま、Public Peering の代わりに Microsoft Peering をご利用いただこうとすると、Public Peering であれば Premium Add-on が必要なかったのに、Premium Add-on が必要になってしまいます。Premium Add-on は有料の追加オプションですので、ExpressRoute 回線の費用が上がるということが発生します。この課題は、解決されておりませんでした。

## 今回アナウンスされた内容

上記 2. の課題の解決のため、2018 年 4 月 1 日以降、Premium Add-on を有効にしなくても、Microsoft Peering を構成してルート フィルターを適用することができるようになりました。これによって、Public Peering 相当の機能を Microsoft Peering でカバーできるようになりました。

代わりに、2018 年 4 月 1 日以降は、Public Peering をあらたに構築することはできなくなりますので、ExpressRoute 経由で PaaS をご利用いただく場合、Microsoft Peering の構築が必須になります。この変更が、今回アナウンスされた内容でございます。

## 本件に関する FAQ

#### 既存の Public Peering が利用できなくなる予定はあるか。

~~現時点では、既存で稼働している Public Peering の利用停止は予定されておらず、引き続きサポートされます。~~

<strong><span style="color: red; ">2023 年 4 月 25 日更新</span></strong> - Public Peering は、2024/03/31 に廃止される予定です。

[Retirement notice: Migrate from Public Peering by March 31, 2024](https://azure.microsoft.com/ja-jp/updates/retirement-notice-migrate-from-public-peering-by-march-31-2024/)

#### Microsoft Peering の利用にはマイクロソフトの事前承認が必要だったはずだが、PaaS へのアクセスを実現するためにも、承認が必要なのか。

Microsoft Peering を構築し、PaaS へアクセスするだけであれば、事前承認は必要になりません。事前承認は、「Office 365 へのアクセスを有効化するルート フィルターを適用する」場合に必要になります。
Office 365 は利用せず、単に Public Peering の代替として Microsoft Peering を利用する場合は、承認は必要ありません。

#### Premium Add-on は必要なくなるのか。

引き続き、以下のケースでは Premium Add-on が必要になります。

- ルート フィルターで、Office 365 の経路を有効化する場合 (Microsoft Peering)
- ルート フィルターで、他の地理的リージョン (*1) の経路を有効化する場合 (Microsoft Peering)
- 他の地理的リージョンの仮想ネットワークを接続する場合 (Private Peering)

(*1) たとえば ExpressRoute 回線を東京で作成した場合、東日本・西日本リージョンは、同じ地理的リージョンです (回線を大阪で作成した場合も同様です)。東南アジアなど、日本国外は、異なる地理的リージョンということになります。

## 参考資料

[ExpressRoute 回線のピアリングの作成と変更を行う](https://docs.microsoft.com/ja-jp/azure/expressroute/expressroute-howto-routing-portal-resource-manager#msft)

Microsoft Peering の構築方法が説明されております。

[Microsoft ピアリングにルート フィルターを構成する: Azure Portal](https://docs.microsoft.com/ja-jp/azure/expressroute/how-to-routefilter-powershell)

ルート フィルターの設定方法が説明されております。
