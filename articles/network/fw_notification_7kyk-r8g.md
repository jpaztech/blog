---
title: 東日本リージョンでの Azure Firewall のゾーン冗長に関するアナウンスの補足 (Tracking ID:7KYK-R8G)
date: 2023-11-30 14:30:00 
tags:
  - Network
  - Azure Firewall
---
こんにちは、Azure テクニカル サポート チームです。
2023 年 11 月 29 日に Azure Firewall で東日本リージョンの物理ゾーン #2 の使用に関するアナウンスがされました(Tracking ID:7KYK-R8G)。
アナウンスされた内容は英語でのご案内であるため、この記事にて補足させていただきます。

<!-- more -->

## 通知内容の日本語抄訳
東日本リージョンの物理ゾーン #2 にデプロイされた Azure Firewall に関する問題について、詳細をご報告いたします。
現在、可用性ゾーンを指定して Azure Firewall を構成する際に、東日本リージョンの物理ゾーン #2 をご利用いただくことが出来ないという問題が発生しております。
この問題は全ての SKU (basic / standard / premium) に影響があり、また、新規の Azure Firewall リソースのデプロイだけでなく、既存の Azure Firewall の起動にも影響を及ぼす可能性がございます。
現在事象の解消に向けた作業を実施しており、現時点で本制限は 2024 年 12 月に解除される予定となっております。

### 対応が必要な事項
<ol type="a">
 <li>東日本リージョンで新規に可用性ゾーンを持つ Azure Firewall をデプロイする場合：
  <ol type="a">
  <li>お客様のサブスクリプション内で、東日本リージョンの物理ゾーン #2 にマッピングされている論理ゾーンの番号を確認してください。次項の「物理ゾーン #2 にマッピングされた論理ゾーンの確認方法」をご覧ください。</li>
  <li>物理ゾーン #2 にマッピングされている論理ゾーンの使用を避けてください。この地域の他のゾーンに  Azure Firewall をデプロイするか、別のリージョン（例：オーストラリア東部）にデプロイしてください。</li>
  </ol>
 </li>
 <li>東日本リージョンで全ての可用性ゾーンにわたって Azure Firewall をデプロイしている場合：
 <ol type="a">
  <li>お客様のサブスクリプション内で、東日本リージョンの物理ゾーン #2にマッピングされている論理ゾーンの番号を確認してください。次項の「物理ゾーン #2 にマッピングされた論理ゾーンの確認方法」をご覧ください。</li>
  <li>お客様の Azure Firewall が物理ゾーン #2 にのみマッピングされているゾーンでデプロイされている場合、<a href="https://learn.microsoft.com/ja-jp/azure/firewall/firewall-faq#-----------------------------:~:text=%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E5%BE%8C%E3%81%AB%E5%8F%AF%E7%94%A8%E6%80%A7%E3%82%BE%E3%83%BC%E3%83%B3%E3%82%92%E6%A7%8B%E6%88%90%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%E3%81%A9%E3%81%86%E3%81%99%E3%82%8C%E3%81%B0%E3%82%88%E3%81%84%E3%81%A7%E3%81%99%E3%81%8B%3F">stop / startを使用して可用性ゾーンの設定を更新</a>し、他の可用性ゾーンを使用してください。
  </li>
  <li>その他の場合では、お客様の Azure Firewall は他の可用性ゾーンに依存して引き続き運用されます。ただし、何らかの理由でこのファイアウォールを<a href="https://learn.microsoft.com/ja-jp/azure/firewall/firewall-faq#azure-firewall-----------------:~:text=Azure%20Firewall%20%E3%81%AE%E5%81%9C%E6%AD%A2%E3%81%A8%E8%B5%B7%E5%8B%95%E3%81%AE%E6%96%B9%E6%B3%95%E3%82%92%E6%95%99%E3%81%88%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84">停止</a>した場合、物理ゾーン #2 を除いた<a href="https://learn.microsoft.com/ja-jp/azure/firewall/firewall-faq#-----------------------------:~:text=%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E5%BE%8C%E3%81%AB%E5%8F%AF%E7%94%A8%E6%80%A7%E3%82%BE%E3%83%BC%E3%83%B3%E3%82%92%E6%A7%8B%E6%88%90%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%E3%81%A9%E3%81%86%E3%81%99%E3%82%8C%E3%81%B0%E3%82%88%E3%81%84%E3%81%A7%E3%81%99%E3%81%8B%3F">異なる Availability Zones の設定で再起動</a>する必要があります。</li>
  </ol>
 </li>
</ol>

