---
title: Azure Front Door (クラシック) と Azure CDN from Standard (Microsoft CDN クラシック) のマネージド証明書のプロビジョニングに関する通知について
date: 2025-07-16 17:30:00 
tags:
  - Network
  - AzureFrontDoor
  - AzureCDN
---

こんにちは。Azure テクニカル サポート チームの藤原です。

本ブログでは、Azure Front Door (クラシック) と Azure CDN from Standard (Microsoft CDN クラシック) のマネージド証明書のプロビジョニングの通知についてご案内いたします。

これ以降、Azure Front Door (クラシック) は **AFD クラシック**、Azure CDN from Standard (Microsoft CDN クラシック) は **Azure CDN クラシック** と記載します。

AFD クラシックの通知は `2S01-LF0` という ID で通知され、Azure CDN クラシックは `7NL5-R_8` という ID で通知されています。これ以降 2 つの通知のことを **本通知** と記載します。

---

## CNAME ベースのドメインコントロール検証が廃止されます

本通知では AFD クラシックと Azure CDN クラシックにおいて CNAME を使用したドメインコントロール検証 (DCV) が廃止されることをお知らせしています。これは業界全体で進められている DCV 廃止の一環です。
 
これを受けて 2025 年 8 月 15 日以降、AFD クラシックと Azure CDN クラシックにおいて、既存のプロファイルにおいてカスタムドメインを追加することと、既存カスタムドメインの証明書を BYOC からマネージド証明書に切り替えることができなくなります。

---

## マネージド証明書のご利用期限について

本通知では、既存のカスタムドメインで使用されているマネージド証明書が自動更新されることもお知らせしています。  

自動更新された後のマネージド証明書の有効期間は **12 ヶ月** であり、**2026 年 7 月 1 日まで** はご利用いただけます。

**2026 年 7 月 1 日以降はマネージド証明書の有効期限が切れます** ので、それまでに **BYOC への切り替え** をお願いいたします。

マネージド証明書から BYOC への切り替え方法については以下のドキュメントをご参照ください。

- [Azure Front Door (クラシック) カスタム ドメインで HTTPS を構成します](https://learn.microsoft.com/ja-jp/azure/frontdoor/front-door-custom-domain-https?tabs=powershell)
- [チュートリアル: Azure CDN カスタム ドメインで HTTPS を構成する](https://learn.microsoft.com/ja-jp/azure/cdn/cdn-custom-ssl?toc=%2fazure%2ffrontdoor%2ftoc.json&tabs=option-1-default-enable-https-with-a-cdn-managed-certificate)

---

## マネージド証明書を使用しているかどうかを確認する方法

AFD クラシック リソースの **Front Door デザイナー** を開き、"フロントエンドまたはドメイン" に表示されているカスタム ドメインをクリックします。

画面の右ペインに表示された **[証明書の管理の種類]** で「**管理されているフロント ドア**」が選択されている場合は、**マネージド証明書を利用しています**。

![](./afd-classic-azure-cdn-managed-cert-provisioning/how-to-check-your-managed-cert.png)

<p align="center">マネージド証明書の確認方法</p>
---

## 新しくプロファイルやカスタムドメインを作成する場合について

本通知でお知らせした内容により、**2025 年 8 月 15 日以降** AFD クラシックと Azure CDN クラシックにおいて新たなプロファイルが作成できなくなり、既存プロファイルにおいてカスタムドメインを追加できなくなります。

新たなプロファイルの作成や既存プロファイルにおいてカスタムドメインの追加を検討されている場合は、**Azure Front Door Standard** もしくは **Premium** への移行をご検討ください。

移行についてのドキュメントは以下をご参照ください。

- [Azure Front Door (クラシック) から Standard または Premium レベルに移行する](https://learn.microsoft.com/ja-jp/azure/frontdoor/migrate-tier)
- [Azure CDN from Microsoft (クラシック) から Azure Front Door への移行について](https://learn.microsoft.com/ja-jp/azure/cdn/tier-migration?toc=%2fazure%2ffrontdoor%2ftoc.json)

---

## AFD クラシックと Azure CDN クラシックの廃止時期について

本通知ではお知らせしていませんが、**AFD クラシックは 2027 年 3 月 31 日に廃止** される予定になっています。  

**Azure CDN クラシックの廃止時期は 2027 年 9 月 30 日** です。

廃止に関するドキュメントは以下をご参照ください。

- [Azure Front Door (classic) will be retired on 31 March 2027](https://azure.microsoft.com/en-us/updates?id=azure-front-door-classic-will-be-retired-on-31-march-2027)
- [Retirement: Azure CDN Standard from Microsoft (classic) will be retired on September 30th, 2027](https://azure.microsoft.com/en-us/updates?id=Azure-CDN-Standard-from-Microsoft-classic-will-be-retired-on-30-September-2027)
