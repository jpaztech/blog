---
title: MAC アドレスの固定化

date: 2016-08-05 13:15:04
tags:
  - Archive
  - Network
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

更新 2017/7/26

例外的に、仮想マシンの内部 IP アドレスを固定している場合において、内部 IP アドレスを異なる固定 IP アドレスに変更した場合には、MAC アドレスの変更が生じます。

----------------------------------------------------

皆さんこんにちは、

暑い日が続きますが、水分補給をこまめにして夏を乗り切る予定の Azure サポート部の中垣内です。

今年の夏と言えば、オリンピックなど待ち遠しいイベントでいっぱいですね。待ち遠しいといえば Azure IaaS 上でのMAC アドレスの固定化機能が実装されました。また、これに伴い以下の Blog 記事で紹介しました割り当て解除の度に NIC 情報が増える事象も解消され、こまめにNIC 情報を削除するなどの作業は不要になっております。

皆様の熱いフィードバックにより実現できた機能ではありますので、重ねてお礼申し上げます。

-該当 Blog
Azure 仮想マシンにおける不要な NIC を削除する方法
https://jpaztech.github.io/blog/archive/delete-nic/
