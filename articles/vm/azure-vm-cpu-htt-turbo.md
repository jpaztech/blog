---
title: Azure VM の CPU コア数 / CPU の種類 / ターボブーストについての解説
date: 2023-4-11 17:30:00
tags:
  - VM
  - Windows
  - Linux
---

こんにちは、Azure テクニカル サポート チームの富田です。  
今回はお問い合わせいただくことの多い Azure VM の CPU に関する以下の点を解説させていただきます。  

 - CPU の vCPU 数 / 物理コア数 / 論理スレッド数について
 - 制約付き vCPU 対応の VM サイズについて
 - CPU の種類について
 - ターボブースト機能について

まず Azure VM ではそのスペックについて VM サイズとして、  
搭載 CPU / vCPU 数 / メモリの量 / ディスクやネットワークの帯域などの組み合わせより選んでいただくこととなります。  
各 VM サイズの情報については、以下の資料をご参照いただけますと幸いでございます。  

> ■ご参考：Azure の仮想マシンのサイズ  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/sizes](https://learn.microsoft.com/ja-jp/azure/virtual-machines/sizes)

---
## CPU の vCPU 数 / 物理コア数 / 論理スレッド数について

ソフトウェア ライセンスの観点等により、Azure VM における vCPU 数 / 物理コア数 / 論理スレッド数についてお問い合わせをいただくことがございます。  

Azure VM では VM サイズとして vCPU 数をお客様に選んでいただくことになります。  
では、8 vCPU の VM サイズを選んだ として、「4 物理コア / 8 論理スレッド」なのか、「8 物理コア / 8 論理スレッド」なのかという点が気になりますね。  

1 つの物理コアを 2 論理スレッドとして扱う技術として、  
 - Intel ハイパースレッディング テクノロジ
 - AMD 同時実行マルチスレッド技術

といった技術がございます。  
 ※ 以下「ハイパースレッド / マルチスレッド化」と記載させていたせていただきます。  

そのため、8 vCPU の VM サイズ については、  
 - ハイパースレッド / マルチスレッド化されている VM サイズの場合は「4 物理コア / 8 論理スレッド」
 - ハイパースレッド / マルチスレッド化されて**いない** VM サイズの場合は「8 物理コア / 8 論理スレッド」

となります。  

どの VM サイズがハイパースレッド / マルチスレッド化されているのかといった点は、  
以下の Azure コンピューティング ユニット (ACU) のドキュメントより確認可能です。  
「vCPU: コア」の表記が「2:1\*\*\*」「2:1\*\*\*\*」になっているものは、  
ハイパースレッド / マルチスレッド化されており、1 つの物理コアを 2 論理スレッドとして扱われております。  

> ■ご参考：Azure コンピューティング ユニット (ACU)  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu](https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu)

> ーーーーーー抜粋ーーーーーー  
> *** ハイパースレッド化されており、入れ子になった仮想化を実行できます。  
> ****AMD 同時実行マルチスレッド技術  
> ーーーーーーーーーーーーーー  

なお、ACU に表記のない VM サイズにつきましては、各 VM サイズにおけるドキュメント等にハイパースレッド / マルチスレッド化されているかという旨が記載されておりますので、それらをご確認いただけますと幸いです。  

> ■ ハイパースレッド化が有効である場合の表記の例（Dv5 および Dsv5 シリーズ）  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv5-dsv5-series](https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv5-dsv5-series)  

> ーーーーーー抜粋ーーーーーー  
> Dv5 および Dsv5 シリーズの仮想マシンは、**ハイパースレッド構成の**第 3 世代 Intel® Xeon® Platinum 8370C (Ice Lake) プロセッサ上で実行されます。  
> ーーーーーーーーーーーーーー

> ■ マルチスレッド化が有効である場合の表記の例（Dasv5 および Dadsv5 シリーズ）  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv5-dsv5-series](https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv5-dsv5-series)  

> ーーーーーー抜粋ーーーーーー  
> Dasv5 シリーズおよび Dadsv5 シリーズは、AMD の第 3 世代 EPYCTM 7763v プロセッサを、最大 256 MB の L3 キャッシュを備えた**マルチスレッド構成で**利用し、汎用ワークロードを実行するための顧客オプションを増やします。  
> ーーーーーーーーーーーーーー

