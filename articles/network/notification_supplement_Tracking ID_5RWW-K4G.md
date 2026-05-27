---
title: Tracking ID_5RWW-K4G の通知に関するアナウンスの補足
date: 2026-05-26 12:00:00 
tags:
  - Network
---

こんにちは、Azure テクニカル サポート チームです。
2026 年 05 月 24 日に Intel D および E-v5 シリーズおよび Cobalt 100 D および E-v6 シリーズ VM に対して Microsoft Azure Network Adapter (MANA) ハードウェアとの OS 互換性の確認に関するアナウンスがされました。(Tracking ID: 5RWW-K4G)

本記事では、通知内容の日本語抄訳に加え、対応が必要なお客様の条件や具体的な手順をわかりやすく整理してご案内いたします。

<!-- more -->
---


## 通知の概要
一部のお客様には、Azure 仮想マシンにおけるネットワーク基盤の変更 (MANA: Microsoft Azure Network Adapter) に関する通知が送られました。
この通知は障害に関する情報ではなく、将来、構成変更および互換性への影響が想定される可能性があることから事前案内をしています。

### 対象 VM シリーズ

| プロセッサ | VM シリーズ |
|---|---|
| Intel | Dsv5, Dv5, Ddsv5, Ddv5, Dlsv5, Dldsv5, Esv5, Ev5, Edsv5, Edv5, Ebsv5, Ebdsv5 |
| Cobalt 100 | Dpsv6, Dpdsv6, Dplsv6, Dpldsv6, Epsv6, Epdsv6 |

### リージョン展開スケジュール

| 日付 | リージョン |
|---|---|
| 2026 年 05 月 26 日 | West Central US |
| 2026 年 05 月 27 日 | East Asia |
| 2026 年 05 月 28 日 | Norway West |
| 2026 年 05 月 29 日 | Spain Central |
| 以降 | 追加リージョンは順次 Service Health 通知で別途案内予定 |

## 対応が不要なケース

以下のいずれかに該当する場合、**対応は不要です**。

- 上記対象 VM シリーズで**高速ネットワーク (Accelerated Networking) を使用していない**場合
- 上記対象 VM シリーズで **Windows OS** を使用している場合

## 対応が必要なケース

上記対象 VM シリーズで**高速ネットワーク (Accelerated Networking) を使用しており**、**NVA (Network Virtual Appliance) ワークロード**を実行している場合は、以下の対応手順を実施してください。

MANA 対応ハードウェアが各リージョンで有効になった後、新規の VM デプロイや、メンテナンス イベント・お客様の操作による既存 VM の再デプロイの際に、MANA 対応ハードウェアに VM が配置される可能性があります。NVA ワークロードの場合、互換性の確認と対応を行わないと、**ネットワーク パフォーマンスの低下**が発生する可能性があります。

## 対応手順

### ステップ 1: 対象 VM の特定

高速ネットワークを使用しており、NVA ワークロードを実行している以下の VM を特定してください。

- Intel D および E-v5 シリーズ VM
- Cobalt 100 D および E-v6 シリーズ VM

### ステップ 2: Linux OS の MANA 互換性の確認

以下ドキュメントの「MANA のサポートの状態を確認する」セクションに沿って、使用している Linux OS が MANA 対応であることを確認してください。


