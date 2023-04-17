---
title: "Azure 上にメールサーバー/SMTP サーバーを構築する場合の注意事項"
date: 2016-06-09 10:58:26
tags:
  - Network
  - SMTP
  - Public IP Address
  - Archive
---

> [!WARNING]
> 本記事は、投稿より時間が経過しており、<strong>内容が古い可能性があります。</strong>
> 
> 最新の情報については、<strong>以下の公式ドキュメントをご参照ください。</strong>
> 
> [Azure でのアウトバウンド SMTP 接続に関する問題のトラブルシューティング](https://learn.microsoft.com/ja-jp/azure/virtual-network/troubleshoot-outbound-smtp-connectivity)



こんにちは、Azure サポート部の石井です。

Azure 上で Windows Server の IIS などの機能によってメールサーバー / SMTP サーバーを構築し、メール配信をする場合の注意点をご紹介します。

## 詳細
Azure では、IP アドレスをプールしており、それを仮想マシンに貸し出すという形態をとっています。現在割り当てられている VM の IP アドレスは、数日前には他の VM の IP アドレスであった可能性があるということになります。

昨今、メールのセキュリティが重要視され、様々な形で迷惑メールとみなされることがございます。こういった既知の IP アドレスをスパムの出所として記録し、ブラックリストとしてフィルターするという第三者機関も多くございます。また、VM を一時的に立ち上げ、その IP アドレスからスパムメールを送信するといった乱用も潜在的な可能性として存在します。

<strong>このような理由から、<span style="color: red; "><u>Azure 上の VM から、外部ドメインに対して直接 SMTP 等を使ってメール送信することは、Azure プラットフォームとしてサポートをしておりません。</span></u></strong>

代替案としては、SendGrid のような、サードパーティのバルク メール送信サービスに SMTP  リレーを構成するという方法となります。Azure マーケット プレースから、SendGrid の無償プラン(送信メール数制限有り)・有償プランも選択が可能ですので、リレー先としてご検討ください。

2017/4/21 追記: Office 365 の Exchange Online へのリレーも可能です。

また、オンプレミスに既に Exchange サーバーがある場合、そちらへのリレーでも実現が可能となります。 英文となりますが、公式情報は以下をご参照ください。

- [Sending E-mail from Azure Compute Resource to External Domains (英語)](https://blogs.msdn.microsoft.com/mast/2016/04/04/sending-e-mail-from-azure-compute-resource-to-external-domains/)

## 参考： SendGrid 設定方法について
マーケット プレースから SendGrid を購入する方法については、以下参考情報の前半である、"SendGrid アカウントを作成する" の項目をご参照ください。

- [SendGrid を使用した Azure での電子メールの送信方法](https://azure.microsoft.com/ja-jp/documentation/articles/sendgrid-dotnet-how-to-send-email/)

※ 「購入」という記載にはなりますが、無償オプションの場合課金は生じません。

また、SendGrid 社より、Windows Server の IIS の SMTP サーバーからのリレー設定方法も公開されておりますので、必要に応じてご参考ください。

- SendGrid 社の技術情報:
[Microsoft IIS 7.5 (英文)](https://sendgrid.com/docs/Integrate/Mail_Servers/iis75.html)

## 補足
SendGrid の利用方法については弊社 (マイクロソフト) からのサポートの対応範囲外となりますので、あらかじめご了承ください。

過去お問合せいただきました事例より、Azure マーケットプレースから SendGrid サブスクリプションを購入した際、一見すると完了したように見えるものの、そのアカウントが利用可能になるまでに数時間～数日遅れるというケースがありました。

Azure マーケットプレース上でアカウントが作成されていても、実際に SendGrid サーバー側でメールがリレー可能となるまでのセットアップに時間差がある可能性があると想定しておりますので、Azure 上の VM からのメール送信をご検討の皆様は、なるべく早めに SendGrid のサブスクリプションを購入いただくことがよいかもしれません。

## 補足 2 (2017/4/21 追記)
SMTP 用途の仮想マシンには、静的 Public IP アドレスとするようにしてください。