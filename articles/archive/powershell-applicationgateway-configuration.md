---
title: Application Gateway を PowerShell で設定変更するコツ
date: 2017-09-07 15:28:25
tags:
  - Archive
  - Application Gateway
  - PowerShell
---

こんにちは、Azure テクニカル サポート チームの飯塚です。

最近、おかげさまで Application Gateway をご利用いただいているお客様が増えております。以前は、ポータルからは Application Gateway の作成ができなかったため、手が出しにくいサービスの 1 つでしたが、現在はポータルから作成可能になり、より手軽に Application Gateway をご利用いただけるようになりました。

しかし、作成はできるようになりましたが、作成したあとの設定変更については、まだポータルからはできないことも多い状況です。ポータルから設定できる項目を増やすよう、弊社としましても取り組んでいるところですが、現状では、PowerShell 等での設定変更が必要な場面が少なからずあります。

ただし、PowerShell で Application Gateway を設定する手順は、慣れないと、少しわかりにくい側面がございます。実際にお問い合わせをいただくことも増えてまいりましたので、設定変更のコツを以下におまとめしました。少しでもお役に立てればと思います。
(なお、以下の内容はリソース マネージャー デプロイ モデルを対象としたものです)

## ■ 設定変更の流れ
非常に簡単に説明しますと、PowerShell による Application Gateway の設定変更は、以下の流れで行います。

1. Get する
1. 設定変更する
1. Set する

最初に現在の構成情報を変数に Get して、設定変更はその変数に対して行います。
そして最後に、設定変更した変数の内容を Set すれば、設定は完了という流れです。
時折、最後に Set するのを忘れてしまい、設定変更してエラーも出なかったのに反映されていない、というお問い合わせをいただくことがあります。
常に上記の 3 ステップを意識することが、非常に大切です。

## ■ 具体例 (1) - リスナーの削除
もう少し詳しく、具体的な例を交えて設定変更手順をみてみましょう。
以下に、「不要なリスナーを削除する」手順をご案内します。
ポータル上では新規のリスナーを作ったり、既存のリスナーの一覧を見ることはできますが、不要になったリスナーを削除することができません。

1. $AppGw 変数に、既存の Application Gateway の設定を Get します。
   >$AppGw = Get-AzureRmApplicationGateway -Name "AppGw の名前" -ResourceGroupName "AppGw が作成されているリソース グループ名"

2. $AppGw 変数の内容から、対象のリスナーを削除します。
   >Remove-AzureRmApplicationGatewayHttpListener -Name "削除するリスナー名" -ApplicationGateway $AppGw

3. 設定変更した $AppGw の内容を Set します。
   >Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

これで、リスナーの削除が完了です。2 つ目の手順を設定したい内容に応じて変更すれば、同じ流れでいろいろな設定変更ができます。

## ■ 具体例 (2) - SSL オフロード用の証明書の変更
もう 1 つ、具体例を紹介させていただきます。
お問い合わせいただく設定変更のうち、もっとも多いのは「SSL オフロード用の証明書の変更」です。
これも本日時点で、ポータルからできない設定変更です。

証明書の変更は、以下の手順で実行可能です。

1. $AppGw 変数に、既存の Application Gateway の設定をGet します。
   >$AppGw = Get-AzureRmApplicationGateway -Name "AppGw の名前" -ResourceGroupName "AppGw が作成されているリソース グループ名"

2. $AppGw 変数に含まれる、証明書を更新します。
   >Set-AzureRmApplicationGatewaySslCertificate -Name "既存の証明書の名前" -ApplicationGateway $AppGw -CertificateFile "新しい証明書 (pfx 形式) の絶対パス" -Password "SSL 証明書のパスフレーズ"
   ※ 証明書の絶対パスは、「C:\work\newcert.pfx」など、.pfx ファイルの場所を指定するものです。

3. 設定変更した $AppGw の内容を Set します。
   >Set-AzureRmApplicationGateway -ApplicationGateway $AppGw

いかがでしょう？流れはリスナーの削除と一緒で、2 番目のコマンドが違うだけなのが、お分かりいただけると思います。

2 番目のコマンドは、実行する設定内容に応じて調べる必要があります。この記事ですべてを網羅するのは難しいため、コマンドリファレンスをご案内します。英語版しかなくて申し訳ありませんが、ぜひ参考にしてみてください (また、多くお問い合わせいただくものなどがあれば記事を更新しようと思います)。
[AzureRm.Network - Application Gateway](https://docs.microsoft.com/ja-jp/powershell/module/azurerm.network/?view=azurermps-4.3.1#application_gateway)


## ■ 参考 - Azure PowerShell の利用方法
Azure PowerShell 自体のインストール方法については、以下の記事でご説明していますので、よろしければ、こちらも参考にご覧くださいませ。
[Azure PowerShell 最新版のインストール手順 (v3.8.0 現在) **追記あり](https://jpaztech.github.io/blog/archive/azure-powershell-3-8-0-install/)

Azure PowerShell のインストール後に、実際に Azure の操作を行うためには (Application Gateway にかかわらず)、サインインが必要です。この手順についてのお問い合わせを何件かいただきましたので、以下に手順をご案内いたします。

1. 以下のコマンドを実行し、管理者アカウントでサインインします。
   >Login-AzureRmAccount
2. サブスクリプションが複数ある場合などは、念のため操作対象のサブスクリプションを明示的に指定します。
   >Select-AzureRmSubscription -SubscriptionId "サブスクリプション ID"


