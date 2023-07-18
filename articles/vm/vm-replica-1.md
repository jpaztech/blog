---
title: VM 複製方法について part.1/3 2 つの方法の紹介
date: 2021-3-29 14:00:01
tags:
  - VM
  - Windows
  - Linux
  - HowTo
---

こんにちは、Azure テクニカル サポート チームの富田です。
今回はご案内することの多い、VM 複製方法についてとなります。

本記事は 3 部作の 1 記事目です。
 1. [VM 複製方法について 2 つの方法の紹介](https://jpaztech.github.io/blog/vm/vm-replica-1)
 2. [一般化したイメージから VM を複製する手順](https://jpaztech.github.io/blog/vm/vm-replica-2)
 3. [OS ディスクのスナップショットから VM を複製する手順](https://jpaztech.github.io/blog/vm/vm-replica-3)

VM 複製方法については多数の方法がありますが、こちらの記事では、よく使われる
 - 一般化を行いイメージを作成して、そのイメージから VM を複製する方法
 - OS ディスクのスナップショットを作成し、そのスナップショットから VM を複製する方法

に絞って説明させていただきます。  

本記事ではマネージド ディスクの使用を前提とさせていただきますので、アンマネージド ディスクをご利用いただいている場合は、下記手順より VM をマネージドディスクに変換をお願いいたします。

- Azure VM を Azure Managed Disks に移行する  
[https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/migrate-to-managed-disks](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/migrate-to-managed-disks)

詳細な手順は、part2 / part3 に記載いたしますので、まずは注意喚起および、それぞれの簡単な概要について紹介します。

---
## Windows VMを複製しようとしている方への注意喚起

重要な事のため、先に記載させていただきます。  
**<span style="color:red">Windows VM を複製しそれをご利用いただく場合、基本的には「一般化したイメージから VM を複製」いただく必要がございます。</span>**   
Windows VM の場合「OS ディスクのスナップショットから VM を複製」はバックアップ用途等でご利用いただけるものとなります。  

- 参考: Windows インストールのディスク複製のための Microsoft ポリシー  
[https://docs.microsoft.com/ja-jp/troubleshoot/windows-server/backup-and-storage/windows-installations-disk-duplication](https://docs.microsoft.com/ja-jp/troubleshoot/windows-server/backup-and-storage/windows-installations-disk-duplication)
 
>＝＝＝＝＝抜粋＝＝＝＝＝  
>When you deploy a duplicated or imaged Windows installation, it is required that the System Preparation (Sysprep) tool is used before the capture of the image.   
>＝＝＝＝＝＝＝＝＝＝＝＝  

---
## 一般化したイメージからVMを複製

こちらの手順では、一般化 (VM 内の固有のファイルやデータを削除) した後に、イメージを作成し、そのイメージから新規に VM を作成 (複製) いただくこととなります。

一般化したイメージから VM を複製いただく手順は基本的に下記の流れになります。
1. 複製元となる VM を作成する
2. 作成した VM で必要なソフトウェアのインストールや設定を行う
3. VM を一般化 (マシン固有のファイルとデータを削除) する
4. 一般化した VM より [イメージ] を作成する
5. 作成した [イメージ] より新規 VM を必要な数だけ作成する

一般化とは、VM を複製したりするための下準備として、マシン固有のファイルとデータを削除するものとなります。  
削除されるデータの例として、VM の管理者アカウント(Built-in Administrator) や SID (Security Identifier) があります。  

つまり、これらの情報は削除されていますので、イメージから新しく VM を作成 (複製) する際に、VM の管理者アカウントを設定し、SID も新規に割り振られるということとなります。
また、**<span style="color:red">一般化した VM は起動不可となるため再利用不可</span>** となりますので、ご注意ください。

なお、Windows VM では一般化をする際 Sysprep というツールを用います。  
そのため [一般化する] = [Sysprep する] と同義で言われることも多いです。

こちらの詳細な手順は [一般化したイメージから VM を複製する手順](https://jpaztech.github.io/blog/vm/vm-replica-2) をご参照ください。

---
## OSディスクのスナップショットからVMを複製

OSディスクのスナップショットから VM を複製いただく手順は基本的に下記の流れになります。

1. 複製元となるVMを用意する
2. VM を停止 (割り当て解除) し、OS ディスクの [スナップショット] を取得
3. 作成した [スナップショット] より必要な数だけ [ディスク] を作成
4. 作成した [ディスク] より VM 作成する

スナップショットからの複製でご注意いただきたい点として、スナップショットは VM 固有のファイルとデータは保持される、OS ディスクの完全読み取りコピーであるという点がございます。  
つまり、複製した VM は SID やホスト名が複製元と同一になります。   

完全複製による意図しない動作を防止するため、同一 VNET 上で元 VM と複製 VM を同時に起動しないようにしてください。  
スナップショットからの複製する場合は **<span style="color:red">別の VNET 上にデプロイするようにお願いいたします。</span>**     

こちらの詳細な手順は [OS ディスクのスナップショットから VM を複製する手順](https://jpaztech.github.io/blog/vm/vm-replica-3) をご参照ください。






