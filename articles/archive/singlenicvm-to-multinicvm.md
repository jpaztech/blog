---
title: Azure で単数 NIC の仮想マシンを複数 NIC にする
date: 2017-10-17 19:06:00 
tags:
  - Archive
  - Network
  - VM
---

こんにちは、Azure サポートチームの三國です。

今回は、単数 NIC の仮想マシンを複数NICにする方法についてご案内します。

本情報の内容（添付文書、リンク先などを含む）は、作成日時点でのものであり、予告なく変更される場合があります。

## はじめに

NIC とは、ネットワークインターフェイスカードの略です。Azure Portal から仮想マシンを作成するときは単数 NIC がついている仮想マシンしか作成できないのですが、Azure PowerShell などを使うことにより最初から複数の NIC を持った仮想マシンを作成することができます。

最初から複数 NIC を持った仮想マシンを作成する方法は、下記のドキュメントをご覧ください。

[複数の NIC を持つ Windows 仮想マシンの作成と管理](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/multiple-nics#create-a-vm-with-multiple-nics)

今回のテーマは、**「後から NIC の数を複数にしたい！」** というケースです。

実は、2つの NIC を持つ仮想マシンにもう1つNICを加えることは難しくありません。

本ブログにおいてこのケースは直接的には取り上げませんので、以下のドキュメントをご参照ください。

(なお、本ブログを読んでも方法については理解できるようになります)

[既存の VM への NIC の追加](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/multiple-nics#add-a-nic-to-an-existing-vm)

それでは、早速中身に入りましょう。

## 単数 NIC の仮想マシンを複数 NIC にする

以下のPowerShellを用いてください。解説は後述します。

**注意!!** このスクリプトにより仮想マシンが停止(割り当て解除)されます。

**注意!!** このスクリプトでは新しい NIC に NSG を割り当てません。割り当てたい場合はスクリプトをカスタマイズするか、NIC 追加後にポータルより行ってください。
```PowerShell
 ######################################################################
### ログインとサブスクリプション指定
######################################################################
Login-AzureRmAccount
$mySub = Get-AzureRmSubscription | Out-GridView -Title "Select an Azure Subscription ..." -PassThru
Select-AzureRmSubscription -SubscriptionId $mySub.Id 

######################################################################
###基本情報を設定する
###なお、パブリックIPアドレスの割り当ては任意です
######################################################################
$resourceGroup = "リソースグループ名"
$location = "場所"
$vmName = "仮想マシン名"
$PublicIpAddressName = "パブリックIPアドレス名"
$dnsNameforPublicIp = "パブリックIPアドレスに紐づくDNS名"
$vNetName = "仮想マシンの所属するVnet名"
$newNicName = "新しいNIC名"

$vm = Get-AzureRmVM -name $vmName -ResourceGroupName $resourceGroup

######################################################################
###仮想マシンを停止する
######################################################################
stop-azurermvm -name $vmName -ResourceGroupName $resourceGroup

######################################################################
###パブリックIPアドレスを作成する
###パブリックIPアドレスが不要であればコメントアウトください。
######################################################################
$pip = New-AzureRmPublicIpAddress -AllocationMethod Dynamic `
-ResourceGroupName $resourceGroup -DomainNameLabel $dnsNameforPublicIp `
-IpAddressVersion IPv4 -Location $location -Name $PublicIpAddressName

######################################################################
###新NICを作成する
###パブリックIPアドレスの割り当ては任意です。不要であれば、
###-PublicIpAddressIdオプションをコメントアウトしてください。
######################################################################
$myVnet = Get-AzureRmVirtualNetwork -Name $vNetName -ResourceGroupName $resourceGroup
$mySubnet = Get-AzureRmVirtualNetworkSubnetConfig -VirtualNetwork $myVnet `
|Out-GridView -Title "Select an Azure Subnet ..." -PassThru

$newNic = New-AzureRmNetworkInterface -Location $location `
-Name $newNicName -ResourceGroupName $resourceGroup `
-SubnetId $mySubnet.Id -PublicIpAddressId $pip.id

######################################################################
###新NICを追加する
######################################################################
Add-AzureRmVMNetworkInterface -VM $vm -Id $newNic.Id

######################################################################
###プライマリNICを指定する
###本手順では既存のNICをプライマリにしていますが、新NICをプライマリに
###したい場合は以下のようにしてください
###$vm.NetworkProfile.NetworkInterfaces[1].Primary=$true
######################################################################
$vm.NetworkProfile.NetworkInterfaces[0].Primary=$true

######################################################################
###仮想マシン情報を更新する
######################################################################
Update-AzureRmVm -ResourceGroupName $resourceGroup -VM $vm

######################################################################
###仮想マシンを起動する
######################################################################
start-azurermvm -name $vmName -ResourceGroupName $resourceGroup
```
## 解説

NIC を単数から複数にするうえで重要なのは、**"プライマリNIC"** を指定するということです。

NIC が単数の時は NIC のパラメータに"プライマリ"という概念はありませんが、複数 NIC になると必要になります。

下記コマンドを単数 NIC の際と複数 NIC の際とでそれぞれ試してみるとご理解頂けるかと存じます。
```PowerShell
(Get-AzureRmVM -name [仮想マシン名] -ResourceGroupName [リソースグループ名]).NetworkProfile.NetworkInterfaces
```
そのため、ただ NIC を追加するだけでなく、プライマリを指定してあげる必要があるのです。

最初から複数NICを持っている仮想マシンにNICを加えるときは、すでにプライマリNICが定められているため、NIC の追加だけで十分です。

以上になります。

(その他、この記事を見に来た方に役立つかもしれないブログ)

[Azure VM (ARM) の NIC 差し替えについて](https://www.syuheiuda.com/?p=4873)