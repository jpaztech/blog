---
title: "NSG フローログ から VNet フローログ への移行についてよくある質問"
date: 2025-02-26 09:00:00
tags:
  - Network
  - Network Watcher
  - NSG Flow Log
  - Vnet Flow Log
---

こんにちは、Azure テクニカル サポート チームです。

2027 年 9 月 30 日にネットワーク セキュリティ グループ (NSG) フローログが廃止され、2025 年 6 月 30 日以降新しい NSG フロー ログが作成できなくなるため、VNet フロー ログへ移行いただくことを推奨する内容がアナウンスされました。(Tracking ID:4NBJ-DQ0)
アナウンスされてから半年ほど経過いたしましたので、VNet フロー ログへの移行に際する概要およびよくある質問についてこの記事にてご紹介させていただきます。

## [アナウンスの概要]
2027 年 9 月 30 日にネットワーク セキュリティ グループ (NSG) フロー ログが廃止され、2025 年 6 月 30 日以降新しい NSG フロー ログが作成できなくなります。
提供終了日 (2027 年 9 月 30 日) を過ぎると、NSG フロー ログで有効になっているトラフィック分析がサポートされなくなり、サブスクリプション内の既存の NSG フロー ログ リソースが削除されるため、NSG のフロー ログの廃止に伴い、VNet フロー ログへの移行を推奨しております。

