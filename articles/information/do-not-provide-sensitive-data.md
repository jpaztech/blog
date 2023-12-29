---
title: お問い合わせにてパスワード等の機密情報を記載しないようにお願いいたします
date: 2024-1-10 12:00:00
tags:
  - Information
---

こんにちは、Azure テクニカル サポート チームです。  
Azure テクニカル サポート チームではお客様から頂いた情報は厳重に管理をしております。
しかしながら、お客様のセキュリティを守るためにも、お問い合わせにてパスワード等の機密情報を記載しないように注意喚起のご案内をさせていただきたく存じます。

---
## お問い合わせにて機密情報を記載しないようにお願いいたします

幣 Azure テクニカル サポート チームにお問い合わせをいただく際に、パスワード等の機密情報を記載されてしまっているというケースが発生しております。  
恐れ入りますが、機密情報はお客様自身で適切に管理いただき、お問い合わせにてお客様の機密情報を記載をしないようにお願い申し上げます。  

これはお問い合わせ起票時以外にも、以下のようなお問い合わせ最中のやり取りも含めてのお願いとなります点、ご理解頂けますと幸いでございます。  

- お問い合わせ起票時の本文内への記載
- お問い合わせ起票時にアップロードいただいたファイル内での記載
- 弊社とのメールやり取りでの本文内への記載
- 弊社とのメールやり取りでの添付ファイルでの記載
- お問い合わせ後にアップロードいただいたファイル内での記載
- 電話での口頭でのやり取り

加えて、テキストベースのファイル以外にもスクリーンショットなどの画像についても機密情報が含まれないようにご注意くださいませ。

---
## 記載してはいけない機密情報の例

以下の例のような機密情報は、お問い合わせに記載をしないようにお願い申し上げます。  

- OS ユーザー / Azure ユーザー等のパスワード
- Azure ストレージアカウントのアクセスキー
- 有効な Azure ストレージアカウントの SAS キー
- 秘密鍵
- クレジットカード番号

もしこれらの情報が含まれる場合は、当該箇所をマスクしていただくようにお願い申し上げます。  
以下はパスワードや Azure ストレージアカウントのアクセスキーおよび SAS キーについてマスクする一例となります。

### パスワードが入ったコマンドについてお問い合わせする場合

```azurecli
-- password P@ssw0rd!
　   ↓
-- password <●●●機密情報のためパスワードはマスクします●●●>
```

### Azure ポータルから取得した Azure Files への接続スクリプトについてお問い合わせする場合の例（アクセスキーをマスク）

```powershell
$connectTestResult = Test-NetConnection -ComputerName test-storage-account.file.core.windows.net -Port 445
if ($connectTestResult.TcpTestSucceeded) {
    # 再起動時にドライブが維持されるように、パスワードを保存する
    cmd.exe /C "cmdkey /add:`"test-storage-account.file.core.windows.net`" /user:`"localhost\test-storage-account`" /pass:`"<●●●ストレージアカウントのアクセスキーなのでマスクします●●●>`""
    # ドライブをマウントする
    New-PSDrive -Name Z -PSProvider FileSystem -Root "\\test-storage-account.file.core.windows.net\test" -Persist
} else {
    Write-Error -Message "Unable to reach the Azure storage account via port 445. Check to make sure your organization or ISP is not blocking port 445, or use Azure P2S VPN, Azure S2S VPN, or Express Route to tunnel SMB traffic over a different port."
}
```

### SAS キーを用いたストレージアカウントの Blob コンテナへのアクセスについてお問い合わせする際の例（SAS キーをマスク）

```http
https://test-storage-account.blob.core.windows.net/container?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-12-29T12:05:45Z&st=2023-12-29T04:05:45Z&spr=https&sig=<●●●ストレージアカウントの SAS キーなのでマスクします●●●>
```

> [!TIP]
> Azure ストレージアカウントのアクセスキーについてご懸念がございます場合は、以下の公開ドキュメントの通りローテーションを行うことが可能です。
> https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-keys-manage#manually-rotate-access-keys

---
## 機密情報をお問い合わせで記載してしまった場合

もし、お客様側より上記のような機密情報を記載されてしまった際は、弊社よりお客様へご連絡の上、弊社およびお客様側で当該情報の削除の対応や、場合によっては新規のお問い合わせ発行をお願いさせていただく可能性があります。  
そのため、サポート着手までお時間をいただく可能性がございます。  
迅速なサポートのご提供およびお客様のセキュリティのためにも、機密情報の記載をしないようにご協力をお願い申し上げます。