---
title: Azure 環境における Windows Server 2016 にて日本語の言語パック適用ができない
date: 2021-5-10 14:00:00
tags:
  - VM
  - Windows
---

こんにちは。Azure テクニカル サポート チームの大関です。 

2021 年 4 月より、Azure Market Place の Windows Server 2016 Datacenter イメージに含まれるトランザクションログの肥大化により、ゲスト OS の日本語化が失敗する事象が報告されております。
Azure Market Place より新規にデプロイした Windows Server 2016 Datacenter の VM においてゲスト OS の日本語化に失敗する事象が発生した事象の場合、上記が該当している可能性が高いと考えられます。

本記事では、対処法についてご紹介いたしますので、当該事象に該当している場合にはお試しいただき、言語パックの適用が完了するかをご確認ください。

<!-- more -->

なお、今回の問題は、Windows 2016 Datacenter イメージ自体の問題の可能性が高く、現在修正を実施しております。今月 (2021 年 5 月) 中には修正完了の予定ではございますが、 もし問題が発生しましたら本対処をご検討いただけますと幸いでございます。 


## 対処策：TxR 配下のトランザクション ログのリセット 

TxR 配下のトランザクション ログは削除しようとしても、システム稼働時は常にシステム プロセスが参照しているため、削除しようとしてもエラーとなります。 
このため、"PendMoves と MoveFile" という弊社の無償のサポート ツールを使ってトランザクション ログの削除をご検討ください。 
 
1. "PendMoves と MoveFile" ツールの入手 
   - 以下の弊社サイトより "PendMoves.zip" をダウンロードし、解凍します。 
   - movefile.exeを対象マシンにコピーします。 
     (※pendmoves.exe は今回は使用いたしません) 

> PendMoves v1.02 and MoveFile v1.01 
> [https://docs.microsoft.com/ja-jp/sysinternals/downloads/pendmoves](https://docs.microsoft.com/ja-jp/sysinternals/downloads/pendmoves) 

2. attrib コマンドで隠し属性を解除します。 
コマンド プロンプトを管理者として実行し以下のコマンドを実行します。 

```CMD
cd C:\Windows\system32\config\txr 
attrib -r -s -h * 
```
 
3. CD コマンドで movefile.exe が保存されているディレクトリに移動します。 

4. movefile.exe コマンドで削除するファイルを登録するため、以下を1 行づつ実行してください。 
   ※アスタリスクによるファイル指定ができないため、貴社環境に存在するファイルに基づきコマンドをご実施ください。 
   ※"<移動先>" を空欄にすることで、次回再起動時にファイルの削除がスケジュールされます。 <br>
   ```CMD
    movefile.exe “C:\Windows\System32\config\TxR\{711988c4-afbd-11e6-80c9-782bcb3928e1}.TxR.0.regtrans-ms” “” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c4-afbd-11e6-80c9-782bcb3928e1}.TxR.1.regtrans-ms” “” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c4-afbd-11e6-80c9-782bcb3928e1}.TxR.2.regtrans-ms” “” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c4-afbd-11e6-80c9-782bcb3928e1}.TxR.blf” “” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c5-afbd-11e6-80c9-782bcb3928e1}.TM.blf ““” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c5-afbd-11e6-80c9-782bcb3928e1}.TMContainer00000000000000000001.regtrans-ms” “” 
    movefile.exe “C:\Windows\System32\config\TxR\{711988c5-afbd-11e6-80c9-782bcb3928e1}.TMContainer00000000000000000002.regtrans-ms” “” 
    ```
    <br>
    下記と同様に表示されることをご確認後、システムの再起動を実施します。 
    <br>
    ```CMD
    Movefile v1.01 - copies over an in-use file at boot time 
    Move successfully scheduled. 
    ```
 
5. 改めて言語パックのインストールをご実施ください。 

手順は以上となります。
上記情報が、少しでも皆様のご参考となれば幸いでございます。