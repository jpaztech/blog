---
title: ACR の Firewall 機能を有効にした状態で ACR の機能を用いてコンテナー イメージをビルドする方法について 
date: 2026-01-14 12:00
tags:
  - Containers
  - Azure Container Registry (ACR)
---

この記事は[Microsoft Azure Tech Advent Calendar 2023](https://qiita.com/advent-calendar/2023/microsoft-azure-tech) の 22 日目の記事になります。

こんにちは！ Azure テクニカル サポート チームの川畑です。
az acr buildコマンドを用いてコンテナー イメージをビルドする際に、ACR の Firewall 機能によって失敗するお問い合わせを頂きます。
この記事では、ACR のFirewall 機能を有効にした状態で ACR の機能を用いてコンテナー イメージをビルドする方法についてご紹介します。

<!-- more -->

---
## ACR のパブリック ネットワーク アクセス機能とは
ACR では、お客様のコンテナー イメージなど OCI アーティファクトをより安全に管理いただくために、ACR にアクセス可能な端末を制限するためのパブリック ネットワーク アクセス機能を提供しております。
パブリック ネットワーク アクセスの設定には、次の3 種類があります。

- 「すべてのネットワーク」
  名前の通りネットワーク レベルでの制限を実施いたしません。
  そのため、インターネット経由でのアクセスを受け付けることが可能となります。

- 「選択されたネットワーク」
  ACR の Firewall 機能を用いて、IP アドレス ベースでのアクセス制限を設けることが可能となります。
  なお、ここで許可可能な IP アドレスの形式は CIDR 形式となっているため、IP アドレス レンジを許可することなども可能となります。
  > [!WARNING] 
  > 許可可能な IP 規則は最大 100 個までとなります。</br>
  >　ご参考情報：パブリック IP ネットワーク ルールを構成する </br>
  >　https://learn.microsoft.com/ja-jp/azure/container-registry/container-registry-access-selected-networks </br>

  > [!WARNING] 
  > この設定を入れることによって、Azure Portal からリポジトリの情報を参照できなくなる場合があります。</br>
  > これは、Azure Portal を用いて ACR へアクセスしているクライアント端末の IP アドレスが許可されていないためとなります。</br>
  > そのため、Azure Portal より ACR 内の情報を参照する必要がある場合には、クライアント端末のパブリック IP アドレスを許可してください。

- 「無効」
  名前の通りパブリック IP アドレス経由でのアクセスを全て防ぐことが可能となります。
  この設定だけでは、ACR にアクセス可能な端末が存在しなくなるため、あわせてプライベート エンドポイントを経由したアクセスを可能なように構成いただく必要があります。
  下記ドキュメントに設定方法がまとまっておりますので、あわせてご参照ください。
　ご参考情報：Azure Private Link を使用して Azure Container Registry にプライベートで接続する
　https://learn.microsoft.com/ja-jp/azure/container-registry/container-registry-private-link


## ACR ビルドとは
ACR ビルドとは、お客様のクライアント端末上ではなく、Azure が管理している各リージョンに存在する ACR 用のエージェントを用いてコンテナー イメージを作成する機能となります。

この機能を用いることで、お客様のクライアント端末にて Docker などのコンテナー ランタイムをインストールすることなく、Azure が用意しているエージェントを用いてコンテナー イメージを作成、ACR へプッシュすることが出来ます。

下記 は ACR ビルドの実行結果の一例となります。
今回の例では、 外部のコンテナー レジストリー (mcr.microsoft.com) より hello-world というコンテナー イメージを取得し、起動する Docker イメージを作成、ACR へプッシュします。

まずは、Docker イメージを作成するために Dockerfile を用意します。
```shell
$ echo "FROM mcr.microsoft.com/hello-world" > Dockerfile
$ cat Dockerfile 
FROM mcr.microsoft.com/hello-world
```
それでは、この Dockerfile を基に ACR ビルドを使って Docker イメージの作成、ACR へプッシュを行います。
```shell
$ az acr build --registry blogbuildtest --image buildtest/hello-world:v1 --file Dockerfile .
Packing source code into tar to upload...
Uploading archived source code from '/tmp/build_archive_6d41a3f0c1e24e1cbac736d1b271ad6c.tar.gz'...
Sending context (345.000 Bytes) to registry: blogbuildtest...
Queued a build with ID: ca1
Waiting for an agent...
2023/12/11 05:16:49 Downloading source code...
2023/12/11 05:16:49 Finished downloading source code
2023/12/11 05:16:50 Using acb_vol_4cfc16ec-0963-4b43-8581-f87207679198 as the home volume
2023/12/11 05:16:50 Setting up Docker configuration...
2023/12/11 05:16:50 Successfully set up Docker configuration
2023/12/11 05:16:50 Logging in to registry: blogbuildtest.azurecr.io
2023/12/11 05:16:51 Successfully logged into blogbuildtest.azurecr.io
2023/12/11 05:16:51 Executing step ID: build. Timeout(sec): 28800, Working directory: '', Network: ''
2023/12/11 05:16:51 Scanning for dependencies...
2023/12/11 05:16:51 Successfully scanned dependencies
2023/12/11 05:16:51 Launching container with name: build
Sending build context to Docker daemon  3.072kB
Step 1/1 : FROM mcr.microsoft.com/hello-world
latest: Pulling from hello-world
1b930d010525: Pulling fs layer
1b930d010525: Verifying Checksum
1b930d010525: Download complete
1b930d010525: Pull complete
Digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
Status: Downloaded newer image for mcr.microsoft.com/hello-world:latest
 ---> fce289e99eb9
Successfully built fce289e99eb9
Successfully tagged blogbuildtest.azurecr.io/buildtest/hello-world:v1
2023/12/11 05:16:52 Successfully executed container: build
2023/12/11 05:16:52 Executing step ID: push. Timeout(sec): 3600, Working directory: '', Network: ''
2023/12/11 05:16:52 Pushing image: blogbuildtest.azurecr.io/buildtest/hello-world:v1, attempt 1
The push refers to repository [blogbuildtest.azurecr.io/buildtest/hello-world]
af0b15c8625b: Preparing
af0b15c8625b: Pushed
v1: digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a size: 524
2023/12/11 05:16:54 Successfully pushed image: blogbuildtest.azurecr.io/buildtest/hello-world:v1
2023/12/11 05:16:54 Step ID: build marked as successful (elapsed time in seconds: 1.093391)
2023/12/11 05:16:54 Populating digests for step ID: build...
2023/12/11 05:16:54 Successfully populated digests for step ID: build
2023/12/11 05:16:54 Step ID: push marked as successful (elapsed time in seconds: 1.829038)
2023/12/11 05:16:54 The following dependencies were found:
2023/12/11 05:16:54 
- image:
    registry: blogbuildtest.azurecr.io
    repository: buildtest/hello-world
    tag: v1
    digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
  runtime-dependency:
    registry: mcr.microsoft.com
    repository: hello-world
    tag: latest
    digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
  git: {}


Run ID: ca1 was successful after 6s
```
しかしながら、上述の通り、ACR ビルドは Azure にて管理している各リージョンに存在する ACR 用のエージェントによってコンテナー イメージの作成、ACR へのプッシュをする機能であるため、**ACR 用のエージェントからお客様の ACR へのアクセス**が行われます。

このアクセスには、パブリック IP アドレスが使われているため、ACR の Firewall 機能を用いてパブリック アクセスを防がれている ACR へのアクセスが失敗することが予想されます。

試しに Azure VM を用意し、この Azure VM が利用しているパブリック IP アドレスを ACR の Firewall 機能によって許可します。

この設定の場合、Azure VM から ACR への通信は成功するため、ACR からコンテナー イメージの取得等は実行できますが、ACR ビルドは失敗します。

作成した Azure VM は以下の通りであり、割り当てられたパブリック IP アドレスは 4.xxx.xxx.xxx となります。

![](./acr-how-to-build-image-with-firewall/vm_information.png)
それでは、この IP アドレスを ACR の Firewall 機能で許可します。

![](./acr-how-to-build-image-with-firewall/acr_information.png)
では、Azure VM に SSH をして、Docker イメージを ACR から取得してみます。
```shell
$ docker pull blogbuildtest.azurecr.io/buildtest/hello-world:v1
v1: Pulling from buildtest/hello-world
1b930d010525: Pull complete
Digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
Status: Downloaded newer image for blogbuildtest.azurecr.io/buildtest/hello-world:v1
blogbuildtest.azurecr.io/buildtest/hello-world:v1

$ docker images
REPOSITORY                                       TAG       IMAGE ID       CREATED       SIZE
blogbuildtest.azurecr.io/buildtest/hello-world   v1        fce289e99eb9   4 years ago   1.84kB
```
docker pull コマンドによってコンテナー イメージを ACR から取得出来ました。
次に ACR ビルドを使ってコンテナー イメージの作成をしてみます。
```shell
$ az acr build --registry blogbuildtest --image buildtestfromvm/hello-world:v1 --file Dockerfile .
Packing source code into tar to upload...
Uploading archived source code from '/tmp/build_archive_ba9f4b643e5b4b79b251d6213e8abd99.tar.gz'...
Sending context (26.336 KiB) to registry: blogbuildtest...
Queued a build with ID: ca2
Waiting for an agent...
2023/12/11 06:06:48 Downloading source code...
2023/12/11 06:06:48 Finished downloading source code
2023/12/11 06:06:48 Using acb_vol_f6e0b320-1247-4584-b5c3-c620a4d138e5 as the home volume
2023/12/11 06:06:48 Setting up Docker configuration...
2023/12/11 06:06:49 Successfully set up Docker configuration
2023/12/11 06:06:49 Logging in to registry: blogbuildtest.azurecr.io
failed to login, ran out of retries: failed to set docker credentials: Error response from daemon: Get "https://blogbuildtest.azurecr.io/v2/": denied: client with IP '52.xxx. xxx.  xxx ' is not allowed access. Refer https://aka.ms/acr/firewall to grant access.
: exit status 1
Run ID: ca2 failed after 5s. Error: failed during run, err: exit status 1
Run failed
```
予想通り Failed となることが確認できました。
なお、この IP アドレス 52.xxx.xxx.xxx が ACR のエージェントが利用しているパブリック IP アドレスとなり、このパブリック IP アドレスが許可されていないことから処理が失敗したことが確認できました。

## ACR ビルドの代替策
前置きが長くなってしまいましたが、上述のように ACR ビルドを用いてコンテナー イメージを作成する場合、ACR の Firewall 機能によってアクセスが防がれてしまう場合があります。
この回避策としては、以下の方法が挙げられます。

1. パブリック ネットワーク アクセスの設定を「すべてのネットワーク」に変更する 
   ACR のエージェントが ACR へアクセスする際に使用しているパブリック IP アドレスが許可されていないことで本事象は発生するため、インターネットからのアクセスを全て受け付けるよう変更いただくことで事象が改善します。

2. ACR のエージェントが利用するパブリック IP アドレスを許可する
   ACR のエージェントが利用するパブリック IP アドレスを「選択されたネットワーク」の IP 規則に追加する方法が挙げられます。
   Azure では、下記サイトにて  Azure の各サービスが利用する IP アドレスを公開しているため、こちらの AzureContainerRegistry.<region> の IP アドレスを追加いただくことで事象が改善することが想定されます。
   　ご参考情報：Download Azure IP Ranges and Service Tags – Public Cloud from Official Microsoft Download Center
   　https://www.microsoft.com/en-us/download/confirmation.aspx?id=56519
   > [!WARNING] 
   > ACR 含め Azure が利用するパブリック IP アドレスは動的なものであり、今後変更される可能性があります。
   そのため、定期的もしくはアクセスが失敗するようになりましたら、最新の ACR のパブリック IP アドレスをご確認・更新いただく必要があります。

3. ACR タスクを利用する
   ACR タスクは、ACR ビルドの制御等を行うことができ、ACR ビルド同様にコンテナー イメージの作成を行うことが可能となります。
   ACR タスクは、下記ドキュメントに記載の通り、ネットワーク バイパス ポリシーを使用することが可能となります。
   ネットワーク バイパス ポリシーを使用することで、Firewall 機能を有効にした状態で、ACR のエージェントからの通信を許可することが可能となります。
   　ご参考情報：タスクのネットワーク バイパス ポリシーを管理する
   　https://learn.microsoft.com/ja-jp/azure/container-registry/manage-network-bypass-policy-for-tasks#enabling-and-disabling-the-network-rule-bypass-policy-setting

   そのため、ACR ビルドの代替方法として ACR タスクをご利用いただくことで ACR の Firewall 機能でパブリック アクセスを防いだまま ACR の機能によってコンテナー イメージを作成することが可能となります。
   次のセクションにて ACR タスクを使ったコンテナー イメージの作成方法について紹介します。

## ACR タスクのご紹介
上述の通り、ACR タスクでは、ACR ビルドと同様に ACR の機能を使ってコンテナー イメージを作成することが可能となります。
それでは、早速 ACR タスクを使って Firewall 機能を有効化した ACR に対してコンテナー イメージの作成、プッシュをしてみます。

ACR タスクを作成する前に事前準備が必要となります。

まず、該当の ACR に対してネットワーク バイパス ポリシーが有効となっているかを確認します。
```shell
az resource show \
--namespace Microsoft.ContainerRegistry \
--resource-type registries \
--name blogbuildtest \
--resource-group blog \
--api-version 2025-05-01-preview \
--query properties.networkRuleBypassAllowedForTasks
false
```
false の値が返ってきたため、この ACR ではネットワーク バイパス ポリシーが無効になっています。
有効にするために、以下のコマンドを実行してみます。
```shell
az resource update \
--namespace Microsoft.ContainerRegistry \
--resource-type registries \
--name blogbuildtest \
--resource-group blog \
--api-version 2025-05-01-preview \
--set properties.networkRuleBypassAllowedForTasks=true
```
その後、改めて有効となっているかを確認してみます。
```shell
az resource show \
--namespace Microsoft.ContainerRegistry \
--resource-type registries \
--name blogbuildtest \
--resource-group blog \
--api-version 2025-05-01-preview \
--query properties.networkRuleBypassAllowedForTasks
true
```
値が true に変更されました。これによって有効化されたことを確認できました。

次に、ACR ビルドでは、コンテナー イメージの作成に使用していた Dockerfile を az acr build コマンドを実行したクライアント端末に存在していましたが、ACR タスクでは ACR のエージェントにてアクセスが可能な場所に配置する必要があります。
ここでは、Dockerfile を ACR 上に配置し、ACR 上に配置した Dockerfile を ACR タスクより使用してコンテナー イメージを作成してみます。

ACR に Dockerfile を配置するにあたり、オープン ソースにて開発がされている ORAS を使用します。
簡単な使用方法につきましては、下記ドキュメントでも紹介されておりますので、ご参考ください。
　ご参考情報：Azure コンテナー レジストリを使って OCI 成果物をプッシュおよびプルする
　https://learn.microsoft.com/ja-jp/azure/container-registry/container-registry-oci-artifacts

それでは、ORAS を使って Dockerfile を ACR にプッシュします。
```shell
$ oras push blogbuildtest.azurecr.io/hello-world.dockerfile:1.0 Dockerfile
```
今回は hello-world.dockerfile というリポジトリとしてプッシュしました。
では、この hello-world.dockerfile を用いるよう ACR タスクを作成してみます。
コマンドは下記のような形式となります。
```shell
$ az acr task create -t <イメージ名> --registry <ACR 名> --name <タスク名> --context oci://<ACR 名>.azurecr.io/<Dockerfile の OCI アーティファクト名>:<Tag>  --file <Dockerfile名> --assign-identity [system] -g <リソース グループ名>
```
今回の環境では、下記のコマンドとなります。
```shell
$ az acr task create -t helloworld --registry blogbuildtest --name helloworldtask  --context oci://blogbuildtest.azurecr.io/hello-world.dockerfile:1.0  --file hello-world.dockerfile --assign-identity [system]
```
なお、ネットワーク バイパス ポリシーを使用してアクセスを行う場合には、ACR タスクにシステム割り当てマネージド ID を利用する必要があります。

  > [!WARNING] 
  > 現在ユーザー割り当てマネージド ID を利用する ACR タスクはプレビューで提供されております。</br>
  >　ご参考情報：パブリック IP ネットワーク ルールを構成する </br>
  >　https://learn.microsoft.com/ja-jp/azure/container-registry/container-registry-access-selected-networks </br>
  > しかしながら、ネットワーク バイパス ポリシーを使用してアクセスするためには、システム割り当てマネージド ID を利用する必要があります。


先ほど実行したコマンドにて、今回作成した ACR タスクにはシステム割り当てマネージド ID を利用するよう設定しているため、このシステム割り当てマネージド ID に必要な権限 (ACRPUSH) を割り当てます。
```shell
$ principalID=$(az acr task show --name helloworldtask --registry tasktest --query identity.principalId --output tsv -g blog)
$ baseregID=$(az acr show --name blogbuildtest --query id --output tsv -g blog)
$ az role assignment create --assignee $principalID --scope $baseregID --role acrpush
```
次に、ACR タスク “helloworldtask” に対して  ACR “blogbuildtest” へのアクセスにマネージド ID を利用するよう設定を行います。
```shell
$ az acr task credential add --name helloworldtask --registry blogbuildtest --login-server blogbuildtest.azurecr.io --use-identity [system] -g blog
```
これで準備は完了です。それでは、ACR タスクを実行します。
```shell
$ az acr task run --name helloworldtask --registry blogbuildtest -g blog                                                                                              Queued a run with ID: cad
Waiting for an agent...
2023/12/14 19:29:42 Downloading source code...
2023/12/14 19:29:45 Finished downloading source code
2023/12/14 19:29:45 Using acb_vol_efd7cb79-502a-47b0-8e44-9689138ae1cb as the home volume
2023/12/14 19:29:46 Setting up Docker configuration...
2023/12/14 19:29:46 Successfully set up Docker configuration
2023/12/14 19:29:46 Logging in to registry: blogbuildtest.azurecr.io
2023/12/14 19:29:47 Successfully logged into blogbuildtest.azurecr.io
2023/12/14 19:29:47 Executing step ID: build. Timeout(sec): 28800, Working directory: '', Network: ''
2023/12/14 19:29:47 Scanning for dependencies...
2023/12/14 19:29:47 Successfully scanned dependencies
2023/12/14 19:29:47 Launching container with name: build
Sending build context to Docker daemon  2.048kB
Step 1/1 : FROM mcr.microsoft.com/hello-world
latest: Pulling from hello-world
1b930d010525: Pulling fs layer
1b930d010525: Verifying Checksum
1b930d010525: Download complete
1b930d010525: Pull complete
Digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
Status: Downloaded newer image for mcr.microsoft.com/hello-world:latest
 ---> fce289e99eb9
Successfully built fce289e99eb9
Successfully tagged blogbuildtest.azurecr.io/helloworld:latest
2023/12/14 19:29:48 Successfully executed container: build
2023/12/14 19:29:48 Executing step ID: push. Timeout(sec): 3600, Working directory: '', Network: ''
2023/12/14 19:29:48 Pushing image: blogbuildtest.azurecr.io/helloworld:latest, attempt 1
The push refers to repository [blogbuildtest.azurecr.io/helloworld]
af0b15c8625b: Preparing
af0b15c8625b: Layer already exists
latest: digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a size: 524
2023/12/14 19:29:49 Successfully pushed image: blogbuildtest.azurecr.io/helloworld:latest
2023/12/14 19:29:49 Step ID: build marked as successful (elapsed time in seconds: 1.140930)
2023/12/14 19:29:49 Populating digests for step ID: build...
2023/12/14 19:29:49 Successfully populated digests for step ID: build
2023/12/14 19:29:49 Step ID: push marked as successful (elapsed time in seconds: 0.898327)
2023/12/14 19:29:49 The following dependencies were found:
2023/12/14 19:29:49
- image:
    registry: blogbuildtest.azurecr.io
    repository: helloworld
    tag: latest
    digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
  runtime-dependency:
    registry: mcr.microsoft.com
    repository: hello-world
    tag: latest
    digest: sha256:92c7f9c92844bbbb5d0a101b22f7c2a7949e40f8ea90c8b3bc396879d95e899a
  git: {}

Run ID: cad was successful after 8s
```
これで、Firewall を有効化している ACR に対して、ACR タスクを用いてコンテナー イメージを作成することが出来ました。

### さいごに
この記事では、ACR のFirewall 機能を有効にした状態で ACR の機能を用いてコンテナー イメージをビルドする方法をご紹介しました。
ご参考にいただけますと幸いです。

本稿が皆様のお役に立ちましたら幸いです。

最後まで読んでいただきありがとうございました！
