---
title: "ExpressRoute の Monthly Prefix Updates に関して"
date: 2020-09-01 10:30:00
tags:
  - Network
  - ExpressRoute
  - Public Peering
  - Microsoft Peering
  - Maintenance
---

こんにちは。Azure サポートの宇田です。

今回は月次で行われている Public / Microsoft Peering の経路更新のメンテナンスについてご紹介します。

## はじめに
ExpressRoute 回線に紐づく Azure サブスクリプションでは、Service Health にて概ね月に一度の頻度で「Important Information Regarding Your ExpressRoute Service」といったタイトルの通知が行われております。こちらの内容について、技術サポートまでお問い合わせいただく事が多いため、今回は改めてブログでも詳細や影響についてご紹介いたします。

### 通知メールの例
(本文中の TRACKING ID や日時、経路数はその都度異なります)

![通知メールのサンプル](./ExpressRoutePrefixRollout/ExpressRoutePrefixRollout1.png)

## 本通知の内容について
Public / Microsoft Peering をご利用の場合、弊社側からプロバイダー様やお客様のルーターに対し、BGP で Azure (および Office 365 等) で使用される Public IP の経路情報を広報しています。(下図参照)

Azure や Office 365 で利用される Public IP は、Azure リージョンの追加や、各リージョンの Public IP アドレスの利用状況 (需給バランス) に応じて追加・変更が生じるため、ExpressRoute の Public / Microsoft Peering で広報される経路情報にも随時変更が生じることになります。

Service Health での通知は、そうした経路情報の変更が発生することを念のためお知らせするものとご認識いただければと思います。

![Microsoft 側から広報される経路情報](./ExpressRoutePrefixRollout/ExpressRoutePrefixRollout2.png)

## 影響有無について
弊社側から広報する経路に変更が生じても、基本的にはお客様側で特別の作業は必要なく、ExpressRoute 経由の通信に影響は生じません。

ただし、プロバイダー様やお客様側のルーターにおいて、事前に定義してある経路情報しか受け取らないようなルートフィルター (ACL 等) の設定を明示的に行われている場合には、変更後の経路を受け取れなくなる可能性がございますのでお心当たりのあるお客様は十分ご留意ください。(こうした設定を行われているお客様は僅かと認識しておりますが、もしご心配な場合にはご契約いただいているプロバイダー様やお客様側のルーターで Reject している経路がないかを念のためご確認いただければと思います。)

## 最後に
今回ご紹介した Prefix Update のメンテナンスは、ここ最近で始まったわけではなく、数年前から月次で実施されているものになります。したがって、冒頭に載せたようなメンテナンスの通知メールを受領したとしても、基本的には全く焦る必要はありません。上記の内容を正しくご理解いただいた上で、「毎月恒例のやつだな」と思っていただければ幸いです。
