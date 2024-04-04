---
title: オンプレ AD DS 認証を利用した Azure ファイル共有マウント手順
date: 2021-05-10 18:00:00
tags:
  - Storage
---
こんにちは、Azure テクニカル サポート チームの木下です。

Azure ファイル共有をマウントする場合、認証方法にはストレージ アカウント キーを使用した認証方法と ID ベース (Active Directory Domain Services / Azure Active Directory Domain Services)の認証方法があります。
その中でも今回はお問い合わせのよくある、オンプレ AD DS (Active Directory Domain Services) 認証によるファイル共有のマウント方法とアクセスについてご紹介いたします。
<!-- more -->

---

## 前提条件
Azure ファイル共有のオンプレ AD DS 認証をご使用いただく場合、以下の前提条件を満たしている必要があります。

**・Azure AD Connect**  

オンプレ AD は [Azure AD Connect](https://docs.microsoft.com/ja-jp/azure/active-directory/hybrid/how-to-connect-install-roadmap) を使って Azure AD と同期している必要があります。

以下は Azure AD Connect により オンプレ AD と Azure AD が同期した状態の一例となります。

![](addsAuthforAzureFiles/AzureFiles01.png)

**・ドメイン参加**  

Azure ファイル共有 にアクセスするクライアント端末はドメイン参加またはドメインサーバーと通信できる必要があります。

**・ポート 445 の開放**  

また、前提条件の詳細に関しては以下の公開情報を必ずご確認ください。

□参考：[概要 - SMB を使用した Azure ファイル共有へのオンプレミスの Active Directory Domain Services 認証 > 前提条件](https://docs.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-auth-active-directory-enable#prerequisites)

---

それでは、さっそくオンプレ AD DS 認証を有効化し、Windows Server へファイル共有をマウントしアクセスする手順をご紹介いたします。

## ▼作業手順

### (1) Azure ファイル共有の作成
(※すでに Azure ファイル共有を作成されている場合はこの手順は不要です。(2) へ進みます)

1-1. 対象のストレージアカウント「ファイル共有」へを押下します。
![](addsAuthforAzureFiles/AzureFiles02.png)

1-2. 「+ファイル共有」を押下し、値を入力し新しいファイル共有を作成します。
![](addsAuthforAzureFiles/AzureFiles03.png)

### (2) Azure ファイル共有に対するオンプレ AD DS 認証の有効化
2-1. AzFilesHybrid モジュールをダウンロードし解凍します。

https://github.com/Azure-Samples/azure-files-samples/releases

2-2. Azure ファイル共有のオンプレ AD DS 認証を有効化するスクリプトを実行します。

□参考：[Join-AzStorageAccount を実行する](https://learn.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-ad-ds-enable#run-join-azstorageaccount)

▼スクリプト利用前提条件
- [AzureFilesActiveDirectoryUtilities.psm1](https://github.com/Azure-Samples/azure-files-samples) モジュールをダウンロードしていること
- 対象となる AD にサービス ログオン アカウントまたはコンピューター アカウントを作成するための権限を持つ AD 認証情報を用いて AD にドメイン参加している端末にモジュールをインストールして実行すること
- ストレージアカウントに対して「所有者」または「共同作成者」の Azure RBAC ロールのいずれかを持つ Azure AD 資格情報でスクリプトを実行すること
- 対象のストレージアカウントがサポートされているリージョンに配置されていること

Join-AzStorageAccount スクリプト例 
```shell
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser

.\CopyToPSPath.ps1 


Import-Module -Name AzFilesHybrid

Connect-AzAccount


$SubscriptionId = "<サブスクリプション ID>"
$ResourceGroupName = "<リソース グループ名>>"
$StorageAccountName = "<ストレージ アカウント名"
$SamAccountName = "<SAM アカウント名>"
$DomainAccountType = "<ComputerAccount|ServiceLogonAccount>"
$OuDistinguishedName = "<OU 識別名>"

Select-AzSubscription -SubscriptionId $SubscriptionId 


Join-AzStorageAccount `
        -ResourceGroupName $ResourceGroupName `
        -StorageAccountName $StorageAccountName `
        -SamAccountName $SamAccountName `
        -DomainAccountType $DomainAccountType `
        -OrganizationalUnitDistinguishedName $OuDistinguishedName
```
各パラメータの詳細につきましては、以下公開情報をご確認ください。

□参考：[Join-AzStorageAccount を実行する](https://learn.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-ad-ds-enable#run-join-azstorageaccount)

実行例
![](addsAuthforAzureFiles/AzureFiles23.png)

2-3. 機能が有効になったことを確認します。

□参考：[機能が有効になっていることを確認する](https://docs.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-ad-ds-enable#confirm-the-feature-is-enabled)

実行例

![](addsAuthforAzureFiles/AzureFiles24.png)

### (3)ファイル共有レベルのアクセス権限を付与
□参考：[共有レベルのアクセス許可](https://docs.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-ad-ds-assign-permissions#share-level-permissions)

| Azure RBAC |     説明      | 
| --- | ----------- | 
| ストレージファイルデータの SMB 共有の管理者特権の共同作成者 | SMB による Azure Storage ファイル共有に対する読み取り、書き込み、削除、および NTFS アクセス許可の変更のアクセスを許可します |
| 記憶域ファイルデータの SMB 共有の共同作成者 | SMB による Azure Storage ファイル共有に対する読み取り、書き込み、削除のアクセスを許可します |
| 記憶域ファイルデータの SMB 共有の閲覧者 | SMB による Azure ファイル共有に対する読み取りアクセスを許可します |

3-1. 対象の Azure ファイル共有 > 「アクセス制御(IAM)」より上記必要なロールを付与します。
![](addsAuthforAzureFiles/AzureFiles06.png)

3-2. ロールが付与されたことを確認します。

(※ここでは例としてユーザー testuser0[1|2] に **ストレージファイルデータの SMB 共有の管理者特権の共同作成者** を付与しています)
![](addsAuthforAzureFiles/AzureFiles07.png)

### (4) Azure ファイル共有マウント用コマンドをコピー

Azure ファイル共有 [接続] より認証方法 [Active Directory] を選択し、表示されているコマンドをコピーします。
![](addsAuthforAzureFiles/AzureFiles08.png)

### (5) 手順(4) でロールを付与したユーザーでサインイン

ここでは例としてユーザー testuser01 でサインインしています。

![](addsAuthforAzureFiles/addsAuthforAzureFiles25.png)

### (6) 手順(4) でコピーしたコマンドを実行
![](addsAuthforAzureFiles/AzureFiles09.png)

### (7) マウントならびに Azure ファイル共有へアクセスできることを確認
![](addsAuthforAzureFiles/AzureFiles10.png)

---

なお、ストレージアカウントキーを使用してファイル共有をマウントすることで、Windows ACL (NTFS アクセス許可とも呼ばれます) を構成することも可能です。

□参考：[パート 3: SMB 経由でディレクトリとファイル レベルのアクセス許可を構成する](https://docs.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-ad-ds-configure-permissions)

ユーザー testuser01 にてストレージアカウントキーを使用しファイル共有をマウントします。
![](addsAuthforAzureFiles/AzureFiles18.png)

マウントしたドライブ内のフォルダに対してアクセス権限を設定します。
 - フォルダ testuser01 はユーザー testuser01 にアクセス許可を付与
 - フォルダ testuser03 はユーザー testuser03 にアクセス許可を付与
![](addsAuthforAzureFiles/addsAuthforAzureFiles26.png)

アクセス権限の設定が適用されているか確認するため、ユーザー testuser03 でサインインし、認証方法 [Active Directory] のスクリプトにてファイル共有をマウントします。
![](addsAuthforAzureFiles/AzureFiles20.png)

アクセスを許可した testuser03 フォルダへはアクセスが可能です。
![](addsAuthforAzureFiles/AzureFiles21.png)

一方で、アクセスを許可していない testuser01 フォルダへはアクセスを行えません。
![](addsAuthforAzureFiles/AzureFiles22.png)

---

ここまではドメインコントローラーに昇格した Windows Server にて Azure ファイル共有に対する AD DS 認証を有効化を実施し、ファイル共有のマウントならびにアクセスを行いました。
次は、上述のドメインに参加している Windows 10 端末にてファイル共有をマウントしアクセスが可能であるか確認します。

ドメイン参加している Windows 10 端末にサインインします。
![](addsAuthforAzureFiles/addsAuthforAzureFiles27.png)

Azure ファイル共有マウント用コマンドをコピーし実行します。
![](addsAuthforAzureFiles/AzureFiles13.png)
ファイル共有へアクセスができることを確認できました。

---

また、オンプレ AD DS 認証ではファイル共有へのアクセス元の端末がドメイン参加していない場合でも、オンプレ AD DS に参加しているドメインサーバーと通信できる状態であれば、認証に AD ユーザー資格情報を入力しファイル共有へアクセスすることも可能です。ご参考としていただけますと幸いです。

>□参考：[概要 - SMB を使用した Azure ファイル共有へのオンプレミスの Active Directory Domain Services 認証 > 前提条件](https://docs.microsoft.com/ja-jp/azure/storage/files/storage-files-identity-auth-active-directory-enable#prerequisites)
>
><一部抜粋>
>
>オンプレミス マシンまたは Azure VM をオンプレミスの AD DS にドメイン参加させます。 ドメインに参加させる方法については、「コンピューターをドメインに参加させる」を参照してください。
>マシンが AD DS にドメイン参加していない場合でも、マシンで AD ドメイン コントローラーが認識されていれば、認証に AD 資格情報を利用することはできます。

ドメイン参加していない Windows 10 端末から、ドメイン参加済みアカウントの AD ユーザー資格情報を利用してファイル共有へアクセスしてみます。

環境
- ドメイン参加済みサーバー：win2016-adds-server-apts

　　- ドメイン参加済みユーザー : win10client01@adfiles.com
- ドメイン未参加端末：win10-noadds-client-apts

オンプレ AD DS に参加しているドメインサーバー (win2016-adds-server-apts)
![](addsAuthforAzureFiles/addsAuthforAzureFiles28.png)

ドメイン参加していない Windows 10 端末 (win10-noadds-client-apts)

※ドメインサーバー (win10-adds-server-apts) と通信できる状態
![](addsAuthforAzureFiles/AzureFiles14.png)

ドメイン参加していない Windows 10 端末 (win10-noadds-client-apts) のエクスプローラーに UNC (\\\\<ストレージアカウント名>.file.core.windows.net\\<ファイル共有名>) を入力すると資格情報入力画面が表示されるため、AD ユーザー資格情報を入力しアクセスを行います。

![](addsAuthforAzureFiles/addsAuthforAzureFiles29.png)

ここでは、ドメイン参加済みユーザー (win10client01@adfiles.com) の AD ユーザー資格情報を利用しています。

![](addsAuthforAzureFiles/AzureFiles17.png)
ファイル共有へアクセスができることを確認できました。

---

本稿は以上となりますが、いかがでしたでしょうか。 本稿が皆様のお役に立てれば幸いです。
