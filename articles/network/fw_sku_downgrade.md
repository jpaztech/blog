---
title: Azure Firewall の SKU をダウングレードする方法
date: 2024-01-24 14:30:00 
tags:
  - Network
  - Azure Firewall
---
こんにちは、Azure テクニカル サポート チームの薄井です。
今回は Azure Firewall の SKU を Premium から Standard にダウングレードする方法ついて紹介します。

<!-- more -->

Azure Firewall の SKU を Premium から Standard にダウングレードすることは可能でございますが、Firewall Policy の ポリシー レベルを Premium から Standard に変更することはできません。
そのため、Azure Firewall の SKU を変更する前に Firewall Policy を Standard で再作成する必要ございます。
Azure Firewall の SKU を Premium から Standard にダウングレードする手順は以下の通りとなります。
 
## Azure Firewall の SKU 変更手順
1. Firewall Policy を Standard で作成します。
2. 対象の Azure Firewall の [概要] をクリックし、Firewall policy の [change] をクリックします。
3. 1 で作成した Firewall policy をチェックし、下部の [保存] をクリックします。
4. 対象の Azure Firewall の [概要] をクリックし、上記の [SKU の変更] をクリックします。
5. ファイアウォール SKU の Standard をクリックします。
6. "ファイアウォール ポリシーを選択してください" の箇所が、3 で保存した Firewall policy であることを確認します。
7. 下部の [Downgrade] をクリックします。

なお、Azure Firewall の SKU を Premium から Standard にダウングレードできるのは、Firewall Policy を使用している場合のみとなります。
ファイアウォール規則 (クラシック) を使用して Azure Firewall を管理することができないため、この点ご留意いただけますと幸いです。
 
また、ダウングレードした際のダウンタイムにつきましては、明確なダウンタイムはご案内することが困難ですが、15 ～ 20 分程度の時間がかかることを確認しております。
そのため、ダウングレードする際は、影響がない時間帯で実施いただければと存じます。
 
## 参考情報
Azure Firewall の SKU 変更ついては以下にも記載がありますのでご一読ください。

[Azure Firewall イージー アップグレード/ダウングレード](https://learn.microsoft.com/ja-jp/azure/firewall/easy-upgrade)


****
