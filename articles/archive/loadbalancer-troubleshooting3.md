---
title: ロードバランサーの診断ログが出力されない場合のチェックポイントについて
date: 2018-04-04 17:25:29 
tags:
  - Archive
  - Network
  - Load Balancer
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは。Azure サポートの宇田です。今回はロードバランサー (Basic) の診断ログが出力されない場合のチェックポイントについてご紹介します。

Azure におけるロードバランサーの挙動については、以下の投稿もあわせてご確認ください。

* ロードバランサー経由での通信ができない場合のチェックポイント
https://jpaztech.github.io/blog/archive/loadbalancer-troubleshooting/
* Azure のロードバランサーは pre-warming も監視も不要です
https://jpaztech.github.io/blog/archive/azure-lb-pre-warming-and-monitoring/
* ロードバランサー経由での通信が偏る場合のチェックポイント
https://jpaztech.github.io/blog/archive/loadbalancer-troubleshooting2/

**2021/07/08 追記**
**Basic SKU の外部ロードバランサーでは診断ログが利用できなくなりました。(元々、診断ログが正常に取得できないという既知の不具合情報がドキュメントに記載されていましたが、以下に抜粋する通知メールのとおり、最終的に診断ログの機能は廃止という結論になったようです。)**
**ログが必要な場合は、Standard SKU でメトリックの機能を活用しましょう。（以前から運用環境では Standard SKU が推奨になっています。）**

> TRACKING ID: 8NBV-BT0
> 
> You’re receiving this notice because you currently use the Azure Load Balancer with diagnostic logs configured with “Load Balancer Alert Events” and “Load Balancer Probe Health Status” categories.
>
> The diagnostic log categories “Load Balancer Alert Events” and “Load Balancer Probe Health Status” are no longer functional and will be removed from the Azure Portal to prevent them from being enabled. They’re being removed from the REST API, Powershell, and CLI starting on 15 March 2021.
>
> Upgrade to Standard to use the “All Metrics” category if you require logging. This will also unlock metrics and insights features. Find more information in our upgrade instructions and known issues page.

<s>

## ロードバランサーの診断ログについて

ロードバランサーでも、他の Azure リソースと同様に診断ログを採取する機能が提供されています。

詳しくは以下のドキュメントをご覧いただければと思いますが、ロードバランサーでポート枯渇が発生した場合に記録される「アラート イベント ログ」と、プローブに状態に変化があった際に記録される「正常性プローブ ログ」の二点が用意されています。

* Azure Load Balancer のログ分析
https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-monitor-log

## 診断ログが出力されない主な要因について

「ロードバランサーの診断ログが正常に出力されない」とサポートにお問い合わせいただく際の、主な要因は以下の通りです。

1. 内部ロードバランサーを使用している
1. ログを記録するようなイベントが発生していない
1. Microsoft.Insights のリソース プロバイダーが登録されていない

それぞれについて、以下に順番にご説明します。

### 内部ロードバランサーを使用している場合

先のドキュメントにも記載の通り、2018 年 4 月現在、診断ログについては外部ロードバランサー のみ対応となっております。

恐れ入りますが、内部ロードバランサーの場合では診断ログをサポートしていないため、ご利用いただくことができません。

> ログ分析は現在、インターネットに接続するロード バランサーに対してのみ機能します。 ログは、リソース マネージャーのデプロイ モデルでデプロイされたリソースについてのみ使用できます。 クラシック デプロイメント モデルのリソースには使用できません。

これは外部ロードバランサーと内部ロードバランサーの仕組みの違いによるものです。

### ログを記録するようなイベントが発生していない場合

診断ログが出力されるのは、該当するイベントが発生した場合のみとなります。ストレージサービスにデータ保存の場合には、該当のイベントが発生したタイミングで、ストレージサービス内にコンテナが作成され、ログが保存されます。

「アラート イベント ログ」であれば、実際にポート枯渇が発生したなどの場合に、「正常性プローブ ログ」であれば、バックエンドの VM がダウンして 2 台中 1 台のみ正常な状態になったり、復旧して 2 台中 2 台が正常に戻った際などに記録されます。このため、状態に変化が無い場合ですと診断ログが出力されませんので、必要に応じて VM を一度停止や再起動などをお試しください。

また、実際にログが出力されるまでに、内部的にデータの転送機能を整えるため少々時間を要しますため、1時間ほど時間をあけていただいてから、再度ログが出力されたかをご確認ください。

### Microsoft.Insights のリソース プロバイダーが登録されていない場合

診断ログの機能については、Microsoft.Insights というリソース プロバイダーによって提供されています。このため、当該リソース プロバイダーが未登録の状態ですと、ログが出力されないことがございます。

以下、仮想マシンの診断ログが表示されない場合について記載したポストにも記載の通り、リソース プロバイダーが未登録の場合は、手動で明示的に登録をお願いいたします。

* [仮想マシンやストレージ アカウントの監視ができない時のトラブル シューティングについて](https://jpaztech1.z11.web.core.windows.net/%E4%BB%AE%E6%83%B3%E3%83%9E%E3%82%B7%E3%83%B3%E3%82%84%E3%82%B9%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B8%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E3%81%AE%E7%9B%A3%E8%A6%96%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%AA%E3%81%84%E6%99%82%E3%81%AE%E3%83%88%E3%83%A9%E3%83%96%E3%83%AB%E3%82%B7%E3%83%A5%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6.html)
※「リソース プロバイダーの状態を確認」のセクションをご参照ください。

</s>

以上、ご参考になれば幸いです。
