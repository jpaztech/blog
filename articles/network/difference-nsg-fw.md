---
title: NSG と Azure Firewall の違い
date: 2020-12-11 14:30:00 
tags:
  - Network
  - NSG
  - Azure Firewall
---

こんにちは、Azure テクニカル サポート チームの薄井です。
今回は Network Security Group (NSG) と Azure Firewall の違いについて紹介します。

- NSG と Azure Firewall ってどっちもアクセス制御できるけれど何が違うの？
- どういう場面で使い分けたらいいの？

という、よくありそうな疑問に回答します。

<!-- more -->

## NSG と Azure Firewall の機能比較
以下の表は NSG と Azure Firewall の大まかな機能比較表です。

|                       機能                 | NSG | Azure Firewall |
|:------------------------------------------|:---:|:--------:|
| 動作箇所           |  サブネットと VM の NIC  |    ネットワークの境界    |
| 対象レイヤー       |  L3/L4  |    L3/L4 + L7    |
| サービスタグによるフィルター処理           |  ○  |     ○    |
| FQDN によるフィルター処理              |  ×  |     ○    |
| SNAT と DNAT                               |  ×  |     ○    |
| 脅威インテリジェンスベースのフィルター処理 |  ×  |     ○    |
| IDPS |  ×  |     ○ (Premium)    |
| 価格 |  無料  |     有料    |

### 動作箇所
NSG はサブネットや Azure 仮想マシンの NIC 上で動作します。
Azure Firewall はインターネット（仮想ネットワーク）と仮想ネットワークの境界で動作します。

### サービスタグによるフィルター処理
サービス タグは、指定された Azure サービスからの IP アドレス プレフィックスのグループを表します。 サービス タグに含まれるアドレス プレフィックスの管理は Microsoft が行い、アドレスが変化するとサービス タグは自動的に更新されます。これにより、ネットワーク セキュリティ規則に対する頻繁な更新の複雑さを最小限に抑えられます。
なお、NSG と Azure Firewall では使用できるサービスタグは異なります。

- [仮想ネットワーク サービス タグ](https://docs.microsoft.com/ja-jp/azure/virtual-network/service-tags-overview)

### FQDN によるフィルター処理
FQDN によるフィルター処理は Azure Firewall のみの機能となります。
FQDN タグを用いると、例えば VNET 内の Windows VM からの Windows Update を行うためのトラフィックを許可したりすることが可能です。
FQDN ターゲットを用いると任意の FQDN への HTTP, HTTPS および MSSQL へのアクセスを制御できます。また、*.microsoft.com への
アクセスを許可/拒否するといったワイルドカードを使用したルールを作成することもできます。
ネットワーク ルールでの FQDN フィルタリングにより、HTTP, HTTPS および MSSQL 以外のプロトコルも FQDN を用いたフィルター処理を行えます。

- [Azure Firewall の FQDN タグの概要](https://docs.microsoft.com/ja-jp/azure/firewall/fqdn-tags)
- [アプリケーション ルールのターゲット FQDN でワイルドカードはどのように機能しますか。](https://docs.microsoft.com/ja-jp/azure/firewall/firewall-faq#how-do-wildcards-work-in-an-application-rule-target-fqdn)
- [ネットワーク ルールでの FQDN フィルタリング](https://docs.microsoft.com/ja-jp/azure/firewall/fqdn-filtering-network-rules)

### SNAT と DNAT
Azure Firewall では Azure VM にパブリック IP アドレスを割り当てない場合でも、SNAT や DNAT の機能によって、
Azure Firewall のパブリック IP を利用することで Azure VM とインターネットとの間で通信が行えます。

- [Azure Firewall とは](https://docs.microsoft.com/ja-jp/azure/firewall/overview#outbound-snat-support)

### 脅威インテリジェンスベースのフィルター処理
Azure Firewall では脅威インテリジェンスベースのフィルター処理をすることが可能です。
ファイアウォール用に脅威インテリジェンスベースのフィルター処理を有効にして、既知の悪意のある IP アドレスやドメインとの間のトラフィックの警告と拒否を行うことができます。

- [Azure Firewall の脅威インテリジェンスベースのフィルター処理](https://docs.microsoft.com/ja-jp/azure/firewall/threat-intel)

### 価格
NSG は無料ですが、Azure Firewall は課金が発生します。

- [Azure Firewall の価格](https://azure.microsoft.com/ja-jp/pricing/details/azure-firewall/)

## その他
### Azure Firewall にて通信制御のルールやログを一元管理する
インターネット と VNet 間との通信やサブネット間の通信を全て Azure Firewall 経由とした場合は、
Azure Firewall 側で一元的に通信制御のルールを管理することができます。
また、診断ログの機能を使用した場合、FWで許可した通信と拒否した通信のログを一元的に記録することができます。

- [チュートリアル:Azure Firewall のログとメトリックを監視する](https://docs.microsoft.com/ja-jp/azure/firewall/tutorial-diagnostics)

## NSG と Azure Firewall のどちらを利用すべきか
以上が NSG と Azure Firewall の比較でした。
まとめますと、どちらを利用するかは、以下のように決定していただければと思います。

- NSG のみの機能で実現できるような場面では NSG のみを利用
- Azure Firewall の機能が必要な場面では Azure Firewall を利用
- 通信制御のログを一元管理する場合には Azure Firewall を利用

## FAQ
### WAF との違いは何ですか
WAF（Web Application Firewall）は、レイヤー 7 に特化して、Web アプリケーションを脆弱性や悪用から保護するファイアウォールです。
Azure Firewall は RDP、SSH、FTP など、あらゆるポートとプロトコルの送受信、HTTP/S 送信におけるアプリケーションの保護を行うものです。
Azure 上で利用できる WAF については以下のドキュメントをご参照いただければと思います。

- [Web アプリケーション ファイアウォールのドキュメント](https://docs.microsoft.com/ja-jp/azure/web-application-firewall/)

### IDS/IPS との違いは何ですか
一般的に言う IDS/IPS (IDPS) はネットワーク型で、ネットワーク上に流れるパケットを収集し、データやプロトコルなど分析し、攻撃パータンやルールにマッチした場合、検出・防止で制御します。
Azure Firewall では Premium SKU で IDPS 機能を提供しています。
また、DDoS Protection Basic / Standard ではバックボーン ネットワーク上で DDoS 攻撃検知・緩和が実施されます。

- [Azure Firewall Premium の機能](https://docs.microsoft.com/ja-jp/azure/firewall/premium-features)

以上、ご参考になれば幸いです。

---
