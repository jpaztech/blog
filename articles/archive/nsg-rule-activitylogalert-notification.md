---
title: ネットワーク セキュリティ グループのルール変更のアラート機能について

date: 2018-03-13 18:58:30
tags:
  - Archive
  - Network
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

## 問題
ポータルのアクティビティ ログ アラートの構成で NSG (リソースタイプ名：Microsoft.Network/networkSecurityGroups) の構成をしても、ルール (送信規則や受信規則) の変更をしても、アラートが設定した通知先に通知されない。

## 原因
ルールについては、別のリソースタイプの定義 (リソースタイプ名：Microsoft.Network/networkSecurityGroups/securityRules) であり、これが完全に一致しない場合は、アラートの機能としてアラートとして挙がらないため。もし、ルールではなく、NSG 自体の構成をした場合には、リソースタイプ名：Microsoft.Network/networkSecurityGroups のイベントが発生するため、アラートは発生します。

## 対応
現状ポータルからは、リソースタイプ名：Microsoft.Network/networkSecurityGroups/securityRules のアラート設定が対応していないため、ご利用いただく際には、PowerShellをご利用いただく必要があります。以下は簡単なサンプルです。

サンプル（新規にアクショングループを作成する場合）：

```PowerShell
$subscriptionId = "<サブスクリプションID>"
$scope = "/subscriptions/<サブスクリプションID>"
$emailReceiverName = "<メール受信の名前>"
$emailAddress = "<メールアドレス>"
$actionGroupName = "<アクショングループ名>"
$actionGroupNameShort = "<アクショングループ名（短い名前）>"
$activityAlertName = "<Activity Alert 名>"
Login-AzureRmAccount -Subscription $subscriptionId
$email_receiver = New-AzureRmActionGroupReceiver -Name $emailReceiverName -EmailReceiver -EmailAddress $emailAddress
$action = Set-AzureRmActionGroup -ResourceGroupName Default-ActivityLogAlerts -Name $actionGroupName -ShortName $actionGroupNameShort -Receiver $email_receiver
$AGAlertObject = New-Object Microsoft.Azure.Management.Monitor.Management.Models.ActivityLogAlertActionGroup
$AGAlertObject.ActionGroupId = $action.Id
$condition1 = New-AzureRmActivityLogAlertCondition -Field "category" -Equal "Administrative"
$condition2 = New-AzureRmActivityLogAlertCondition -Field "resourceType" -Equal "Microsoft.Network/networkSecurityGroups/securityRules"
$condition3 = New-AzureRmActivityLogAlertCondition -Field "status" -Equal "Accepted"
Set-AzureRmActivityLogAlert -ResourceGroupName Default-ActivityLogAlerts -Name $activityAlertName -Scope $scope -Location Global -Action $AGAlertObject -Condition $condition1,$condition2,$condition3
```

もし、上記は新規にアクショングループを作る方法ですが、もし既存のものを使いたい場合には、$email_receiver ... 以下の3行を以下に切り替えることで、既存のアクショングループを使うことが可能です。

```PowerShell
$action = Get-AzureRmActionGroup -ResourceGroupName Default-ActivityLogAlerts -Name "<アクショングループ名>"
$AGAlertObject = New-Object Microsoft.Azure.Management.Monitor.Management.Models.ActivityLogAlertActionGroup
$AGAlertObject.ActionGroupId = $action.Id
```

以上ご参考になれば幸いです。
