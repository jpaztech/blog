---
title: Azure Windows VM でクラスター サイズが拡張したいボリューム サイズに対応してない場合について
date: 2022-12-21 14:00:00
tags:
  - VM
  - Data Disk
---

こんにちは。Azure テクニカル サポート チームの新見です。

Azure Windows VM において、データ ディスクの拡張方法に関してお問い合わせをいただくことがあります。
今回はディスク拡張前の Windows NTFS のクラスター サイズ（アロケーション ユニットサイズ）が、ディスク拡張後のボリューム サイズに対応していない際に、ディスクを拡張する方法をご案内させていただきます。

## 注意事項
念のため、作業の実施前には、予期せぬご状況に備えてバックアップやスナップショットの取得をご実施いただければと存じます。
[公開情報：Azure VM バックアップについて - Azure Backup | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/backup/backup-azure-vms-introduction)
[公開情報：仮想ハード ディスクの Azure スナップショットを作成する - Azure Virtual Machines | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/virtual-machines/snapshot-copy-managed-disk?tabs=portal)

また、記憶域スペースをご利用をいただいている場合においては、以下の手順をご参照ください。
[公開情報：Azure Windows VM で記憶域スペースを拡張する | Japan Azure IaaS Core Support Blog (jpaztech.github.io)](https://jpaztech.github.io/blog/vm/extend-storage-space-on-azure-windows-vm/)


## クラスター サイズが拡張したいボリューム サイズに対応している場合
### 概要
データ ディスクを拡張する際には、クラスター サイズが拡張したいボリューム サイズに対応している場合、Azure Portal 等にてディスクのサイズを拡張いただいた後、ゲスト OS 上の操作にてボリュームを拡張する必要があります。
 
### 手順
#### 1. 仮想マシンを停止し、ディスクのサイズを拡張する
[公開情報：Azure 内の Windows VM に接続されている仮想ハード ディスクを拡張する - Azure Virtual Machines | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/expand-os-disk#resize-a-managed-disk-in-the-azure-portal)
参照箇所：Azure portal でマネージド ディスクのサイズを変更する

#### 2. 仮想マシン内からボリュームを拡張する
[公開情報：Azure 内の Windows VM に接続されている仮想ハード ディスクを拡張する - Azure Virtual Machines | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/expand-os-disk#using-disk-manager)
参照箇所：ディスク マネージャーの使用

しかしながら、この手順を実行する際にクラスター サイズが対応していない場合はエラーが発生するため、対処方法を以下の通りお伝えします。


## クラスター サイズが拡張したいボリューム サイズに対応していない場合
### 概要
そのまま既存のデータ ディスクを拡張することができないため、データ ディスクを新規で作成して仮想マシンに接続し、クラスター サイズが対応しているサイズでボリュームを作成した上で、既存ボリューム上のデータを新規ボリュームにコピーする必要があります。

### 解説
クラスター サイズが拡張したいボリューム サイズに対応している場合の手順で拡張した場合、クラスター サイズは拡張前のデフォルトのサイズのままなので、拡張したいボリュームのサイズに対応していない場合はクラスター サイズを対応させる必要があります。
しかし、クラスター サイズを変えてしまうと、ボリュームのフォーマットが実施されデータが消えてしまうため、新規でデータ ディスクを作成することでご対応いただければと存じます。

P70 で作成したディスクの 16TB のボリュームを、 32TB に拡張したい場合を例として説明します。

#### デフォルトのクラスター サイズと必要なクラスター サイズ
作成するボリュームのサイズによって、デフォルトのクラスター サイズは以下のように異なります。
[公開情報：NTFS、FAT、および exFAT のデフォルトのクラスター サイズ (microsoft.com)](https://support.microsoft.com/ja-jp/topic/ntfs-fat-%E3%81%8A%E3%82%88%E3%81%B3-exfat-%E3%81%AE%E3%83%87%E3%83%95%E3%82%A9%E3%83%AB%E3%83%88%E3%81%AE%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%83%BC-%E3%82%B5%E3%82%A4%E3%82%BA-9772e6f1-e31a-00d7-e18f-73169155af95)

| ボリュームのサイズ | Windows 7、Windows Server 2008 R2、Windows Server 2008、Windows Vista、Windows Server 2003、Windows XP、Windows 2000 |
|:-----------|:-----------|
| 2TB – 16TB | 4KB |
| 16TB – 32TB | 8KB |

P70(16TB) でディスクを作成し、16TB でボリュームを作成した場合、デフォルトのクラスター サイズは 4KB になります。
クラスター サイズ が 4KB の場合、ボリュームは 16TB までしか対応していません。
32TB のボリュームを作成するには、8KB のクラスター サイズが必要になります。

[公開情報：NTFS の概要 | Microsoft Docs](https://learn.microsoft.com/ja-jp/windows-server/storage/file-server/ntfs-overview#support-for-large-volumes)

| クラスター サイズ	| 最大ボリュームおよびファイル |
|:-----------|:-----------|
| 4KB (既定のサイズ) | 16TB |
| 8KB | 32TB |

クラスター サイズが拡張したいボリューム サイズに対応している場合の手順で、P70(16TB) のディスクを P80(32TB) に拡張した場合、16TB で作成済のボリュームのクラスター サイズはデフォルトと変わらず 4KB のままです。
そのため、この作成済の 16TB ボリュームを 32TB にしたい場合、 8KB のクラスター サイズが必要となるので、クラスター サイズが 4KBのままでは 32TB に拡張することができず、実際実行した場合以下のようにエラーメッセージが表示されます。

![](./extend-data-disk-related-to-a-cluster-size-01.png)	

#### クラスター サイズの変更はフォーマットが伴う
上記の通り、32TB のボリュームを利用するためには、クラスター サイズを 8KB 以上に変更する必要がありますが、クラスター サイズを変更してしまうと、ボリュームのフォーマットが実施されることとなってしまいます。
（ P70(16TB) のディスク上でクラスター サイズを 8KB に変更してしまうと、データが消えてしまいます。）


#### ディスク内の既存のデータに影響を与えない方法
P80 のデータ ディスクを新規作成して仮想マシンに接続し、16TB 以上のサイズでボリュームを作成した上で、既存ボリューム上のデータを新規ボリュームにコピーします。
16TB ~ 32TB のサイズでボリュームを新規で作成した場合は、デフォルトのクラスター サイズが 8KB となるため、そのままご利用いただくことができます。

### 手順
#### 1. 対応しているサイズのデータ ディスクを新規作成して、仮想マシンにアタッチする
[公開情報：マネージド データ ディスクを Windows VM に接続する - Azure - Azure Virtual Machines | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/attach-managed-disk-portal)

Azure portal にて、対象の VM を選択します。
左のメニューから [ディスク] を選択し、[新しいディスクを作成し接続する] を選択します。
[保存] を選択したら、新しいデータ ディスクの作成と VM への接続の完了です。

![](./extend-data-disk-related-to-a-cluster-size-02.png)

#### 2. 新規ボリュームを作成する
[公開情報：ハード ディスク パーティションを作成してフォーマットする (microsoft.com)](https://support.microsoft.com/ja-jp/windows/%E3%83%8F%E3%83%BC%E3%83%89-%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF-%E3%83%91%E3%83%BC%E3%83%86%E3%82%A3%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E4%BD%9C%E6%88%90%E3%81%97%E3%81%A6%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88%E3%81%99%E3%82%8B-bbb8e185-1bda-ecd1-3465-c9728f7d7d2e)

まず、対象の VM に接続します。
まず、[スタート]  ボタンを右クリックし、 [コンピューターの管理] を開きます。
新規でアタッチしたディスクの上で右クリックし、[新しいボリューム]を選択し、希望のサイズで新規ボリュームを作成します。

![](./extend-data-disk-related-to-a-cluster-size-03.png)

しばらくすると、フォーマットが完了し、ボリュームが新規作成されます。

![](./extend-data-disk-related-to-a-cluster-size-04.png)

エクスプローラーでもボリュームが作成できたことを確認できます。

![](./extend-data-disk-related-to-a-cluster-size-05.png)

#### 3. 既存ボリューム上のデータを新規ボリュームにコピーする
[公開情報：robocopy | Microsoft Docs](https://learn.microsoft.com/ja-jp/windows-server/administration/windows-commands/robocopy)

新規ボリュームに既存のボリュームのデータをコピーします。

例）

```shell
robocopy F:\ G:\ /copyall
```

#### 4. 既存ディスクをデタッチする
[公開情報：Windows VM からデータ ディスクを切断する - Azure - Azure Virtual Machines | Microsoft Docs](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/detach-disk#detach-a-data-disk-using-the-portal)

Azure portal にて、対象の仮想マシンを選択します。
左のメニューから [ディスク] を選択し、既存のデータ ディスクの右端にある [X] ボタンを選択します。
[保存] を選択したら、既存のデータ ディスクが VM から接続解除されます。
※デタッチしたディスクはストレージに残ります。 ディスクが削除されるわけではありません。

![](./extend-data-disk-related-to-a-cluster-size-06.png)

## さいごに
Azure Windows VM において、データ ディスク拡張前の Windows NTFS のクラスター サイズが、ディスク拡張後のボリューム サイズに対応していない際は、ディスクを拡張する方法にご留意ください。
本記事が、皆様の運用に役立つことを願っています。
