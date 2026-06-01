---
title: Azure Marketplace の Windows Server 2022 イメージ非推奨化（.NET 6 同梱イメージ）について
date: 2026-06-01 17:00:00
tags:
  - VM
  - VMSS
  - Windows
  - Image
  - .NET
  - HowTo
---

こんにちは、Azure テクニカル サポート チームです。
この度、Azure Marketplace にて提供されている一部の Windows Server 2022 イメージが **2026 年 6 月 9 日** をもちまして非推奨 (deprecated) となる旨 Service Health 通知 8PJS-_48「**Image deprecation notice: Plan your migration to the new Azure Marketplace Windows Server 2022 image offer by 9 June 2026**」されております。
本件につきまして多くのお問い合わせをいただいておりますため、通知の背景や必要な対応、対象 VM の確認方法などを以下にご紹介させていただきます。

---
## 今回ご確認されております通知について

この度ご確認いただいております通知につきましては、Azure Marketplace にて提供されている旧 Windows Server 2022 イメージが **2026 年 6 月 9 日** をもちまして非推奨となるため、対象イメージより作成いただいた環境をご利用のお客様に対して、期限が迫ってきている旨のお知らせ、ならびに対処をお願いさせていただくことを目的としたご案内となります。

具体的には、**".NET 6" のサポート満了**や予定されておりますパッチ提供の終了に伴い、.NET 6 が既定で導入されております一部の Windows Server 2022 イメージが Azure 上で非推奨となる事を記した情報となります。

> [!NOTE]
> 本件は **".NET 6 が同梱されている Windows Server 2022 イメージ"** が対象です。Windows Server 2022 という OS そのもののサポート終了を示すものではございません。

