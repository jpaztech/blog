---
title: Azure Front Door (クラシック) のリタイアについて
date: 2024-03-29 21:00:00 
tags:
  - Network
  - AzureFrontDoor
---

こんにちは。Azure テクニカル サポート チームの石原です。

本ブログでは、Azure Front Door (クラシック) のリタイアのアナウンスと Azure Front Door Standard 及び Premium への移行方法に関する情報をご案内致します (以降は Azure Front Door を AFD と記載致します)。

<!-- more -->

---

## AFD (クラシック) のリタイアについて

2027 年 3 月 31 日に AFD (クラシック) の提供が終了し、AFD (クラシック) に対するサポートも終了します。
提供終了までの間は既存の AFD (クラシック) の設定を変更することは可能ですが、2025 年 4 月 1 日以降は Azure ポータル、Terraform、Azure PowerShell や Azure CLI などを使用して新しい AFD (クラシック) リソースが作成できなくなります。
アナウンス内容につきましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Azure Front Door (classic) will be retired on 31 March 2027](https://azure.microsoft.com/ja-jp/updates/azure-front-door-classic-will-be-retired-on-31-march-2027/)


## AFD (クラシック) のリタイアに関する FAQ

AFD (クラシック) のリタイアに関するよくある質問につきましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Azure Front Door (classic) retirement FAQ](https://learn.microsoft.com/ja-jp/azure/frontdoor/classic-retirement-faq)


## AFD (クラシック) から AFD Standard/Premium への移行方法について

AFD (クラシック) の提供が終了する 2027 年 3 月 31 日までに、事前にお客様にて AFD Standard/Premium へ移行する必要がございます。
AFD (クラシック) から AFD Standard/Premium にゼロ ダウンタイムで移行するプロセスや手順に関しましては、下記の URL に記載がございますので、ご参考になれば幸いです。

[Azure Front Door (クラシック) から Standard/Premium に移行する](https://learn.microsoft.com/ja-jp/azure/frontdoor/migrate-tier)
