---
title: "詳説 Azure ExpressRoute – Part1: ExpressRoute を導入する前に"
date: 2018-02-09 17:24:39
tags:
  - Archive
  - Network
  - ExpressRoute
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは。Azure サポートの宇田です。
今回から複数回にわたって、ExpressRoute について詳しく解説したいと思います。

* Part1: ExpressRoute を導入する前に
* [Part2: ExpressRoute のルーティング制御について](./archive/expressroute-deep-dive-part2.md)
* [Part3: ExpressRoute の導入手順について](./archive/expressroute-deep-dive-part3.md)
* [Part4: ExpressRoute の冗長構成について](./archive/expressroute-deep-dive-part4.md)
* [Part5: ExpressRoute の増速やプロバイダー変更について](./archive/expressroute-deep-dive-part5.md)
* [Part6: ExpressRoute の各種上限値について](./network/expressroute-deep-dive-part6.md)

## ExpressRoute とは何か

ExpressRoute は、オンプレミスと Azure を閉域網で接続するためのサービスです。

Azure (Microsoft) とは別にプロバイダー様と別途契約いただき、既存の WAN などと接続して、オンプレミスから Azure の各種サービス (一部を除く) に対して、Internet 経由や VPN 経由での接続と比較して低遅延で信頼性の高い通信ができるようになります。

* ExpressRoute の概要
https://docs.microsoft.com/ja-jp/azure/expressroute/expressroute-introduction

## 3 種類のピアリング形態

ExpressRoute では、接続先に応じて 3 種類のピアリング形態が用意されています。

(1 つの ExpressRoute 回線に対して、これら 3 つのピアリングを併用することが可能です)

* Private Peering: 仮想ネットワークとの接続 (Azure 上の Private IP 帯との接続)
* Public Peering: Azure のパブリック サービスとの接続 (Azure の Public IP 帯との接続)
* Microsoft Peering: Office 365 サービスとの接続

利用するサービスに応じて、必要になるピアリングを選択し、それぞれ構築いただく事となります。

例えば、Azure VM とだけ通信ができればよいという事であれば Private Peering のみで疎通が可能です。他方で、Azure Storage や SQL Database などといった PaaS のサービス群にアクセスする場合は、Public Peering が必要になります。

**2018/03/06 追記:**
**ExpressRoute の中長期的な予定として、Public Peering は Microsoft Peering へ統合される方針となっております。詳細については以下のアナウンスをご確認ください。**

* ExpressRoute の Public Peering と Microsoft Peering に関するアナウンス
https://jpaztech.github.io/blog/archive/expressroute-announcement-march-2018/

## Premium Add-On

ピアリングと併せて検討が必要な事項として、Premium Add-On があります。

国内で ExpressRoute をご利用になる場合、東京 or 大阪の接続ポイントから Azure に接続することになるかと思います。この際、東京で接続しても、大阪で接続しても、Azure の東日本・西日本リージョンとの通信が可能になります。

一方で、国内で接続した場合には、海外の Azure データセンターとは既定の状態では接続ができません。PaaS のサービスや Office 365 など、国内のデータセンターのみで完結せず海外との通信が必要になる場合や、DR 要件などで国外のリージョンをご利用になる場合には、別途 Premium Add-On が必要になります。

## ExpressRoute の費用

ExpressRoute を利用するにあたっては、様々な費用が発生しますので、事前に十分確認しましょう。

* ExpressRoute の価格 (Azure 側の Edge Router の費用および、従量課金プランの場合は転送量に応じた課金)
https://azure.microsoft.com/ja-jp/pricing/details/expressroute/

* ExpressRoute ゲートウェイの価格 (各仮想ネットワークに必要な Gateway の費用)
https://azure.microsoft.com/ja-jp/pricing/details/vpn-gateway/

* ExpressRoute プロバイダーの費用 (Azure - プロバイダー間の費用)

* アクセス回線の費用 (プロバイダー - オンプレミス間の費用)

Microsoft が関与するのは前者二点のみとなりますので、後者の費用については各プロバイダー様までお問い合わせください。

## プロバイダーの選択

