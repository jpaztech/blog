---
title: ゾーン未指定時の VM ゾーンおよびサブスクリプション毎のゾーン番号指す物理ゾーンについて
date: 2023-10-30 17:30:00
tags:
  - VM
  - Windows
  - Linux
  - HowTo
---

こんにちは、Azure テクニカル サポート チームの富田です。  
Azure VM で可用性ゾーンを未指定の場合にはゾーン番号が何処になるかは分からない点と、サブスクリプション毎にゾーン番号が指し示す物理ゾーンが違う点について解説させていただきます。  

## 可用性ゾーンを未指定の場合のゾーンについて

可用性ゾーンに対応するリージョンでは Azure VM の可用性ゾーンを指定することで、ご希望のゾーン上に VM をデプロイすることが可能です。  
ゾーンは原則 1 ～ 3 番のゾーン番号で指定が可能でございます。  

> ■ご参考：可用性ゾーン  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/availability#availability-zones](https://learn.microsoft.com/ja-jp/azure/virtual-machines/availability#availability-zones)

なお、可用性ゾーンを未指定の場合はゾーン 1 ～ 3 のどのゾーンで VM が起動するか把握することは叶いません。  
VM 割り当て解除をして起動することでゾーンが変更となることもございます。  
加えて現在どのゾーンで起動しているかといったことも確認をすることが叶いません。  
特定ゾーンでの稼働が必要な場合は、可用性ゾーンを指定して VM をデプロイいただくようにお願いいたします。  

## サブスクリプション毎にゾーン番号が指し示す物理ゾーンが違う点について

Azure ポータル等で表示・指定できるゾーン番号は、サブスクリプション毎に指し示す物理ゾーンが異なります。  
Azure ポータル等で表示・指定できるゾーン番号のことを「論理ゾーン」、実際の物理的なゾーンの場所のことを「物理ゾーン」と呼びます。
例えば X リージョンで以下のように物理ゾーンが 3 つあったとします。  

- A 市物理ゾーン 
- B 町物理ゾーン 
- C 村物理ゾーン 

この際にサブスクリプションによって、以下の例のように指し示すゾーンが違う場合がございます。  

**contoso 社サブスクリプションの場合**

|論理ゾーン番号|実際の物理ゾーン|
|:-|:-|
|1 番|A 市物理ゾーン|
|2 番|B 町物理ゾーン|
|3 番|C 村物理ゾーン|

**hogehoge 社サブスクリプションの場合**

|論理ゾーン番号|実際の物理ゾーン|
|:-|:-|
|1 番|C 村物理ゾーン|
|2 番|A 市物理ゾーン|
|3 番|B 町物理ゾーン|

そのため、「contoso 社サブスクリプション」と「hogehoge 社サブスクリプション」でどちらも Azure ポータルから論理ゾーン 1 番に VM を作成したとしても、実際の物理ゾーンは違う場所であるといったことが発生します。  
恐縮ながら、論理ゾーン番号と実際の物理ゾーンのマッピングについては確認を行うことが叶いません。  
これは特定のゾーンに需要が偏らないようにするために必要な措置でございます点、ご理解いただけますと幸いです。  

他方、別のサブスクリプションとの論理ゾーンのマッピングについては後述の通り REST API にて確認が可能です。  
すなわち、「contoso 社サブスクリプション」の論理ゾーン 1 番は「hogehoge 社サブスクリプション」の論理ゾーン 2 番と同じであるとの点は確認が可能です。  

## サブスクリプション間の論理ゾーンのマッピングを REST API で確認する

以下の REST API を用いて確認する事が可能です。  

■ご参考：Subscriptions - Check Zone Peers
https://learn.microsoft.com/ja-jp/rest/api/resources/subscriptions/check-zone-peers

上記ページの「使ってみる」をより、サブスクリプション間の論理ゾーンのマッピングを確認する方法を解説させていただきます。  

まずは比較用の Microsoft.Resources/AvailabilityZonePeering 機能が有効か確認します。  
Azure Cloud Shell 等を用いて、比較元サブスクリプションにて以下の Azure CLI コマンドを実行します。  

```azurecli
az feature show --namespace Microsoft.Resources --name AvailabilityZonePeering --subscription 比較元サブスクリプションID | jq .properties.state
```

上記コマンドの結果として "Registered" と表示されていない場合は、以下の Azure CLI コマンドで機能を登録します。  
"Registered" の状態になるまでお時間がかかることがございます。  

```azurecli
az feature register --namespace Microsoft.Resources --name AvailabilityZonePeering
```

上記ページの「使ってみる」を選択して、比較元サブスクリプションでログインします。
その後表示された「REST API 使ってみる」のページにて、パラメーターの subscriptionId で比較元サブスクリプションを選択します。  

そして、「REST API 使ってみる」のページの本文のエリアに以下の例のように、比較対象のリージョンおよび比較先サブスクリプション ID を記載します。
複数サブスクリプションを設定することも可能です。

```http
{
  "location": "リージョン名（japaneast など）",
  "subscriptionIds": [
    "subscriptions/比較先サブスクリプションAのID",
    "subscriptions/比較先サブスクリプションBのID"
  ]
}
```

その後、実行ボタンを選択すると以下の例のような結果が得られます。

```http
{
  "subscriptionId": "比較元サブスクリプションID",
  "location": "japaneast",
  "availabilityZonePeers": [
    {
      "availabilityZone": "1",
      "peers": [
        {
          "subscriptionId": "比較先サブスクリプションAのID",
          "availabilityZone": "3"
        },
        {
          "subscriptionId": "比較先サブスクリプションBのID",
          "availabilityZone": "2"
        }
      ]
    },
    {
      "availabilityZone": "2",
      "peers": [
        {
          "subscriptionId": "比較先サブスクリプションAのID",
          "availabilityZone": "2"
        },
        {
          "subscriptionId": "比較先サブスクリプションBのID",
          "availabilityZone": "1"
        }
      ]
    },
    {
      "availabilityZone": "3",
      "peers": [
        {
          "subscriptionId": "比較先サブスクリプションAのID",
          "availabilityZone": "1"
        },
        {
          "subscriptionId": "比較先サブスクリプションBのID",
          "availabilityZone": "3"
        }
      ]
    }
  ]
}
```

上記の結果より、比較元サブスクリプションの論理ゾーン 1 は、  

- 比較先サブスクリプション A では、論理ゾーン 3
- 比較先サブスクリプション B では、論理ゾーン 2
- 
と同じ、物理ゾーンを指しているといったマッピングの確認ができました。  

上述の内容がお客様のお役に立てますと幸いでございます。