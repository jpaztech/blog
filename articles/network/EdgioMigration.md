---
title: Azure CDN from Edgio の提供終了に関するアナウンスの補足説明
date: 2024-12-12 12:00:00 
tags:
  - Network
  - AzureCDN
---
こんにちは、Azure テクニカル サポート チームです。

Azure CDN の Edgio Standard SKU 及び Premium SKU について、2025 年 1 月 15 日までに移行が必要な通知がありました。この通知に関して、本ブログでは Front Door 又は Azure CDN の Microsoft クラック SKU への移行方法について補足します。

<!-- more -->

### 背景
Azure CDN の Edgio Standard SKU 及び Premium SKU は、Edgio 社 (旧 Verizon 社) の CDN プラットフォームでサービスを提供していましたが、2024 年 9 月 9 日に Edgio 社が米連邦破産法第 11 条の適用を申請したことから、Azure CDN の Edgio Standard SKU 及び Premium SKU を継続してご提供できなくなりました。
最新の状況として、Edigo 社から 2025 年 1 月 15 日以降に CDN サービス提供を終了する旨が通達されたことで、お客様には 2025 年 1 月 15 日までにいずれかの CDN サービスを移行していただく旨を、Edgio Standard SKU 及び Premium SKU をご利用いただいているお客様に通知しました。

