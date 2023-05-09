---
title: Load Balancer と Application Gateway の通信の違い
date: 2018-11-26 19:29:00 
tags:
  - Archive
  - Network
  - Load Balancer
  - Application Gateway
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは、Azure サポートチームの山崎です。
今回は Load Balancer と Application Gateway の通信の違いについてご紹介します。

## Load Balancer の場合

Load Balancer を経由する通信は宛先 NAT され、バックエンドのサーバへ転送されます。

![Load Balancer 経由の通信](./lb_apgw_tayamasa01.png)

**[行きの通信]**

1. クライアントから Load Balancer への通信
    - 送信元：クライアントの IP
    - 宛先：Load Balancer のフロントエンド IP
2. Load Balancer からサーバへの通信
    - 送信元：クライアントの IP
    - 宛先：サーバの IP <span style="color: red; ">(宛先 NAT)<span>

**[戻りの通信]**

3. サーバから Load Balancer への通信
    - 送信元：サーバの IP
    - 宛先：クライアントの IP
4. Load Balancer からクライアントへの通信
    - 送信元：Load Balancer のフロントエンド IP
    - 宛先：クライアントの IP

## Application Gateway の場合

Application Gateway はリバースプロキシとして動作するため、クライアントとApplication Gateway 間、Application Gateway とサーバ間で異なるセッションが作成されます。

![Application Gateway 経由の通信](./lb_apgw_tayamasa02.png)

**[行きの通信]**

1. クライアントから Application Gateway への通信
    - 送信元：クライアントの IP
    - 宛先：Application Gateway のフロントエンド IP
2. Application Gateway からサーバへの通信
    - 送信元：Application Gateway の内部 IP (通信するインスタンスの IP)
    - 宛先：サーバの IP

**[戻りの通信]**

3. サーバから Application Gateway への通信
    - 送信元：サーバの IP
    - 宛先：Application Gateway の内部 IP
4. Application Gateway からクライアントへの通信
    - 送信元：Application Gateway のフロントエンド IP
    - 宛先：クライアントの IP

## よくあるお問い合わせ

- Application Gateway 経由時にクライアント証明書認証できない

サーバ側でクライアント証明書の認証を行っており、Application Gateway 経由に変更したタイミングで認証が出来なくなるとのお問い合わせをいただきます。Application Gateway の場合、クライアントとApplication Gateway 間、Application Gateway とサーバ間の通信は異なりますので、クライアントからの証明書がサーバ側に届かないため、サーバ側でのクライアント証明書認証はできません。Application Gateway でクライアント証明書の認証、バックエンドのサーバへクライアント証明書に関する情報の転送を行う場合は、[Application Gateway での相互認証の概要](https://learn.microsoft.com/ja-jp/azure/application-gateway/mutual-authentication-overview?tabs=powershell) をご参照ください。Load Balancer の場合は Load Balancer 自体が通信を終端するわけではなく通信を転送するため、クライアント証明書がサーバまで届きますのでクライアント証明書認証が可能です。

- Traffic Manager との違い

Traffic Manager については DNS で負荷分散を行います。

![Traffic Manager を利用した通信](./lb_apgw_tayamasa03.png)

**[DNS 通信]**

1. クライアントが Traffic Manager の名前解決を行う
    - test.trafficmanager.net
2. Traffic Manager が負荷分散先の情報を返信
    - test01.japaneast.cloudapp.azure.com: 1.1.1.1 (A レコード)

**[エンドポイントとの通信]**

3. 名前解決後はエンドポイントと直接通信を行います。<span style="color: red; ">（Traffic Manager を経由しない）</span>
    - 送信元：クライアントの IP
    - 宛先：サーバの IP

> クライアント側で DNS キャッシュが残っている場合は Traffic Manager を経由せず、そのまま継続してエンドポイントと通信を行います。DNS キャッシュがなくなったタイミングで再度名前解決を行い、Traffic Manager がどのエンドポイントと通信するか決定します。

## 正常性プローブの違い

プローブの送信元についても、Load Balancer と Application Gateway で違いがあります。

Load Balancer の場合、プローブの送信元は "168.63.129.16" という IP アドレスになります。

![Load Balancer の正常性プローブ](./lb_apgw_tayamasa04.png)

Application Gateway の場合、プローブの送信元はそれぞれのインスタンスの内部 IP アドレスになります。そのため、インスタンスが 2 つの場合、以下のようにそれぞれからプローブが行われています。

![Application Gateway の正常性プローブ](./lb_apgw_tayamasa05.png)

Traffic Manager の場合、プローブの送信元は [Azure で利用される IP アドレス一覧の JSON ファイル](https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519) 内にある AzureTrafficManager タグの IP アドレスのいずれかが利用されます。

![Traffic Manager の正常性プローブ](./lb_apgw_tayamasa06.png)

以上、ご参考になれば幸いです。