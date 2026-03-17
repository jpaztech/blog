---
title: [VPNGW] Basic SKU の Public IP アドレスを使用している Azure VPN Gatewayのマイグレーションについて（Basic SKU VPN Gatewayは除く）
date: 2026-03-17 15:00:00
tags:
  - Network
  - VPN Gateway
---

こんにちは、Azure テクニカル サポート チームです。<BR>
この記事では、Azure VPN Gateway において Basic SKU の Public IP アドレスを使用している場合の標準的なマイグレーション手順と作業時の注意点をご紹介します。<BR>
また、この記事でご紹介する内容は動画でもご紹介しております。<BR>
動画では Azure Portal を使用して実際に移行する手順をご確認いただけますので、こちらも併せてご活用ください。<BR>

<video src="./vpngw-basicip-migration/[VPN Gateway] About the Basic Public IP Migration 8.mp4" controls="true" width="640" height="400"></video>

<!-- more -->

# Azure Public IP アドレス リソースの SKU
Azure の Public IP アドレス リソースには、Basic および Standard の 2 種類の SKU が用意されています。<BR>
Azure VPN Gatewayにおいては、環境によって Basic SKU の Public IP アドレスが利用されているケースがあります。<BR>
Basic SKU の Public IP アドレスは順次サービス終了が予定されているため、Basic SKU から Standard SKU へのマイグレーション作業が必要となります。<BR>

![basic-or-standard-ip](./vpngw-basicip-migration/basic-or-standard.png)

<BR>

# 1. マイグレーションの対象となるGatewayの条件
マイグレーションの対象となるGatewayの条件は、下記の表のとおりです。<BR>

| VPN Gateway SKU                              | 本マイグレーション作業 要/不要 |
|---------------------------------------------|-------------------------------|
| Basic SKU                                   | 別の対応が必要<br>※ 商用ワークロードの使用は非推奨 |
| Standard SKU                                | **必要** |
| High Performance SKU                        | **必要** |
| VpnGw [1–5] SKU + Basic SKU Public IP       | **必要** |
| VpnGw [1–5] SKU + Standard SKU Public IP    | 不要 |
| VpnGw [1–5] AZ SKU                          | 不要 |

<BR>

VPN Gatewayの SKU は、Azure ポータルで対象のGateway リソースを選択し、［概要］画面からご確認いただけます。<BR>
また、Public IP アドレスの SKU については、Public IP アドレスのリンクをクリックし、［概要］画面からご確認いただけます。<BR>
これらをご確認のうえ、ご利用中のGatewayがマイグレーション対象に該当するかをご確認ください。<BR>

![check-sku](./vpngw-basicip-migration/check-sku.png)

<br>

# 2. マイグレーションの手順
## 2-1. マイグレーションの流れ - 検証
実際のマイグレーション作業の流れについてご案内いたします。<BR>
マイグレーションは、「検証」「準備」「移行」「コミット」の 4 つのステップで進行します。<BR>
マイグレーション ツール画面を開くには、Azure ポータルで対象の VPN Gateway Gateway リソースを選択し、［構成］→［Migrate to Standard IP］をクリックしてください。<BR>
移行ツールを開くと、自動的に構成の検証が実行されます。<BR>
問題がなければ「Succeeded」と表示され、「検証」は完了となります。<BR>

![migration-to-standardIP](./vpngw-basicip-migration/migration-to-standardIP.png)

<BR>

## 2-2. マイグレーションの流れ - 準備
次に［Prepare］をクリックすると、マイグレーションの準備が開始され、移行先の VPN Gatewayが作成されます。<BR>

![prepare](./vpngw-basicip-migration/prepare.png)

このステップの完了にはおおよそ 30 分程度かかりますが、本ステップ中に通信影響は発生しません。<BR>

![migration-to-standardIP-2](./vpngw-basicip-migration/migration-to-standardIP-2.png)

準備が完了すると、次のステップである［Migrate］および［Abort］が表示されます。<BR>