また、恐縮ながら物理ホスト サーバー 1 台に搭載された合計物理コア数やソケット数はお客様に公開が叶いません点ご理解賜りますと幸いでございます。  

> [!NOTE]
> ソフトウェアについてはパブリック クラウド環境の場合はオンプレミスの物理サーバーと違ったライセンス ルールがある場合がございます。  
> 「ライセンス上どのように CPU 数などをカウントするか？」「パブリッククラウドとオンプレミス環境でのライセンスの違いはあるか？」など、各ソフトウェア ライセンスの観点については、そのソフトウェア ライセンスを取り扱っている会社様にご確認をお願いいたします。  

---
## 制約付き vCPU 対応の VM サイズについて

ソフトウェアによっては vCPU の数によって、ライセンス料金が決定されるものがございます。  
例えばその際に、  
> 「メモリは 256 GB 欲しいので Standard_E32d_v5 サイズ（32 vCPU / 256 GB）が良さそうだけど、32 vCPU もあるとライセンス料金が高くなってしまう。」  

ということがあるかと存じます。  

このようなご要望にお応えするため、Standard_E32d_v5 サイズ（32 vCPU / 256 GB）から、vCPU の数のみを減らした、  
Standard_E32-8ds_v5 サイズ（8 vCPU / 256 GB）というサイズのご用意がございます。  
このように vCPU 数のみを元の VM サイズから減らしているものを **「制約付き vCPU 対応の VM サイズ」** と定義しております。  

制約付き vCPU 対応の VM サイズには以下のような特徴がございます。  

 - 元の VM サイズから 1/2 または 1/4 に vCPU 数を減らしています。  
 - vCPU 数以外のスペック（メモリ容量・ディスクの仕様・NIC 数・ネットワーク帯域など）は元の VM サイズと同じ仕様です。  
 - 全ての VM サイズに対し「制約付き vCPU 対応の VM サイズ」がご用意されているわけではございません。  
 - 命名規則としては vCPU 数の部分が「元のvCPU数-実際のvCPU数」といった表記になっております。  

制約付き vCPU 対応の VM サイズの一覧・仕様・価格などに関しては以下のドキュメントをご参照ください。  

