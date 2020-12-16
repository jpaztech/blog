---
title: Azure Marketplace から作成した Windows VM において SMB 1.0 が有効化できない事象について
date: 2020-12-08 15:30:00
tags:
  - VM
  - Windows
---

こんにちは、Azure テクニカル サポート チームの菅澤です。

Azure Marketplace より作成した Windows Server 2012 R2 以降の VM について、SMB 1.0 がインストールしようとするとイメージファイルパスの指定を求められることがございます。
こちらの背景及び対処策についてご紹介いたします。

<!-- more -->
<hr>

## ■ Azure Marketplace 上の Windows イメージにおける SMB 1.0 への対応について
Azure Marketplace 上の Windows Seriver 2012 R2 以降のイメージは、2018 年秋以降、SMB 1.0 が無効化した状態にて公開しております。
この無効化方法が、OS 上で無効化しただけではなく、バイナリーファイルを除去という形になっておりますため、お客様にて SMB 1.0 を有効化（追加インストールを含む）することができないことになります。

多くのお客様より、SMB 1.0 の有効化が可能となるよう、バイナリ―ファイルの組み込みのご要望いただいておりますが、後述の通り、SMB 1.0 の利用を推奨できないという状況があるために、このような対応を行う予定はございません。
大変恐縮ではございますが、代替として SMB 2.x / 3.x のご利用をご検討いただけますと幸いでございます。

> 補足
> 技術的には、SMB 1.0 のインストールを行おうとした際に表示される代替ソースパスの指定画面において、これに対応するパッケージや iso ファイルを指定すればインストールを行うことが可能です。
> しかし Azure サポートでは、SMB 1.0 のパッケージの配布、iso ファイルの提供など、この有効化に関するサポートを提供しておりません。

<hr>

## ■ なぜ SMB 1.0 を利用できないのか
SMB 1.0 は設計から 30 年程度が経過するプロトコルとなっており、その脆弱性を利用した問題も多数発生しております。
この脆弱性に対処するためには、設計が根本から見直された SMB 2.x 以上のプロトコルを利用するほかに選択がない状況です。
このことから、当社として SMB 1.0 のご利用はセキュリティの観点から推奨できないこととなっております。
また、以下のように最新の Windows バージョンでは　SMB 1.0 が既定ではインストールされない旨、以下のドキュメントにてご連絡をさせていただいております。
　# OS としての対応は、サポートされない・有効化できない、というわけではなく、
　# 利用するには手動での追加インストールが必要となるものです。

( 参考 ) Windows 10 Fall Creators Update と Windows Server バージョン 1709 以降のバージョン
   の既定では SMBv1 はインストールされません
　https://support.microsoft.com/ja-jp/help/4034314/smbv1-is-not-installed-by-default-in-windows

上述の背景より、Azure Marketplace 上の Windows Server 2012 R2 以降のイメージでは、前述の通り SMB 1.0 を無効化した状態で公開しております。
なお、Azure としては、この無効化の方法が OS としての対応とは異なっており、前述の通りバイナリ―ファイルの除去という形が取られております。

<hr>


## ■ Winodws OS 上で有効となっている SMB クライアントバージョンを確認する方法について
Windows OS 上にて、どのバージョンの SMB クライアントが有効となっているかを確認したいというお客様も多くいらっしゃるかと存じます。
そんな場合には、Windows OS 上にて PowerShell を起動し、以下のコマンドを実行いただけますと、これを確認することが可能です。
```
sc.exe qc lanmanworkstation
```
実行結果中、DEPENDENCIES に MRxSmb20 が表示される場合、SMB 2.x / 3.x をご利用いただくことが可能となります。
また、MRxSmb10 が表示される場合には SMB 1.0 をご利用いただくことが可能となります。

( 参考 ) Windows と Windows Server で SMBv1、SMBv2、SMBv3 を検出する方法と有効
       または無効にする方法
　https://support.microsoft.com/ja-jp/help/2696547/how-to-detect-enable-and-disable-smbv1-smbv2-and-smbv3-in-windows-and
　ご確認いただきたい項：
　SMB クライアントで状態を検出し、SMB プロトコルを有効または無効にする方法

<hr>

## ■ SMB 1.0 を Azure VM にて利用したい場合の対処方法について
Azure Marketplace 上の Windows Seriver 2012 R2 以降のイメージを用いて作成した VM では SMB 1.0 を有効化いただくことは叶いません。
しかし、どうしてもこれを利用しなければならない場合もあるかと存じます。
このような場合にも、Azure VM としてプロトコルを規制しているわけではございませんので、前述の通り SMB 1.0 の利用は推奨できませんが、対処策といたしましてはお客様自身にて SMB 1.0 機能を有効化した、または有効化可能な状態の仮想ディスクをご用意いただくことでご利用いただくことが可能です。

以下に、仮想マシンを複製する方法および Hyper-V にて作成された 仮想ディスクを Azure 上に移行する方法に関するドキュメントを記載いたします。
こちらを参考に、ご検討くださいますようお願いいたします。
 
- 仮想マシンを複製する場合
　( 参考 ) Azure Resource Manager (ARM) 仮想マシンの複製方法のご紹介 (Part.1)
　https://blogs.technet.microsoft.com/jpaztech/2018/09/21/arm-vm-replication-part-1/
　( 参考 ) Azure Resource Manager (ARM) 仮想マシンの複製方法のご紹介 (Part.2)
　https://blogs.technet.microsoft.com/jpaztech/2018/09/25/arm-vm-replication-part-2/
 
- 仮想マシンをローカルからアップロードする場合
　( 参考 )Azure にアップロードする Windows VHD または VHDX を準備する
　https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/prepare-for-upload-vhd-image
　( 参考 )汎用化した VHD をアップロードして Azure で新しい VM を作成する
　https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/upload-generalized-managed
　( 参考 ) Azure 上の Windows Server 仮想マシンのライセンス認証
　https://blogs.technet.microsoft.com/jpaztech/2017/10/25/activate_windowsvm_on_azure/ 

上述の内容について、お客様 VM のセキュリティ向上のための施策であることとなり、何卒ご理解いただけますようお願いいたします。
また、本稿が皆様のお役に立てれば幸いです。
