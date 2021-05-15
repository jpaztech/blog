---
title: Azure 上の Windows OS が起動しない場合の情報まとめ (2021 年 5 月 14 日更新版)
date: 2021-5-14 14:00:00
tags:
  - VM
  - Windows
  - noboot
---

こんにちは。Azure テクニカル サポート チームの重田です。 
今回は、当サポートチームの旧ブログでご紹介しておりました Windows OS が起動しない (noboot) 場合の情報について、情報を更新した上で改めてご紹介いたします。

更新元の記事：[Azure 上の Windows OS が起動しない場合の情報まとめ (2018 年 8 月 27 日版)](https://jpaztech1.z11.web.core.windows.net/Azure%E4%B8%8A%E3%81%AEWindowsOS%E3%81%8C%E8%B5%B7%E5%8B%95%E3%81%97%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AE%E6%83%85%E5%A0%B1%E3%81%BE%E3%81%A8%E3%82%81(2018%E5%B9%B48%E6%9C%8827%E6%97%A5%E7%89%88).html)

<!-- more -->

この Windows OS が起動しなくなる事象については、状況把握や復旧手段に関してご支援させていただいている際のポイントを、弊社 Windows サポートチームの公式ブログからご紹介しています。

> **OS が起動しなくなる問題が発生した場合の対処方法について – 概要**
> [https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-OutLine/](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-OutLine/)

> **OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法**
> [https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)

なお、上記 Windows OS 観点のブログに記載されている [3] - [6] を Azure 環境上でお試しいただく方法については、下記の別記事で紹介しています。

> **管理ディスクの場合：**
> 【管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-managed-disk/

> **非管理ディスクの場合：**
> 【非管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-unmanaged-disk/

本記事では、Windows OS が起動しなくなる事象に関する Azure 観点での状況把握や復旧方法に関する Tips のまとめをご紹介します。


<hr>

## TIPS #1 ブート診断による画面確認

Windows VM ではブート診断を有効化していただくことで、Azure ポータル上から OS の画面ショットを見ることができます。
RDP 接続が出来ない場合には、ブート診断を使ってどのような画面になっているか確認をしましょう。
具体的な手順については、下記公開情報をご確認ください。

> ブート診断を使用して Azure の仮想マシンのトラブルシューティングを行う方法
> [https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/boot-diagnostics](https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/boot-diagnostics)


<hr>

## TIPS #2 Azure における復旧方法

Windows OS が起動しなくなる事象は原因追及が困難な場合が多く、対処方法を実施しても必ず Windows OS が起動できるようになる保証はないことをご注意下さい。
最も確実な方法は **バックアップから復旧させる方法** になりますので、**定期的なバックアップのご取得** をご実施くださいますようお願いいたします。

もし、バックアップが存在しない場合には、上述の "[OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)" にて記載されているような対処をお試しいただきます。

### ■ バックアップからリストアする

#### Azure Backup
Azure Backup にて、VM のバックアップを取得しておけば、何かあった場合に正常時の状態からの復元が行える可能性が高いです。
Azure Backup に関する公開情報をいくつかご紹介いたしますので、ご参考情報としてご確認いただけますと幸いです。

> Azure で仮想マシンをバックアップする
> [https://docs.microsoft.com/ja-jp/azure/backup/quick-backup-vm-portal](https://docs.microsoft.com/ja-jp/azure/backup/quick-backup-vm-portal)

> Azure portal で Azure VM データを復元する方法
> [https://docs.microsoft.com/ja-jp/azure/backup/backup-azure-arm-restore-vms](https://docs.microsoft.com/ja-jp/azure/backup/backup-azure-arm-restore-vms)

> Azure VM バックアップのサポート マトリックス
> [https://docs.microsoft.com/ja-jp/azure/backup/backup-support-matrix-iaas](https://docs.microsoft.com/ja-jp/azure/backup/backup-support-matrix-iaas)


#### スナップショット
Azure Backup を使用できない場合は、ディスク リソースのスナップショットを取得し、有事の際にはそのスナップショットからディスクを復元する方法もあります。
スナップショットの取得に関する詳細な手順に関しましては、下記の公開情報をご確認ください。
なお、ディスクのスナップショットは、Azure Backup と異なり VM の稼働状態で取るとデータに不整合が発生する場合があります。
スナップショットを作成する前に VM を停止することをお勧めします。

> ポータルまたは PowerShell を使用してスナップショットを作成する
> [https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/snapshot-copy-managed-disk](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/snapshot-copy-managed-disk)
> ※ 管理ディスク用の手順になります。

#### OS ディスクのスワップ
ディスクを復元した際には、事象が発生した VM の OS ディスクと入れ替えることが可能です。
詳細な手順は下記をご確認ください。

> VM の OS ディスクをスワップする
> [https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows#swap-the-os-disk-for-the-vm](https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows#swap-the-os-disk-for-the-vm)
> ※ 管理ディスク用の手順になります。


### ■ 復旧用の VM を使って対応する

起動ができない VM の OS ディスクを、他の正常な VM にデータ ディスクとして接続することで、当該 OS ディスクに対する操作が可能となります。

順序が前後しますが、"[OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)" 内で紹介している "[3] SFC (System File Checker)、[4] regback を用いたレジストリ復旧、[5] 更新プログラムのアンインストール、[6] ファイルシステムの破損チェック" は、この方法で実施することができます。

Azure 側の具体的な手順に関しては、再掲となりますが、下記の別記事でご紹介していますので、ご利用環境に合わせてご確認ください。

> 【管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-managed-disk/

> 【非管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-unmanaged-disk/

なお、公開情報としては下記がございますのでご確認ください。

> Azure Portal から OS ディスクを復旧 VM にアタッチして Windows VM のトラブルシューティングを行う
> [https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows](https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows)


### ■ Windows の回復コンソールを使用する

"[OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)" 内で紹介している、"[1] スタートアップ修復、[2] Boot 構成情報の修正" を実施する場合、Windows の回復コンソールの立ち上げが必要となります。
回復コンソールは、Azure 上からは直接操作ができませんので、Nested Hyper-V をご利用いただくか、VHD ファイルをオンプレミス環境にダウンロードし Hyper-V 環境を構築することで行います。

オンプレミス環境に Hyper-V 環境が無い場合、Azure での Nested Hyper-V 用 VM を一時的に作成するということが便利です。
具体的な手順に関しては、下記公式ブログをご確認ください。

> Nested Hyper-V を使った VM の復旧
> [https://docs.microsoft.com/en-us/archive/blogs/jpaztech/recover_vm_using_nested_hyperv](https://docs.microsoft.com/en-us/archive/blogs/jpaztech/recover_vm_using_nested_hyperv)
<!-- 後で更新する -->

なお、オンプレミス環境で回復コンソールの立ち上げを実施する場合に関しても、オンプレミス環境で行う "Hyper-V 構築 → VHD のダウンロード → VM の起動" といった手順は、Nested Hyper-V を使った手順とほぼ同様となりますので、ご参考となれば幸いです。

<hr>

## TIPS #3 バックアップ取得に関する Tips

上述の通り、Windows OS としての対処をご実施いただいても、事象が 100％ 復旧するという保証はなく、最も確実な復旧方法はバックアップから復旧させる方法になります。
バックアップからのリストアであれば、復旧までの時間がある程度予測できることも利点と言えます。
復旧をより確実なものとするために、以下のような点についても心がけてください。

### ■ バックアップの基本: Azure Backup で複数世代のバックアップを保持する

Windows OS が起動できないという状態に陥った場合、何らかの形で Windows OS のデータ (レジストリやファイル システム、ファイル システムのメタデータ) が破損してしまっている場合があります。
このような場合において事例上少なくないのは、「バックアップを取得したその時点で、すでに何らかのデータが壊れてしまっていた」という状況です。

Azure Backup は、VM を止めずにバックアップを取得するができます。
ただし、稼働中の OS は、起動時に必要なファイルの一部が破損しても、次の再起動までは走り続けることができるという場合があります。

#### Windows イメージに何らかの支障が発生した状態で稼働が続いているとどのようになるか

「Windows VM を再起動したら、OS が正しく起動されなかった。OS の問題が起きているようなので、バックアップからリストアを行った。状況が改善しないため、何世代か前のバックアップを用いてリストアを複数試してみたが、どれをリストアしても同様に OS が正しく起動されない状態になってしまった。」といったシナリオになります。

もともと Windows OS 内のレジストリやファイル システムが破損していたがそのまま稼働していた場合、再起動時に問題が顕在化し、OS が正しく起動できない事象が発生します。

Azure Backup は「1 日ごとに 7 世代」といったポリシー設定に基づいて世代管理します。
その枠内で無事復旧できるイメージがあればいいですが、そうではない場合、Azure Backup でも復旧できないシナリオもある、ということをご紹介します。
稀で不運な事例ではありますが、リスクとしてご認識くださいますようお願いいたします。

### ■ ディスクのスナップショットを活用しよう

VM を再起動して無事に Windows OS が起動できたことが保証できるタイミングまでを含めて確認いただくことが一番安全ではありますが、再起動なんて月に 1 度か、それ以下しかしない、という場合も勿論あります。

その場合には、「正常な状態の VM を停止し、OS ディスクのスナップショットを作成しておく」ことをお勧めします。

上述の通り、データに不整合がある状態になることを防ぐため、スナップショットを作成する前に VM を停止することをお勧めします。
スナップショット作成のために、VM を停止 / 開始させることで、開始後に OS が正しく起動することを確かめることもできます。
(ゲスト OS のシャットダウンを実施してから VM の停止をご実施いただくとより安全です。) 
(OS 起動が確約されるのであれば、前のバージョンのスナップショットは削除しても問題ないので、1 世代分のスナップショットを保持すればよいということになります。)

Windows OS にアプリケーションを追加したり、Windows Update を適用する、といったシステム変更に際してディスクのスナップショットを作成しておくと安心です。

#### 追加コストの話

スナップショットの課金形態や考え方は、非管理ディスクと管理ディスクで若干異なります。
追加でコストが発生する部分となりますので、適切に理解をするため下記の通りご紹介します。


#### 非管理ディスクのスナップショット

非管理ディスクのスナップショットは、もとのディスク (VHD ファイル) のコピーではなく、その時点の差分データです。
そのため、VHD ファイルを誤って削除してしまうと、スナップショットも削除されてしまうのでご注意ください。
ただし課金の面では、差分の容量分のみが課金されます。

例:

1. 元々の使用量が 30 GB のVHDでスナップショットを作成する。
   この時点ではスナップショットぶんの課金ゼロであり、30 GB の VHD の容量分のみの課金となる。
2. VHD ファイル上に 1 GB の変更が加わる。
   この時点で以前のスナップショットとの差分で生じた 1 GB が加算された 31 GB ぶんの課金が発生する。

上記の詳細については、下記公開情報をご確認ください。

> Blob スナップショットの課金方法について
> [https://docs.microsoft.com/ja-jp/rest/api/storageservices/understanding-how-snapshots-accrue-charges](https://docs.microsoft.com/ja-jp/rest/api/storageservices/understanding-how-snapshots-accrue-charges)

> Managed Disks の価格
> [https://azure.microsoft.com/ja-jp/pricing/details/managed-disks/](https://azure.microsoft.com/ja-jp/pricing/details/managed-disks/)
>> <抜粋 (2021/5/14) > 
>> Premium SSD Managed Disks の完全なスナップショットとイメージを Standard ストレージに格納できます。
>>ローカル冗長 (LRS) とゾーン冗長 (ZRS) スナップショットのいずれかのオプションをお選びいただけます。
>> Standard LRS と Standard ZRS どちらのオプションでも、これらのスナップショットとイメージはディスクの使用量に応じて月々 ¥5.600/GB で課金されます。
>> たとえば、プロビジョニングされた容量が 64 GB のマネージド ディスクのスナップショットを作成し、実際に使用したデータ サイズが 10 GB だった場合、スナップショットは、使用したデータ サイズである 10 GB に対してのみ課金されます。
>> Premium SSD マネージド ディスク ストレージに保存することを選択した場合、1 か月あたり ¥17.024/GB で課金されます。

#### 管理ディスクのスナップショット

管理ディスクのスナップショットは、もとのディスク (VHD ファイル) の完全な複製です。
そのため、スナップショットを作成した元のディスクを削除してもスナップショットは削除されず、スナップショットからディスクの作成 (復元) を実施することが可能です。
課金の面では、スナップショット元のデータのコピーのため、実使用量分のデータが課金対象になります。

管理ディスクは、P10 (Premium, 128GiB) や S10 (Standard, 128GiB) といった決まったサイズごとに課金枠が決まっていますが、スナップショットはその中の実容量をベースに課金されます。
つまり、128 GiB の VHD 中、10 GiB しか使われていなかったら、10 GiB 分のみがスナップショットの課金額となります。

なお、Premium ストレージのスナップショットを Standard ストレージに取る、ということも可能です。
例えば、P10 の管理ディスクとそのスナップショット (Standard ストレージ) に取得する場合、[もとのディスクの料金 (P10)] と、[Standard スナップショットの容量別課金 × 使用している実容量 GiB] の課金が発生することとなります。

### ■ 参考資料

バックアップと高可用性、DR との違い、といった点も理解しておくことが重要です。
高可用性環境なら、VM 1 台の OS が起動しなかった場合にも復旧のための時間的猶予が生まれます。

下記公式ブログのアーカイブにて、Azure において様々に存在するダウンタイムを避けるサービスについて紹介しておりますので、ご参考情報としてご参照下さい。

> Azure エンジニアが解説する落ちないサービス入門
> [https://blogs.technet.microsoft.com/jpaztech/2018/05/29/aiming_no_downtime/](https://blogs.technet.microsoft.com/jpaztech/2018/05/29/aiming_no_downtime/)


本記事が皆様のお役に立てれば幸いです。

