---
title: Azure CDN Microsoft Standard SKU (クラシック) のリタイアについて
date: 2024-09-30 23:00:00 
tags:
  - Network
  - AzureCDN
---

こんにちは。Azure テクニカル サポート チームの石原です。

本ブログでは、Azure CDN Microsoft Standard SKU (クラシック) のリタイアのアナウンスと Azure Front Door Standard 及び Premium への移行方法に関する情報をご案内致します (以降は Azure Front Door を AFD と、Azure CDN Microsoft Standard SKU を MS CDN と記載致します)。

<!-- more -->

---

## MS CDN (クラシック) のリタイアについて

2027 年 9 月 30 日に MS CDN (クラシック) の提供が終了し、MS CDN (クラシック) に対するサポートも終了します。
提供終了までの間は既存の MS CDN (クラシック) の設定を変更することは可能ですが、2025 年 10 月 1 日以降は Azure ポータル、Terraform、Azure PowerShell や Azure CLI などを使用して新しい MS CDN (クラシック) リソースが作成できなくなります。
アナウンス内容につきましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Retirement: Azure CDN Standard from Microsoft (classic) will be retired on September 30th, 2027](https://azure.microsoft.com/en-us/updates/v2/Azure-CDN-Standard-from-Microsoft-classic-will-be-retired-on-30-September-2027)

> [!注意]
> なお、記事には誤りがあり、2025 年 10 月 1 日以降も既存の MS CDN (クラシック) のリソースは更新できます。
>

## MS CDN (クラシック) のリタイアに関する FAQ

MS CDN (クラシック) のリタイアに関するよくある質問につきましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Azure CDN Standard from Microsoft (クラシック) の廃止に関する FAQ](https://learn.microsoft.com/ja-jp/azure/cdn/classic-cdn-retirement-faq)


## MS CDN (クラシック) から AFD Standard/Premium への移行方法について

MS CDN (クラシック) の提供が終了する 2027 年 9 月 30 日までに、事前にお客様にて AFD Standard/Premium へ移行する必要がございます。
MS CDN (クラシック) から AFD Standard/Premium にゼロ ダウンタイムで移行するプロセスや手順に関しましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Microsoft Azure CDN (クラシック) を Standard/Premium レベルに移行する](https://learn.microsoft.com/ja-jp/azure/cdn/migrate-tier)