![migrate-abort](./vpngw-basicip-migration/migrate-abort.png)

<BR>

なお、P2S 接続に "cloudapp.net" で終わる FQDN を使用して VPN Gatewayへ接続されている場合は、準備完了後に [VPN クライアントのダウンロード] を選択し、<BR>
更新された VPN クライアント プロファイル（ZIP ファイル）をダウンロードしてください。<BR>

![vpn-client](./vpngw-basicip-migration/vpn-client.png)

その後、ダウンロードしたプロファイルを使用して再接続を行い、ポイント対サイト（P2S）接続が可能であることを確認してください。<BR>
*(※ご利用中の VPN Gatewayが対象であるかどうかの確認方法は [Gatewayでレガシ DNS が使用されているかどうかを確認する](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/basic-public-ip-migrate-howto?tabs=portal#check-if-your-gateway-uses-legacy-dns) をご参照ください。

<BR>

## 2-3. マイグレーションの流れ - 移行
次のステップは「Migration」です。
この段階で作業をキャンセルする場合は、［Abort］をクリックしてください。<BR>
これにより、準備ステップで作成されたリソースが削除され、作業開始前の状態に戻ります。<BR>
作業を進める場合は、［Migration］をクリックします。<BR>
本ステップにて、実際の Public IP アドレスの SKU 移行作業が実行され、<span style="color:red;"><strong>最大で約 5 分程度の通信断が発生する可能性があります。</strong></span><BR>

![migration](./vpngw-basicip-migration/migration.png)

<span style="color:red;"><strong>※移行を行っている途中で VPNGateway の状態が Failed で表示されることがございますが、完了時には Succeeded に変わりますのでご安心ください。</strong></span><BR>

![failed](./vpngw-basicip-migration/failed.png)

なお、SKU を変更しても、VPN Gatewayで使用されている Public IP アドレス自体は変更されませんのでご安心ください。<BR>
移行が完了すると、最後のステップとして［Commit］および［Abort］のボタンが表示されます。<BR>
ツール上には新しいGatewayでのトラフィック処理状況が表示されますので、トラフィックが正常に流れていることをご確認ください。<BR>

![traffic](./vpngw-basicip-migration/traffic.png)

*（※ P2S 接続のみの環境ではトラフィック処理状況は表示されないため、クライアントから移行後の VPN Gatewayへ P2S 接続が可能か確認してください。）* <BR>
万一、問題が確認された場合は、［Abort］を選択することで作業前の状態に戻すことが可能です。

<BR>

## 2-4. マイグレーションの流れ - コミット
トラフィックが正常に流れていることを確認できましたら、［Commit］をクリックしてください。<BR>
なお、［Commit］実行後は切り戻しができませんので、ご注意ください。<BR>

![commit](./vpngw-basicip-migration/commit.png)

このステップでは、移行により不要となったリソースのクリーンアップ処理が実行されます。<BR>
本処理にはおよそ 15 分程度かかります。<BR>

![migration-to-standardIP-2](./vpngw-basicip-migration/migration-to-standardIP-2.png)

［Commit］が完了すると、VPN Gatewayで使用されている Public IP アドレスの SKU が Standard に変更され、マイグレーション作業は完了となります。<BR>

![finish](./vpngw-basicip-migration/finish.png)

<BR>

# 3. まとめ
VPN Gatewayで Basic SKU の Public IP アドレスを使用している場合のマイグレーション手順についてご紹介しました。<BR>
本マイグレーション作業は、すべて Azure Portalから実行可能です。<BR>
公式ドキュメントには、より詳細な情報や補足事項も記載されていますので、作業を実施される前にあわせてご確認ください。<BR>
[Basic SKU パブリック IP アドレスを VPN Gateway 用に Standard SKU に移行する方法](https://learn.microsoft.com/ja-jp/azure/vpn-gateway/basic-public-ip-migrate-howto?tabs=portal)
