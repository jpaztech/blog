---
title: ExpressRoute の Public Peering の構成変更について
date: 2016-11-10 11:14
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


皆さん、こんにちは。Azure サポートチームの平原です。本日は、ExpressRoute で通知が行われている Public Peering の構成変更のお知らせについてご案内いたします。


<!-- more -->

## 概要

2016年 3月に、Azure チームより以下の通知が対象のお客様宛にご連絡されました。

> As of March 7, 2016, we now limit connectivity to services accessible through Azure public peering only from public IP addresses. Existing circuits can continue to access services available through Azure public peering using private IP addresses until August 22, 2016, after which they must begin using public IP addresses.

本来、Public Peering を通して Azure の各 PaaS サービスに接続する際には、パブリック IP が必要になりますが、現在は Azure ネットワーク側で NAT を設置することで、対応をしています。この変更の要点としては、この NAT 変換が Azure ネットワーク側で取り外されるため、お客様側で パブリック IP を用意し、各サービスに接続していただく必要があります。

また、上記では 8 月中旬に変更が行われる旨の記載がございますが、マイクロソフトおよび関係ベンダーとの調整により変更処理は延期されております。現在マイクロソフトでは、更新に向け作業を進めている状況です。

## 影響

この変更により、プライベートIPを用いて直接接続している場合には以下の影響があります。

- L2 接続プロバイダーをご利用の場合には、プライベート IP を用いて直接接続している場合には、Azure サービスへの接続に影響があります。
- L3 サービスプロバイダーをご利用の場合には、変更による影響を受ける可能性があります。そのため、ご利用のサービスプロバイダーにお問い合わせいただき、影響を受けるかどうかをご確認ください。

## 対処策

この変更に対応するためには、Azure  Public Peering をご利用の際に、パブリック IP をご利用いただいた上で、一般的な方法としては、NAT (Network Address Translation) もしくは PAT (Port Address Translation)  を使う方法です。詳細は、下記ドキュメントをご参照いただければ幸いです。

- ExpressRoute NAT の要件
https://azure.microsoft.com/ja-jp/documentation/articles/expressroute-nat/

- NAT をセットアップして管理するためのルーター構成のサンプル
https://azure.microsoft.com/ja-jp/documentation/articles/expressroute-config-samples-nat/


## 補足事項

現状 Public Peering をご利用の場合には、Azure ネットワーク内で NAT が構成され自動的に各種サービスに接続が行われています。各 Azure サービスでは、接続 IP に制限をかける「ファイアウォール」機能を持っている場合があります (SQL データベース等)。Azure 内の NAT 側で構成されるソース IP については、お客様側で確認ができないため、もし必要な場合には Azure サポートサービスまでお問い合わせください。