Edgio Standard SKU 及び Premium SKU から Azure サービスを移行先として選択される場合、Front Door Standard SKU を推奨しています。Front Door Standard SKU への移行は、通信影響を軽微にする手順含めて、[Azure CDN from Edgio から Azure Front Door に移行する](https://learn.microsoft.com/ja-jp/azure/frontdoor/migrate-cdn-to-front-door)でご案内しています。

このブログでは、Edgio Standard SKU 及び Premium SKU から、暫定対応として Azure CDN の Microsoft クラシック SKU に移行されたい場合において、制約・制限事項と手順についてご案内します。

### 制約・制限事項
Azure CDN の Micrsoft クラシック SKU に移行をされる場合、以下が制約・制限事項となります。事前にご確認いただくようお願いします。

・Azure CDN の Microsoft クラシック SKU は、Microsoft の CDN プラットフォームでサービスを提供していますが、2027 年 9 月 30 日にサービス提供停止が決定しています。Microsoft クラシック SKU から Front Door Standard SKU 及び Premium SKU への移行についてはツールが提供されています。これらの点についてご紹介した[ブログ](https://jpaztech.github.io/blog/network/mscdn-classic-retire/)も併せてご参照ください。

・Edgio Standard SKU の機能として提供している「geo フィルタリング」や「キャッシュ規則」は、Microsoft クラシック SKU の geo フィルタリングやキャッシュ規則、ルールエンジンで代替が可能です。

・Edgio Premium SKU で提供している「トークン認証」については、Microsoft クラシック SKU や Front Door Standard SKU では代替機能がありません。

・Edgio Premium SKU で提供しているルール エンジンの一部機能は、Microsoft クラシック SKU のルールエンジンでは提供できない場合があります。

### 移行手順
この移行手順では、Edgio Standard SKU 及び Premium SKU から、暫定対応として Azure CDN の Microsoft クラシック SKU に移行されたいシナリオの手順についてご案内します。大きく分けて下記のステップで移行をします。
> Edgio Standard SKU 及び Premium SKU に共通する事項は Edgio SKU と記載します。

① Microsoft クラシック SKU の Azure CDN リソースをデプロイする  
② 既存の Edgio SKU の構成状況を確認し、Microsoft クラシック SKU の設定として追加する  
③ (カスタム ドメインが構成されている場合) カスタム ドメインを構成する  
④ 事前の接続試験を実施する  
⑤ DNS レイヤーで Edgio SKU から Microsoft クラシック SKU に切り替える  

#### ① Microsoft クラシック SKU の Azure CDN リソースをデプロイする
Azure Portal 等から Azure CDN のリソースとして、[Microsoft クラシック SKU をデプロイ](https://learn.microsoft.com/ja-jp/azure/cdn/cdn-create-new-endpoint?toc=%2Fazure%2Ffrontdoor%2FTOC.json)します。配信元には、Edgio SKU で指定している配信元を指定してください。

#### ② 既存の Edgio SKU の構成状況を確認し、Microsoft クラシック SKU の設定として追加する
Edgio Standard SKU をご利用の場合に主にご確認いただきたい点は、「キャッシュ規則」と「geo フィルタリング」です。この 2 つの設定内容を確認いただき、Microsoft クラシック SKU の設定として反映してください。

Edgio Premium SKU をご利用の場合に確認いただきたい点として、Azure Portal の [高度な機能] から専用ポータルにアクセスいただき、設定内容をご確認ください。

#### ③ (カスタムドメインが構成されている場合) カスタムドメインを構成する
Edgio SKU の現環境でカスタムドメインをご利用いただいている場合、カスタム ドメインの切り替えには複数のステップが必要になります。Azure CDN にカスタム ドメインを登録する時、ドメイン検証が必要です。ドメイン検証の方法は 2 つあり、カスタム ドメインを CNAME レコードで直接マッピングする、または cdnverify サブドメインを使って登録する方法があります。一般的な構成では、既にカスタム ドメインを CNAME レコードで直接マッピングしていることが想定されるため、移行先の Microsoft クラシック SKU には、cdnverify サブドメインを使ってカスタム ドメインを登録し、HTTPS の有効化まで完了する必要があります。具体的には下記の手順 (A)-(D) が必要です。

[公開情報 1 : チュートリアル:カスタム ドメインをエンドポイントに追加する](https://learn.microsoft.com/ja-jp/azure/cdn/cdn-map-content-to-custom-domain?toc=%2Fazure%2Ffrontdoor%2FTOC.json&tabs=dns-provider%2Cazure-portal%2Cazure-portal-cleanup)  
[公開情報 2 : チュートリアル:Azure CDN カスタム ドメインで HTTPS を構成する](https://learn.microsoft.com/ja-jp/azure/cdn/cdn-custom-ssl?tabs=option-1-default-enable-https-with-a-cdn-managed-certificate)
 
(A) Edgio SKU に関連付いたカスタムドメイン名の確認と、カスタムドメインをホスティング (管理) している DNS サーバーの設定を管理者様などへ確認してください。  
(B)  カスタム ドメインを管理している DNS サーバーで、cdnverify サブドメインを Microsoft クラシック SKU のエンドポイントに向けた CNAME レコードを追加します。
>例として、Microsoft クラシック SKU のエンドポイントが microsoftClassic.azureedge.net の場合、追加する cdnverify サブドメインは下記です。  
>cdnverify.customDomain CNAME cdnverify microsoftStandard.azureedge.net  

(C) Azure Poratl などから、Microsoft クラシック SKU のエンドポイント リソースに対して、カスタム ドメインを追加します。  
(D) Microsoft クラシック SKU に関連付いたカスタム ドメインの HTTPS 有効化を実施します。  
>この時、Microsoft クラシック SKU では持ち込み証明書または Azure CDN のマネージド証明書を選択することが可能です。Azure CDN マネージド証明書を選択した場合、証明書発行のために DigiCert 社から発送されるメールによるドメイン検証が必要です。もしメールが到達していない、またはメールが到達できないドメインの場合は、Azure サポートにご依頼いただければ別の検証方法として TXT レコードによるドメイン検証などをご提案可能です。  
>(DigiCert 社と連携するため、3 営業日ほどお時間をいただく場合があります)

#### ④ 事前の接続試験を実施する
カスタム ドメインを構成していない場合、デプロイした Microsoft クラシック SKU の既定のエンドポイントに対してリクエストを送信し、期待された結果が応答されるか確認します。

③ の手順によって、Microsoft クラシック SKU にカスタム ドメインを構成している場合、HTTPS 接続用の証明書の展開が完了した後、接続試験を実施します。下記の PowerShell コマンドや curl コマンド、hosts ファイルに静的に IP アドレスを指定して Web ブラウザからテストする方法があります。A.A.A.A についてはデプロイいただいた Microsoft クラシック SKU の既定のエンドポイント名前解決した IP アドレスを指定してください。"CustomDomain.contoso.com" はお客様のカスタム ドメインに置き換えてください。

・PowerShell
```PowerShell
Invoke-WebRequest https://A.A.A.A/ -Headers @{"Host"="CustomDomain.contoso.com"}
```
・Curl
```bash
curl https://CustomDomain.contoso.com/ --resolve CustomDomain.contoso.com:443:A.A.A.A
```
・hosts ファイル
```
[A.A.A.A CustomDomain.contoso.com] を hosts ファイルに指定してください。
```
>[!NOTE]hosts ファイルで試験する場合、接続試験後は削除することをご留意ください。

#### ⑤ DNS レイヤーで Edgio SKU から Microsoft クラシック SKU に切り替える
カスタム ドメインを構成していない場合、接続元リソースで Edgio SKU のエンドポイントから Microsoft クラシック SKU のエンドポイントに切り替えます。

カスタム ドメインを構成している場合、カスタム ドメインを管理している DNS サーバーで CNAME レコードを切り替えます。具体的には、カスタム ドメインの CNAME レコードとしてEdgio SKU のエンドポイントに向けられた構成を、Microsoft クラシック SKU のエンドポイントに向ける構成に切り替えます。

DNS レイヤーの切り替え後、一定の期間 Edgio SKU にリクエストが送信されることが想定されます。そのため、少なくとも 3 日程度は Edgio SKU のリソースは残存してください。
