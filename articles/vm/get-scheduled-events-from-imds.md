---
title: Azure VM の「再起動を必要としないメンテナンス」を事前に検知する方法
date: 2023-12-29 16:00:00
tags:
  - VM
  - Windows
  - Linux
  - HowTo

---

こんにちは、Azure テクニカル サポート チームの富田です。  
今回は表題の通り、Azure VM の再起動を必要としないメンテナンスを事前に検知する方法をご紹介させていただきます。  
IMDS を用いて Scheduled Events を監視することで、再起動を必要としないメンテナンスを事前に検知することが可能です。  

---
## Azure VM のメンテナンスについて

Azure VM はお客様に安心してご利用いただくためにセキュリティ向上の対応や機能改善等を目的として定期的に Azure 基盤側のメンテナンスを行っております。  
お客様の VM に影響の発生する可能性のあるメンテナンスとして、大きく以下の 2 種類に分けられます。  

- 再起動を**必要とする**メンテナンス
- 再起動を必要としないメンテナンス（ライブマイグレーションを含む）

>■ご参考：Azure での仮想マシンのメンテナンス  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/maintenance-and-updates

再起動を**必要とする**メンテナンスについては、以下の通り Azure Portal の [サービスの正常性] で事前に確認が可能です。

>■ご参考：計画メンテナンスの通知の処理  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/maintenance-notifications

再起動を必要としないメンテナンスについては、恐縮ながら Azure Portal での事前の確認をすることや、既定でメールの通知がされるものではございません。  
そのため、「何とかして再起動を必要としないメンテナンスが発生することを事前に確認することができないか？」というお問い合わせをいただくこともございます。  
後述の通り、IMDS を用いて Scheduled Events を監視することで再起動を必要としないメンテナンスを事前に確認する事が可能です。  

---
## IMDS を用いて Scheduled Events を確認する

まずは IMDS について簡単に解説させていただきます。  
IMDS（Instance Metadata Service）は、現在実行中の VM に関する情報を取得できるものとなっております。  
実行中の VM 内から IMDS に HTTP アクセスを行うことで、情報を取得することが可能です。  
なお、同一の可用性セット内の VM もしくは同じ VMSS 内のインスタンスについても合わせて情報を取得できます。

>■ご参考：Azure Instance Metadata Service  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/instance-metadata-service

この IMDS のエンドポイントの 1 つとして、Scheduled Events というものがございます。  
これは VM の近い将来にスケジュールされている VM の再起動やメンテナンスのイベントを確認できるものとなっております。  

>■ご参考：Azure Metadata Service: Windows VM のScheduled Events  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/scheduled-events

>■ご参考：Azure Metadata Service: Linux VM の Scheduled Events  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/linux/scheduled-events

それでは、Scheduled Events の確認を実際にやってましょう。  
以下のコマンドを Azure VM 上のゲスト OS 内にて実行します。  


**Windows** の場合は PowerShell より以下のコマンドで、IMDS の Scheduled Events のエンドポイントに HTTP でアクセスします。  

```http
Invoke-RestMethod -Headers @{"Metadata"="true"} -Method GET -Uri "http://169.254.169.254/metadata/scheduledevents?api-version=2020-07-01" | ConvertTo-Json -Depth 64
```

**Linux** の場合は以下の通り Bash で curl コマンドで、IMDS の Scheduled Events のエンドポイントに HTTP でアクセスします。  

```bash
curl -H Metadata:true http://169.254.169.254/metadata/scheduledevents?api-version=2020-07-01
```

実行結果として、以下の例のように直近のスケジュールされたイベントがレスポンスとして確認できます。

### 特に何もスケジュールされたイベントが無い場合

```json
{
    "DocumentIncarnation":  0,
    "Events":  [

               ]
}
```

### 起動を必要としないメンテナンスがスケジュールされている場合

