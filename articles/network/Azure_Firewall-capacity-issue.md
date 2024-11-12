---
title: Azure Firewall のキャパシティに関する問題およびその原因 / 対策について
date: 2024-11-xx 17:30:00
tags:
  - Network
  - Azure Firewall
  - capacity
---
こんにちは、Azure Networking サポート チームの間島です。

今回は、数万ユーザーが Azure Firewall を経由して通信を行うような大規模なシステムを運用されているお客様より、特にお問い合わせいただくことが多い Azure Firewall のキャパシティに関する問題およびその原因 / 対策についてご紹介させていただきます。
なお、お客様が Azure Firewall の設計や運用の検討を行う際に、Azure Firewall のパフォーマンス観点で考慮すべき点につきましては、下のリンク先がご参考になるかと思いますので、まず最初にご一読いただければと思います。
> [!IMPORTANT]
>Azure Firewall のパフォーマンスに関するベスト プラクティス
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-best-practices

## Azure Firewall のキャパシティに関するお問い合わせの例
### SNAT ポートが枯渇する
#### - 問題
Azure 内の仮想マシン (VM) や Azure Virtual Desktop (AVD) から Azure Firewall を経由するインターネットへのアクセスが増加した結果、Azure Firewall の SNAT ポートが枯渇し、VM や AVD からインターネットへのアクセスがエラーとなる。
#### - 原因
Azure Firewall では、下のリンク先に記載されているように、パブリック IP アドレス毎にインスタンス 1 つにつき 2,496 個の SNAT ポートを利用することが可能となっていますが、当該の Azure Firewall にてパブリック IP アドレスを 1 つしか使用していない場合には、スケールアウトによりインスタンス数が最大の 20 になった場合でも、最大 49,920 個のSNAT ポートしか利用できません。その結果、SNAT ポートを多く利用する環境の場合には、SNAT ポートの枯渇が発生する場合があります。
> [!TIP]
>Azure Firewall の既知の問題と制限事項
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-known-issues

#### - 対策
SNAT ポートを多く利用する環境の場合には、設計段階にてパブリック IP アドレスを 複数使用して Azure Firewall を構成することを検討してください。また通信先にて、Azure Firewall にて SNAT された後の IP アドレスのレンジにより、アクセス許可を行う要件がある場合には、通信先でのアクセス許可を簡素化するために、Azure Firewall のパブリック IP アドレスを IP アドレス プレフィックスから割り当てることをご検討ください。
> [!TIP]
>パブリック IP アドレス プレフィックス
>https://learn.microsoft.com/ja-jp/azure/virtual-network/ip-services/public-ip-address-prefix

また、運用段階では、Azure Firewall の下記のメトリックを監視し、SNAT 枯渇が発生しないよう運用監視を行い、空きの SNAT ポートが不足した場合にはパブリック IP アドレスの追加をご検討ください。
> [!TIP]
>ファイアウォールの正常性状態
>https://learn.microsoft.com/ja-jp/azure/firewall/monitor-firewall-reference#firewall-health-state
>SNAT ポート使用率
>https://learn.microsoft.com/ja-jp/azure/firewall/monitor-firewall-reference#snat-port-utilization

### IDPS 機能を使用すると Azure Firewall を経由する通信のスループットが低下する
#### - 問題
Azure Firewall Premium を利用しており、最大 100 Gbps のスループットを期待していたが、IDPS 機能を使用した場合のスループットが期待値より低い。
#### - 原因
Azure Firewall Premium にて、TLS (トランスポート層セキュリティ) 検査と IDPS (侵入検出および防止) を利用する場合には、Azure Firewall のスループットに影響を及ぼす可能性があります。Azure Firewall Premium にて IDPS 機能を「アラートを出して拒否」に設定し、TLS および IPS を使用する場合には、Azure Firewall Premium の最大スループットは 10 Gbps、単一 TCP 接続の最大スループットは 300 Mbps に低下します。
> [!TIP]
>Azure Firewall のパフォーマンス
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-performance
>パフォーマンス データ
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-performance#performance-data

#### - 対策
TLS (トランスポート層セキュリティ) 検査や IDPS (侵入検出および防止) を利用する場合には、設計段階にて上記の最大スループットを考慮したシステム設計を行ってください。
また、テスト段階において、本番環境と同様なトラフィックや、将来のユーザー数やアプリケーション数の増加を想定したトラフィックを発生させて、パフォーマンス テストを実施 / 評価してください。
> [!TIP]
>パフォーマンス テスト
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-performance#performance-testing

### Azure Firewall のインスタンスのスケールアウトが遅い
#### - 問題
お客様企業の社員が業務を開始する時間帯に、Azure 内の仮想マシン (VM) や Azure Virtual Desktop (AVD) から Azure Firewall を経由するインターネットへのアクセスが急増し、Azure Firewall の CPU 使用率やスループットが上昇するが、Azure Firewall のインスタンスのスケールアウトが追随せず、VM や AVD からインターネットへのアクセスがエラーとなる。
#### - 原因
Azure Firewall は、平均スループットまたは CPU 消費量が 60% になるか、接続使用率が 80% になると、徐々にスケールアウトしますが、スケールアウトには 5 ～ 7 分かかります。 そのため、Azure Firewall を経由するインターネットへのアクセスが急増した場合には、Azure Firewall のスケールアウトが追随できない場合があります。
> [!TIP]
>Azure Firewall のスケールアウトにはどのくらいの時間がかかりますか。
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-faq#azure-firewall--------------------------

#### - 対策
設計段階では、上記のスケールアウトの動作を考慮したシステム設計を行ってください。パフォーマンス テストを行うときは、少なくとも 10 ～ 15 分のテストを行い、Azure Firewall のスケールアウトの速度がお客様のシステム要件を満たしているかどうか確認 / 評価してください。また、運用段階では、Azure Firewall の下記のメトリックを監視し、システムを利用するユーザー数の増加や、新しいアプリケーションの追加による影響を確認 / 評価してください。
> [!TIP]
>AZFW 待機時間プローブ
>https://learn.microsoft.com/ja-jp/azure/firewall/monitor-firewall-reference#azfw-latency-probe

### Azure Firewall の負荷が高いにも関わらずスケールアウトしない (インスタンス数が枯渇している) 
#### - 問題
AVD の利用ユーザーが増加したことにより、Azure Firewall のパフォーマンス系のメトリックからはインスタンス数が不足していると推測されるが、インスタンスがスケールアウトせず、AVD を利用する全ユーザーに影響が生じた。
#### - 原因
Azure Firewall は最大 20 インスタンスまでスケールアウトすることが可能ですが、それ以上のスケールアウトは、現時点ではサポートされておりません。
> [!TIP]
>Azure Firewall の既知の問題と制限事項
>https://learn.microsoft.com/ja-jp/azure/firewall/firewall-known-issues

#### - 対策
設計段階では、上記のインスタンス数の上限を考慮したシステム設計を行ってください。なお、現時点では Azure Firewall にはインスタンス数や CPU 使用率のメトリックはないため、運用段階では「待機時間プローブ」や「スループット」のメトリック監視により代替してください。
> [!TIP]
>Azure Firewall 監視データリファレンス
>https://learn.microsoft.com/ja-jp/azure/firewall/monitor-firewall-reference

当ブログが、お客様よりお問い合わせをいただくことが多い Azure Firewall のキャパシティ問題に関して、お客様にて設計や運用を行う際の手助けになりましたら、幸いです。
