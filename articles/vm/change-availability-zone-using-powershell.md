---
title: VM の再作成により可用性ゾーンを変更する (PowerShell 編)
date: 2020-11-02 15:30:00
tags:
  - VM
  - Availability Zone
  - Azure PowerShell
  - Sample Script
---

こんにちは、Azure テクニカル サポート チームの菅澤です。

Azure VM では、一部リージョンのみとはなりますが可用性ゾーンをサポートしています。

- Azure での Availability Zones をサポートしているリージョン
  [https://docs.microsoft.com/ja-jp/azure/availability-zones/az-region](https://docs.microsoft.com/ja-jp/azure/availability-zones/az-region)

ただ、可用性ゾーンを利用した VM を作成したい場合には、これに利用するディスクも可用性ゾーンを利用している必要があり、一般に仮想マシンを新規デプロイする場合にのみこの利用有無を設定できます。

<!-- more -->

しかし、運用をしている中で可用性ゾーンへ組み入れる必要が発生したり、逆に、可用性ゾーンに組み入れられていると一部機能が対応しないため、可用性ゾーンから外したいというご要望が出てくることがあるかと思います。

本稿では、こうしたご要望にお応えするために、可用性ゾーンへ含まれない VM を可用性ゾーンに組み入れる、可用性ゾーンに含まれる VM を可用性ゾーンから外す方法について、Azure PowerShell のサンプルを用いてそれぞれご案内いたします。  

> [!TIP]
> Azure ポータルで VM の可用性ゾーンに関する変更を行いたい場合は以下の記事をご参照くださいませ。  
> [https://jpaztech.github.io/blog/vm/recreate-vm-to-change-settings/](https://jpaztech.github.io/blog/vm/recreate-vm-to-change-settings/)

## ■ 本手順を利用する前提条件

本手順では、管理ディスクを利用していることを前提としてご案内いたします。
Azure PowerShell か実行可能な環境、もしくは Azure CloudShell をご利用いただける環境から実行してください。

## ■ 手順の流れについて

可用性ゾーンへ含まれない VM を可用性ゾーンに組み入れる、可用性ゾーンに含まれる VM を可用性ゾーンから外すのいずれの場合でも以下の流れにて作業を行います。

1. 仮想マシンを停止する。
2. 仮想マシンのスナップショットを取得する。
3. 仮想マシンのスナップショットから仮想マシンを作成する。
4. 作成されたスナップショット、およびもともと利用されていたリソースを削除する。

## ■ 可用性ゾーンを設定したい場合

まず、設定変更を行いたい仮想マシンを停止してください。

停止が完了したら、現在利用しているディスクのスナップショットを取得します。
```PowerShell
$ResourceGroup = "AZ" # リソースグループ名
$Location = "japaneast"　# リージョン名 ( japaneast など )
$vmName = "NonAz" # 仮想マシン名

# 必要に応じて変更してください
$snapshotName = $vmname + "-OSDisk-Snapshot"  # スナップショット名

###以下変更不要###
# VM の情報を取得
$vm = get-Azvm -ResourceGroupName $ResourceGroup -Name $vmName

# スナップショットを作成
$snapshot =  New-AzSnapshotConfig -SourceResourceId $vm.StorageProfile.OsDisk.ManagedDisk.Id -Location $Location -CreateOption copy

New-AzSnapshot -Snapshot $snapshot -SnapshotName $snapshotName -ResourceGroupName $ResourceGroup
```

次に、上記で取得したスナップショットをもとに VM を作成します。

可用性ゾーンでパブリック IP アドレスを利用する場合には Standard SKU かつ静的な割り当てが必要となりますのでご注意ください。

- パブリック IP アドレス
  [https://docs.microsoft.com/ja-jp/azure/virtual-network/public-ip-addresses](https://docs.microsoft.com/ja-jp/azure/virtual-network/public-ip-addresses)

```PowerShell
$ResourceGroup = "AZ" # リソースグループ名
$Location = "japaneast"　# リージョン名
$vmName = "NonAz" # 元の VM の仮想マシン名
$ZoneNo = 1 # ゾーン番号 ( 1 or 2 or 3 )

# 必要に応じて変更してください
$snapshotName = $vmname + "-OSDisk-Snapshot"　# スナップショット名
$osDiskName = $vmname + "-OSDisk-AZ"  # 新しい VM の OS ディスク名
$virtualMachineName = $vmName + "AZ" # 新しい VM 名

###以下変更不要ですが、 VM の Config を作成にある Windows / Linux の部分のみご確認ください ###
# 以下は元 VM と同じものを自動的に選択しています
# VM の情報を取得
$vm = get-Azvm  -ResourceGroupName $ResourceGroup -Name $vmName
$Subnet =  (Get-AzNetworkInterface -ResourceID $vm.NetworkProfile.NetworkInterfaces.Id).IpConfigurations.subnet.Id # サブネット情報
$virtualMachineSize = $vm.HardwareProfile.VmSize # VM サイズ 
$DiskType = (Get-AzDisk -ResourceGroupName $ResourceGroup -DiskName  $vm.StorageProfile.OsDisk.Name).Sku.Name # ディスクの種類

# スナップショット情報を取得
$snapshot = Get-AzSnapshot -ResourceGroupName $ResourceGroup -SnapshotName $snapshotName

# ディスクを作成
$diskConfig = New-AzDiskConfig -Location $snapshot.Location -SourceResourceId $snapshot.Id -CreateOption Copy -Zone $ZoneNo -AccountType $DiskType
$disk = New-AzDisk -Disk $diskConfig -ResourceGroupName $ResourceGroup -DiskName $osDiskName

# VM の Config を作成　( -Windows となっている部分は、Linux VM の場合には -Linux に変えてください )
$VirtualMachine = New-AzVMConfig -VMName $virtualMachineName -VMSize $virtualMachineSize -Zone $ZoneNo
$VirtualMachine = Set-AzVMOSDisk -VM $VirtualMachine -ManagedDiskId $disk.Id -CreateOption Attach -Windows

# public IP および NIC を作成
$publicIp = New-AzPublicIpAddress -Name ($vmName+'-AZ_ip') -ResourceGroupName $ResourceGroup -Location $snapshot.Location -AllocationMethod Static -Zone $ZoneNo -Sku Standard
$nic = New-AzNetworkInterface -Name ($vmName+'-AZ_nic') -ResourceGroupName $ResourceGroup -Location $snapshot.Location -SubnetId $subnet -PublicIpAddressId $publicIp.Id 
$VirtualMachine = Add-AzVMNetworkInterface -VM $VirtualMachine -Id $nic.Id

# VM を作成
New-AzVM -VM $VirtualMachine -ResourceGroupName $ResourceGroup -Location $snapshot.Location
```

上記で作成された VM が動作するようでしたらば、もともと利用していたリソースおよび、本手順で作成したスナップショットを削除し、手順は完了となります。

## ■ 可用性ゾーンの設定を削除したい場合

まず、現在利用しているディスクのスナップショットを取得します。

```PowerShell
$ResourceGroup = "AZ" # リソースグループ名
$Location = "japaneast"　# リージョン名 ( japaneast など )
$vmName = "Az" # 仮想マシン名

# 必要に応じて変更してください
$snapshotName = $vmname + "-OSDisk-Snapshot"  # スナップショット名

###以下変更不要###
# VM の情報を取得
$vm = get-Azvm  -ResourceGroupName $ResourceGroup -Name $vmName

# スナップショットを作成
$snapshot =  New-AzSnapshotConfig -SourceResourceId $vm.StorageProfile.OsDisk.ManagedDisk.Id -Location $Location -CreateOption copy

New-AzSnapshot -Snapshot $snapshot -SnapshotName $snapshotName -ResourceGroupName $ResourceGroup
```

次に、上記で取得したスナップショットをもとに VM を作成します。

```PowerShell
$ResourceGroup = "AZ" # リソースグループ名
$Location = "japaneast"　# リージョン名
$vmName = "Az" # 元の VM の仮想マシン名

# 必要に応じて変更してください
$snapshotName = $vmname + "-OSDisk-Snapshot"　# スナップショット名
$osDiskName = $vmname + "-OSDisk_NonAz"  # 新しい VM の OS ディスク名
$virtualMachineName = $vmName + "NonAZ" # 新しい VM 名

###以下変更不要ですが、 VM の Config を作成にある Windows / Linux の部分のみご確認ください ###
# 以下は元 VM と同じものを自動的に選択しています
# VM の情報を取得
$vm = get-Azvm -ResourceGroupName $ResourceGroup -Name $vmName
$Subnet =  (Get-AzNetworkInterface -ResourceID $vm.NetworkProfile.NetworkInterfaces.Id).IpConfigurations.subnet.Id # サブネット情報
$virtualMachineSize = $vm.HardwareProfile.VmSize # VM サイズ 
$DiskType = (Get-AzDisk -ResourceGroupName $ResourceGroup -DiskName  $vm.StorageProfile.OsDisk.Name).Sku.Name # ディスクの種類

# スナップショット情報を取得
$snapshot = Get-AzSnapshot -ResourceGroupName $ResourceGroup -SnapshotName $snapshotName

# ディスクを作成
$diskConfig = New-AzDiskConfig -Location $snapshot.Location -SourceResourceId $snapshot.Id -CreateOption Copy -AccountType $DiskType
$disk = New-AzDisk -Disk $diskConfig -ResourceGroupName $ResourceGroup -DiskName $osDiskName

# VM の Config を作成　( -Windows となっている部分は、Linux VM の場合には -Linux に変えてください )
$VirtualMachine = New-AzVMConfig -VMName $virtualMachineName -VMSize $virtualMachineSize
$VirtualMachine = Set-AzVMOSDisk -VM $VirtualMachine -ManagedDiskId $disk.Id -CreateOption Attach -Windows

# public IP および NIC を作成
$publicIp = New-AzPublicIpAddress -Name ($vmName+'NonAZ_ip') -ResourceGroupName $ResourceGroup -Location $snapshot.Location -AllocationMethod Static -Sku Standard
$nic = New-AzNetworkInterface -Name ($vmName+'NonAZ_nic') -ResourceGroupName $ResourceGroup -Location $snapshot.Location -SubnetId $subnet -PublicIpAddressId $publicIp.Id 
$VirtualMachine = Add-AzVMNetworkInterface -VM $VirtualMachine -Id $nic.Id

# VM を作成
New-AzVM -VM $VirtualMachine -ResourceGroupName $ResourceGroup -Location $snapshot.Location
```

上記で作成された VM が動作するようでしたらば、もともと利用していたリソースおよび、本手順で作成したスナップショットを削除し、手順は完了となります。

## ■ 参考

本ドキュメントの作成に当たっては、以下の資料を参考としておりますので、よろしければこちらもご確認をいただけますと幸いです。

- スナップショットの作成
  [https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/snapshot-copy-managed-disk](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/snapshot-copy-managed-disk)

- PowerShell でスナップショットから仮想マシンを作成する
  [https://docs.microsoft.com/ja-jp/azure/virtual-machines/scripts/virtual-machines-windows-powershell-sample-create-vm-from-snapshot](https://docs.microsoft.com/ja-jp/azure/virtual-machines/scripts/virtual-machines-windows-powershell-sample-create-vm-from-snapshot)


本稿が皆様のお役に立てれば幸いです。
