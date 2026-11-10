---
title: Azure VM に対する Windows Server 2016 拡張セキュリティ更新プログラム (Extended Security Updates /ESU）の適用
date: 2026-11-10 9:00:00
updated: 2026-11-10 9:00:00
tags:
  - VM
  - Windows
---

こんにちは、Azure テクニカル サポート チームの富田雄大です。

本記事では、Azure VM での Windows Server 2016 の拡張セキュリティ更新プログラム (Extended Security Updates、以下 ESU) に関する最新情報をこちらで更新させていただきます。

<!-- more -->

---

## Azure VM に対する Windows Server 2016 ESU の適用

Azure VM に対する Windows Server 2016 ESU の適用について、多くのお問い合わせをいただいております。
恐縮ながら 2026/11/10 の時点では、Azure VM での Windows Server 2016 ESU の利用方法 (適用手順など) については、情報が公開されておりません。
恐れ入りますが、今後の情報公開をお待ちいただきますようお願いいたします。

**情報が公開され次第、本記事でもその内容を記載・更新させていただきます。お手数ではございますが、最新情報が必要な際は、本記事を定期的にご確認いただけますと幸いです。**

---
## ESU の料金について

公開情報としては、**2026 年 4 月 1 日以降にリリースされる Windows および SQL Server 向け ESU は、Azure 内外で同じ定価となる**ことが案内されております点、参考として記載させていただきます。

■ご参考：[Update on Pricing for Extended Security Updates for Windows and SQL Server](https://www.microsoft.com/en-us/licensing/news/services-pricing-consistency-update)

> Customers who use Windows and SQL Server Extended Security Updates released on or after April 1, 2026, will see the same pricing whether they purchase in Azure or outside Azure.

> [!TIP]
> Azure 上の Windows Server 2012 / Windows Server 2012 R2 は ESU が無償でしたが、Windows Server 2016 ESU は Azure でも有償となります。

---
## Azure VM に対する Azure Arc を利用した ESU の適用について

以下の公開情報で案内されている、Azure Arc を利用した Windows Server 2016 ESU の適用方法を、Azure VM でも利用できるかというお問い合わせをいただくことがございます。

■ご参考：[Azure Arc を通じて Windows Server の拡張セキュリティ更新プログラムを配信する準備をする](https://learn.microsoft.com/ja-jp/azure/azure-arc/servers/prepare-extended-security-updates)

恐れ入りますが、**Azure Arc 対応サーバーは、Azure で実行されている仮想マシンの管理を有効にするために設計またはサポートされておりません。** 以下の公開情報にも、この制限が記載されております。

■ご参考：[サポートされる環境 - Azure Arc 対応サーバーの概要](https://learn.microsoft.com/ja-jp/azure/azure-arc/servers/overview#supported-environments)

> Azure Arc 対応サーバーは、Azure で実行されている仮想マシンの管理を有効にするために設計またはサポートされていません。

■ご参考：[サポートされる環境 - 接続された機械エージェントの前提条件](https://learn.microsoft.com/ja-jp/azure/azure-arc/servers/prerequisites#supported-environments)

> Azure、Azure Stack Hub、または Azure Stack Edge でホストされている仮想マシンには Azure Arc をインストールしないでください。

上記のとおり、Azure VM を使用してオンプレミス環境をシミュレートできるのは、テスト目的に限られます。Azure VM での Windows Server 2016 ESU の利用方法については、今後の情報公開をお待ちいただきますようお願いいたします。

---
## さいごに

ESU は以下に記載の通り、セキュリティ更新を受け取れる暫定的な措置であり、ESU 以前の標準的なサポートサービスを継続するものではございません。

■ご参考：[拡張セキュリティ更新 (ESU) プログラムとは何ですか?
](https://learn.microsoft.com/ja-jp/lifecycle/faq/extended-security-updates#------------esu--------------)

>これらは、長期的なソリューションとしてではなく、サポートされている新しいプラットフォームに移行する際にセキュリティを維持するための暫定的な措置です。 ESU には、製品の延長サポート終了日から 3 年以内の、緊急* または重要* なセキュリティ更新プログラムが含まれています。
>ESU プログラムは、製品のライフサイクルを延長せず、元のサポート タイムラインを超えてテクニカル サポートを提供しません。 ESU を使用しているお客様は、セキュリティ更新プログラムに関連しない問題のトラブルシューティング、バグ修正、技術ガイダンスなどの標準的なサポート サービスを受け取りません。

ESU の利用ではなく、OS 自体の更新を行うことについてもご検討いただけますと幸いでございます。

■ご参考：[Azure で Windows Server を実行している VM のインプレース アップグレード](https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows-in-place-upgrade)

本記事の情報が少しでもお客様のお役に立てましたら幸いです。
