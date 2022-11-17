---
title: Azure KMS の IP アドレスが変わります
date: 2022-9-20 11:00:00
tags:
  - VM
  - Windows
---

こんにちは。Azure テクニカル サポート チームの鳥越です。

近日中に新しい Azure KMS の IP アドレスがリリースされる予定となっております。
そこで本記事では、Azure KMS の IP アドレスに関する下記の資料の補足をご紹介します。

<!-- more -->
なお、下記ブログ記事も合わせてご参考いただけますと幸いです。

> ご参考) Azure Windows Virtual Machine Activation: two new KMS IP addresses (…and why you should care) 
> [https://techcommunity.microsoft.com/t5/azure-compute-blog/azure-windows-virtual-machine-activation-two-new-kms-ip/ba-p/3621189](https://techcommunity.microsoft.com/t5/azure-compute-blog/azure-windows-virtual-machine-activation-two-new-kms-ip/ba-p/3621189)
> ご参考) Generally available: New KMS DNS in Azure Global Cloud
> [https://azure.microsoft.com/en-us/updates/new-kms-dns-in-azure-global-cloud/](https://azure.microsoft.com/en-us/updates/new-kms-dns-in-azure-global-cloud/)

---

## 〇 何が起こりますか?

2022 年 7 月に新しい Azure KMS の IP アドレスとして、20.118.99.224 と 40.83.235.53 の 2 つの新しい KMS IP アドレスを発表しました。

Azure グローバル クラウドの KMS サーバーの最初の DNS 名は azkms.core.windows.net で　20.118.99.224 および 40.83.235.53 を指し示します。
Azure グローバル クラウドの KMS サーバーの 2 番目の DNS 名は kms.core.windows.net で、IP アドレスは 23.102.135.246 です。

つまり、カスタム ルート構成を行っている環境では、Azure グローバル クラウドの 3 つの IP アドレスすべてをカスタム ルートに追加する必要があります。

---

## 〇 どのような影響がありますか?

ほとんどの仮想マシンについて影響はないと考えられますが、旧来の Azure KMS の IPアドレス(23.102.135.246) を UDR などで登録している、または、kms.core.windows.net に対する URL アクセスを限定している環境については、azkms のエンドポイントを追加いただく必要がございます。

追加されない場合、仮想マシンは Azure KMS サーバーにアクセスできないため、以下のようなエラーメッセージが記録されます。

>「エラー: 0xC004F074 ソフトウェア ライセンス サービスで、コンピューターのライセンス認証ができなかったことが報告されました。キー管理サービス (KMS) に接続できませんでした。詳細については、アプリケーション イベント ログを参照してください。」

動作影響に関して、認証に失敗した場合のライセンスの猶予期間は 180 日間です。
つまり、お客様の構成の関係で、新しい azkms エンドポイントにアクセスできなかった場合、前回のアクセス認証から 180 日間の猶予がありますので、慌てて対策を行う必要はありません。

また、実際のライセンス切れが発生した場合には、通知モード (ライセンス認証切れ状態) となりますが、こちらは仮想マシンの稼働に大きな影響 (強制シャットダウン、ログオン不可、サーバー / クライアント機能の使用制限など) を与えるものではありません。
なお、通知モードは、再度 KMS 認証を行い成功した際に解除されます。

そのため、今回の通知からの変更で間に合わなかった場合には、180 日間の猶予において対策を実施いただけますと幸いです。

> ご参考) Windows ライセンス認証が期限切れになるとどうなりますか?
> [https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems#what-happens-if-windows-activation-period-expires](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems#what-happens-if-windows-activation-period-expires)

---

## 〇 どのような対応が必要ですか?

以下のお客様については、新しい Azure KMS エンドポイントへのアクセス許可を追加いただくようお願いいたします。

**対象の構成**
> - UDR にて旧来の Azure KMS の IP アドレス (23.102.135.246) を指定している
> - エンドポイントを kms.core.windows.net のみに限定している

**必要な対応**
新しい KMS エンドポイントへのアクセス許可を追加

> - エンドポイント : azkms.core.windows.net
> - 新しいKMS IP アドレス : 20.118.99.224 と 40.83.235.53

---

## 〇 新しい Azure KMS エンドポイントへの接続確認方法

以下のコマンドを実施し、疎通に問題がないかご確認お願いいたします。

1. PowerShell を開く
2. 次のコマンドを実施する
   ```PowerShell
   test-netconnection azkms.core.windows.net -port 1688 
   test-netconnection 20.118.99.224 -port 1688 
   test-netconnection 40.83.235.53 -port 1688 
   ```

接続が可能であれば特に対処は必要ありません。
接続が失敗した場合には、前項の「どのような対応が必要ですか?」をご確認いただき、設定変更をお願いいたします。

---

## 〇 補足事項

今回の変更ですが、今後多くのお客様が Azure を利用していく上で、Azure KMS サーバーを増強し、負荷上昇による認証失敗を解消するための措置となります。
今後も弊社 Azure インフラストラクチャの安定した稼働に努めてまいりますので、お手数をおかけしますが、作業についてご理解給われますと幸いです。

<br>
ご紹介は以上となります。
上記情報がお役に立てれば幸いです。