[MANA のサポートの状態を確認する](https://learn.microsoft.com/ja-jp/azure/virtual-network/accelerated-networking-mana-linux#check-the-status-of-mana-support)

### ステップ 3: 非互換の場合の対応

OS が MANA 非互換の場合、**MANA 対応の OS または NVA 製品にアップグレード**してください。MANA 対応製品の一覧については、お使いの NVA プロバイダーにお問い合わせください。

### ステップ 4: 追加時間が必要な場合の一時的な除外措置

ステップ 3 の対応に追加の時間が必要な場合、サードパーティのパブリッシャーより提供されている NVA については `LegacyVMNVA` タグを適用して有効化することで、**MANA ハードウェアへの配置から一時的に除外**されます。

> [!WARNING]
> - この除外措置は **2027 年 05 月 31 日** に期限切れとなります。
> - リージョンで MANA 対応ハードウェアが有効になる前にタグを適用していない場合、VM は MANA 対応ハードウェアにデプロイされる可能性があります。

### ステップ 5: 期限までのアップグレード
リソース タグによる除外措置を行っている場合、**2027 年 05 月 31 日までに** MANA 対応の OS または NVA 製品へのアップグレードを完了してください。この日以降、すべての VM が MANA 対応ハードウェアに配置される可能性があります。

## LegacyVMNVA タグの適用方法

NVA ワークロードを実行している VM に対して `LegacyVMNVA` タグを適用することで、一時的に MANA ハードウェアへの配置を除外できます。
`LegacyVMNVA` タグを任意のスコープに設定する組み込みの Azure ポリシーが用意されておりますので、こちらをご利用ください。


[一時的な MANA 例外 LegacyVMNVA](https://learn.microsoft.com/ja-jp/azure/virtual-network/accelerated-networking-mana-network-virtual-appliance-opt-out#temporary-mana-exception-with-legacyvmnva)

手動でリソース タグを設定いただく場合、以下の手順となります。

Azure CLI の場合
```Bash
az vm update --resource-group "リソースグループ名" --name "VM 名" --set tags.LegacyVMNVA=true
```

Azure PowerShell の場合
```PowerShell
$vm = Get-AzVM -ResourceGroupName "リソースグループ名" -Name "VM 名"
$vm.Tags["LegacyVMNVA"] = "true"
Update-AzVM -ResourceGroupName "リソースグループ名" -VM $vm
```

Azure ポータルの場合

1. Azure ポータルで対象の VM リソースに移動します。
2. 左側のメニューから **[タグ]** を選択します。
3. 名前に `LegacyVMNVA`、値に `true` を入力します。
4. **[保存]** をクリックします。

## 対応フローチャート

以下のフローチャートで、お客様の環境に必要な対応を確認できます。

```
対象 VM シリーズ (Intel E-v5 / Cobalt 100 D E-v6) を使用している
  │
  ├─ 高速ネットワークを使用していない → 対応不要
  │
  ├─ Windows OS を使用している → 対応不要
  │
  └─ 高速ネットワーク + Linux OS を使用している
      │
      ├─ NVA ワークロードではない → ※ Linux OS が MANA 対応であることを確認の上、必要に応じてカーネルの更新
      └─ NVA ワークロードである
          │
          ├─ OS が MANA 互換 → 対応不要
          │
          └─ OS が MANA 非互換
              │
              ├─ すぐにアップグレード可能 → MANA 対応 OS/NVA にアップグレード
              │
              └─ 時間が必要 → LegacyVMNVA タグを適用 → 2027 年 05 月 31 日までにアップグレード
```

※ NVA に該当しない VM は、以下ドキュメント内の「MANA のサポート状態を確認する」を参照して、Linux OS が MANA 対応か確認してください。非対応の場合、カーネルの更新をお願いします。


[MANA のサポートの状態を確認する](https://learn.microsoft.com/ja-jp/azure/virtual-network/accelerated-networking-mana-linux#check-the-status-of-mana-support)

## FAQ

### MANA とは何ですか？

Microsoft Azure Network Adapter (MANA) は、Azure の新しいネットワーク アダプター ハードウェアです。高速ネットワーク (Accelerated Networking) を使用する VM に対して、強化されたネットワーク パフォーマンスを提供します。

### MANA 非互換の OS を使い続けるとどうなりますか？

Intel v5 および Cobalt 100 の VM サイズで MANA 非互換の OS を使い続ける場合、VM は既存の Mellanox ハードウェアおよび新しい MANA 対応ハードウェアの両方で引き続きサポートされますが、**ネットワーク パフォーマンスが低下する可能性**があります。該当の VM サイズが廃止されるまでサポートは継続されます。

### LegacyVMNVA タグの有効期限はいつですか？

**2027 年 05 月 31 日**です。この日以降、タグの有無に関わらず、すべての VM が MANA 対応ハードウェアに配置される可能性があります。

### Windows OS の場合は対応が必要ですか？

いいえ、Windows OS を使用している場合は対応不要です。

### 既存の VM にも影響がありますか？

はい。メンテナンス イベントやお客様の操作（再デプロイなど）によって既存の VM が再配置される際に、MANA 対応ハードウェアに配置される可能性があります。

****

以上、Microsoft Azure Network Adapter (MANA) ハードウェアとの OS 互換性の確認に関するアナウンスの補足でした。
本記事が少しでも皆様のお役に立てれば幸いです。