> ■ご参考：制約付き vCPU 対応の VM サイズ  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/constrained-vcpu](https://learn.microsoft.com/ja-jp/azure/virtual-machines/constrained-vcpu)

> ■ご参考：Windows Virtual Machines の料金  
> [https://azure.microsoft.com/ja-jp/pricing/details/virtual-machines/windows/](https://azure.microsoft.com/ja-jp/pricing/details/virtual-machines/windows/)

---
## CPU の種類について

同じ VM サイズでも物理ホスト サーバーに搭載された CPU の種類が異なるため、VM の実行される CPU の種類が変わるといったことがございます。  
例えば、以下のように Dv4 および Dsv4 シリーズは、ブログ執筆の 2023 年 4 月時点では、以下 2 種類の CPU でご提供をさせていただいております。  

> ■ご参考：Dv4 および Dsv4 シリーズ  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv4-dsv4-series](https://learn.microsoft.com/ja-jp/azure/virtual-machines/dv4-dsv4-series)

> ーーーーーー抜粋ーーーーーー  
> Dv4 および Dsv4 シリーズは、ハイパースレッド構成の第 3 世代 Intel® Xeon® Platinum 8370C (Ice Lake) プロセッサまたは Intel® Xeon® Platinum 8272CL (Cascade Lake) プロセッサ上で実行されます。  
> ーーーーーーーーーーーーーー

そのため、ご利用者様から見ると、  
 - VM を割り当て解除 / 起動したら CPU の種類が変わった。
 - 同じ VM サイズの VM を何台が使っているが、それぞれ別の種類の CPU で実行されている。

 ということが発生します。  

また、「特定の CPU の種類を選んで使いたい。」といったご要望も頂くことがございます。
恐縮ながら、後述の Azure Dedicated Host を利用する場合の除き、特定の CPU の種類を選んでご使用いただくことは叶いません.。 

なお、異なる CPU の種類で実行された場合も大きな性能差が出ないよう、目安として以下の ACU の範囲内での性能差となるように設計されております。  

> ■ご参考：Azure コンピューティング ユニット (ACU)  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu](https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu)

> [!NOTE]
> VM を割り当て解除および再デプロイしない場合は、原則 CPU の種類が変更されませんが、  
> 予期せぬ物理ホストサーバーの不具合等で、別の CPU の種類の物理ホストサーバーに VM が移動される場合がございます。  

---
## Azure Dedicated Host で CPU の種類を選ぶ

Azure Dedicated Host をご利用いただく場合に限り、CPU の種類を選ぶことが可能となります。  
Azure Dedicated Host は物理ホストサーバー 1 台丸ごとをお客様に占有いただくサービスとなります。  
物理ホストサーバーを選ぶ際に SKU として、VM ファミリと特定のハードウェア仕様の組み合わせを選択することとなり、この際にハードウェアに搭載される CPU の種類を選択することが可能です。  

例えば、Dsv4 シリーズを搭載できる Azure Dedicated Host SKU として、ブログ執筆の 2023 年 4 月時点では、以下の 2 種類があることが確認できます。  
　
 - Dsv4_Type1：Intel® Xeon® Platinum 8272CL (Cascade Lake)
 - Dsv4_Type2：Intel® Xeon® Platinum 8370C (Ice Lake) 

この占有されたホストサーバー上で稼働させれば、CPU が変更されることはないものとなります。  
しかしながら、Azure Dedicated Host は物理ホストサーバー 1 台丸ごとをお客様に占有いただくため、通常の VM より高い利用料金が設定されております。  
Azure Dedicated Host の概要や価格等については、以下の記事をご参照ください。  

> ■ご参考：Azure 専用ホスト  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/dedicated-hosts](https://learn.microsoft.com/ja-jp/azure/virtual-machines/dedicated-hosts)

> ■ご参考：Azure Dedicated Host の価格  
> [https://azure.microsoft.com/ja-jp/pricing/details/virtual-machines/dedicated-host/](https://azure.microsoft.com/ja-jp/pricing/details/virtual-machines/dedicated-host/)

> ■ご参考：汎用 Azure Dedicated Host SKU  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/dedicated-host-general-purpose-skus](https://learn.microsoft.com/ja-jp/azure/virtual-machines/dedicated-host-general-purpose-skus)

---
## ターボブースト機能について

一時的に CPU クロックを向上させる技術として、  
 - Intel® Turbo テクノロジ
 - AMD® Boost テクノロジ

といった技術がございます。  
 ※ 以下「ターボブースト機能」と記載させていたせていただきます。  

多くの VM サイズではこのターボブースト機能が有効となっております。  
しかしながら、ターボブースト機能によって実際に CPU クロックが向上している際も、お客様のゲスト OS からは CPU クロックは固定で表示されることがございます。  
これは、物理ホストサーバー側にて制御が行われ、ゲスト OS は HW レジスタを直接参照できないことがあるためとなります。  

そのため恐れ入りますが、ターボブースト機能によってどの程度クロックが向上しているかについては、恐縮ながら確認が叶いません点ご理解賜りますと幸いです。  
なお、ターボブースト機能は、あくまで余裕がある際にベースクロックよりパフォーマンスを向上させるものでございますので、ターボブースト機能が動作していない場合に性能が低下するものではなく、通常よりも性能が向上するといった機能でございます。  

> ■ご参考：Azure コンピューティング ユニット (ACU)  
> [https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu](https://learn.microsoft.com/ja-jp/azure/virtual-machines/acu)

> ーーーーーー抜粋ーーーーーー  
> *ACU は、Intel® Turbo テクノロジを使用して CPU 周波数を上げ、パフォーマンスを向上させます。 パフォーマンス向上の量は、VM のサイズ、ワークロードのほか、同じホストで実行されている他のワークロードによって変動する場合があります。  
> **ACU は、AMD® Boost テクノロジを使用して CPU 周波数を上げ、パフォーマンスを向上させます。 パフォーマンス向上の量は、VM のサイズ、ワークロードのほか、同じホストで実行されている他のワークロードによって変動する場合があります。  
> ーーーーーーーーーーーーーー  

---

以上の通り今回は Azure VM の CPU についてよくあるご質問の内容を解説させていただきました。  
上記内容が皆様のお役に立てますと幸いでございます。




