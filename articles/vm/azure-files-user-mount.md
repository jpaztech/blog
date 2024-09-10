---
title: Azure Files をマウントするユーザーとアクセスについて
date: 2024-9-10 17:30:00
tags:
  - Windows
  - Azure Files
---

こんにちは、Azure テクニカル サポート チームの富田です。  

お客様より「Windows 環境でユーザー A でマウントした Azure Files についてユーザー B より参照ができない。」というお問い合わせをいただくことがございます。 
こちらは New-PSDrive / net use / エクスプローラーでマウントした際の仕様となっており、マウントを行ったユーザー以外のユーザーからは Azure Files のマウント先を参照できないものとなっております。 
そのため原則としてユーザー毎にマウントを行っていただく必要がございます点、ご留意くださいませ。 

<!-- more -->

なお、Windows Server 2019 / Windows 10 以降の OS では、New-SmbGlobalMapping コマンドを利用し Azure Files をマッピングいただくことで、 全てのユーザーでのアクセスが可能かつ、Windows ユーザーがログインしていない状態でも Azure Files へのアクセスが可能となります。  
以下に手順を紹介させていただきますが、このような状態がお客様のセキュリティ要件上問題ないものであるかご確認をいただきますようお願いいたします。

---サンプル手順--- 

1. 該当環境に管理者アカウントでログインします。 
2. Powershell を [管理者として実行] から起動します。 
3. 以下のコマンドの ＜＞ で指定している部分をご自身の環境に合わせて変更してから順に実行します。 

```PowerShell
## 共有で使用するアカウントを指定 
$User = "localhost\＜ストレージアカウント名＞" 

## 上記アカウントのパスワードを指定 
$PWord = ConvertTo-SecureString -String "＜ストレージアカウントアクセスキー＞" -AsPlainText -Force 

## クレデンシャルを作成 
$Credential = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $User, $PWord 

## -RemotePath に共有のパスを指定、-LocalPath にマッピングするドライブを指定 
New-SmbGlobalMapping -RemotePath \\＜ストレージアカウント名＞.file.core.windows.net\＜ファイル共有名＞ -Credential $Credential -LocalPath Z: -Persistent $True 
```

4. 一度サインアウトすることで、アクセス可能となります。 

---手順ここまで--- 

■ご参考：Azure Files とは  
https://learn.microsoft.com/ja-jp/azure/storage/files/storage-files-introduction

■ご参考： New-SmbGlobalMapping  
https://learn.microsoft.com/en-us/powershell/module/smbshare/new-smbglobalmapping　 

上記の内容がお客様のお役に立てますと幸いでございます。 

