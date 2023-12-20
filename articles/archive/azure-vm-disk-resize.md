---
title: 仮想マシンのディスク サイズを Azure PowerShell から拡張する方法
date: 2016/04/18 16:18:51
tags:
  - Archive
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは。Azure サポートの宇田です。
今回は Azure 仮想マシンのディスク サイズを変更する方法についてご紹介します。

## クラシック (ASM) 環境の場合

クラシック環境の場合には、仮想マシンを停止したうえで Azure PowerShell から以下のように実行します。

<pre># 仮想マシン情報を取得します
$VmConfig = Get-AzureVM -ServiceName "<クラウド サービス名>" -Name "<仮想マシン名>"

# OS ディスクを1023 GB へ拡張します
Update-AzureDisk -DiskName $VmConfig.VM.OSVirtualHardDisk.DiskName -ResizedSizeInGB 1023 -Label "<ディスク ラベル>"

# 1 つ目のデータ ディスクを1023 GB へ拡張します
Update-AzureDisk -DiskName $VmConfig.VM.DataVirtualHardDisks[0].DiskName -ResizedSizeInGB 1023 -Label "<ディスク ラベル>"

# 2 つ目のデータ ディスクを1023 GB へ拡張します
Update-AzureDisk -DiskName $VmConfig.VM.DataVirtualHardDisks[1].DiskName -ResizedSizeInGB 1023 -Label "<ディスク ラベル>"</pre>

## リソース マネージャー (ARM) 環境で非管理ディスクの場合

リソース マネージャー環境かつ非管理ディスクを使用している場合、管理ポータルもしくは Azure PowerShell から以下のように実行します。

<pre># 仮想マシン情報を取得します
$VmConfig = Get-AzureRmVM -Name "<仮想マシン名>" -ResourceGroupName "<リソース グループ名>"

# OS ディスクを1023 GB へ拡張します
$VmConfig.StorageProfile.OSDisk.DiskSizeGB = 1023

# 1 つ目のデータ ディスクを1023 GB へ拡張します
$VmConfig.StorageProfile.DataDisks[0].DiskSizeGB = 1023

# 2 つ目のデータ ディスクを1023 GB へ拡張します
$VmConfig.StorageProfile.DataDisks[1].DiskSizeGB = 1023

# 最後に変更を適用します
Update-AzureRmVM -ResourceGroupName "<リソース グループ名>" -VM $VmConfig</pre>

## リソース マネージャー (ARM) 環境で、管理ディスクの場合

リソース マネージャー環境かつ管理ディスクを使用している場合、管理ポータルもしくは Azure PowerShell から以下のように実行します。

<pre># 管理ディスクを1023 GB へ拡張します
 New-AzureRmDiskUpdateConfig -DiskSizeGB 1023 | Update-AzureRmDisk -ResourceGroupName "<リソース グループ名>" -DiskName "<ディスク名>"</pre>

## サイズ変更時の留意点

上記のような方法でサイズ変更を頂くにあたり、以下の様な点にご留意を頂ければと思います。

* 事前に仮想マシンを停止したうえでサイズ変更をご実施ください
(停止していない場合、その旨のエラーが表示されます)
* 上記ではあくまでも Azure からみたディスク サイズを拡張しています
OS 内で認識されるサイズについては、別途パーティションの拡張をお願いいたします
* 拡張したディスクを再拡張することは可能ですが、縮小を行うことはできません
(どうしても縮小が必要な場合は、別の小さなディスクへコピーをお願いします)

**2017/11/14 更新 管理ディスクの場合について、手順を追記しました。**
