---
title: Azure Linux VM の OS ディスク拡張方法
date: 2020-6-19 17:30:00
tags:
  - VM
  - Linux
  - Disk
  - HowTo
disableDisclaimer: true
---

こんにちは、Azure テクニカル サポート チームの青山です。

Azure Marketplace のイメージからデプロイしたほとんどの Linux VM は、OS ディスクサイズが 30GB となります。VM の用途次第では、このサイズでは `/` 領域が不足することがあります。
そこで今回は OS ディスクの拡張方法、および、パーティション、ファイルシステムの拡張方法についてご案内します。

なお、データディスクの拡張については下記公式ドキュメントに詳細手順がありますので、こちらを参考にしてください。
 - [Azure CLI を使用して Linux VM の仮想ハード ディスクを拡張する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/expand-disks)


## Azure ディスクの拡張

[Azure CLI](https://docs.microsoft.com/ja-jp/cli/azure/install-azure-cli?view=azure-cli-latest) で `az login` が完了していることを前提とします。
CLI をインストールしていない場合は、[Azure Cloud Shell の Bash](https://docs.microsoft.com/ja-jp/azure/cloud-shell/quickstart) を使うと便利です。

1. 環境に合わせて変数を設定します。`myResourceGroup` には VM のリソースグループ名、`myVmName` には VM のリソース名、`myOsDiskSize` には拡張後の OS ディスクサイズを指定しましょう。以下の例では 100GB に拡張します。
   ```bash
   myResourceGroup="contosogroup"
   myVmName="contosovm"
   myOsDiskSize="100"
   ```
2. VM 実行中は接続されたディスクのサイズを変更できません。一度 VM を停止(割り当て解除)します。
   ```bash
   az vm deallocate --resource-group $myResourceGroup --name $myVmName
   ```
3. ディスクサイズを変更します。管理ディスクの場合は、`az disk update` でサイズ変更します。
   ```bash
   osdiskid=$(az vm show --resource-group $myResourceGroup --name $myVmName --query storageProfile.osDisk.managedDisk.id -o tsv)
   az disk update --ids $osdiskid --size-gb $myOsDiskSize
   ```
   非管理ディスクの場合は、`az vm update` でサイズ変更します。
   ```bash
   az vm update -n $myVmName -g $myResourceGroup --set StorageProfile.OSDisk.DiskSizeGB=$myOsDiskSize
   ```
4. VM を起動します。Azure CLI での操作はここまでとなります。
   ```bash
   az vm start --resource-group $myResourceGroup --name $myVmName
   ```

## ファイルシステムの拡張
Ubuntu など、cloud-init が予め有効なシステムでは、起動時に拡張が済んでいる場合があります。
ここでは、LVM 構成ではない RHEL7.6 でのコマンド例を紹介します。

1. VM に SSH 接続します。
2. `lsblk` コマンドで拡張するパーティションを確認します。
   ```bash
   lsblk -p -o NAME,FSTYPE,SIZE,MOUNTPOINT
   ```
   以下の出力例では、`/` は `/dev/sda2` に 31.5G の xfs として作成されていることが確認できます。
   ```
   NAME        FSTYPE  SIZE MOUNTPOINT
   /dev/fd0              4K
   /dev/sda            100G
   |-/dev/sda1 xfs     500M /boot
   `-/dev/sda2 xfs    31.5G /
   /dev/sdb              7G
   `-/dev/sdb1 ext4      7G /mnt/resource
   ```
3. `yum` コマンドで、`cloud-utils-growpart` パッケージをインストールします。
   ```bash
   sudo yum install -y cloud-utils-growpart
   ```
4. `growpart` コマンドでパーティションを拡張します。
   ```bash
   sudo growpart /dev/sda 2
   ```
5. 再度 `lsblk` コマンドを使い、`/dev/sda2` が拡張されたかを確認してみましょう。
   ```bash
   lsblk -p /dev/sda2
   ```
   以下の出力例では、99.5G に拡張されたことが確認できます。
   ```
   NAME      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
   /dev/sda2   8:2    0 99.5G  0 part /
   ```
6. ファイルシステムを拡張します。xfs の場合は、`xfs_growfs`, ext4 の場合は、`resize2fs` コマンドを使います。
   ```bash
   sudo xfs_growfs /
   ```
   拡張されました。
   ```
   meta-data=/dev/sda2              isize=512    agcount=4, agsize=2065088 blks
            =                       sectsz=512   attr=2, projid32bit=1
            =                       crc=1        finobt=0 spinodes=0
   data     =                       bsize=4096   blocks=8260352, imaxpct=25
            =                       sunit=0      swidth=0 blks
   naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
   log      =internal               bsize=4096   blocks=4033, version=2
            =                       sectsz=512   sunit=0 blks, lazy-count=1
   realtime =none                   extsz=4096   blocks=0, rtextents=0
   data blocks changed from 8260352 to 26086139
   ```
7. 最後に、`df` コマンドで `/` のサイズを確認してみましょう。
   ```bash
   df -hT /
   ```
   目的のサイズになっていれば無事成功です。
   ```
   Filesystem     Type  Size  Used Avail Use% Mounted on
   /dev/sda2      xfs   100G  2.8G   97G   3% /
   ```

---
