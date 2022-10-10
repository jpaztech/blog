---
title: アンマネージド ディスクを使用している仮想マシンのマネージド ディスクへの移行について
date: 2022-10-11 12:00:00
tags:
  - VM
  - Managed Disk
---

こんにちは、Azure サポートチームの木下です。
今回は、度々お問い合わせいただきます、アンマネージド ディスク (非管理ディスク) を使用している仮想マシンのマネージド ディスク (管理ディスク) への移行についてご紹介いたします。
<!-- more -->
---
2017 年にマネージド ディスク (管理ディスク) がリリースされて以降、マネージド ディスクの機能強化が行われてきました。今後もマネージド ディスクの機能向上に備えるため、2022 年 9 月 30 日以降、アンマネージド ディスクは非推奨となり、2025 年 9 月 30 日をもちまして廃止が予定されております。

> [!IMPORTANT]
> Azure の更新情報や TrackingID: JTP9-JD0 にて周知されている情報となります。
>  参考）Azure unmanaged disks will be retired on 30 September 2025
> https://azure.microsoft.com/ja-jp/updates/azure-unmanaged-disks-will-be-retired-on-30-september-2025/

上記の通り、2025 年 9 月 30 日以降、アンマネージド ディスクを使用している仮想マシンは利用できなくなりますので、この期日までにアンマネージド ディスクを使用している仮想マシンをマネージド ディスクへ移行する必要がございます。

> [!NOTE]
>Azure 更新情報 URL 内に記載の "Page blobs will not be affected by this change." の箇所につきまして補足させていただきます。
>アンマネージド ディスクの仮想マシンでは、VHD ファイルを Azure Storage 内に ページ BLOB として格納し、アンマネージド ディスクとして仮想マシンで利用しております。
>今回アンマネージド ディスクは 2025 年 9 月 30 日をもって廃止となり、アンマネージド ディスクを使用している仮想マシンは利用できなくなりますが、Azure Storage 内に格納されているページ BLOB 自体には影響はございませんのでこの点はご安心くださいませ。

お客様のご利用の環境において、アンマネージド ディスクを使用した仮想マシンが存在するのかどうかを確認し、存在する場合は計画的にマネージド ディスクへの移行を行いましょう。

## 1. アンマネージド ディスクを使用している仮想マシンが存在するかの確認

アンマネージド ディスクを使用している仮想マシンが存在するかどうかは Azure Portal や Azure CLI でご確認いただくことができます。

▼Azure Portal を使用する場合 

[Azure Portal] > [仮想マシン (Virtual Machines)] ＞ [ビューの管理] > [列の編集] をクリックします。

![](./unmanaged-disk-retired/01.png)

[+ 列の追加] をクリックします。

![](./unmanaged-disk-retired/02.png)

[マネージド ディスクを使用する] を選択し、保存します。

![](./unmanaged-disk-retired/03.png)

[マネージド ディスクを使用する] の項目が追加されます。

![](./unmanaged-disk-retired/04.png)

マネージド ディスクを使用している場合は「はい」、アンマネージド ディスクを使用している場合は「いいえ」と表示されます。
この項目が「いいえ」の場合、アンマネージド ディスクを使用した仮想マシンとなりますので、マネージド ディスクへの移行が必要であるとご判断いただくことが可能です。

▼Azure CLI を使用する場合
コマンド例
```sh
$ vmids=$(az vm list --query [].id -o tsv)
$ az vm show --ids $vmids --query "[].{vmname:name, rgname:resourceGroup, unmanageddisk:storageProfile.osDisk.vhd.uri}" -o table
Vmname    Rgname    Unmanageddisk
--------  --------  ----------------------------------------------------
testvm01  testrg01
testvm02  testrg02  https://sample.blob.core.windows.net/vhds/sample.vhd
```
[Unmanageddisk] 項目に VHD ファイルの URL が表示されている仮想マシンは、マネージド ディスクを使用した仮想マシンとなります。

## 2. マネージド ディスクへの移行方法

マネージド ディスクへの移行方法や注意事項については以下公開情報にておまとめしておりますのでご参考ください。

参考）
- [Windows 仮想マシンをアンマネージド ディスクからマネージド ディスクに移行する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/convert-unmanaged-to-managed-disks)
- [Linux 仮想マシンをアンマネージド ディスクからマネージド ディスクに移行する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/convert-unmanaged-to-managed-disks)

## 3. マネージド ディスクを利用することの利点や価格

マネージド ディスクをご利用いただくことによって得られる利点や価格に関しましては以下におまとめしておりますので、必要に応じてこちらもご参照ください。

参考）
- [マネージド ディスクの利点](https://learn.microsoft.com/ja-jp/azure/virtual-machines/managed-disks-overview#benefits-of-managed-disks)
- [Managed Disks の価格](https://azure.microsoft.com/ja-jp/pricing/details/managed-disks/)
- [Unmanaged Disk Azure ページ BLOB の価格](https://azure.microsoft.com/ja-jp/pricing/details/storage/page-blobs/)

マネージド ディスクは、ディスク リソースとしてプロビジョニングされたディスク サイズに対して課金が発生いたしますが、アンマネージド ディスクは、ページ BLOB として課金が発生いたします。

本稿が皆様のお役に立てれば幸いです。