■ご参考：Incoming Changes for Window Server 2022 Marketplace Image Users
[Breaking change for Window Server 2022 Image Users with .NET 6](https://techcommunity.microsoft.com/blog/azurecompute/incoming-changes-for-window-server-2022-marketplace-image-users/4262423)

以下に詳説申し上げます。

---
## 1. .NET 6 に関する必要な対応について

.NET 6 につきましては、**2024 年 11 月に EOL** を迎えており、上述の通りサポートが満了しておりますので、.NET 8 等、サポートされている新しいバージョンに移行していただくことを推奨しております。

なお対象の Windows Server 2022 イメージ群につきましては、上記 EOL 後の影響を鑑みて、後述の公開情報にも記載のある通り、パッチ対応 (セキュリティ修正) が **2026 年 6 月まで**の提供という形で継続されておりましたが、当該パッチ対応の終了に伴い、イメージ自体も非推奨となる流れとなっております。

.NET はバージョン間で互換性がありませんので、ランタイムを利用しているアプリケーションを特定いただき、ご利用の各アプリケーションにおきましても、適宜新しい .NET のバージョンに対応いただく必要がございます。

もし .NET 8 が必要なアプリケーションがあり、.NET 8 をインストールされたい場合には以下のリンクから入手してインストールしていただけますと幸いです。

■ご参考：.NET 8.0 のダウンロード
[.NET 8.0 (Linux、macOS、Windows) のダウンロード | .NET](https://dotnet.microsoft.com/ja-jp/download/dotnet/8.0)

> [!TIP]
> .NET を利用しているアプリケーションによっては、更新の際に再起動が必要となる場合がございます。こちらにつきましては .NET を利用されますアプリケーションの観点からご確認をいただけますと幸いです。
> 一般的に .NET Framework や、.NET ランタイム ライブラリのバージョン アップ時には再起動が行われるという前提での対応、例えば業務時間外や、ダウンタイムについての事前の周知の上での一時的サービス停止を行うなどの対応を行われることを推奨しております。

---
## 2. 対処しなかった場合について

なお .NET 6 のご利用を継続いただいた場合でも、Windows Server OS のサポート自体がされなくなるという状況ではございませんが、アンインストールを行わずに継続してご利用される場合、**パッチの提供が終了されている製品を利用いただく**こととなりますので、セキュリティ観点やコンプライアンスの観点等においてリスクが生じる事が想定されます。

また、対象のイメージ群が非推奨となった場合におきましても、当該イメージより作成された VM や VMSS インスタンス環境が即時に停止されるといったことはございませんが、上記の通りパッチ提供が終了する .NET 6 を引き続きご利用いただくことに関するリスクが生じる点に加え、非推奨化に伴い、以下の制約が生じます。

- **新規仮想マシンおよび VMSS の作成**ができなくなります
- **VMSS のスケール アウト**ができなくなります
- 別のイメージを指定するなどの対処が必要となります
- **新しいイメージ バージョンの公開も終了**いたしますので、VMSS をご利用の場合、イメージの更新による最新化が叶わないこととなります

単体の仮想マシンにつきましては Windows Update 経由でゲスト OS の更新がご実施いただけますが、**VMSS につきましては、ゲスト OS の更新が Azure Marketplace の OS イメージ更新に依存**しております。そのため、期日までに対応を実施いただくことをご検討くださいますようお願いいたします。

この点につきましては、お客様の運用方針に基づきご判断いただく必要がございますが、弊社といたしましては、リスク低減の観点から、**.NET 6 のアンインストールまたはサポート対象バージョンへの移行**をご検討いただくことを推奨しておりますこと、お含みおきをいただけますと幸いです。

---
## 3. Windows Server 2022 イメージが非推奨となる事への必要な対応について

もし非推奨となる Windows Server 2022 イメージをご利用いただいております場合でも、**既に動作中の既存の VM には影響を及ぼしません**が、当該イメージを利用した新規 VM の作成不可や VMSS のスケールアウト不可など、運用環境によっては今後のご作業に影響を及ぼす可能性がございます。

この度通知された非推奨となるイメージは**購入プランのないイメージ**となりますため、新たなイメージへの直接的な移行は叶いません。
そのため、イメージの更新が必要と判断される環境の場合、対処方法として以下の 2 通りがございますので、ご確認をくださいますと幸いです。

### 対処方法 1：非推奨ではないイメージまたはカスタム イメージから VM を再作成する

対象のイメージにつきましては今後廃止も予定されており、Azure Marketplace では、**2025 年 3 月 9 日より .NET 6 を含まない新しいイメージ**を提供しておりますため、期日 (2026 年 6 月 9 日) までに、必要に応じて新イメージによる再構築の対処につきましてもご検討くださいますようお願いいたします。

> [!IMPORTANT]
> 新イメージでは、**.NET がイメージに同梱されなくなります**。
> ご利用環境にて .NET 6 を使用するアプリケーションを動作させている場合、当該アプリケーションが **.NET 8 または 10 で動作することをご確認**いただいた上で、インスタンス作成後に .NET 8 または 10 をインストールする必要がありますこと、ご注意くださいますようお願いいたします。

### 対処方法 2：イメージの移行をせず、.NET の更新またはアンインストールをする

上述の通り、対象のイメージには .NET 6 が含まれている状況となりますため、作成いただいた環境にて .NET 6 をご利用いただいていない場合においても、セキュリティ / コンプライアンスの観点から、必要に応じて、**.NET 6 の削除やアップグレード**などをご検討いただく必要があるかと存じます。

非推奨イメージに関する仕様等につきましては、下記公開情報に記載がございますので、併せてご確認いただけますと幸いでございます。

■ご参考：非推奨のイメージに関する FAQ
[非推奨の Azure Marketplace イメージ - Azure Virtual Machines | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/virtual-machines/deprecated-images)

---
## 4. 対象 VM の確認方法について

よくあるご質問事項として、対象 VM の確認方法に関するご質問をいただく事がございます。
こちらにつきまして、下記の **Azure Resource Graph (ARG) クエリ**がご活用いただけるかと存じます。

**＜手順＞**

1. Azure Portal 上部の検索にて "**Resource Graph エクスプローラー**" を入力し、Resource Graph エクスプローラーに移動します。
2. 下記クエリを入力の上、画面上部の **[クエリの実行]** をクリックします。

**＜クエリ＞**

```kusto
// VM の場合
Resources
| where type == "microsoft.compute/virtualmachines"
| extend offer = tostring(properties.storageProfile.imageReference.offer)
| extend sku  = tostring(properties.storageProfile.imageReference.sku)
| extend publisher = tostring(properties.storageProfile.imageReference.publisher)
| where publisher =~ "MicrosoftWindowsServer"
| where offer =~ "WindowsServer"
| where sku startswith "2022"
| project subscriptionId, resourceGroup, name, location, offer, sku, imageVersion = tostring(properties.storageProfile.imageReference.version)
| order by subscriptionId, resourceGroup, name
```

```kusto
// VMSS の場合
Resources
| where type == "microsoft.compute/virtualmachinescalesets"
| extend offer = tostring(properties.virtualMachineProfile.storageProfile.imageReference.offer)
| extend sku  = tostring(properties.virtualMachineProfile.storageProfile.imageReference.sku)
| extend publisher = tostring(properties.virtualMachineProfile.storageProfile.imageReference.publisher)
| where publisher =~ "MicrosoftWindowsServer"
| where offer =~ "WindowsServer"
| where sku startswith "2022"
| project subscriptionId, resourceGroup, name, location, offer, sku, imageVersion = tostring(properties.virtualMachineProfile.storageProfile.imageReference.version), upgradePolicy = tostring(properties.upgradePolicy.mode)
```

> [!TIP]
> 上記クエリは publisher が `MicrosoftWindowsServer`、offer が `WindowsServer`、sku が `2022` で始まるリソースを抽出するものです。出力された `sku` および `imageVersion` をもとに、対象イメージに該当するかをご確認ください。

---
## さいごに

以上が、Azure Marketplace の Windows Server 2022 イメージ非推奨化に関する解説となります。
本件は **.NET 6 が同梱されたイメージ**を対象としたものであり、既存の稼働中 VM が即座に停止するものではございませんが、**新規 VM 作成・VMSS スケールアウトへの影響**や、**パッチ提供終了に伴うセキュリティ / コンプライアンス上のリスク**が想定されますため、期日 (2026 年 6 月 9 日) までに、運用方針に応じた対処をご検討いただけますと幸いです。

ご不明な点がございましたら、対象の VM / VMSS の情報などを添えて弊社の技術サポート窓口にお問い合わせをいただけますと幸いでございます。
上述の内容が皆様のお役に立つことを願っております。
