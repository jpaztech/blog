---
title: プライベート DNS ゾーンと内部 Azure API Management を組み合わせる時のベストプラクティス
date: 2026-04-20 12:00:00 
tags:
  - Network
  - Azure Private DNS
  - DNS
---

こんにちは、Azure テクニカル サポート チームの箕輪です。
プライベート DNS ゾーンは、仮想ネットワーク上で任意のゾーン名やプライベート エンドポイントで利用する privatelink サブドメインの名前解決を提供する DNS サービスで、仮想ネットワーク上に展開されたリソースの名前解決に影響を与えます。  
その中で、内部 Azure API Management を利用しているシナリオで、プライベート DNS ゾーンの構成によって Azure サービスへの名前解決が意図せず失敗し接続ができない事象が発生し得ます。このブログでは、要因と考えられる対応策についてご紹介します。

<!-- more -->

## このブログで紹介するシナリオ

[Azure API Management (APIM)](https://learn.microsoft.com/ja-jp/azure/api-management/api-management-key-concepts) とは、あらゆる環境にわたる API のためのハイブリッドなマルチクラウド管理プラットフォームです。 APIM は Azure ユーザーだけではなく、各 Azure サービスの内部コンポーネントとしても組み合わせて利用されています。

APIM のエンドポイントは、インターネット上に公開されるパブリック エンドポイントの他、仮想ネットワーク上のリソースとしてプライベート エンドポイントや、外部非公開の API エンドポイントとして [内部 APIM](https://learn.microsoft.com/ja-jp/azure/api-management/api-management-using-with-internal-vnet) などが構成できます。この中で内部 APIM を利用する時、APIM の各エンドポイントへの接続はパブリック IP アドレスではなくプライベート IP アドレスで接続する必要があるため、仮想ネットワーク上で名前解決を提供するプライベート DNS ゾーンとの組み合わせにて構成する内容が公開情報に記載されています。

この内部 APIM の構成時に、プライベート DNS ゾーンとして azure-api.net を指定した構成では、Azure PaaS への接続が失敗する事象が発生する可能性があります。

## 発生要因

Azure の仮想ネットワーク上のリソースに対する名前解決の構成として、Azure 既定の DNS サーバー (168.63.129.16) を参照先として指定する構成が一般的です。この Azure 既定の DNS サーバーは、仮想ネットワークとリンクされたプライベート DNS ゾーンに対して DNS クエリを送信した時に参照する必要があります。仮想ネットワーク上に展開可能なプライベート DNS Resolver の受信エンドポイント宛ての DNS クエリについても、 Azure 既定の DNS サーバー (168.63.129.16) に転送されます。

次に内部 APIM を利用するためには、内部 APIM の各エンドポイント (FQDN) に対応したプライベート IP アドレスへの接続が必要です。各エンドポイント (FQDN) の名前解決結果を対象のプライベート IP アドレスにするために、DNS 構成としてプライベート DNS ゾーンを構成する旨が、公開情報に記載されています。  
この時どのようなゾーン名にするかは具体的な記載がありませんが、必要なエンドポイントに共通しているのは azure-api.net となるため、azure-api.net　をゾーン名としてプライベート DNS ゾーンを構成されることが多いと想定しています。

そして、今回のベストプラクティスにおける意図せず名前解決に失敗する事象の要因として、APIM は各 Azure サービスの内部コンポーネントとして利用される場合があることが挙げられます。例えば Azure OpenAI Service（AOAI）や Azure Data Factory などでは、これまでのお問合せ事例より一部機能で APIM が組み込まれています。  
具体的には、接続元クライアントからの接続時の FQDN は AOAI のエンドポイントであったとしても、名前解決を実施すると azure-api.net を含んだエイリアスが一連の名前解決に含まれます。この時、プライベート DNS ゾーンに  azure-api.net  を指定していると、本来パブリック DNS サーバーで名前解決されるものが、プライベート DNS ゾーンで名前解決され、対象の DNS レコードが存在しないため名前解決に失敗し、接続影響を及ぼします。  
なお、その他の Azure サービスについても、一部機能で利用されている場合や、機能実装に伴い APIM が組み込まれる場合があります。

## プライベート DNS ゾーン観点での対応方法

このシナリオにおける対応策のポイントは、内部 APIM とプライベート DNS ゾーンを組み合わせる時に、ゾーン名を azure-api.net とした場合に、APIM に関連する意図しない通信影響を及ぼす点です。  
意図しない通信影響を回避するためのポイントとしては、内部 APIM は機能によって差異はありますが、名前解決が必要なエンドポイントがおおよそ特定できる点です。
この動作により、利用されている内部 APIM に対するエンドポイントのみ DNS 構成し、ゾーン名を azure-api.net 以外にすることで意図しない事象を回避することが可能です。
内部 APIM のエンドポイント情報は、リソース デプロイ時に指定したリソース名をホスト名とし、各エンドポイントのドメインと組み合わせます。  
内部 APIM の公開情報 ([DNS レコードを構成する](https://learn.microsoft.com/ja-jp/azure/api-management/api-management-using-with-internal-vnet#configure-dns-records))に倣いリソース名を contosointernalvnet とした場合、一般的な構成ですと下記のエンドポイントが該当します。  
このエンドポイント名は、Azure Portal で構成した内部 APIM リソースを選択し、[設定 - プロパティ] から確認ができます。

```
contosointernalvnet.azure-api.net (ゲートウェイ)
contosointernalvnet.developer.azure-api.net (開発者ポータル)
contosointernalvnet.management.azure-api.net　(管理 API)
```

プライベート DNS ゾーン観点では、ゾーン名は任意のものを指定可能なことがポイントとして挙げられます。今回のシナリオでは、ゾーン名を azure-api.net にすることで事象が発生するので、上記の内部 APIM のエンドポイントの FQDN 自体をゾーン名に指定し、A レコードを登録することで、他の Azure サービスの azure-api.net を含んた名前解決に影響を与えず、対象の内部 APIM だけ名前解決が可能になります。
公開情報のリソース名を基に具体例を挙げると、まず下記 3 つの FQDN をプライベート DNS ゾーンのゾーン名に指定してデプロイします。デプロイされた後、対象ゾーンの頂点ドメインとしてホスト部に @ を指定して、対応するプライベート IP アドレスを A レコードとして登録することで、FQDN に対する名前解決だけプライベート IP アドレスが応答され、それ以外の azure-api.net に対応する名前解決はパブリック DNS に転送することが可能になります。

```
contosointernalvnet.azure-api.net
contosointernalvnet.developer.azure-api.net
contosointernalvnet.management.azure-api.net
```
なお、プライベート DNS ゾーンには [インターネット フォールバック機能](https://learn.microsoft.com/ja-jp/azure/dns/private-dns-fallback) (ゾーン内に対象の DNS レコードがない場合にパブリック DNS に問い合わせる機能) がありますが、この機能は privatelink サブドメインのみ対象とした機能となるため、今回のシナリオの azure-api.net は対象外となります。

上記、ご参考になれば幸いです。

---
