---
title: Azure VM (ARM) の NIC 差し替えについて
date: 2016-09-14 16:11:16
tags:
  - Archive
  - Network
  - NIC
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

Azure サポートの宇田です。今回は ARM の Azure VM で、NIC を差し替える方法についてご紹介します。

[先日の記事](https://jpaztech.github.io/blog/archive/static-mac-address/)でもご紹介した通り、2016 年 8 月上旬より、Azure VM を割り当て解除にしても MAC アドレスが変更されないように動作が改善されました。これによって、いわゆる[ゴースト NIC が増える問題](https://jpaztech.github.io/blog/archive/delete-nic/)が解決されましたが、一方で VM 内で誤ってネットワーク周りの設定を変更してしまい、RDP 接続ができなくなった場合に、割り当て解除や再デプロイで対処を行うことが出来なくなっています。こうした場合には NIC を入れ替える方法が有効ですので、以下の方法で対処ください。

## 事前準備

NIC の差し替えはポータルから行うことが出来ませんので、Azure PowerShell から実施します。

このため、お手元に Azure PowerShell が利用できる環境をご用意ください。([設定方法](https://learn.microsoft.com/ja-jp/powershell/azure/install-azure-powershell))

## NIC の差し替え

<pre># 設定項目

$VmName = "<仮想マシン名>"
$ResourceGroupName = "<リソース グループ名>"
$VirtualNetworkName = "<仮想ネットワーク名>"
$SubnetName = "<サブネット名>"
$Location = "<リージョン名>"
$OldNicName = "<既存の NIC 名>"
$NewNicName = "<新規作成する NIC 名>"
$NewPublicIpAddressName = "<新規作成する Public IP 名>"

# 差し替える NIC (+ Public IP) を新規で作成
$VirtualNetwork = Get-AzureRmVirtualNetwork -Name $VirtualNetworkName -ResourceGroupName $ResourceGroupName
$Subnet = Get-AzureRmVirtualNetworkSubnetConfig -Name $SubnetName -VirtualNetwork $VirtualNetwork
$NewPublicIpAddress = New-AzureRmPublicIpAddress -Name $NewPublicIpAddressName -ResourceGroupName $ResourceGroupName -Location $Location -AllocationMethod Dynamic
$NewNic = New-AzureRmNetworkInterface -Name $NewNicName -ResourceGroupName $ResourceGroupName -Location $Location -Subnet $Subnet -PublicIpAddress $NewPublicIpAddress

# 新規 NIC を追加
$VM = Get-AzureRmVM -Name $VmName -ResourceGroupName $ResourceGroupName
Add-AzureRmVMNetworkInterface -VM $VM -NetworkInterface $NewNic

# 既存 NIC を削除
$OldNic = Get-AzureRmNetworkInterface -Name $OldNicName -ResourceGroupName $ResourceGroupName
Remove-AzureRmVMNetworkInterface -VM $VM -NetworkInterfaceIDs $OldNic.Id

# NIC の変更を適用 (再起動が発生します)
Update-AzureRmVM -VM $VM -ResourceGroupName $ResourceGroupName</pre>

## 留意事項

ご利用の仮想マシンの構成によってさまざま異なりますが、以下のような点にご留意ください。

* NIC の差し替えに伴い、VM の再起動が発生します
* パブリック IP アドレスを新規作成するため、IP アドレスが変更されます
* 既存の NIC 設定は引き継がれません
(NSG の設定や ロードバランサー配下への追加等は別途実施ください)

~~また、今回と同様の手法で NIC の追加や削除のみを行うこともできますが、Azure VM ではシングル NIC とマルチ NIC の行き来が出来ません。(1 枚 ⇔ 2 枚 は不可、2 枚 ⇔ 3 枚以上は可)~~

~~* 複数 NIC を持つ VM の作成 – 制限事項~~
~~https://azure.microsoft.com/ja-jp/documentation/articles/virtual-networks-multiple-nics/#制限事項~~
> ~~単一 NIC の VM をデプロイ後に、複数 NIC で構成することはできません (その逆の場合も構成できません)。構成するには、VM を削除してから、再作成する必要があります。~~

**2017/12/13 追記**
現在は、仮想マシンを停止した状態であればシングル NIC とマルチ NIC の行き来も可能となっております。(ただし、NIC を 0 枚にすることは出来ません。)

以上、ご参考になれば幸いです。
