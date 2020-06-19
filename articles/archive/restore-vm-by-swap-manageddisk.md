---
title: (PowerShell編) Azure仮想マシン (管理ディスク) の交換を活用して元のネットワークにリストアする
date: 2018-06-04 15:31:32
tags:
  - Archive
  - Managed Disk
  - Backup / Restore
  - PowerShell
disableDisclaimer: true
---

こんにちは。Azure サポートチームの三國です。
今回は 2018 年 4 月にリリースされた、管理ディスクの交換 (スワップ) 機能を用いて仮想マシンを元のネットワークにリストアする方法をご案内します。

本ブログは Azure PowerShell 編です。ポータルでの手順は以下の投稿をご参照下さい。
[(旧) Azure 仮想マシン (管理ディスク) の交換を活用して元のネットワークにリストアする](http://blogs.technet.microsoft.com/jpaztech/2018/05/30/restore-vm-by-swap-manageddisk/)

<span style="color:red;">本情報の内容（添付文書、リンク先などを含む）は、作成日時点でのものであり、予告なく変更される場合があります。</span>


## ■ 注意事項

- Azure PowerShell のバージョンは 6.1.0 にて検証を行っておりますが、バージョンによってパラメータが異なる可能性や実行頂けない可能性があります。
- ストレージアカウントに vhd が作成され、管理ディスクが新規で作成されます。
- リストアする仮想マシンの情報を記載した json ファイルが PowerShell 実行元のローカルにダウンロードされます。
- バックアップは別途取得頂く必要がございます。
- 仮想マシンの停止が発生します。
- 仮想マシンのリストアが行われますので、実行には長時間を要します。
- <span style="color:red;">サンプルのスクリプトである為、責任は一切負いかねます。十分に検証いただいた上でご利用をお願いいたします。</span>


## ■ はじめに
Azure Backup での仮想マシンの復元には2つの選択肢があります。

- 特定の時点のバックアップ VM である VM を新しく作成する。
- ディスクを復元し、そのプロセスに含まれるテンプレートを使用して、復元された VM をカスタマイズするか、個別にファイルを回復する。

[(参考) Azure Portal を使用して仮想マシンを復元する](https://docs.microsoft.com/ja-jp/azure/backup/backup-azure-arm-restore-vms)

しかし、可能であれば復元前の仮想マシンと同じネットワークにリストアしたいというニーズも強くあるかと存じます。
そこで、以下のような手順で実現する方法をご案内いたします。

1. 仮想マシンのディスクを VHD に復元する
1. VHD を管理ディスク化する
1. 復元後のディスクを復元前のディスクと交換する (仮想マシンの停止が伴います)

これは、2018年4月より管理ディスクでも可能になった機能を用いております。
[(参考) Managed Virtual Machines で OS ディスク スワップの一般提供を開始](https://blogs.technet.microsoft.com/jpitpro/2018/05/11/os-disk-swap-managed-disks/)

それでは、サンプルスクリプトおよび使用法をご案内します。

## ■ サンプルスクリプトの使用法
'変数の指定' における各変数をカスタマイズしてご利用ください。
過去 7 日間に取得した Backup のうち最新のものをリストアする動作となります。

リストア先のストレージアカウントにおいて、自動で決められたコンテナ名、vhd 名で vhd がリストアされますが、作成される管理ディスク名は指定する必要があります。スクリプトでは接頭辞を付ける動作としております。
(例: 'testdisk' というディスク名なら 'res-testdisk' となります)

その他ご不明点等ございましたらコメント欄に記載ください。

## ■ サンプルスクリプト

<pre>
########################################################
## 変数の指定
########################################################

# サブスクリプション ID
$subscriptionId = 'xxxxx-xxxxx-xxxxx-xxxxx-xxxxx'

# 仮想マシンのリソース グループ名
$vmResourceGroupName = 'sample-RG'

# 仮想マシン名
$vmName = 'sample-VM'

# Backup の vault 名
$vaultName = 'sample-vault'

# ストレージ アカウントのリソース グループ名
$storageAccountResourceGroupName = 'sample-RG'

# ストレージ アカウント名
$storageAccountName = 'samplestorage'

# リストア用の管理ディスクの接頭辞
$prefix = 'res-'


########################################################
## ログイン、サブスクリプションの選択
########################################################

Login-AzureRmAccount
Select-AzureRmSubscription -SubscriptionId $subscriptionId


########################################################
## リストア・管理ディスク作成の準備
########################################################

# 過去7日間に取得したBackUpのうち最新のものをディスクにリストア
Get-AzureRmRecoveryServicesVault -Name $vaultName | Set-AzureRmRecoveryServicesVaultContext

$namedContainer = Get-AzureRmRecoveryServicesBackupContainer  `
  -ContainerType "AzureVM"  `
  -Status "Registered"  `
  -FriendlyName $vmName

$backupitem = Get-AzureRmRecoveryServicesBackupItem  `
 -Container $namedContainer  `
 -WorkloadType "AzureVM"

$startDate = (Get-Date).AddDays(-7)
$endDate = Get-Date

$rp = Get-AzureRmRecoveryServicesBackupRecoveryPoint  `
  -Item $backupitem  `
  -StartDate $startdate.ToUniversalTime()  `
  -EndDate $enddate.ToUniversalTime()

$restorejob = Restore-AzureRmRecoveryServicesBackupItem  `
  -RecoveryPoint $rp[0]  `
  -StorageAccountName $storageAccountName  `
  -StorageAccountResourceGroupName $storageAccountResourceGroupName

Wait-AzureRmRecoveryServicesBackupJob -Job $restorejob -Timeout 43200

# Config JsonのURI取得
$job = Get-AzureRmRecoveryServicesBackupJobDetails -JobId $restorejob.JobId
$jsonContainer = $job.Properties["Config Blob Container Name"]
$jsonBlob = $job.Properties["Config Blob Name"]

# Config Jsonのダウンロード
$ctx = (Get-AzureRmStorageAccount  `
  -ResourceGroupName $storageAccountResourceGroupName  `
  -Name $storageAccountName).Context

Get-AzureStorageBlobContent -Blob $jsonBlob -Container $jsonContainer -Destination .\  -Context $ctx 

# Jsonのオブジェクト化
$jsonObj = (Get-Content .\$jsonBlob -Encoding Unicode -Raw).TrimEnd([char]0x00) |ConvertFrom-Json

# VMオブジェクトの取得 
$vmObj = Get-AzureRmVM -ResourceGroupName $vmResourceGroupName -Name $vmName


########################################################
## OSディスクの作成
########################################################

# OSディスクの作業用オブジェクトの作成
$osDiskObj = $jsonObj.'properties.storageProfile'.osDisk

# 現在のOSディスク情報の取得
$currentOSdisk = Get-AzureRmDisk  `
  -ResourceGroupName $vmResourceGroupName  `
  -DiskName $vmObj.StorageProfile.OsDisk.Name

# 管理ディスクの作成(OSディスク)
$newOsDiskName = $prefix + $currentOSdisk.Name

$osDiskConfig = New-AzureRmDiskConfig  `
  -Location $vmObj.Location  `
  -AccountType $currentOSdisk.Sku.Name  `
  -CreateOption Import  `
  -OsType $vmObj.StorageProfile.OsDisk.OsType  `
  -SourceUri $osDiskObj.vhd.uri

$newOSdisk = New-AzureRmDisk  `
  -ResourceGroupName $vmResourceGroupName  `
  -DiskName $newOsDiskName  `
  -Disk $osDiskConfig


########################################################
## データディスクの作成
########################################################

# データディスクの作業用オブジェクトの作成
$dataDiskObj = $jsonObj.'properties.storageProfile'.dataDisks

$currentDataDiskObj = $vmObj.StorageProfile.DataDisks

$newDataDiskArray = @()

if ($dataDiskObj){
    $dataDiskObj | foreach{
        $lunNum = $_.Lun

        # 現在のデータディスク情報の取得
        $currentDataDiskName = ($currentDataDiskObj | Where-Object {$_.Lun -eq $lunNum}).Name

        $currentDataDisk = Get-AzureRmDisk -ResourceGroupName $vmResourceGroupName -DiskName $currentDataDiskName

        # 管理ディスクの作成(データディスク)
        $newDataDiskName = $prefix + $currentDatadiskName

        $dataDiskConfig = New-AzureRmDiskConfig -Location $vmObj.Location -AccountType $currentDatadisk.Sku.Name -CreateOption Import -SourceUri $_.vhd.uri

        $newDataDisk = New-AzureRmDisk -ResourceGroupName $vmResourceGroupName -DiskName $newDataDiskName -Disk $dataDiskConfig

        $newDataDiskArray = $newDataDiskArray + $newDataDisk
    }
}


########################################################
## 仮想マシンの停止
########################################################

# 仮想マシンを停止する
Stop-AzureRmVM -ResourceGroupName $vmResourceGroupName -Name $vmName -Force


########################################################
## OSディスクの差し替え
########################################################

# 最新状態のVMオブジェクトの取得 
$vmObj = Get-AzureRmVM -ResourceGroupName $vmResourceGroupName -Name $vmName

# OSディスクの差し替え  
Set-AzureRmVMOSDisk -VM $vmObj -ManagedDiskId $newOSdisk.Id -Name $newOSdisk.Name

# 仮想マシン情報の更新をする
Update-AzureRmVM -ResourceGroupName $vmResourceGroupName -VM $vmObj 


########################################################
## データディスクの差し替え
########################################################

if ($dataDiskObj){
    $dataDiskObj | foreach{
        $lunNum = $_.Lun

        # デタッチするデータディスク情報の取得
        $currentDataDiskName = ($currentDataDiskObj | Where-Object {$_.Lun -eq $lunNum}).Name

        # アタッチするデータディスクオブジェクトの取得
        $sourceVhd = $_.vhd.uri
        $newDataDiskObj = $newDataDiskArray | Where-Object {$_.CreationData.SourceUri -eq $sourceVhd}

        # 既存のデータディスクのデタッチ
        Remove-AzureRmVMDataDisk -VM $vmObj -DataDiskNames $currentDataDiskName

        # 仮想マシン情報の更新をする
        Update-AzureRmVM -ResourceGroupName $vmResourceGroupName -VM $vmObj

        # 新規のデータディスクのアタッチ
        Add-AzureRmVMDataDisk -VM $vmObj -CreateOption Attach -Lun $_.lun -ManagedDiskId $newDataDiskObj.Id

        # 仮想マシン情報の更新をする
        Update-AzureRmVM -ResourceGroupName $vmResourceGroupName -VM $vmObj
    }
}


########################################################
## 仮想マシンの起動
########################################################

# 仮想マシンを起動する
Start-AzureRmVM -Name $vmName -ResourceGroupName $vmResourceGroupName
</pre>