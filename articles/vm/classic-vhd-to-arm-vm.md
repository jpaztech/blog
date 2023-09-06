---
title: クラシック VM で使用していた VHD から ARM VM を作成する手順
date: 2023-9-1 9:00:00
tags:
  - VM
  - Windows
  - Linux
  - HowTo
---

こんにちは、Azure テクニカル サポート チームの富田です。  
Azure のクラシック VM は 2023 年 9 月 6 日を持ちまして廃止となりました。  
そのためこれ以降サポートされる VM は ARM（Azure Resource Manager）の VM となります。  
クラシック VM の ARM VM への移行については以下の通りドキュメント等がございます。  

■ご参考：2023 年 9 月 6 日までに IaaS リソースを Azure Resource Manager に移行する  
[https://learn.microsoft.com/ja-jp/azure/virtual-machines/classic-vm-deprecation](https://learn.microsoft.com/ja-jp/azure/virtual-machines/classic-vm-deprecation )  

■ご参考：Classic VM から ARM への移行についての注意事項 (VM、ストレージ編)  
[https://jpaztech.github.io/blog/vm/migrate_classic_vm_and_storage](https://jpaztech.github.io/blog/vm/migrate_classic_vm_and_storage)  

他方、上記とは別の方法としてクラシック VM で使用していた OS ディスクの VHD から ARM VM を作成することも可能でございますので、今回はこの手順についてご説明させていただきます。  

>[!NOTE]
>クラシック VM で使用していた VHD はクラシックストレージアカウントに保存されておりますが、クラシックストレージアカウントも 2024 年 8 月 31 日に完全に廃止されます。
>クラシックストレージアカウントの移行については以下のドキュメントをご参照くださいませ。  
>　  
>■ご参考：クラシック ストレージ アカウントを Azure Resource Manager へ 2024 年 8 月 31 日までに移行する
>[https://learn.microsoft.com/ja-jp/azure/storage/common/classic-account-migration-overview](https://learn.microsoft.com/ja-jp/azure/storage/common/classic-account-migration-overview)

---
## 手順の大まかな流れ

クラシック VM で使用していた OS ディスクの VHD から ARM VM を作成する手順についてご紹介させていただきます。  
クラシックストレージアカウントに保存されている VHD からそのままでは ARM VM の作成が叶いませんため、以下の手順を踏む必要がございます。  

1. クラシックストレージアカウントから ARM ストレージアカウントへ VHD をコピーする。（AzCopy コマンド実行）
2. ARM ストレージアカウント内の VHD からディスクリソースを作成する。
3. ディスクリソースから ARM VM を作成する。

![](./classic-vhd-to-arm-vm/2023-08-16-11-01-20.png)

ディスクリソースの作成のためには ARM ストレージアカウントに VHD を一旦コピーする必要があるため少し手順が多いですが一つずつ解説させていただきます。  
それでは、それぞれの手順の詳細をご案内させていただきます。

---
## 1. クラシックストレージアカウントから ARM ストレージアカウントへ VHD をコピーする。（AzCopy コマンド実行）

AzCopy コマンドを用いてクラシックストレージアカウントから ARM ストレージアカウントへ VHD をコピーします。  
コマンド実行のために **<①コピー元ディスクの Blob URI><②コピー元 SAS トークン><③コピー先 URL>** の 3 つが必要となりますので、以下の順で用意をします。

---
### 1-1. クラシック VM で使用していた VHD の Blob URI を特定する。

ポータルの上部の検索ボックスより「仮想マシン (クラシック)」を検索して、クラシック VM の一覧を表示します。

![](./classic-vhd-to-arm-vm/2023-08-15-14-32-30.png)

表示されたクラシック VM の一覧から対象となる VM を選択します。

![](./classic-vhd-to-arm-vm/2023-08-15-14-33-57.png)

クラシック VM のリージョンをメモしておきます。  

![](./classic-vhd-to-arm-vm/2023-08-15-15-49-14.png)

左側のメニューより「ディスク」を選択して、OS ディスクの名前をクリックします。

![](./classic-vhd-to-arm-vm/2023-08-15-14-34-57.png)

ディスクの Blob URI が「場所」として表示されますので、この URI を **<①コピー元ディスクの Blob URI>** としてメモします。

![](./classic-vhd-to-arm-vm/2023-08-15-14-36-48.png)

データディスクがある場合は同じ手順でデータディスクについても URI をメモしておいてください。

---
### 1-2. コピー元クラシックストレージアカウントの準備

先の手順でクラシック VM のディスクの Blob URI を **<①ディスクの Blob URI>** としてメモしていると思います。  
Blob URI より以下の通り、クラシックストレージアカウント名が判別可能です。

> https://**<クラシックストレージアカウント名>**.blob.core.windows.net/<コンテナー名>/<VHD名>.vhd

こちらで確認したクラシックストレージアカウント名を、ポータルの上部の検索ボックスより検索して、クラシックストレージアカウントの画面を表示します。

![](./classic-vhd-to-arm-vm/2023-08-15-16-27-20.png)

表示されたクラシックストレージアカウントの画面にて、左側のメニューより「Shared Access Signature」を選択し、以下の画像の例のように SAS トークンを生成し **<②コピー元 SAS トークン>** としてメモします。
この際 SAS の有効期限等を適切に設定をお願いいたします。  

![](./classic-vhd-to-arm-vm/2023-08-16-09-20-13.png)

以上でコピー元の準備は完了です。

---
### 1-3. コピー先 ARM ストレージアカウントの準備

コピー先の ARM ストレージアカウントを作成します。  
既に ARM ストレージアカウントがある場合は、そちらをご利用いただいても大丈夫です。

ポータルの上部の検索ボックスより「ストレージアカウント」を検索して、ストレージアカウントの一覧画面を表示します。  

![](./classic-vhd-to-arm-vm/2023-08-15-15-46-00.png)

ストレージアカウント一覧画面の左上にある「作成」より ARM ストレージアカウントを作成します。  

![](./classic-vhd-to-arm-vm/2023-08-15-15-46-57.png)

ストレージアカウント作成の際、リージョン（地域）はクラシック VM と同じリージョンに作成します。  
一時的なものですので冗長性は「LRS」で良いかと存じます。その他の設定項目は既定のままで問題ないものと存じます。

![](./classic-vhd-to-arm-vm/2023-08-15-15-57-23.png)

作成したストレージアカウントを表示し、左側のメニューより「コンテナー」を選択し、上部の「＋コンテナー」から新規 Blob コンテナーを作成します。  

![](./classic-vhd-to-arm-vm/2023-08-15-16-03-53.png)

作成したコンテナーを選択し、コンテナーの画面の左側のメニューより「共有アクセス トークン」を選択の上、以下の図の例のようにコピー先の URL を生成します。  
この際も SAS の有効期限等を適切に設定をお願いいたします。  
以下のように表示された「BLOB SAS URL」が **<③コピー先 URL>** となります。  

![](./classic-vhd-to-arm-vm/2023-08-15-16-19-19.png)

以上でコピー先の準備も完了しました。

---
### 1-4. AzCopy コマンドを組み立てる

用意した **<①コピー元ディスクの Blob URI><②コピー元 SAS トークン><③コピー先 URL>** を使って、コピーを実行する AzCopy コマンドを組み立てましょう。  
以下の順で並べます。

```azcopy
azcopy copy '<①コピー元ディスクの Blob URI><②コピー元 SAS トークン>' '<③コピー先 URL>' --blob-type PageBlob
```

実際の文字列の例としては以下のような形となります。  

```azcopy
azcopy copy 'https://classicsasample8.blob.core.windows.net/vhds/os-disk.vhd?sv=2022-11-02&ss=b&srt=sco&sp=rl&se=2023-08-16T10:08:35Z&st=2023-08-16T02:08:35Z&spr=https&sig=saskeyverylongsaskeyverylongsaskeyverylong%3D' 'https://armsasample8.blob.core.windows.net/newvhd?sp=racwl&st=2023-08-16T02:09:36Z&se=2023-08-16T10:09:36Z&spr=https&sv=2022-11-02&sr=c&sig=hereisasykeyhereisasykeyhereisasykey%3D' --blob-type PageBlob
```

これにて実行する AzCopy のコマンドが用意できました。

---
### 1-5. Cloud Shell にて AzCopy コマンドで VHD コピーを実行する

AzCopy はコマンドベースでファイルのコピーなどを行えるコマンドライン ユーティリティです。  
今回は既定で AzCopy がインストールされている Cloud Shell を利用した手順をご紹介させていただきます。  
既に AzCopy がインストールされている環境をお持ちの場合はそちらをご利用いただいても問題ございません。  

■ご参考：AzCopy を使ってみる  
[https://learn.microsoft.com/ja-jp/azure/storage/common/storage-use-azcopy-v10](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-use-azcopy-v10)

まず、ポータル右上の Cloud Shell 起動ボタンを選択します。

![](./classic-vhd-to-arm-vm/2023-08-16-09-24-27.png)

初めて Cloud Shell をご利用頂く場合はセットアップの画面が表示されますので、表示された内容に沿ってセットアップをお願いいたします。  
なお、Cloud Shell の Bash / PowerShell どちらにも AzCopy はインストールされていますのでどちらをご利用いただいても大丈夫です。  

Cloud Shell が起動したら用意した AzCopy コマンドを実行します。  
正常完了した場合は以下のように「Number of Transfers Completed: 1」が記録されます。  

![](./classic-vhd-to-arm-vm/2023-08-16-11-19-12.png)

これにて ARM ストレージアカウントに VHD のコピーが完了しました。  
データディスクも合わせて移行する場合は、同様の手順でデータディスクもご対応をお願いいたします。  

---
## 2. ARM ストレージアカウント内の VHD からディスクリソースを作成する。

次に ARM VM を作成するためのディスクリソースを作成します。  
ポータルの上部の検索ボックスより「ディスク」を検索して、ディスクの一覧画面を表示します。  

![](./classic-vhd-to-arm-vm/2023-08-16-11-22-38.png)

左上の「作成」ボタンを選択します。

![](./classic-vhd-to-arm-vm/2023-08-16-11-23-42.png)

ディスクの新規作成画面に遷移するので、以下の形でディスクを作成します。

|項目|選択する内容|
|:-|:-|
|サブスクリプション|当該のサブスクリプションを選択します。|
|リソースグループ|任意で構いません。|
|ディスク名|任意で構いません。|
|地域|元のクラシック VM と同一リージョンにします。|
|可用性ゾーン|ゾーンを使用しない場合は「必要ありません」を選択します。|
|ソースの種類|「ストレージ BLOB」を選択します。|
|ソース サブスクリプション|当該のサブスクリプションを選択します。|
|ソース BLOB|「参照」ボタンを選択し、コピーした ARM ストレージアカウント内の VHD ファイルを選択します。この際サイズも確認できます。|
|OS の種類|VHD の内容に合わせてご選択ください。|
|VM の世代|元がクラシック VM なので「第 1 世代」を選択します。|
|VM アーキテクチャ|既定の「x64」となります。|
|サイズ|VHD より大きなサイズに設定します。ストレージの種類は任意で構いません。|

![](./classic-vhd-to-arm-vm/2023-08-16-11-41-10.png)

その他のオプションは既定のままで大丈夫ですので、ディスクの作成を行ってください。  
データディスクがある場合は同様の手順でデータディスクもご対応をお願いいたします。  

---
## 3. ディスクリソースから ARM VM を作成する。

最後に作成した OS ディスクのリソースの画面をポータルで表示します。  
上部に「VM の作成」ボタンがございますので、こちらを選択します。  

![](./classic-vhd-to-arm-vm/2023-08-16-11-44-29.png)

新規 ARM VM の作成画面に遷移いたしますので、お客様の環境に合わせて ARM VM の作成を実施くださいませ。  
作成時に「ディスク」のタブよりデータディスクのアタッチも可能でございます。  

![](./classic-vhd-to-arm-vm/2023-08-16-14-38-17.png)

---

以上で ARM VM の作成ができました。必要に応じて不要となった VHD などは削除くださいませ。  
上記の内容がお役に立てますと幸いでございます。