[ネットワーク セキュリティ グループのフローのログ記録](https://learn.microsoft.com/ja-jp/azure/network-watcher/nsg-flow-logs-overview)

> 重要 <br>
> 2027 年 9 月 30 日にネットワーク セキュリティ グループ (NSG) フロー ログは廃止されます。 この提供終了の一環として、2025 年 6 月 30 日以降新しい NSG フロー ログを作成できなくなります。 
> NSG フロー ログの制限を克服するために、仮想ネットワーク フロー ログに移行することをお勧めします。 
> 提供終了日を過ぎると、NSG フロー ログで有効になっているトラフィック分析がサポートされなくなり、サブスクリプション内の既存の NSG フロー ログ リソースが削除されます。 
> ただし、NSG フロー ログのレコードは削除されず、引き続きそれぞれのアイテム保持ポリシーに従います。 詳細については、公式告知を参照してください。

## [NSG フロー ログと VNet フロー ログの違い]
フロー ログは、ネットワーク トラフィックの監視と分析に使用される Network Watcher の機能の 1 つとして提供しているロギング サービスです。ネットワーク セキュリティ グループ (NSG) で設定したセキュリティ ルールの評価や仮想ネットワーク (VNet) 内のトラフィックを監視し、NSG で許可されたトラフィックと拒否されたトラフィックを記録することが可能です。今までは Subnet や NIC のみでしかログの採取ができませんでしたが、VNet フロー ログの登場によって、VNet 単位でのログを採取することが可能となりました。NSG フロー ログと VNet フロー ログの違いについて完結にお伝えすると、VNet フロー ログは、NSG フロー ログの上位互換にあたる機能となりますが、具体的な違いについては以下の表をご覧ください。

|機能の違い |NSG フロー ログ |Vnet フロー ログ |
|---|---|---|
|フロー ログを取得できる対象範囲 (ターゲット) |Subnet/NIC |VNet/Subnet/NIC |
|ログ形式 |[ログ形式](https://learn.microsoft.com/ja-jp/azure/network-watcher/vnet-flow-logs-overview#log-format)<br>[サンプル ログ レコード](https://learn.microsoft.com/ja-jp/azure/network-watcher/vnet-flow-logs-overview#sample-log-record) |[ログ形式](https://learn.microsoft.com/ja-jp/azure/network-watcher/nsg-flow-logs-overview#log-format)<br>[サンプル ログ レコード](https://learn.microsoft.com/ja-jp/azure/network-watcher/nsg-flow-logs-overview#sample-log-records)|
|トラフィック分析のスキーマ |[トラフィック分析スキーマ](https://learn.microsoft.com/ja-jp/azure/network-watcher/traffic-analytics-schema?tabs=nsg#traffic-analytics-schema) |[トラフィック分析スキーマ](https://learn.microsoft.com/ja-jp/azure/network-watcher/traffic-analytics-schema?tabs=vnet#traffic-analytics-schema) |
|ストレージ アカウント  |`https//{storageAccountName}@insights-logs-networksecuritygroupflowevent` のパス内に保存 |`https://{storageAccountName}@insights-logs-flowlogflowevent` のパス内に保存 |
|Log Analytics Workspace  |"AzureNetworkAnalytics_CL" テーブルに保存 |"NTANetAnalytics" テーブルに保存 |
|NSG フロー ログではサポートされず、<br>VNet フロー ログではサポートされたシナリオ  | 右記が非サポート シナリオ | ステートレス フロー内のバイトとパケット<br>仮想ネットワーク暗号化の識別(VNet Encryption)<br>Azure API マネージメント<br>Application Gateway<br>Virtual Network Manager<br>ExpressRoute Gateway<br>Virtual Machine scale sets<br>VPN Gateway<br>Azure VM (D family v6 series)<br>Azure VM (E family v6 series)<br>Azure VM (F family v6 series)|
|VNet フロー ログではサポートされず、<br>NSG フロー ログではサポートされるシナリオ  | なし | - |

## [FAQ]
Q1. 既存の NSG フロー ログのデータは削除されますか<br>
A1. いいえ。既存の NSG フロー ログのデータは削除されません (ただしストレージ アカウントのリテンション期間に準じます)。移行前のログ (NSG フロー ログ) は保存先のストレージ アカウント内の [insights-logs-networksecuritygroupflowevent] というパスに保存され、移行後のログ (VNet フロー ログ)は [insights-logs-flowlogflowevent] というパスに保存されます。
また、トラフィック分析を有効化にしている場合、NSG フロー ログは [AzureNetworkAnalytics_CL] テーブル、VNet フロー ログは [NTANetAnalytics] テーブルを Log Analytics ワークスペースのクエリで確認が可能です。

Q2. NSG フロー ログから VNet フロー ログへ移行スクリプトを利用して移行した場合、既存の環境において通信影響やパフォーマンス影響はありますか<br>
A2. いいえ。NSG フロー ログから VNet フロー ログへの移行に伴う通信影響ございません。

Q3. NSG フロー ログでトラフィック分析を有効化し、Log Analytics で独自のクエリを利用し分析を行っていましたが、VNet フロー ログでも同じクエリで分析することは可能ですか<br>
A3. いいえ。NSG フロー ログと VNet フローログでは、トラフィック分析のスキーマが異なるため NSG フロー ログで利用していたクエリを使い回すことはできません。VNet フロー ログのスキーマを参考の上、VNet フロー ログ用のクエリを作成いただく必要があります。

(参考)<br>
[トラフィック分析スキーマ - Network Watcher | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/network-watcher/traffic-analytics-schema?tabs=vnet#traffic-analytics-schema)

Q4. NSG フロー ログから VNet フロー ログへ移行スクリプトを利用する場合の PowerShell のバージョンに指定はありますか<br>
A4. Powershell 7 以降での動作を想定しております。 Powershell 7よりも前のバージョンでスクリプトを実行した場合、スクリプトの実行に失敗することが想定されます。Powershell のバージョンは $PSVersionTable を実行いただくことで確認可能です。

Q5. 移行スクリプト (MigrationFromNsgToAzureFlowLogging.ps1) を実行した際に選択できる、"Proceed with migration with aggregation" (集計あり) と "Proceed with migration without aggregation" (集計なし) の違いはなんですか<br>
A5. "Proceed with migration with aggregation" は、同じ VNet 内の NIC/Subnet に関連付けられている NSG の NSG フロー ログを 1 つの VNet フロー ログにまとめて、移行する方法です。例えば、VNetA 内に Subnet-1、NIC1 があり、それぞれに NSG が関連付けられており、NSG フロー ログを設定している場合 (NSG フロー ログが 2 つ設定されている) は、VNetA をターゲットとした VNet フロー ログが 1 つ作成されます。
一方で、"Proceed with migration without aggregation" は、同じ VNet 内の Subnet/NIC の NSG の NSG フロー ログを VNet フロー ログと 1:1 対応する形で移行する方法です。例えば、 VNetA 内に Subnet-1、NIC1 があり、それぞれに NSG が関連付けられており、NSG フロー ログを設定している場合 (NSG フロー ログが 2 つ設定されている) は、Subnet と NIC をターゲットとした VNet フロー ログが 1 つずつ作成されます。(現在有効化されている NSG フロー ログの数だけ VNet フロー ログが作成されます。)

[移行スクリプトを実行する - Network Watcher | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/network-watcher/nsg-flow-logs-migrate#run-migration-script)

> フロー ログを移行するネットワーク セキュリティ グループが同じ仮想ネットワーク内の 3 つのネットワーク インターフェイスに関連付けられている場合は、集計ありの移行を選択して 1 つの仮想ネットワーク フロー ログ リソースを仮想ネットワークに適用することができます。 <br>
> また、集計なしの移行を選択し、3 つの仮想ネットワーク フロー ログ (ネットワーク インターフェイスごとに 1 つの仮想ネットワーク フロー ログ リソース) を持つこともできます。

Q6. 移行の種類、"Proceed with migration with aggregation" (集計あり) と "Proceed with migration without aggregation" (集計なし) の選び方が分かりません<br>
A6. フロー ログの保存先をサブネットや NIC ごとに別のストレージ アカウントにしたい場合や、ログの対象を特定のサブネットや NIC のみに限定したい場合は、"Proceed with migration without aggregation" (集計なし) を選択し移行いただく必要があります。

Q7. NSG フロー ログを有効化しており、トラフィック分析も有効化していますが、VNet フロー ログ移行後はトラフィック分析を無効化したいと考えています。移行スクリプトのオプションでトラフィック分析を無効化することはできますか<br>
A7. いいえ。移行スクリプトでは、既存の NSG フロー ログの設定を引き継ぐ形で VNet フロー ログが作成されます。トラフィック分析を無効化したい場合、移行前にトラフィック分析を無効化いただく、もしくは移行後にトラフィック分析を無効化いただく必要があります。

Q8. 移行スクリプト (MigrationFromNsgToAzureFlowLogging.ps1) を実行した際に VNet フロー ログの名称は指定できますか<br>
A8. いいえ、移行スクリプトを用いた移行では VNet フロー ログの名称が自動的に指定されるため明示的に名称を指定することはできません。明示的に名称を指定したい場合、VNet フロー ログを新規で作成いただく必要があります。
自動的に指定される名称は、移行の種類 ("Proceed with migration with aggregation"/"Proceed with migration without aggregation") によって命名規則が異なります。<br>
"Proceed with migration with aggregation" の場合、<Subnet や NIC が属する VNet 名> "-" <リソースグループ名> "-" flowlog の命名規則で VNet フロー ログが作成されます。<br>
"Proceed with migration without aggregation" の場合、<NIC 名/ Subnet 名> "-" <リソースグループ名> "-" flowlog の命名規則で VNet フロー ログが作成されます。

Q9. 2025 年 6 月 30 日以降に既存の NSG フローログの設定変更はできますか<br>
A9. はい。2025 年 6 月 30 日以降、新規の NSG フローログは作成不可となりますが、既存の NSG フローログの設定変更は可能です。
