---
title: Azure VM のシステムリソース高騰の原因調査について
date: 2023-04-28 12:00:00
tags:
  - VM
  - CPU
  - Memory
---

こんにちは、Azure テクニカルサポートの橋本です。

Azure VM の CPU 、メモリの使用率およびディスクビジー率が高騰し、原因調査のお問合せをいただくことがございます。
システムリソース高騰のトラブルシューティングでは事象発生中の OS のログが必要なことから、
事後対応による原因究明はほぼ不可能なため、発生中に OS にログインしてログを取得する、または事象発生に備えて定期的なログ取得設定を実施しておく必要があります。

本ブログ記事では、複数ございます公式ドキュメントのシステムリソース高騰のトラブルシューティングのご案内をお纏めしつつ、よくあるお問合せとトラブルシューティングの共通事項などを踏まえまして以下をご案内させていただきます。

<!-- more -->

　・Azure VM システムリソース高騰の一般的な要因
　・原因調査の流れ
　・問題のプロセスを追跡する

関連ドキュメント

> ご参考：Linux でのパフォーマンスのトラブルシューティングとボトルネックの分離
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-performance-bottlenecks-linux](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-performance-bottlenecks-linux)

> ご参考：Azure Windows 仮想マシンでの CPU 使用率の高い問題のトラブルシューティング
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm)

> ご参考：Azure Windows 仮想マシンでのメモリの高い問題のトラブルシューティング
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/azure-windows-vm-memory-issue](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/azure-windows-vm-memory-issue)


---

## ■ Azure VM システムリソース高騰の一般的な要因

システムリソース高騰要因の多くはご利用のアプリケーションのワークロードに依存したものとなり、
まれにご利用の OS 、アプリケーションのプログラムのエラー又はバグ等の不具合による原因もございます。
システムリソースを多く利用するプロセスを特定することがトラブルシューティングにおいて必須の作業となります。

プロセスが特定できましたら、アプリケーションログなどから、該当プロセスの観点から当時の接続数などの負荷状況を確認、
エラーなどによるリトライや処理滞留がリソースひっ迫を起こしていないか、
ご利用バージョンより既知不具合発生報告の事例確認等を行います。

なお、 Microsoft から提供されていない、 OS プロセス以外のサードパーティ製品や、
又はお客様作成の業務アプリケーションのプロセスが問題を引き起こしているケースですと、
プロセス機能の提供元へ原因調査をお願いさせていただいております。
これは、プロセスがなぜ多くのシステムリソースを利用しているか、
その妥当性については該当プロセス側の解析調査が必要となり、
弊社より  判断することができないためとなります。

> ご参考：Azure Windows 仮想マシンでの CPU 使用率の高い問題のトラブルシューティング - 一般的な要因
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm#common-factors](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm#common-factors)

---

## ■ 原因調査の流れ

お客様環境の Azure VM は監視ソフトウェアや Azure のメトリックのアラート設定によって
OS レベルのリソース状況を監視しているかと思います。
しかしながら、OS 上のプロセスレベルでのシステムリソース利用状況は Azure メトリックではログ取得できず、
監視ソフトウェアなどでもプロセスレベルの情報を取得しているケースはそれほど多くないと思います。

プロセスレベルでのシステムリソースの利用状況を別途取得しておりませんと、
事後に問題のプロセスを特定することがほぼ不可能となります。
この点を踏まえまして、一般的に Azure VM のシステムリソース高騰の原因調査は以下のような流れとなります。

  **(1) 事前のログ取得設定**
  **(2) システムリソース高騰が発生**
  **(3) (1) で取得設定していたログを回収し、稼働プロセス毎のリソース使用状況を解析**
  **(4) 特定したプロセスの観点から原因を究明**

---

## ■ 問題のプロセスを追跡する

ご利用の OS によって問題となっているプロセスの追跡に利用するツールが異なりますため、 
Windows 、 Linux それぞれのシナリオ毎に記載させていただきます。

