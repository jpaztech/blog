---
title: "Azure Peering Service と ExpressRoute の違いについて"
date: 2024-01-29 10:00:00
tags:
  - Network
  - ExpressRoute
  - Azure Peering Service
---

こんにちは。Azure サポートの宇田です。
今回は Azure Peering Service と ExpressRoute の違いについてご紹介いたします。

## Azure Peering Service とはどのようなサービスか

Microsoft Azure Peering Service (MAPS) は、インターネット サービス プロバイダー (ISP) や Internet Exchange (IX) 経由で Microsoft のグローバル ネットワーク (AS8075) へのルーティングを最適化し信頼性とパフォーマンスを強化するサービスです。サービス名に "Azure" の名前を冠してはいますが、その接続先は Azure だけではなく、パブリック インターネット経由でアクセス可能な Microsoft 365 や Dynamics 365 等を含んだ Microsoft のグローバル ネットワーク全体になります。

また、以下のドキュメントにも記載がありますが、Azure Peering Service は閉域接続 (プライベート接続) サービスではありません。あくまでも ISP や IX 経由で直接 Microsoft のネットワークに接続するサービスですので、他の AS を経由しない分だけホップ数や遅延が小さく抑えられ、通信経路上の影響を受けにくいというのみであり、位置づけとしてはパブリック ネットワーク (≒インターネット) 経由での接続となります。

* [Azure Peering Service の概要](https://learn.microsoft.com/ja-jp/azure/peering-service/about)

## ExpressRoute の Microsoft Peering と何が違うのか

Azure Peering Service と似たサービスとして、ExpressRoute 回線 (ExpressRoute Circuit) の Microsoft Peering が存在します。両者の違いについてお問い合わせいただく事も多いため、具体的な差異を以下の表でご説明します。

|  | Azure Peering Service | ExpressRoute (Microsoft Peering) |
| ---- | ---- | ---- |
| 接続先 | Microsoft のグローバル ネットワーク | 主に Azure のみ |
| Microsoft 側の ASN | 8075 | 12076 |
| 接続形態 | パブリック接続 (≒インターネット) | プライベート接続 (≒閉域網) |
| Azure VNet への接続 | 不可 | Private Peering を構成すれば可能 |
| Microsoft 365 との接続 [(*)](#Microsoft-365-との接続に関して) | 可能 | 一部の承認されたお客様のみ可能 |
| Azure 上のリソース [(**)](#Microsoft-の関与する範囲について) | テレメトリ機能を利用する場合のみ作成 | ExpressRoute 回線リソースを作成 |
| 接続料金 [(**)](#Microsoft-の関与する範囲について) | 原則、接続プロバイダー様のみにお支払い | Azure と接続プロバイダー様の双方にお支払い |
| SLA [(**)](#Microsoft-の関与する範囲について) | 接続プロバイダー様にご確認ください | MSEE 側の問題であれば Microsoft 側の SLA 有り |
| サポート窓口 [(**)](#Microsoft-の関与する範囲について) | 原則、接続プロバイダー様 | Azure (MSEE) 側は Microsoft、PE 側は接続プロバイダー様 |

### (*) Microsoft 365 との接続に関して

[Azure ExpressRoute for Microsoft 365](https://learn.microsoft.com/ja-jp/microsoft-365/enterprise/azure-expressroute) に以下の記載がある通り、ExpressRoute での Microsoft 365 への接続は承認制となっています。法規制により閉域接続が必須となっているような一部のお客様に限ってのみ承認され、そうした特殊な要件がない場合にはご利用いただけません。**Microsoft 365 との安定した接続を確保したい一般のお客様は、Azure Peering Service での接続をご検討ください。**(ただし、前述の通り Azure Peering Service は閉域接続のためのサービスではございませんのでご留意ください。)

> **Microsoft 365 の ExpressRoute は、ほとんどの状況でサービスに最適な接続モデルを提供しないため 、お勧めしません。** そのため、この接続モデルを使用するには Microsoft の承認が必要です。 お客様のすべての要求を確認し、必要なまれなシナリオでのみ、Microsoft 365 の ExpressRoute を承認します。 詳細については 、[ExpressRoute for Microsoft 365 ガイド](https://aka.ms/erguide) を参照してください。また、生産性、ネットワーク、セキュリティ チームに関するドキュメントの包括的なレビューに従って、Microsoft アカウント チームと協力して、必要に応じて例外を送信してください。 Microsoft 365 のルート フィルターを作成しようとしている未承認のサブスクリプションには、 [エラー メッセージが表示](https://support.microsoft.com/kb/3181709)されます。

また、Microsoft 365 は Internet 経由で快適にご利用いただけるよう弊社外の 3rd party の CDN サービス等も利用しているため、ExpressRoute と Azure Peering Service のいずれを利用される場合であっても、弊社外のエンドポイントとの通信に Internet 接続が必要となりますので、十分ご留意ください。

### (**) Microsoft の関与する範囲について

ExpressRoute をご利用の場合には、Azure 上で ExpressRoute 回線のリソースを作成したり、各種設定をご実施いただきます。他方で Azure Peering Service に関しては、(テレメトリの機能を利用しない限りは) Azure 上のリソースは作成したり、設定を行っていただく必要はなく、ExpressRoute 回線のように Microsoft に対して接続料金をお支払いいただくことはありません。言い換えますと、仮に通信障害などが発生したとしても、Microsoft としては料金を頂戴していないため、SLA による返金はございません。(接続プロバイダー様による SLA の提供有無をご確認ください。)

また、Azure 側に個々のお客様のリソースが存在せず、各接続プロバイダー様とお客様間の契約情報なども弊社では把握できないことから、障害時に Microsoft 側へお問い合わせいただいたとしても環境固有の調査などを行うことができません。したがって、トラブル時のお問い合わせ先 (サポート窓口) は原則として Microsoft ではなく、接続プロバイダー様となります。(接続プロバイダー様によって Microsoft 側に問題があると判断された場合には、接続プロバイダー様と弊社の NOC 間で調査を行うこととなります。)

以上、ご参考になれば幸いです。
