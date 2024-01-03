---
title: クラシック環境の Azure VM をリソース マネージャー環境へ移行するには
date: 2016-05-11 10:16:16
tags:
  - Archive
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**
こんにちは。Azure サポートの宇田です。

今回は、Azure VM をクラシック (V1) からリソース マネージャー (V2) へと移行する方法についてご紹介いたします。

## 概要

Azure では現在、クラシック環境 (ASM: Azure Service Management) とリソース マネージャー環境 (ARM: Azure Resource Manager) の 2 種類のデプロイ モデルが用意されています。

リソース マネージャー環境では、クラシックでは特に意識をせずに使っていた NIC や IP アドレスも “リソース” として個々に管理するようになりました。個々のリソースが独立したおかげでより柔軟な構成が取れるように改善されており、マルチ NIC の構成やロードバランサーを使用した負荷分散も構成しやすくなりました。(その反面、各リソースをそれぞれ厳密に定義する必要がありますので、慣れるまでは面倒と感じられる方も多いかもしれません)

なお現時点 (2016/05) ではクラシック環境のリタイア予定などは決まっていませんので、今後も引き続きクラシック環境をご利用いただく事が出来ます。ただ、新機能などはリソース マネージャー環境でしか利用できないといった事も徐々に増えてきますので、既存の環境についても徐々にリソース マネージャー環境への移行を検討いただければと思います。

なお、移行のためのスクリプト等が今後も段階的にリリースされていきます。現時点では後述のリンクに記載の通り、制限事項もある状況とはなりますが、今後の提供スケジュールなどは以下で言及されていますので、あわせてご確認ください。

