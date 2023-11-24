---
title: Microsoft ピアリングを経由するかどうかの確認方法
date: 2023-11-24 16:00:00
tags:
  - Network
  - ExpressRoute
---

こんにちは、Azure テクニカル サポート チームの山崎です。
今回は対象の通信が Microsoft ピアリングを経由するかどうかの確認方法についてご紹介します。

## Microsoft ピアリングで広報される経路について

ExpressRoute の Microsoft ピアリングをご利用の場合、ルートフィルターの設定でどのような経路を広報するかを設定します。

**(ルートフィルターの設定画面 - Azure ポータル)**
![](./judge-via-ms-peering/judge-via-ms-peering-01.png) 


**(実行コマンド)**
各サービスコミュニティで広報される経路については以下の PowerShell コマンドからご確認いただけます。

~~~
Get-AzBgpServiceCommunity
~~~


**(出力例 1)**
~~~
$communities = Get-AzBgpServiceCommunity
$communities | format-list

Name               : Exchange
Id                 : /subscriptions//resourceGroups//providers/Microsoft.Network/bgpServiceCommunities/Exchange
Type               : Microsoft.Network/bgpServiceCommunities
ServiceName        : Exchange
BgpCommunities     : {Exchange, Exchange IPv6}
BgpCommunitiesText : [
                       {
                         "ServiceSupportedRegion": "Global",
                         "CommunityName": "Exchange",
                         "CommunityValue": "12076:5010",
                         "CommunityPrefixes": [
                           "13.107.6.152/31",
                           "13.107.18.10/31",
                           "13.107.128.0/22",
                           "23.103.160.0/20",
                           "40.92.0.0/15",
                           "40.96.0.0/13",
                           "40.104.0.0/15",
                           "40.107.0.0/16",
                           "52.96.0.0/14",
                           "52.100.0.0/14",
                           "52.238.78.88/32",
                           "104.47.0.0/17",
                           "131.253.33.215/32",
                           "132.245.0.0/16",
                           "150.171.32.0/22",
                           "204.79.197.215/32",
                           "13.107.128.0/24",
                           "13.107.129.0/24",
                           "150.171.32.0/24",
                           "150.171.34.0/24",
                           "150.171.35.0/24",
                           "52.96.38.0/24"
                         ],
                         "IsAuthorizedToUse": false,
                         "ServiceGroup": "O365"
                       },
                       {
                         "ServiceSupportedRegion": "Global",
                         "CommunityName": "Exchange IPv6",
                         "CommunityValue": "12076:5010",
                         "CommunityPrefixes": [
                           "2603:1006::/40",
                           "2603:1016::/36",
                           "2603:1026::/36",
                           "2603:1036::/36",
                           "2603:1046::/36",
                           "2603:1056::/36",
                           "2620:1ec:4::152/128",
                           "2620:1ec:4::153/128",
                           "2620:1ec:c::10/128",
                           "2620:1ec:c::11/128",
                           "2620:1ec:d::10/128",
                           "2620:1ec:d::11/128",
                           "2620:1ec:8f0::/46",
                           "2620:1ec:900::/46",
                           "2620:1ec:a92::152/128",
                           "2620:1ec:a92::153/128",
                           "2a01:111:f400::/48",
                           "2a01:111:f403::/48"
                         ],
                         "IsAuthorizedToUse": false,
                         "ServiceGroup": "O365"
                       }
                     ]

Name               : OtherOffice365Services
Id                 : /subscriptions//resourceGroups//providers/Microsoft.Network/bgpServiceCommunities/OtherOffice365Se
                     rvices
Type               : Microsoft.Network/bgpServiceCommunities
ServiceName        : OtherOffice365Services
BgpCommunities     : {Other Office 365 Services, Other Office 365 Services IPv6}
BgpCommunitiesText : [
                       {
                         "ServiceSupportedRegion": "Global",
                         "CommunityName": "Other Office 365 Services",
                         "CommunityValue": "12076:5100",
                         "CommunityPrefixes": [
                           "13.107.6.171/32",
                           "13.107.6.192/32",
                           "13.107.9.192/32",
                           "13.107.18.15/32",
                           "13.107.140.6/32",
                       (... 省略)
~~~

**(出力例 2)**
~~~
$communities = Get-AzBgpServiceCommunity
$communities.BgpCommunities | where { $_.CommunityName -eq 'Azure Storage Japan East' }

ServiceSupportedRegion : Global
CommunityName          : Azure Storage Japan East
CommunityValue         : 12076:52012
CommunityPrefixes      : {13.73.8.16/28, 13.73.8.32/28, 20.38.116.0/23, 20.60.172.0/23...}
IsAuthorizedToUse      : True
ServiceGroup           : AzureStorage
CommunityPrefixesText  : [
                           "13.73.8.16/28",
                           "13.73.8.32/28",
                           "20.38.116.0/23",
                           "20.60.172.0/23",
                           "20.60.248.0/23",
                           "20.150.85.0/24",
                           "20.150.105.0/24",
                           "20.209.22.0/23",
                           "20.209.170.0/23",
                           "20.209.234.0/23",
                           "23.98.57.64/26",
                           "40.115.169.32/28",
                           "40.115.175.16/28",
                           "40.115.175.32/28",
                           "40.115.227.80/28",
                           "40.115.229.16/28",
                           "40.115.229.32/28",
                           "40.115.231.64/27",
                           "40.115.231.112/28",
                           "40.115.231.128/28",
                           "52.239.144.0/23"
                         ]
~~~

## 宛先が FQDN の場合

通信対象が IP の場合、上記の手順で IP をご確認いただくことで対象のサービスコミュニティが確認可能で、ルートフィルターの設定状況により Microsoft ピアリングを経由するかどうかを確認することが可能です。また、各サービス毎に以下のようなドキュメントでも ExpressRoute の対応状況について記載がされています。

  [Office 365 の URL と IP アドレスの範囲]
  [https://docs.microsoft.com/ja-jp/office365/enterprise/urls-and-ip-address-ranges](https://docs.microsoft.com/ja-jp/office365/enterprise/urls-and-ip-address-ranges)

  [Azure ExpressRoute と Azure Site Recovery]
  [https://docs.microsoft.com/ja-jp/azure/site-recovery/concepts-expressroute-with-site-recovery](https://docs.microsoft.com/ja-jp/azure/site-recovery/concepts-expressroute-with-site-recovery)

ドキュメントに記載がなく、対象が FQDN の場合には個別に調査が必要となります。Microsoft ピアリング観点としては IP を特定いただくことで経由、非経由が判断出来ますため、調査としては対象の FQDN に紐づく IP 情報についてご確認いただく必要がございます。

> 対象の FQDN に紐づく IP アドレスの調査については FQDN が利用されるサービス毎に調査が必要となりますので、ご利用サービス宛てにお問い合わせをお願いします。

対象の FQDN によっては IP が固定でわかる場合もあれば、情報公開されておらず不定の場合もあります。IP が明確に特定できないような場合には Internet 経由で通信できるようネットワークを構成いただければ幸いです。

以上、ご参考になれば幸いです。