### 物理ゾーン #2 にマッピングされた論理ゾーンの確認方法
物理ゾーンは、Azure サブスクリプションや地域ごとに異なる論理ゾーンにマッピングされています。お客様のAzureサブスクリプションでこの物理ゾーンにマッピングされた論理ゾーンを確認するには、[本ドキュメントの手順](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview?tabs=azure-cli#physical-and-logical-availability-zones)をご実施ください。（現在、ドキュメントは英語のみとなります。本ブログ記事の「物理ゾーンと論理ゾーンのマッピングの確認方法」にも手順を記載しております。）

本問題に関して、情報のアップデートが行われた際には、速やかに最新の情報をご案内いたします。
この度は、お客様にご不便をおかけし、大変申し訳ありません。

## 状況別対応内容のまとめ
通知内容から、Azure Firewall の状況別に必要な対応のまとめは以下の通りとなります。

- 東日本リージョンでこれから新規に Azure Firewall をデプロイしたい場合:
  - ゾーン冗長なし、もしくは論理ゾーンと物理ゾーンのマッピングを確認し、物理ゾーン #2 以外を指定してデプロイする必要がございます。
- 既に東日本リージョンで複数のゾーンを指定してデプロイしている場合:
  - 対応は必要ございません。
- 既存の東日本リージョンの Azure Firewall が単一のゾーンのみ指定してデプロイしている場合:
  - 論理ゾーンと物理ゾーンのマッピングを確認し、物理ゾーン #2 に Azure Firewall がデプロイされている場合は[stop / startを使用して可用性ゾーンの設定を更新](https://learn.microsoft.com/ja-jp/azure/firewall/firewall-faq#-----------------------------:~:text=%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E5%BE%8C%E3%81%AB%E5%8F%AF%E7%94%A8%E6%80%A7%E3%82%BE%E3%83%BC%E3%83%B3%E3%82%92%E6%A7%8B%E6%88%90%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%E3%81%A9%E3%81%86%E3%81%99%E3%82%8C%E3%81%B0%E3%82%88%E3%81%84%E3%81%A7%E3%81%99%E3%81%8B%3F)する必要がございます。

## 物理ゾーンと論理ゾーンのマッピングの確認方法
物理ゾーンと論理ゾーンのマッピングは以下のコマンドで確認が可能です。

Azure CLI の場合
```Bash
az rest --method get --uri '/subscriptions/{サブスクリプション ID}/locations?api-version=2022-12-01' --query 'value'
```

Azure PowerShell の場合
```PowerShell
$subscriptionId = (Get-AzContext).Subscription.ID
$response = Invoke-AzRestMethod -Method GET -Path "/subscriptions/$subscriptionId/locations?api-version=2022-12-01"
$locations = ($response.Content | ConvertFrom-Json).value
```
コマンドを実行すると、各リージョンの物理ゾーンと論理ゾーンのマッピング情報が取得できます。このマッピングはサブスクリプションごとに異なります。
以下は各コマンドごとの取得したマッピング情報の抜粋となります。

Azure CLI の場合
```JSON
    "availabilityZoneMappings": [
      {
        "logicalZone": "1",
        "physicalZone": "japaneast-az2"
      },
      {
        "logicalZone": "2",
        "physicalZone": "japaneast-az3"
      },
      {
        "logicalZone": "3",
        "physicalZone": "japaneast-az1"
      }
    ],
```

Azure PowerShell の場合
```
id                       : /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/locations/japaneast
name                     : japaneast
type                     : Region
displayName              : Japan East
regionalDisplayName      : (Asia Pacific) Japan East
metadata                 : @{regionType=Physical; regionCategory=Recommended; geography=Japan; geographyGroup=Asia Paci
                           fic; longitude=139.77; latitude=35.68; physicalLocation=Tokyo, Saitama; pairedRegion=System.
                           Object[]}
availabilityZoneMappings : {@{logicalZone=1; physicalZone=japaneast-az2}, @{logicalZone=2; physicalZone=japaneast-az3},
                            @{logicalZone=3; physicalZone=japaneast-az1}}
```

logicalZone が論理ゾーンとなり、通常、ポータルやコマンドで見えているゾーンの番号となります。
physicalZone が物理ゾーンとなります。
今回は japaneast-az2 と紐づいている logicalZone の番号を Azure Firewall のデプロイ時に指定しないように対応が必要となります。

## Azure Firewall の停止および可用性ゾーンを指定する開始方法
Azure Firewall の Azure PowerShell での停止方法は以下のコマンドになります。
```PowerShell
$azfw = Get-AzFirewall -Name "ファイアウォール名" -ResourceGroupName "リソースグループ名"
$azfw.Deallocate()
Set-AzFirewall -AzureFirewall $azfw
```

例として、論理ゾーン 1 が物理ゾーン 2 の場合において、論理ゾーン 2, 3（物理ゾーン 1, 3）を指定して Azure Firewall を Azure PowerShell で開始する方法は以下のコマンドになります。

```PowerShell
$azfw = Get-AzFirewall -Name "ファイアウォール名" -ResourceGroupName "リソースグループ名"
$vnet = Get-AzVirtualNetwork -ResourceGroupName "リソースグループ名" -Name "VNet 名"
$pip= Get-AzPublicIpAddress -ResourceGroupName "リソースグループ名" -Name "Public IP 名"
$azfw.Allocate($vnet, $pip)
$azFw.Zones=2,3
$azfw | Set-AzFirewall
```
例として、2 つの Public IP が関連付けられており、マネージメント サブネットの Public IP がある Azure Firewall を論理ゾーン 2, 3（物理ゾーン 1, 3）を指定して Azure PowerShell で開始する方法は以下のコマンドになります。
```PowerShell
$azfw = Get-AzFirewall -Name "ファイアウォール名" -ResourceGroupName "リソースグループ名"
$vnet = Get-AzVirtualNetwork -ResourceGroupName "リソースグループ名" -Name "VNet 名"
$pip1= Get-AzPublicIpAddress -ResourceGroupName "リソースグループ名" -Name "Public IP 名"
$pip2= Get-AzPublicIpAddress -ResourceGroupName "リソースグループ名" -Name "Public IP2 名"
$mgmtPip = Get-AzPublicIpAddress -ResourceGroupName "リソースグループ名" -Name "マネージメント サブネットの Public IP 名"
$azfw.Allocate($vnet, @($pip1,$pip2), $mgmtPip)
$azFw.Zones=2,3
$azfw | Set-AzFirewall
```
****