#### 【Windows 環境で問題のプロセスを追跡する】

Windows 環境では、標準機能のパフォーマンスモニターを利用してプロセスレベルの情報を含む、
各システムリソースの利用状況を取得することが可能となります。
パフォーマンスモニターでのログ収集方法と、問題プロセスを追跡する方法についてはこちらの記事をご参照ください。

> ご参考：パフォーマンス ログ収集
> [https://jpwinsup.github.io/blog/2021/06/07/Performance/SystemResource/PerformanceLogging/](https://jpwinsup.github.io/blog/2021/06/07/Performance/SystemResource/PerformanceLogging/)

> ご参考：Azure Windows 仮想マシンでの CPU 使用率の高い問題のトラブルシューティング - プロセスを特定する
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm#identify-the-process](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-high-cpu-issues-azure-windows-vm#identify-the-process)


#### 【Linux 環境で問題のプロセスを追跡する】

Linux 環境では、プロセスレベルのリソース利用状況を確認するコマンドはありますが、
Windows のパフォーマンスモニターのようにスケジュール機能などが組み込まれたものがございません。

このため、 cron などの機能と組み合わせてコマンドでプロセス利用状況を定期的に取得する形となりますが、
公式ドキュメントには ps や top コマンドの説明のみでしたので、cron と合わせてご利用する際のサンプルを
以下にご用意させていただきます。

なお、記事内のサンプルスクリプトは、Microsoft の標準サポートプログラムまたはサービスではサポートされません。
サンプル スクリプトは現状有姿で提供され、いかなる保証も行いません。
この点についてはご了承のうえでご利用をお願いいたします。

**-------------------------------------------------------------------------**
**統計情報の取得**
**-------------------------------------------------------------------------**
プロセス毎のシステムリソース利用状況について事象発生前後の傾向を確認するため
cron にてプロセス情報の確認コマンドを定期実行します。

- ログ出力先ディレクトリの名前は以下を想定しています。
/var/osperf
こちらは空き容量の十分にある任意のディレクトリに変更いただいて問題ございません。
出力ログのサイズは環境に依存いたしますが検証環境では 1 回あたり 60 KB 程度でございました。

1. root ユーザにスイッチします。
```
sudo su -
```

2. ログ取得のスクリプトを作成します
```
mkdir /var/osperf
touch /var/osperf/osperf.sh
chmod 700 /var/osperf/osperf.sh
vi /var/osperf/osperf.sh
===
date >> /var/osperf/`date +%y%m%d`.free.out ; /usr/bin/free >> /var/osperf/`date +%y%m%d`.free.out
date >> /var/osperf/`date +%y%m%d`.meminfo.out ; /usr/bin/cat /proc/meminfo >> /var/osperf/`date +%y%m%d`.meminfo.out
date >> /var/osperf/`date +%y%m%d`.slabtop.out ; /usr/bin/slabtop -o >> /var/osperf/`date +%y%m%d`.slabtop.out
date >> /var/osperf/`date +%y%m%d`.psaux.out ; /usr/bin/ps aux --sort -rss >> /var/osperf/`date +%y%m%d`.psaux.out
date >> /var/osperf/`date +%y%m%d`.top.out ; /usr/bin/top -b -n 1 >> /var/osperf/`date +%y%m%d`.top.out
===
※osperf.sh ファイルにこちらの五行を記載
```

3. root 権限で以下コマンドより root ユーザの crontab を修正します
```
crontab -e -u root
===
*/10 * * * * sh /var/osperf/osperf.sh
===
※こちら、10 分毎に一度実行される形としております。
```
 
4. システムリソースの高騰の事象が再現しましたら
/var/osperf ディレクトリの情報の取得をお願いいたします。

今回ご案内させていただきました内容が、皆様のお役に立てますと幸いでございます。

---

