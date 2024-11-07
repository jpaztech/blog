---
title: Azure File Sync のログ採取について
date: 2024-11-07 12:00:00
tags:
  - Storage
---

こんにちは、Azure テクニカル サポート チームの富田です。 
お客様より Azure Files Sync のトラブルシューティングのサポートリクエストをいただいた際に、調査のためログの採取をお願いすることがございます。 
本記事ではログの採取方法についてご紹介をさせていただきます。 

<!-- more -->

1. [Debug-StorageSyncServer -Diagnose（サーバー診断）](.#1-Debug-StorageSyncServer-Diagnose%EF%BC%88%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC%E8%A8%BA%E6%96%AD%EF%BC%89)
2. [Debug-StorageSyncServer -TestNetworkConnectivity（ネットワーク接続テスト）](.#2-Debug-StorageSyncServer-TestNetworkConnectivity%EF%BC%88%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E6%8E%A5%E7%B6%9A%E3%83%86%E3%82%B9%E3%83%88%EF%BC%89) 
3. [Debug-StorageSyncServer -FileSyncErrorsReport（同期失敗に関するレポート）](.#3-Debug-StorageSyncServer-FileSyncErrorsReport%EF%BC%88%E5%90%8C%E6%9C%9F%E5%A4%B1%E6%95%97%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E3%83%AC%E3%83%9D%E3%83%BC%E3%83%88%EF%BC%89) 
4. [Debug-StorageSyncServer -AFSDiag（ログとトレースを収集）](.#4-Debug-StorageSyncServer-AFSDiag%EF%BC%88%E3%83%AD%E3%82%B0%E3%81%A8%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E3%82%92%E5%8F%8E%E9%9B%86%EF%BC%89) 
5. [Azure Files Sync に関するイベントログの採取](.#5-Azure-Files-Sync-%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%83%AD%E3%82%B0%E3%81%AE%E6%8E%A1%E5%8F%96)

各ログの採取は問題の発生しているサーバーエンドポイントとなる Windows Server 上で PowerShell より実行をお願いいたします。 
調査のためにすべてのログが必要といったわけではございませんので、担当エンジニアからご依頼させていただいたログを取得いただけますと幸いでございます。 

なお、公開ドキュメントにも Azure Files Sync のトラブルシューティングについての記載がございますので、ご自身でトラブルシューティング可能な点が無いかご確認いただくこともできます。 

■ご参考：Azure File Sync のトラブルシューティング 
https://learn.microsoft.com/ja-jp/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot

> [!TIP]
> 各コマンド実行前に Import-Module をしていますが、初回に Import-Module を 1 回のみ 実行することで、都度 Import-Module を実行する必要はございません。

---

### 1. Debug-StorageSyncServer -Diagnose（サーバー診断）
Azure File Sync に関する一般的な問題が無いか診断をするコマンドとなります。 

■ ログ取得方法 

以下のコマンドを実行して表示される結果をコピーして、テキストファイルでご共有ください。 

```PowerShell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll" 
Debug-StorageSyncServer -Diagnose
```

---

### 2. Debug-StorageSyncServer -TestNetworkConnectivity（ネットワーク接続テスト）

サーバーエンドポイントとして使用している Windows Server から各種 Azure 上のリソースへのネットワーク疎通テストを行うコマンドとなります。 
正常な通信ができていない可能性がある場合などに使用します。 

以下のドキュメントのように、通信経路上に、Firewallがある場合、Proxyがある場合等をはじめとして、Azure File Sync に関連するAzureサービスとの通信が可能な状況かどうかを確認することができます。 

■ご参考：Azure File Sync のプロキシとファイアウォールの設定 
https://learn.microsoft.com/ja-jp/azure/storage/file-sync/file-sync-firewall-and-proxy　 

■ ログ取得方法 

以下のコマンドを実行して表示される結果をコピーして、テキストファイルでご共有ください。 

```Powershell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll" 
Debug-StorageSyncServer -TestNetworkConnectivity
```

---

### 3. Debug-StorageSyncServer -FileSyncErrorsReport（同期失敗に関するレポート） 

同期に失敗したファイルの特定などを行うコマンドです。 
ファイルの同期に問題が発生している場合に使用します。 
Azure Portal上にて、同期のエラーが表示されている際に、同期エラーとなっている具体的なファイル・フォルダーや、同期エラーとなっているエラー内容を、ファイル・フォルダーごとに確認するために使用できます。 

■ご参考：同期されていない特定のファイルまたはフォルダーがあるかどうかを確認するにはどうすればよいですか? 
https://learn.microsoft.com/ja-jp/troubleshoot/azure/azure-storage/files/file-sync/file-sync-troubleshoot-sync-errors#how-do-i-see-if-there-are-specific-files-or-folders-that-are-not-syncing  

■ ログ取得方法 
以下のコマンドを実行して表示される結果をコピーして、テキストファイルでご共有ください。 

```PowerShell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll" 
Debug-StorageSyncServer -FileSyncErrorsReport 
```

---

### 4. Debug-StorageSyncServer -AFSDiag（ログとトレースを収集） 

Azure File Sync に関する詳細なログおよびトレースを行うコマンドです。 
一般的に広く情報を収集したい場合に、このコマンドで情報収集をお願いする場合もございますが、主に事象の再現性がある場合に、再現時の情報を収集するためのコマンドとしてご案内することが多いものとなります。 

■ ログ取得方法 

以下のコマンドを実行すると、「Please reproduce the problem and press D when done ...:」というメッセージが表示されます。 

```PowerShell
Import-Module "C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll" 
Debug-StorageSyncServer -AFSDiag -OutputDirectory C:\output -KernelModeTraceLevel Verbose -UserModeTraceLevel Verbose 
```

何か特定の操作で再現性のある問題についてトレースする場合は、再現操作を行った後に D を入力し Enter キーを押下してください。 
特定の操作で起こる問題ではない場合には、そのまま何もせず D を入力し Enter キーを押下してください。 
実行完了までに少しお時間がかかる場合がございますが、完了すると C:\output フォルダー配下に AFSDiag_2023-04-20-03-40-20.zip というようなファイルが生成されます。 
こちらの生成されたファイルをご共有ください。 

---

### 5. Azure Files Sync に関するイベントログの採取 

Windows イベントログに Azure File Sync に関するログが記録されます。 

■ ログ取得方法 

“C:\Windows\System32\winevt\Logs” フォルダーに保存されている、「Microsoft-FileSync-」で始まるファイル名のものを全て、ファイルごとご共有ください。 

---

上記内容がお役に立てますと幸いでございます。 


