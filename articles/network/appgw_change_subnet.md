---
title: Application Gateway でサブネットを変更する方法
date: 2020-04-21 14:30:00 
tags:
  - Network
  - Application Gateway
---

こんにちは、Azure テクニカル サポート チームの薄井です。
今回は Application Gateway V1 および V2 でサブネットを変更する方法についてご紹介します。

残念ながら現在の Azure ポータルからは、すでにデプロイした Application Gateway のサブネットを後から変更することはできません。
サブネットを変更する必要性が生じたら、新しく Application Gateway を作り直すしかありません。

しかし Azure PowerShell を使うことで、 Application Gateway を作り直すことなく、既存のサブネットの設定を変更することができます。

## サブネット変更方法

※ 弊社検証環境でも動作の確認を行っておりますが念のため、お客様環境におかれましても事前に検証環境で動作をご確認のうえ本番環境への適用をお願いいたします。

※ Application Gateway のフロントエンド IP 構成において、プライベート IP アドレスが固定で設定されている場合は、プライベート IP アドレスと関連するリスナー設定等を削除しておく必要があります。

---
1. あらかじめ同一 VNET 内に変更先の新しいサブネットを作成しておきます。
2. Azure PowerShell または ポータルより Cloud Shell を起動し、以下のコマンドレットを入力します。（<>の部分は環境に合わせて変更が必要となります）

3. 構成を変更する対象のサブスクリプションを指定します。
```powershell
Select-AzSubscription -SubscriptionId <サブスクリプション ID>
```

4. 構成を変更する対象の仮想ネットワークを指定します。
```powershell
$VNet = Get-AzVirtualNetwork -Name <対象の仮想ネットワーク> -ResourceGroupName <変更対象のリソースグループ>
```

5. 変更先のサブネットを取得します。
```powershell
$Subnet = Get-AzVirtualNetworkSubnetConfig -Name <変更先のサブネット名> -VirtualNetwork $VNet
```
 
4. 変更対象の Application Gateway を取得します。
```powershell
$gw=Get-AzApplicationGateway -name <変更対象の Application Gateway 名> -ResourceGroupName <変更対象のリソースグループ>
```

5. サブネットの変更を加えます。
```powershell
$gw2=Set-AzApplicationGatewayIPConfiguration -ApplicationGateway $gw -Name "appGatewayIpConfig" -Subnet $Subnet
```

6. 稼働中の Application Gateway を停止します。※ 停止に数分かかります
```powershell
Stop-AzApplicationGateway -ApplicationGateway $gw
```

7. Application Gatewayを設定、開始します。※ 開始に 10 分以上かかります
```powershell
Set-AzApplicationGateway -ApplicationGateway $gw2
```

8. 開始後に以前と同様に Web サーバへアクセスできるか確認します。
---

以上、ご参考になれば幸いです。

## その他の Application Gateway のサブネットに関連する情報
Application Gateway のサブネットについて関連する情報が以下のページにあります。
併せてご参考いただければと思います。

- [アプリケーション ゲートウェイ構成の概要 > サブネットのサイズ](https://docs.microsoft.com/ja-jp/azure/application-gateway/configuration-overview#size-of-the-subnet)
- [アプリケーション ゲートウェイ構成の概要 > アプリケーション ゲートウェイ サブネット上のネットワーク セキュリティ グループ](https://docs.microsoft.com/ja-jp/azure/application-gateway/configuration-overview#network-security-groups-on-the-application-gateway-subnet)
- [Application Gateway に関してよく寄せられる質問](https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-faq)