```json
{
    "DocumentIncarnation":  28,
    "Events":  [
                   {
                       "EventId":  "E92E64F9-XXXX-XXXX-XXXX-FF3EBA4C0090",
                       "EventStatus":  "Scheduled", → スケジュールされたイベントがある。★★★
                       "EventType":  "Freeze", → 再起動を伴わないメンテナンスである。★★★
                       "ResourceType":  "VirtualMachine",
                       "Resources":  [
                                         "VMName" → 対象の VM 名。★★★
                                     ],
                       "NotBefore":  "Mon, 19 Sep 2023 18:00:00 GMT", → この時刻以降にメンテナンスが実行される。★★★
                       "Description":  "This is sample Description",
                       "EventSource":  "Platform",
                       "DurationInSeconds":  2 → 想定される影響時間は 2 秒である。★★★
                   }
               ]
}
```

イベントによって何分前までには通知されるといった NotBefore の時間が違いますが、再起動を必要としないメンテナンスについては、実行される約 15 分前までにはスケジュールが設定されます。  
つまり 20 分前といった場合はまだスケジュールが設定されていないために、確認が叶わない場合もございます点、ご留意ください。  

すなわち、定期的に IMDS の Scheduled Events をアクセスすることで、再起動を必要としないメンテナンス実行の約 15 分前には事前にメンテナンスが発生する予定を確認することが可能です。  
次のセクションではこの Scheduled Events を定期的に確認する方法についてご案内させていただきます。  

---
## Windows 環境で定期的に Scheduled Events を監視し、再起動を必要としないメンテナンスがあった際にアラート通知を行うサンプル

Windows 環境においては、以下の通り公開ドキュメントとして、定期的に Scheduled Events を監視し、再起動を必要としないメンテナンスがスケジュールされた際にアラート通知を行うサンプルがございます。  

>■ご参考：Azure VM のスケジュールされたイベントを監視する  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/windows/scheduled-event-service

具体的な内容は実際のドキュメントをご確認いただきたく存じますが、簡単に内容を解説すると以下の通りとなります。  

- 同一の可用性セットに VM を 2 つ作成する。
- 片方の VM にて SchService.ps1 という定期的な Scheduled Events のアクセスを行うスクリプトを実行する。
- SchService.ps1 は同一の可用性セット内 VM に対する Scheduled Events を検知すると、その内容をイベントログに記録する。
- Azure Monitor の Log Analytics を用いて、その記録されたイベントログを監視する。
- Scheduled Events が記録されたイベントログを発見すると、アラート（メール通知等）を発報する。

なお、恐縮ながら再起動を必要としないメンテナンスを疑似的に発生させて "EventType":"Freeze" の Scheduled Events を発生させることは叶いません。  
そのため、このサンプルの動作確認としては代替として再起動イベントを検知する形となっております。  

上記のサンプルによって、同一の可用性セット内の VM で再起動を必要としないメンテナンスがスケジュールされた際に、自動的にメール通知を行うといったことが可能となります。  
また、SchService.ps1 をご自身で拡張いただくことで、Scheduled Events を検知したら自動的に何かを実行するといったスクリプトにしていただくことも可能です。

---
## Linux 環境で定期的に Scheduled Events を監視するサンプル

Linux 環境においては、上記の Windows のようにアラート通知を行うといったサンプルのご用意がございませんが、定期的な Scheduled Events の監視をするサンプルが以下の通りご用意されております。  

>■ご参考：Azure Metadata Service: Scheduled Events Samples  
>https://github.com/Azure-Samples/virtual-machines-scheduled-events-discover-endpoint-for-non-vnet-vm

勿論、上記サンプル以外にも Scheduled Events へ定期的なアクセスを試みる方法を実行頂いても構いません。  

---

以上の通り、Azure VM の再起動を必要としないメンテナンスを事前に検知する方法をご紹介させていただきました。  
なお、再起動を必要としないメンテナンスを実行するタイミングをコントロールしたいといった場合は、Dedicated Host もしくは分離された仮想マシンをご利用の上、メンテナンス構成を設定いただくことで実現可能でございます。  
この点については以下の公式ドキュメント等をご参照ください。  

>■ご参考：メンテナンス構成による VM の更新の管理  
>https://learn.microsoft.com/ja-jp/azure/virtual-machines/maintenance-configurations

定期的なメンテナンスは安心してお客様に Azure をご利用いただく上で必要不可欠でございます点、ご理解賜りますと幸いでございます。
