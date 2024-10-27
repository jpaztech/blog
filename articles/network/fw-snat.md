---
title: Firewall のパブリック IP と NAT ゲートウェイ併用構成の比較
date: 2024-10-25 14:30:00 
tags:
  - Network
  - Azure Firewall
  - NAT Gateway
  - Public IP Address
---

こんにちは、Azure テクニカル サポート チームの薄井です。
今回は Firewall のパブリック IP と NAT ゲートウェイ併用構成の比較について紹介します。

<!-- more -->

> [!NOTE] この記事は当初 Azure Firewall のパブリック IP の使われ方がランダムではなかったため、実際のパブリック IP の使われ方を説明しておりました。
しかしながら、2024 年 10 月時点ではパブリック IP がランダムに使用される動作に変更されたため、内容を Azure Firewall のパブリック IP と NAT ゲートウェイ併用構成の比較に変更いたしました。

## Azure Firewall のパブリック IP による SNAT について

Azure Firewall を経由してインターネット宛に通信するときは、関連付けられているパブリック IP へ送信元のアドレス変換（SNAT）が行われます。パブリック IP が 1 つしかない時はそのパブリック IP のアドレスしか使用されませんが、複数のパブリック IP アドレスが Azure Firewall に関連付けられている場合の動作は、以下のドキュメントの記載の通りランダムに選択されます。

[Azure PowerShell を使用して複数のパブリック IP アドレスを使用する Azure Firewall をデプロイする](https://learn.microsoft.com/ja-jp/azure/firewall/deploy-multi-public-ip-powershell)

> SNAT -送信 SNAT 接続に追加のポートを使用できるので、SNAT ポートが不足する可能性が低減されます。 Azure Firewall では、接続に使用する送信元パブリック IP アドレスがランダムに選択されます。 ネットワークにダウンストリーム フィルターがある場合、ファイアウォールに関連付けられているすべてのパブリック IP アドレスを許可する必要があります。 この構成を簡略化するには、パブリック IP アドレス プレフィックスを使用することを検討してください。

## NAT ゲートウェイ による SNAT について
Azure Firewall Subnet に NAT ゲートウェイを関連付けることにより、Azure Firewall のパブリック IP ではなく、NAT ゲートウェイで SNAT を行うことができるようになります。
注意点として、NAT ゲートウェイはゾーン冗長をサポートしていないため、利用する場合は Azure Firewall をゾーン冗長しないようにデプロイする必要があります。
Azure Firewall と NAT ゲートウェイを組み合わせて使用する方法については以下のドキュメントをご参照ください。

[Azure Virtual Network NAT を使用した SNAT ポートのスケーリング | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/firewall/integrate-with-nat-gateway)

[チュートリアル： ハブ アンド スポーク ネットワークで NAT ゲートウェイと Azure Firewall を統合する - Azure Virtual Network NAT | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/virtual-network/nat-gateway/tutorial-hub-spoke-nat-firewall)

## Azure Firewall と NAT Gateway の比較表
以下の表は Azure Firewall のパブリック IP による SNAT と NAT Gateway の機能比較表です。

|                       機能                 | Firewall のパブリック IP | NAT ゲートウェイ |
|:------------------------------------------|:---:|:--------:|
| SNAT ポート数（パブリック IP 1 つにつき）           |  2,496 * FW 内部インスタンス数 ※1  |    64,512    |
| 関連付けられる パブリック IP の数       |  250  |    16    |
| パブリック IP が使用される順番           |  ランダム  |    ランダムかつほぼ均等に使用される    |
| ゾーン冗長のサポート              |  ○  |     ×    |
| 価格              |  FW と FW のパブリック IP の価格  |  FW と FW のパブリック IP, NAT ゲートウェイと NAT ゲートウェイ のパブリック IP の価格    |

※1 Azure Firewall の内部インスタンス数は最低 2 となり、負荷に応じてスケールアウトします。

以上、ご参考になれば幸いです。

---