ExpressRoute を契約するにあたっては、Microsoft のほかに回線プロバイダーとの契約も必要です。

多くのプロバイダーから ExpressRoute 関連サービスを提供いただいていますが、以下の二種類のプロバイダー様に大別され、提供されているサービスや責任範囲が異なりますので、事前に十分確認しましょう。

* L2 プロバイダー: ルーターの管理はお客様側で実施 (BGP オペレーターが必要)
* L3 プロバイダー: ルーターの管理を含めてプロバイダー様が提供

なお、L3 のプロバイダーと比較して費用が安価であるという理由で L2 のプロバイダーを選択されて、構築時に大変苦労されており、それによってコストメリットを十分に享受できていないようなお客様も、少なからずいらっしゃいます。L2 のプロバイダー様を利用する場合には、お客様側でルーターのコンフィグや管理を行うことになりますので、決して費用のみで判断せず、運用コストも含めて検討いただければと思います。(特に、BGP オペレーターがいない場合は、L3 のプロバイダーを利用することを強く推奨します。)

また、プロバイダーからオンプレミス側へのアクセス回線についても、専用線 / IP-VPN / 閉域 SIM など多様な形態が用意されています。こうした点についても、プロバイダー様へご相談ください。

## ExpressRoute のよくある誤解

### 全ての通信が ExpressRoute で完結する (?)

結論からいうと、答えは No です。

ExpressRoute をご利用いただくことで、多くの Azure サービスと閉域網で接続が可能ですが、一部の通信については、ExpressRoute だけでは完結しません。代表的な例をいくつかご紹介しましょう。

* Azure ポータル
ポータルは多種多様な接続先とバックグラウンドで通信を行っています。ExpressRoute を通るものもありますが、Azure 外の CDN を経由して配信されているもの等も存在しますので、ExpressRoute のみではアクセスできません。

* Azure CDN / Traffic Manager
FAQ にも記載の通り、これらのサービスは ExpressRoute 経由ではアクセスができません。また、利用されるサービスや API エンドポイントによっては、フロントエンドでこうした ExpressRoute 非対応のサービスを使用している場合があります。利用予定のサービスが ExpressRoute のみで通信できるのか、一部の通信は Internet へ出ることになるのかは事前にご確認ください。

### Internet から完全に分離できる (?)

先の内容とも重複しますが、Internet から完全に分離して疑似的にプライベート クラウドのように利用することは極めて困難です。IaaS の Azure VM のみを利用して、一切の拡張機能を使用しないなどであれば不可能ではありませんが、完全閉域にしようとすると利用できないサービスや機能制限が多々生じることになりますのでご注意ください。(例えば、Azure バックアップを利用しようとすると、Azure Storage の FQDN である xxx.blob.core.windows.net などに対して名前解決が必要となりますし、名前解決された IP アドレスは Azure データセンターの Public IP アドレスになります。)

### オンプレミスから L2 で延伸できる (?)

こちらも No です。ExpressRoute は、あくまでも L3 での接続となりますし、Azure の仮想ネットワークは VLAN には対応していません。

### セキュリティが高い (?)

ExpressRoute は閉域網で Azure と接続しますので、Internet 経由の通信と比較して盗聴リスクが低いことは間違いありません。また、Private Peering であれば、お客様にて作成した仮想ネットワークにのみ接続されるため、その他のお客様のネットワークとは分離されます。ただし、Public Peering や Microsoft Peering で接続されるネットワークは Azure や Office 365といったパブリック クラウドのネットワークになります。つまり、ExpressRoute 自体は Azure や Office 365 をご利用いただいているお客様が共通で利用しているネットワークとの接続のみを提供するサービスとなるため、その中のテナント（お客様が利用しているサーバー）との通信のみに制限すると行ったことはできません。

このように、ExpressRoute を利用したからといって、セキュリティ面を一切考慮しなくてよくなる訳では無いため、Public Peering や Microsoft Peering を利用する場合は、これまでのオンプレミス環境と同様に、多層防御の原則にのっとって適切にセキュリティを考慮していただくことが極めて重要です。
