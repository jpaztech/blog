---
title: Azure VM での Windows Server Standard Edition 利用について
date: 2024-09-10 17:31:00
tags:
  - VM
  - Windows
---

こんにちは。Azure テクニカル サポート チームの富田です。
本ブログ記事では、Azure VM での Windows Server Standard Edition の利用についてご案内いたします。

<!-- more -->
Azure マーケット プレイスでは、Windows Server の Datacenter Edition (Azure Edition を含む) の提供はありますが、Standard Edition の提供はありません。
 
もし Standard Edition の利用をされたいといった場合は、オンプレミス環境から既に所有している Standard Edition の VHD やイメージをお持ちいただくことでご利用いただくことが可能となります。
VHD の準備方法については以下となります。

■ご参考：Azure にアップロードする Windows VHD または VHDX を準備する
[https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/prepare-for-upload-vhd-image](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/prepare-for-upload-vhd-image)

なお、Standard Edition を利用したとしても Datacenter Edition を利用したとしても、Windows Server VM にかかる料金に差異はありません。上位エディションの Datacenter Edition (Azure Edition を含む) がマーケット プレイスより利用可能ですので、特別な事情がない限り、これらの利用をご検討いただけますと幸いです。

Windows Server エディションごとの機能の比較は以下のドキュメントを参考にしてください。

■ご参考 : Windows Server のエディションの比較 | Microsoft Learn
[https://learn.microsoft.com/ja-jp/windows-server/get-started/editions-comparison?pivots=windows-server-2022](https://learn.microsoft.com/ja-jp/windows-server/get-started/editions-comparison?pivots=windows-server-2022)

簡単ではございますが、上記の内容が皆様のお役に立ちますと幸いでございます。

