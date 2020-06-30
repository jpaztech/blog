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

### 注意
作業前には必ず [バックアップ](https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/tutorial-backup-vms) を取得しておきましょう。

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
ここでは、LVM 構成ではない RHEL7.6 でのコマンド例を紹介します。LVM 構成の場合は [ファイルシステムの拡張 (LVM)](#ファイルシステムの拡張-LVM) を参照してください。

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

## ファイルシステムの拡張 (LVM)
ここでは、LVM 構成の RHEL8.2 でのコマンド例を紹介します。

1. VM に SSH 接続します。
2. `lsblk` コマンドで拡張するパーティションを確認します。
   ```bash
   lsblk -p -o NAME,FSTYPE,SIZE,MOUNTPOINT
   ```
   以下の出力例では、`/` としてマウントされている LV `rootlv` は `/dev/sda2` に作成されていることが確認できます。
   ファイルシステムは xfs として作成されています。
   ```
   NAME                          FSTYPE       SIZE MOUNTPOINT
   /dev/sda                                   100G
   ├─/dev/sda1                   xfs          500M /boot
   ├─/dev/sda2                   LVM2_member   63G
   │ ├─/dev/mapper/rootvg-tmplv  xfs            2G /tmp
   │ ├─/dev/mapper/rootvg-usrlv  xfs           10G /usr
   │ ├─/dev/mapper/rootvg-homelv xfs            1G /home
   │ ├─/dev/mapper/rootvg-varlv  xfs            8G /var
   │ └─/dev/mapper/rootvg-rootlv xfs            2G /
   ├─/dev/sda14                                 4M
   └─/dev/sda15                  vfat         495M /boot/efi
   /dev/sdb                                     7G
   └─/dev/sdb1                   ext4           7G /mnt
   ```
3. `yum` コマンドで、`cloud-utils-growpart` パッケージをインストールします。
   ```bash
   sudo yum install -y cloud-utils-growpart
   ```
4. `growpart` コマンドでパーティションを拡張します。
   ```bash
   sudo growpart /dev/sda 2
   ```
5. `pvresize` コマンドで、PV を拡張します。
   ```bash
   sudo pvresize /dev/sda2
   ```
   成功すると、以下のような出力が得られます。
   ```
     Physical volume "/dev/sda2" changed
     1 physical volume(s) resized or updated / 0 physical volume(s) not resized
   ```
6. `vgs` コマンドで `rootlv` の含まれている `rootvg` の領域が増えたか確認してみます。
   ```bash
   sudo vgs
   ```
   以下の出力例では 76.02 GB が使用可能です。
   ```
     VG     #PV #LV #SN Attr   VSize   VFree
     rootvg   1   5   0 wz--n- <99.02g <76.02g
   ```
7. `lvextend` コマンドで、LV を拡張します。
   今回は、空き容量を全て使って `rootlv` を拡張します。
   ```bash
   sudo lvextend -l +100%FREE /dev/rootvg/rootlv
   ```
   成功すると、以下のような出力が得られます。
   ```
     Size of logical volume rootvg/rootlv changed from 2.00 GiB (512 extents) to <78.02 GiB (19973 extents).
     Logical volume rootvg/rootlv successfully resized.
   ```
8. ファイルシステムを拡張します。xfs の場合は、xfs_growfs, ext4 の場合は、resize2fs コマンドを使います。
   ```bash
   sudo xfs_growfs /
   ```
   成功すると、以下のような出力が得られます。
   ```
   meta-data=/dev/mapper/rootvg-rootlv isize=512    agcount=4, agsize=131072 blks
            =                       sectsz=4096  attr=2, projid32bit=1
            =                       crc=1        finobt=1, sparse=1, rmapbt=0
            =                       reflink=1
   data     =                       bsize=4096   blocks=524288, imaxpct=25
            =                       sunit=0      swidth=0 blks
   naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
   log      =internal log           bsize=4096   blocks=2560, version=2
            =                       sectsz=4096  sunit=1 blks, lazy-count=1
   realtime =none                   extsz=4096   blocks=0, rtextents=0
   data blocks changed from 524288 to 20452352
   ```
9. 最後に、df コマンドで / のサイズを確認してみましょう。
   ```bash
   df -hT /
   ```
   目的のサイズになっていれば無事成功です。
   ```
   Filesystem                Type  Size  Used Avail Use% Mounted on
   /dev/mapper/rootvg-rootlv xfs    79G  625M   78G   1% /
    ```
---
