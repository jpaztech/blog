---
title: "サービスタグに必要なアクセス制御 (RBAC) について"
date: 2023-12-25 15:00:00
tags:
  - Network
  - Network Security Group
  - Service Tag
  - RBAC
---

こんにちは、Azure テクニカル サポート チームです。

Azure サービスをご利用いただく中で、Azure ロールベースのアクセス制御 (RBAC) を利用し、必要な権限をユーザーに付与し、運用いただいているお客様も多いかと存じます。
その中で、Azure Portal 上の NSG のサービスタグが一部しか表示されない事象があるというお問い合わせを多くいただいておりますので、その原因および回避策について本ブログでご説明いたします。

## NSG のサービスタグが一部しか表示されない原因
以下のように、一部のサービスタグのみしか表示されないというお問い合わせをいただいております。

![service-tag-rbac-ng](https://github.com/jpaztech/blog/blob/master/articles/network/azure-service-tag-authority/service-tag-rbac-ng.png?raw=true)

結論から申し上げると、サービスタグを表示させるための、RBAC 権限が付与されていない、不足している場合、上記のような事象が発生いたします。
上記のように一部のサービスタグのみしか表示されない場合、サービスタグを表示させるための、読み取りアクセス許可をユーザーに対して付与いただく必要がございます。
具体的には、すべてのサービスタグを表示させるために、<span style="color: red; ">**サブスクリプション**</span>のスコープに対して、以下の 2 つの読み取り権限を付与いただく必要がございます。

```
"Microsoft.Network/locations/serviceTags/read"
"Microsoft.Network/locations/serviceTagDetails/read"
```

[仮想ネットワーク サービス タグ - Virtual Network | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/virtual-network/service-tags-overview)
> 現在のサブスクリプションに対して、認証され、読み取りアクセス許可を持つロールを持っている必要があります。

## 全てのサービスタグを表示させる方法
一部のサービスタグのみしか表示されない場合、以下の手順をご確認下さい。

### 1. 読み取りアクセス許可権限が付与されているか

Azure Portal からサブスクリプションへ遷移いただき、[アクセス制御 (IAM)] > アクセスの確認 > 対象のユーザーを検索 > 割り当てられているロールを選択 > JSON から、
上述の 2 つの権限、または 2 つの権限を含む権限 (e.g. "Microsoft.Network/\*/read", "\*") が付与されているかご確認下さい。

### 2. 読み取りアクセス許可権限を付与する
1. の手順において、サービスタグの読み取りアクセス許可が無かった場合、サブスクリプションのスコープに対して、閲覧者ロールを付与する、
または、カスタムロールで最小限の権限を付与したい場合、以下の 2 つの権限をカスタムロールに追加ください。

```
"Microsoft.Network/locations/serviceTags/read"
"Microsoft.Network/locations/serviceTagDetails/read"
```

サブスクリプションのスコープに対して、閲覧者権限を付与したい場合、Azure Portal からサブスクリプションへ遷移いただき、[アクセス制御 (IAM)] > [+追加] > [ロールの割り当ての追加] > [閲覧者]を指定し、任意のユーザー、グループに権限を付与いただけます。

[アクセス権の付与 - ロールベースのアクセス制御 | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/role-based-access-control/quickstart-assign-role-user-portal#grant-access)

カスタムロールをご利用いただいている場合、Azure Portal からサブスクリプションへ遷移いただき、[アクセス制御 (IAM)] > ユーザーに付与しているカスタムロールから [編集] を押下 > JSON から上記 2 つの権限を追加ください。

[カスタム ロールの更新 - ロールベースのアクセス制御 | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/role-based-access-control/custom-roles-portal#update-a-custom-role)

上記設定適用後、ロールの更新には少々お時間を要しますので、一度 Azure Portal からログアウトいただき、再ログインいただいた後、サービスタグが表示されるようになるかご確認いただければと存じます。

## カスタムロールのご利用について
Azure Portal の UI はサービスタグに関わらず、高頻度で改善/改修が行われているため、それに伴い、必要な権限が追加・変更になる場合がございます。
そのため、カスタムロールで細かく権限を制御されている場合、Azure Portal の UI 変更にともなって、権限修正が必要になる可能性もございます。
カスタムロールをご利用の場合には、お客様側でも十分に検証いただくと共に、修正が必要になる点も予めご認識いただきますようお願い申し上げます。


以上、ご参考になりましたら幸いでございます。
