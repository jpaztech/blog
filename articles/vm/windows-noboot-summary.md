---
title: Azure 上の Windows OS が起動しない場合の情報まとめ
date: 2021-5-14 18:00:00
tags:
  - VM
  - Windows
  - Noboot
---

こんにちは。Azure テクニカル サポート チームの重田です。 
今回は、当サポートチームの旧ブログでご紹介しておりました Windows OS が起動しない (noboot) 場合の情報について、情報を更新した上で改めてご紹介いたします。

<!-- more -->

この Windows OS が起動しなくなる事象については、状況把握や復旧手段に関してご支援させていただいている際のポイントを、弊社 Windows サポートチームのブログからご紹介しています。

> **OS が起動しなくなる問題が発生した場合の対処方法について – 概要**
> [https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-OutLine/](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-OutLine/)

> **OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法**
> [https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)

なお、上記 Windows OS 観点のブログに記載されている [3] - [6] を Azure 環境上でお試しいただく方法については、下記の別記事で紹介しています。

> **管理ディスクの場合：**
> 【管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-managed-disk/

本記事では、Windows OS が起動しなくなる事象に関する Azure 観点での状況把握や復旧方法に関する Tips のまとめをご紹介します。

---

## TIPS #1 ブート診断による画面確認

Windows VM ではブート診断を有効化していただくことで、Azure ポータル上から OS の画面ショットを見ることができます。
RDP 接続が出来ない場合には、ブート診断を使ってどのような画面になっているか確認をしましょう。
具体的な手順については、下記公開情報をご確認ください。

> ブート診断を使用して Azure の仮想マシンのトラブルシューティングを行う方法
> [https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/boot-diagnostics](https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/boot-diagnostics)

---

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

#### OS ディスクのスワップ
ディスクを復元した際には、事象が発生した VM の OS ディスクと入れ替えることが可能です。
詳細な手順は下記をご確認ください。

> VM の OS ディスクをスワップする
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows#swap-the-failed-vms-os-disk-with-the-repaired-disk](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows#swap-the-failed-vms-os-disk-with-the-repaired-disk)

### ■ 復旧用の VM を使って対応する

起動ができない VM の OS ディスクを、他の正常な VM にデータ ディスクとして接続することで、当該 OS ディスクに対する操作が可能となります。

順序が前後しますが、"[OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)" 内で紹介している "[3] SFC (System File Checker)、[4] regback を用いたレジストリ復旧、[5] 更新プログラムのアンインストール、[6] ファイルシステムの破損チェック" は、この方法で実施することができます。

Azure 側の具体的な手順に関しては、再掲となりますが、下記の別記事でご紹介していますので、ご利用環境に合わせてご確認ください。

> 【管理ディスク編】復旧 VM を使った Windows VM の Noboot 復旧手順
> https://jpaztech.github.io/blog/vm/noboot-recovery-managed-disk/

なお、公開情報としては下記がございますのでご確認ください。

> Azure Portal から OS ディスクを復旧 VM にアタッチして Windows VM のトラブルシューティングを行う
> [https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows](https://docs.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-recovery-disks-portal-windows)

> Azure 仮想マシンのブート エラーのトラブルシューティング
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/windows/boot-error-troubleshoot](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/windows/boot-error-troubleshoot)


### ■ Windows の回復コンソールを使用する

"[OS が起動しなくなる問題が発生した場合の対処方法について – 対処方法](https://jpwinsup.github.io/blog/2021/05/07/Performance/NoBoot/NoBoot-Solution/)" 内で紹介している、"[1] スタートアップ修復、[2] Boot 構成情報の修正" を実施する場合、Windows の回復コンソールの立ち上げが必要となります。
回復コンソールは、Azure 上からは直接操作ができませんので、Nested Hyper-V をご利用いただくか、VHD ファイルをオンプレミス環境にダウンロードし Hyper-V 環境を構築することで行います。

オンプレミス環境に Hyper-V 環境が無い場合、Azure での Nested Hyper-V 用 VM を一時的に作成するということが便利です。
具体的な手順に関しては、下記ブログをご確認ください。

> Nested Hyper-V を使った VM の復旧
> [https://docs.microsoft.com/en-us/archive/blogs/jpaztech/recover_vm_using_nested_hyperv](https://docs.microsoft.com/en-us/archive/blogs/jpaztech/recover_vm_using_nested_hyperv)

なお、オンプレミス環境で回復コンソールの立ち上げを実施する場合に関しても、オンプレミス環境で行う "Hyper-V 構築 → VHD のダウンロード → VM の起動" といった手順は、Nested Hyper-V を使った手順とほぼ同様となりますので、ご参考となれば幸いです。

---

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

スナップショットのコストについては、公式ドキュメントをご参照いただけますと幸いです。

> スナップショット（Azure Disk Storage の課金について）
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/disks-understand-billing#snapshots](https://learn.microsoft.com/ja-jp/azure/virtual-machines/disks-understand-billing#snapshots)

### ■ 参考資料

バックアップと高可用性、DR との違い、といった点も理解しておくことが重要です。
高可用性環境なら、VM 1 台の OS が起動しなかった場合にも復旧のための時間的猶予が生まれます。

下記ブログのアーカイブにて、Azure において様々に存在するダウンタイムを避けるサービスについて紹介しておりますので、ご参考情報としてご参照下さい。

> Azure エンジニアが解説する落ちないサービス入門
> [https://blogs.technet.microsoft.com/jpaztech/2018/05/29/aiming_no_downtime/](https://blogs.technet.microsoft.com/jpaztech/2018/05/29/aiming_no_downtime/)


本記事が皆様のお役に立てれば幸いです。

