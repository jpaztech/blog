---
title: 1 TB 以上のディスクを持つ VM の Azure Backup (Private Preview)
date: 2017-06-30 21:03:44
tags:
  - Archive
  - Azure Backup
---

こんにちは、Azure サポート チームの世古です。
現在 Azure Storage において新しいディスク サイズが最大 4 TB までサポートされるようになりました。

2018/1/21 より管理ディスクを持つ VM においてもサポートされるようになりました。
[Azure Storage の新しいディスク サイズ – 4 TB までの VHD サイズがサポートされるようになりました。](https://blogs.technet.microsoft.com/jpaztech/2017/06/16/newazurestoragesizes/)

12 月までは Azure IaaS VM のバックアップにおいては 4 TB のディスクを持つ VM のバックアップはサポートしておりませんでしたが、Azure Backup の機能追加により非管理ディスクのみ Private Preview として機能を提供しております。管理ディスクについては、1 月を目途に Private Preview の提供を進めております。
[Instant recovery point and large disk support for Azure Backup](https://gallery.technet.microsoft.com/Instant-recovery-point-and-25fe398a)

## 注意事項

- 本プレビュー機能はサブスクリプション毎に適用されますので、適用したサブスクリプション内全ての Recovery Services コンテナーに本機能が反映されます。
- 本プレビュー機能をサブスクリプションに登録した場合、元に戻すことはできません。
- プレミア ストレージを VM で使用している場合、初回バックアップ時に VM で使用している容量と同等の空き容量がストレージ アカウントに必要となります。
- 本プレビュー機能として、バックアップ時に作成されたスナップショットは「7 日間」保持される仕様となります。これは、リストアを高速化するための仕様となります。そのため、例えば 2 TB のディスク容量のスナップショットが既定で 7 日間保持されるため、その分ストレージ保持料金が発生します。(今後、保持期間を選択できるよう開発中です。 )

## 機能動作について

バックアップが実行されると、同じストレージ アカウント上に VM のスナップショットの情報が取得されます (以下図①)。
このスナップショットのデータは既定で 7 日間保持された後、Recovery Services コンテナー上にアップロードされます (以下図②)。

コンテナー上にアップロードされるまでの期間は 7 日間でございますが、コンテナー上にアップロードされたデータの保持期間はバックアップ時に指定頂いた保持期間でございます。

{% asset_img snapshot.jpg %}