* [Transitioning to the Resource Manager model (英語)](https://azure.microsoft.com/en-us/blog/transitioning-to-the-resource-manager-model/)
* [Resource Manager モデルへの移行 (日本語訳)](https://blogs.technet.microsoft.com/jpitpro/2016/03/29/resource-manager-%E3%83%A2%E3%83%87%E3%83%AB%E3%81%B8%E3%81%AE%E7%A7%BB%E8%A1%8C/)

また、これまで Azure PowerShell で各種作業をスクリプト化されていた方も多いかと思いますが、コマンドレットもそれぞれ以下のように変更となります。各コマンドレットのパラメーターも変わっていますので、運用面も考慮に入れて移行の準備をしていただければと思います。

* ASM の場合: Get-AzureVM など <動詞>-Azure<名詞> の文法
* ARM の場合: Get-AzureRmVM など <動詞>-AzureRm<名詞> の文法

## Azure PowerShell や Azure CLI を使用して移行する

つい先日(2016/05) より、Azure PowerShell や Azure CLI を利用しての移行が可能となりました。(現時点では Public Preview)

ドキュメント類はまだ英語のみですが、以下に詳細な手順や制限事項などの記載がありますのでご確認ください。

* Platform supported migration of IaaS resources from Classic to Azure Resource Manager
https://azure.microsoft.com/ja-jp/documentation/articles/virtual-machines-windows-migration-classic-resource-manager/
* Clone a classic Virtual Machine to Azure Resource Manager using PowerShell Scripts
https://azure.microsoft.com/ja-jp/documentation/articles/virtual-machines-windows-migration-scripts/
* Migrate IaaS resources from Classic to Azure Resource Manager using Azure PowerShell
https://azure.microsoft.com/ja-jp/documentation/articles/virtual-machines-windows-ps-migration-classic-resource-manager/
* Migrate IaaS resources from Classic to Azure Resource Manager using Azure CLI
https://azure.microsoft.com/ja-jp/documentation/articles/virtual-machines-linux-cli-migration-classic-resource-manager/

## 手動で移行する

上記の PowerShell の方法でサポートされないシナリオの場合には、各リソースを手動で作成・移行する必要があります。

移行の主な手順としては以下の通りです。

<pre>1. クラシック環境の情報をメモします。

2. 仮想ネットワークを作成します。

 2-1. 新ポータルを開き、[参照] - [仮想ネットワーク] を選択します。

 2-2. 画面上部の [追加] より、事前にメモした情報をもとに新規で
      仮想ネットワークを作成します。
      - 名前 (例: JapanEast)
      - アドレス空間 (例: 10.0.0.0/16)
      - サブネット名 (例: Subnet-1)
      - サブネット アドレス範囲 (例: 10.0.0.0/19)
      - リソース グループ (新規でご設定ください)
      - 場所 (例: Japan East)

 2-3. 作成完了後、[参照] - [仮想ネットワーク] - [設定] - [アドレス空間] より
      必要に応じてサブネットを追加します。(例: Subnet-2, 10.0.32.0/19)

   ※ この際、GatewaySubnet という名前の /27 - /29 のサブネットを
      サイト間 VPN のゲートウェイ用に必ず作成ください。

3. 仮想ネットワーク ゲートウェイを作成します。

 3-1. [参照] - [仮想ネットワーク ゲートウェイ] を選択します。

 3-2. 上部の [追加] より、事前にメモした情報をもとに新規で仮想ネットワーク ゲートウェイを作成します。

      - 名前 (例: JapanEastGateway)
      - 仮想ネットワーク (先に 2. で作成した仮想ネットワークを指定します)
      - パブリック IP アドレス (新規作成します)
      - ゲートウェイの種類 (VPN を指定します)
      - VPN の種類 (静的: "ポリシー ベース"、動的: "ルート ベース" を指定します)
      - リソース グループ (新規もしくは先に 2-2. で作成したものを指定します)
      - 場所 (VNet と同一の地域を指定します)

   ※ 作成には数十分程お時間を要しますので、作成完了までお待ちください。

4. ローカル ネットワーク ゲートウェイを作成します。

 4-1. [参照] - [ローカル ネットワーク ゲートウェイ] を選択します。

 4-2. 上部の [追加] より、事前にメモした情報をもとに新規でローカル ネットワーク ゲートウェイを作成します。

      - 名前 (例: JapanOnpremiseGateway)
      - IP アドレス (オンプレミス側の VPN ルーターの IP アドレスを指定します)
      - アドレス空間 (オンプレミス側の IP アドレス帯を指定します)
      - リソース グループ (新規もしくは先に 2-2. で作成したものを指定します)
      - 場所 (リソース グループと同一のリージョンを指定します)

5. サイト間 VPN 接続を行います

 5-1. [参照] - [仮想ネットワーク ゲートウェイ] - [設定] - [接続] を選択します。

 5-2. 上部の [追加] より、先に作成した仮想ネットワーク ゲートウェイ等を指定しVPN 接続の設定を完了します。

      - 名前 (例: JapanEast-TokyoOffice)
      - 接続の種類 (オンプレミスとの接続時は "サイト対サイト" を選択します)
      - 仮想ネットワーク ゲートウェイ (手順 3. で作成したものを指定します)
      - ローカル ネットワーク ゲートウェイ (手順 4. 出作瀬したものを指定します)
      - 共有キー (VPN 接続に用いる共有キーを設定します)
      - リソース グループ (新規もしくは先に 2-2. で作成したものを指定します)
      - 場所 (リソース グループと同一のリージョンを指定します)

オンプレミスのルータで適切な設定を行われていれば、以上で VPN 接続が完了します。
ネットワーク設定が完了したら、仮想マシンを PowerShell にて作成します。

6. ストレージ アカウントを新規作成します。

 6-1. [参照] - [ストレージ アカウント] を選択します。
      この際 [ストレージ アカウント (クラシック)] を選択しないようご留意下さい。

 6-2. 上部の [追加] より、ストレージ アカウントを新規で作成します。
      既存のストレージ アカウントと同一名称は使用できませんのでご留意下さい。

7. VHD ファイルを新たに作成したストレージにコピーします。

 7-1. 事前に既存の仮想マシンをすべてシャットダウンし、停止します。

 7-2. VHD のコピーに際し、Microsoft Azure Storage Tools をダウンロードし、
      お手元のコンピュータにインストールを行います。

      Microsoft Azure Storage Tools
      https://aka.ms/downloadazcopy

 7-3. 管理者権限でコマンド プロンプトを起動し、AzCopy のフォルダに移動します。

      > cd C:\Program Files (x86)\Microsoft SDKs\Azure\AzCopy

 7-4. 続けて、以下のようにコマンドを実行し、VHD のコピーを行います。

      > azcopy.exe /source:<コピー元コンテナの URL> /dest:<コピー先コンテナの URL> /pattern: /sourcekey:<コピー元のアクセスキー> /destkey:<コピー先のアクセスキー>
      StorageA から StorageB に Disk.vhd をコピーするには以下の様に実行します。

      コマンド例
      > azcopy.exe /source:https://StorageA.blob.core.windows.net/vhds /dest:https://StorageB.blob.core.windows.net/vhds /pattern:Disk.vhd /sourcekey:<コピー元のアクセスキー> /destkey:<コピー先のアクセスキー>

   ※ ファイル サイズが大きい場合、コピーに長時間を要す可能性があります。
      コピーが成功すると、以下の様に表示されますので、successfully の箇所を
      ご確認ください。また、異なるリージョン間でコピーを行う場合には、
      ネットワークに課金が発生いたしますのでご留意頂ければと思います。

      ==============================
         Transferring files |
      
         Transfer summary:
         -----------------
         Total files transferred: 1
         Transfer successfully:   1
         Transfer failed:         0
      ==============================

8. コピーした VHD をもとに、PowerShell や JSON テンプレートを使用して仮想マシンを作成します。
   クラシック環境で負荷分散セットなどを使用していた場合には、[ロード バランサー] なども考慮して作成してください。</pre>

なお、項番 8. の仮想マシン再作成ですが、リソース マネージャー環境では各リソースを全て厳密に定義する必要があります。 ご利用の構成によってどのリソースをどのように構築する必要があるかは様々異なりますので、今回は細かく触れていませんがご了承下さい。

上記手順はあくまでも概要として捉えていただき、実際の移行作業は事前に十分検証を行ったうえで実施いただければと思います。

現在はまだ Public Preview とはなっておりますが、今後もアップデート等あれば本ブログにてご紹介したいと思います。
引き続き、最新の情報をチェックいただければ幸いです。
