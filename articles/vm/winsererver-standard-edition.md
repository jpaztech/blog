---
title: Azure VM での Windows Server Standard Edition 利用について
date: 2024-08-15 12:00:00
tags:
  - Information
  - VM
  - Windows
disableDisclaimer: false
---

こんにちは。Azure テクニカル サポート チームです。
本ブログ記事では、Azure VM での Windows Server Standard Edition の利用についてご案内いたします。

<!-- more -->
Azure マーケットプレイスでは、上位エディションである Datacenter Edition / Datacenter: Azure Edition が同じ利用料金で提供されておりますため、Standard Edition のご提供がございません。

もし Standard Edition の利用をされたいといった場合は、オンプレミス環境から既に所有している Standard Editionを持ち込むことも可能ではございます。
この場合は、以下のように VHD の準備が必要となります。

■ご参考：Azure にアップロードする Windows VHD または VHDX を準備する
[https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/prepare-for-upload-vhd-image](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/prepare-for-upload-vhd-image)

上記の通り、Standard Edition を利用したとしても、料金の差異は無く、上位エディションの Datacenter Edition / Datacenter: Azure Editionがマーケットプレイスより、ご利用可能ですので、こちらの利用をご検討いただけますと幸いです。

Windows Server エディションごとの機能の比較は以下のドキュメントを参考にしてください。

■ご参考 : Windows Server のエディションの比較 | Microsoft Learn
[https://learn.microsoft.com/ja-jp/windows-server/get-started/editions-comparison?pivots=windows-server-2022](https://learn.microsoft.com/ja-jp/windows-server/get-started/editions-comparison?pivots=windows-server-2022)

簡単ではございますが、上記の内容がお客様のお役に立ちますと幸いでございます。

