---
title: Liunx の NTP クライアント設定について
date: 2021-12-07 17:30:00
tags:
  - VM
  - Linux
---

こんにちは。Azure テクニカル サポート チームの橋本です。

本記事では　Azure 環境下での Linux OS での時刻同期に関してご紹介します。
公式ドキュメントのみではわかりづらい部分があるかと思いますので、よくご質問いただく内容を踏まえ、本記事で設定方法や、デフォルトの状態に関しての
情報を纏めてご紹介させていただければと考えております。
時刻同期の設計、環境構築などで今回の情報が皆様のお役に立てれば幸いです。

## 関連ドキュメント
公式ドキュメント上では以下の URL 情報にご案内があります。

> **Azure での Linux VM の時刻同期**
> [https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/time-sync](https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/time-sync)


## ご案内の概要

本記事では以下の情報をご紹介します。

1. デフォルトの時刻同期設定について
2. Azure 時刻同期サーバー、サービスの有無
3. PTP を利用した Azure ホストとの時刻同期

## 1. デフォルトの時刻同期設定について

デフォルトの時刻同期設定は、ご利用のイメージによって異なり、一律の設定となっているわけではありません。
基本的には以下のいずれかの設定となっています。

- 時刻同期サービスが未構成
- NTP を利用した外部 NTP サーバーとの時刻同期が構成されている
  (OS イメージ提供元にて提供されている NTP サーバーが指定されている)
- PTP を利用した Azure ホストとの時刻同期が構成されている

## 2. Azure 時刻同期サーバー、時刻同期サービスの有無

よく時刻同期のプロトコルとして利用されている NTP サーバーについては、お客様向けに Azure サービスとしてご用意はありません。
NTP をご利用いただくことについて制限などはありませんが、ご利用される場合には、外部の NTP サーバーをご指定いただく必要があります。

なお、Azure 上の Windows 仮想マシンの既定値に定義されている time.windows.com ですが、こちらはインターネット上のパブリックな NTP サーバーであり、Azure サービスとして提供しているものではなく、動作をサポートしているものではありません。

時刻同期のための Azure サービスとしては、 Azure ホストと同期する PTP を提供しています。
Azure Marketplace の最新の Linux イメージでは徐々に仮想マシンの時刻同期として PTP を利用するように変更されており、仮想マシンを作成した初期状態ですでに Azure ホストと同期されるように構成されているものもあります。

Azure ホスト自体は内部で Microsoft のタイムサーバーと同期しており、GPS アンテナを使用して、Microsoft が所有する Stratum 1 デバイスから時刻を取得しています。

## 3. PTP を利用した Azure ホストとの時刻同期

Azure ホストとの時刻同期を行う際の手順についてご紹介します。
以下の例では SUSE 環境での検証結果を前提として記載させていただきますが、パッケージインストールコマンド以外は基本的どのディストリビューションでも流れとしては同じとなります。

1. NTP など他の時刻同期のサービスが起動している場合は停止
   ```bash
   sudo su –
   # root 権限にて実施
   systemctl stop ntp
   systemctl disable ntp
   systemctl status ntp
   ```

2. chrony をインストール
   ```bash
   # root 権限にて実施
   rpm -qa | grep chrony
   zypper install chrony
   ```

3. インストールされた chrony パッケージが表示されることを確認
   ```bash
   # root 権限にて実施
   rpm -qa | grep chrony
   ```

4. lsmod コマンドを実行し、hv_utils が表示結果に存在するか確認
   ```bash
   # root 権限にて実施
   lsmod | grep hv_utils

   # 実行結果の例
   # hv_utils               32768  1 
   # ptp                    20480  1 hv_utils
   # hv_vmbus              106496  7 hv_storvsc,hv_utils,hid_hyperv,hv_balloon,hv_netvsc,hyperv_keyboard,hyperv_fb
    ```

5. PTP クロックソースが (hyperv) であることを確認
   高速ネットワークの利用有無など、環境によって出力結果が異なるため、後続の手順で正しいデバイス ファイルを選択するように hyperv の ptp クロックソースの情報を確認します。

   ```bash
   # root 権限にて実施
   ls /sys/class/ptp

   # 実行結果の例
   # ptp0 ptp1 ptp_hyperv

   cat /sys/class/ptp/ptp0/clock_name

   # hyperv
   ```

6. chrony を利用しPTP クロックソースを利用した時刻同期を構成
以下の例は手順 5 の確認の結果、ptp0 が正しい PTP クロックソースと確認した場合の設定となります。

```bash
   # root 権限にて実施
   vi /etc/chrony.conf
   ```

   ファイル末尾に以下行を追加
   ```bash
   refclock PHC /dev/ptp0 poll 3 dpoll -2 offset 0
   ```

7. chrony を起動し、さらにシステム起動時に自動実行
   ```bash
   # root 権限にて実施
   systemctl start chronyd
   systemctl enable chronyd

   # 実行結果の例
   # Created symlink from /etc/systemd/system/multi-user.target.wants/chronyd.service to /usr/lib/systemd/system/chronyd.service.
  ```

8. chrony による時刻同期状況を確認する ※PHC0 が存在すること
   ```bash
   # root 権限にて実施
   chronyc sources
   
   # 実行結果の例
   # 210 Number of sources = 1
   # MS Name/IP address         Stratum Poll Reach LastRx Last sample
   # ===============================================================================
   # #* PHC0                          0   3   377     3  +2401ns[+5304ns] +/- 2032ns
   ```

本記事が皆様のお役に立てれば幸いです。