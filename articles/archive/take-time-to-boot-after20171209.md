---
title: 2017/12/9 以降 Azure VM の起動に時間がかかる事象についての対処方法
date: 2017-12-18 10:17:24
tags:
  - Archive
  - Boot
disableDisclaimer: true
---

<span style="color:red;">12/16 より問題解消のための修正を開始し、現在 (12/25) では修正を提供しております。
一部 VM に対しては別途ユーザー様に対処が必要な項目がございますので、継続して起動に時間がかかる問題が発生する環境においては、以下にご案内いたします対処実施をご検討ください。</span>

### 対象となる VM について
- VMSnapshot という名前の拡張機能がインストールされている VM(Azure バックアップの対象VM)
- VM 停止状態においてバックアップが実行されているVM

 

こんにちは、Azure IaaS Support チームです。
12/9 より一部の Azure VM にて起動処理に時間がかかる事象が発生しています。
このブログでは事象の発生理由と問題解消に向けた取り組みについて周知いたします。


### 発生事象

Azure ポータル・Azure PowerShell・Azure Automation を利用した VM が起動するまでに長時間かかります。
場合によっては VM の起動が失敗します。


### 発生対象

Azure バックアップの対象となっている Azure VM (Windows) で発生します。
具体的には、VMSnapshot という名前の拡張機能がインストールされている VM で発生します。
この拡張機能は Azure バックアップの対象としているサーバーに自動的にインストールされます。


### 原因

VM 起動処理の一環として拡張機能のステータスをチェックするステップがあります。
12/8 に実施された VMSnapshot 拡張機能の更新モジュールに問題があり、VM 起動時のステータス チェックが完了しない状態となっております。
その結果、VM の起動処理が完了するまでに長時間かかります。場合によっては VM の起動が失敗します。


### 解消に向けた取り組み

マイクロソフトではすでに原因を特定して、VMSnapshot 拡張機能の修正版を対象の VM に対して配信しております。


### 対処方法

本問題は最新版の拡張機能に更新する事で解決いたします。拡張機能の更新は VM が起動している際にバックアップを実行すると自動で行われます。尚、 VM 停止状態においてバックアップが実行される場合には更新が行われません。
その為、対処としてまずは問題が発生する環境の VMSnapshot の拡張機能を削除下さいますようお願いいたします。


### 拡張機能の削除手順

1. Azure ポータルを開きます。
1. [Virtual Machines] - "対象の VM" - [拡張機能] - [VMSnapshot] を選択します。
1. [アンインストール] - [はい] を選択して拡張機能を削除します。

上記作業を実施する事で、対象の VM の問題については修正されますが、対象のサブスクリプション上には複数の VM が存在しており、またいくつかの VM については停止状態でバックアップが実行される為、更新が行われない可能性がございます。
その為、以下のスクリプトを実行して対象のサブスクリプション上にあるすべての VM に対して VMSnapshot の拡張機能削除をご検討下さいますようお願いいたします。

VMSnapshot の拡張機能は次回バックアップを実行する際に再度インストールされますので、以下の削除を実施する事でのデメリットや VM への影響はございませんのでご安心ください。


------------ スクリプト 開始 ------------
<pre>
## Azure にログインします。
Login-AzureRmAccount

## すべての VM 情報を取得します。
$VMs = Get-AzureRmVM

## VM に VMSnapshot の拡張機能が含まれる場合には削除します。
foreach($vm in $VMs){
  Remove-AzureRmVMExtension -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -Name VMSnapshot -Force
}
</pre>


------------ 実行結果例 ------------
<pre>
RequestId IsSuccessStatusCode StatusCode ReasonPhrase
--------- ------------------- ---------- ------------
True      NoContent           No         Content  <<<< 対象の拡張機能がない場合に記録
True                          OK         OK  <<<< 対象の拡張機能が削除された場合に記録

Remove-AzureRmVMExtension : Cannot modify extensions in the VM when the VM is not running.
ErrorCode: OperationNotAllowed
ErrorMessage: Cannot modify extensions in the VM when the VM is not running.
<<<< VMが起動していない為拡張機能が削除出来ない場合に記録
</pre>
