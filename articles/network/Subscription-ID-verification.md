---
title: サブスクリプション ID とリソース ID の確認について
date: 2021-11-26 12:30:00
tags:
  - Azure Portal
---

こんにちは、Azure サポート チームです。

お客様から日々お問い合わせ頂いている内容について、正確に調査や状況確認を行うために、我々サポートエンジニアからお客様にリソース情報 (サブスクリプション ID 、リソース ID) をお伺いすることがあります。
本トピックでは、このサブスクリプション ID とリソース ID の確認方法についてご紹介いたします。

## サブスクリプション ID とは
Microsoft Azure をご利用頂く際に、お客様と日本マイクロソフト株式会社は、無償または有償のサブスクリプション契約 (無料評価版、従量課金プラン等) を結びます。
お客様が締結したこのサブスクリプション契約を一意のものとして識別するために、マイクロソフトでは 32 桁の GUID を付与しています。この GUID がサブスクリプション ID で以下のフォーマットで表記されます。

xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

## サブスクリプション名とサブスクリプション ID の確認方法について

以下では、Azure Portal からサブスクリプション名とサブスクリプション ID 確認する方法についてご案内いたします。

1. Azure ポータルにサインインします。

2. Azure Poral ホーム画面上部の検索バーから [サブスクリプション] と検索 / Azure Portal ホーム画面下部の移動から [サブスクリプション]をクリックします。

![](Subscription-ID-verification/01.png)

3. 表示されたサブスクリプション一覧から、該当のサブスクリプションを選択しクリックします。
![](Subscription-ID-verification/02.png)

4. 画面上部にサブスクリプション名とサブスクリプション ID が表示されます。

5. カーソルを合わせると[クリップボードにコピー]が表示されます。

![](Subscription-ID-verification/03.png)

### 特定のリソースからサブスクリプション名とサブスクリプション ID を確認する
特定のリソースからサブスクリプション名とサブスクリプション ID を確認するためには、リソースの概要画面上部から確認できます。
![](Subscription-ID-verification/04.png)

## リソース ID とは
Azure のリソース ID とは Azure Resource Manager におけるリソースの一意な識別子を示しており、以下のフォーマットで表記されます。
/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderName}/ {resourceType}/{resourceName}

## リソース ID の確認方法について

1. 調査対象のリソースの概要画面の右部の [JSON ビュー] をクリックします。 (例では Azure VM を示す。)
![](Subscription-ID-verification/05.png)

2. JSON ビュー上部にリソース ID が表示されます。
3. カーソルを合わせると[クリップボードにコピー]が表示されます。
![](Subscription-ID-verification/06.png)
