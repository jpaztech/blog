---
title: Azure PowerShell 最新版のインストール手順 (v3.8.0 現在) **追記あり
date: 2017-05-02 15:07:49
tags:
  - Archive
  - PowerShell
disableDisclaimer: true
---

><span style="color:red;">2017 年 9 月 5 日 追記</span>
>下記の記事の執筆以降も Azure PowerShell は更新されており、現在の最新バージョン (4.3.1) では、スタンドアローンのインストーラーも公開されております。以下のページの「Azure PowerShell 4.3.1 Installer」から、インストーラーをダウンロードして実行すれば、この記事の手順を行わなくても Azure PowerShell のインストールは可能です。
>
><span style="color:red;">Releases - Azure/azure-powershell</span>
>
>ただし、この記事の手順でインストールを実行すると、アップデートがしやすいなどのメリットもありますので、こちらの手順についても、ぜひ参考にしていただければと思います。

こんにちは、Azure テクニカル サポート チームの飯塚です。

コマンドやスクリプトで Azure の管理ができる、とっても便利な Azure PowerShell ですが、ここ最近のバージョンにおいて、スタンドアローンのインストーラーが提供されなくなったり、WebPI でのインストールができなくなっているなど、インストール方法が少々変わっております。

2017 年 5 月 2 日時点での最新版である Azure PowerShell 3.8.0 のインストール手順は、以下の公開ドキュメントでご説明しているとおり、PowerShellGet を利用するものです。
[Install and configure Azure PowerShell](https://docs.microsoft.com/ja-jp/powershell/azure/install-azurerm-ps)

しかし、本ドキュメントは現時点で英語版のみの提供であり、また PowerShellGet のインストールなど、一部別のドキュメントの参照が必要な部分もあり、少々わかりにくいのではないかと思います。そこで、本ブログ記事で、あらためて Azure PowerShell のインストール方法をおまとめしました。参考にしていただければと思います。


## ■ 1. PowerShellGet のインストール
Azure PowerShell の最新版のインストールは、PowerShellGet という、PowerShell コマンドで自動的にモジュールをダウンロードする仕組みを利用します。
PowerShellGet は、Windows 10 か Windows Server 2016 以降のコンピューターには、PowerShell 5.0 とともに既定でインストールされています。

お手元のコンピューターで、PowerShellGet が使えるかどうかを確認するには、以下の PowerShell コマンドを実行します。

**コマンド**
>Get-Module PowerShellGet -list | Select-Object Name,Version,Path

**PowerShellGet が使える場合の出力例**
>Name          Version Path
>----          ------- ----
>PowerShellGet 1.0.0.1 C:\Program Files\WindowsPowerShell\Modules\PowerShellGet\1.0.0.1\PowerShellGet.psd1

コマンドの出力結果に、PowerShellGet のバージョン情報が出力されれば、PowerShellGet が使えますので、そのまま 2. の手順に進んでください。
もし表示されない場合 (PowerShellGet が使えない場合、画面になにも出力されないはずです) は、以下のいずれかの手順で PowerShellGet をインストールしてください。

### 1-1. PowerShell 5.0 へのアップグレード
PowerShell 自体を 5.0 にアップグレードする方法です。
以下のページから Windows Management Framework 5.0 をダウンロードし、PowerShell 5.0 をインストールします。
[Windows Management Framework 5.0](https://www.microsoft.com/en-us/download/details.aspx?id=50395)

### 1-2. PowerShellGet のみのインストール
PowerShellGet の機能をインストールするものです。以下のページからモジュールをダウンロードし、インストールします。
[PackageManagement PowerShell Modules Preview - March 2016](https://www.microsoft.com/en-us/download/details.aspx?id=51451)

## ■ 2. Azure PowerShell のインストール
PowerShellGet が利用できるようなっしたら、実際に Azure PowerShell をインストールします。
PowerShell を「管理者として実行」して、以下のコマンドを実行してください。
クラシック デプロイ モデルとリソース マネージャー デプロイ モデルで、それぞれインストールするモジュール名が異なりますが、2 つのモジュールは共存可能ですので、両方のコマンドを実行いただいても問題ありません。

**クラシック デプロイ モデルの Azure PowerShell をインストール**
>Install-Module Azure
**リソース マネージャー デプロイ モデルの Azure PowerShell のインストール**
>Install-Module AzureRM

コマンドの実行時に、必要なモジュールをインストールするか尋ねられた場合は「Y」を入力して先に進みます。

><span style="color:red;">2017 年 9 月 5 日 追記</span>
>最新の Azure PowerShell にバージョンアップする場合は、<span style="color:red;">Update-Module</span> コマンドがご利用いただけます。

3. Azure PowerShell の利用
実際に Azure PowerShell のコマンドレットを利用する場合、最初に、以下のコマンドを実行してモジュールのロードを行ってください。

クラシック デプロイ モデルの Azure PowerShell をインポート
Import-Module Azure
リソース マネージャー デプロイ モデルの Azure PowerShell のインポート
Import-Module AzureRM
補足: 自動的に Import-Module が実行されるようにする方法
PowerShell を起動するたびに、Import-Module コマンドを実行するのは面倒かもしれません。そのようなときは、「PowerShell プロファイル」に Import-Module コマンドを記載することで、PowerShell の実行時に、自動的に Import-Module コマンドが実行され、すぐに Azure PowerShell が利用できるようになります。

PowerShell プロファイルについては、以下の資料を参考にご覧ください。

Windows PowerShell プロファイル

