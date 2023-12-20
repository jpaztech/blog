---
title: 予期せず Azure のリソースが消えた・構成が変わった場合の確認方法
date: 2018-02-09 13:41:10
tags:
  - Archive
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは、Azure サポートの宇田です。

今回は Azure のアクティビティ ログの確認方法についてご紹介します。

## リソースが消えた？構成が変わった？

Azure サポートに稀にお問い合わせいただく内容として、以下のようなものがあります。

* 何もしていないのにリソースが消えている
* いつの間にか構成が変わっている

こうした事象ですが、Azure が勝手にリソースを操作することは、原則としてあり得ません。
(サブスクリプションの無償枠を使い切った場合など、一部の場合を除きます)

もし万が一こうした事象に遭遇した場合は、以下のような方法で確認ください。

## 誰が操作したかをアクティビティ ログから確認する方法

Azure のポータルや PoweShell、CLI 等で行われた各種操作は、アクティビティ ログとして記録されます。

予期せずリソースが消失したり、構成が変わっている場合は、「いつ」、「誰が」、「どのような変更を」行ったかを確認しましょう。

* Azure アクティビティ ログでサブスクリプション アクティビティを監視する
https://docs.microsoft.com/ja-jp/azure/monitoring-and-diagnostics/monitoring-overview-activity-logs

上記ドキュメントの通り、ポータル等でも簡易的に確認することが可能ですが、Azure PowerShell を使う事で、詳細が確認できます。

<pre>PS> Get-AzureRmLog

# StartTime や EndTime のオプション等で時間帯を絞ったり、ResourceId で対象のリソースに絞る事も可能です。

Authorization        :
                       Scope     : /subscriptions/<サブスクリプション ID>/resourceGroups/<リソース グループ名>/providers
                       /Microsoft.Network/networkSecurityGroups/shudaArmWindowsNsg/securityRules/DenyAll
                       Action    : Microsoft.Network/networkSecurityGroups/securityRules/delete <== NSG の削除を実行
                       Role      :
                       Condition :
Claims               :
                       (中略)
                       ipaddr         : 203.0.113.130 <== クライアント端末の IP アドレス
                       name           : Shuhei Uda <== ユーザー名
                       http://schemas.microsoft.com/identity/claims/objectidentifier: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                       onprem_sid     : S-1-5-21-xxxxxxxxxx-xxxxxxxxx-xxxxxxxxx-xxxxxxx <== クライアント端末の SID
                       (中略)
HttpRequest          :
                       ClientId        : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                       Method          : DELETE
                       Url             :
                       ClientIpAddress : 203.0.113.130 <== クライアント端末の IP アドレス
Properties           :
                       statusCode     : Accepted
                       serviceRequestId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Caller               : xxxxx@microsoft.com <== 実行アカウント
Description          :
                       (中略)
Level                : Informational
ResourceGroupName    : <リソース グループ名>
ResourceProviderName : Microsoft.Azure.Management.Monitor.Models.LocalizableString
ResourceId           : /subscriptions/<サブスクリプション ID>/resourceGroups/<リソース グループ名>/providers/Microsoft.N
                       etwork/networkSecurityGroups/shudaArmWindowsNsg/securityRules/DenyAll <== 操作したリソースの ID
ResourceType         :
OperationId          : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx <== 操作 ID
                       (中略)
EventTimestamp       : 2018/02/07 4:41:33 <== 実行時刻 (UTC)
SubmissionTimestamp  : 2018/02/07 4:41:50
SubscriptionId       : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx <== サブスクリプション ID
TenantId             :
</pre>

## [注意事項]

※ アクティビティ ログは既定では 90 日しか保存されません。長期保存されたい場合は、Azure ストレージやイベントハブに転送する設定が必要です。(先の URL 内の “ログ プロファイルを使用してアクティビティ ログをエクスポートする” の項を参照ください。)

※ 操作を実行したクライアント端末の IP アドレスは、REST API の呼び出し元が記録されるため、Azure Cloud Shell や Azure Automation を利用した場合など、Azure のデータセンターが所有する IP アドレスとして記録される場合もあります。

※ アクティビティ ログに記録されるのは、あくまでも Azure のリソースに対する操作のみとなります。Azure ストレージ上のファイルが消えた等の事象については、本手法では確認する事が出来ませんので、ストレージの診断ログなどから確認をいただければと思います。(既定では無効なため、事前に有効化が必要です。)

* Azure ポータルでのストレージ アカウントの監視
https://docs.microsoft.com/ja-jp/azure/storage/common/storage-monitor-storage-account
