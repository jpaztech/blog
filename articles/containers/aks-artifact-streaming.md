---
title: Artifact Streaming とは？ ACR のイメージを AKS にデプロイして試してみた
date: 2023-12-24 12:00:00
tags:
  - Containers
  - Azure Kubernetes Service (AKS)
  - Azure Container Registry (ACR)
---

この記事は [Microsoft Azure Tech Advent Calendar 2023](https://qiita.com/advent-calendar/2023/microsoft-azure-tech) の 24 日目の記事になります🎅

こんにちは。Azure テクニカル サポートチームの桐井です。

[Ignite 2023](https://techcommunity.microsoft.com/t5/apps-on-azure-blog/aks-welcomes-you-to-ignite-2023/ba-p/3983317) で、ACR/AKS 関連の機能としてArtifact Streaming が発表されました。
本記事では、Artifact Streaming を使って ACR にあるコンテナー イメージを AKS クラスターにデプロイする様子を紹介します。

Artifact Streaming は 2023/12 現在、プレビュー機能として提供されております。
今後のアップデートにより、将来この記事で紹介した内容から変更される可能性があることを何卒ご了承ください！

<!-- more -->

## Artifact Streaming とは

> ご参考) Public preview: Artifact streaming support in Azure Kubernetes Service (AKS)
> https://azure.microsoft.com/ja-jp/updates/public-review-artifact-streaming-support-in-azure-kubernetes-service-aks/

コンテナー イメージは、データの実体を表す複数の`レイヤー`と、イメージに含まれるレイヤーの情報をまとめた`マニフェスト`によって構成されています。

通常、コンテナー化されたアプリケーションを起動するには、コンテナー イメージの Pull (ダウンロードと展開) が必要になります。
イメージの Pull では次のような処理が行われます:

1. コンテナー レジストリにアクセスし、マニフェストからレイヤーの情報を取得する
2. レイヤーのダウンロードが必要か確認する (ローカル キャッシュが利用できるか確認する)
3. 各レイヤーをダウンロードする
4. ダウンロード済みのレイヤーを展開する
5. コンテナーを起動する

このように、コンテナーの起動に至るまでには、イメージを構成するレイヤーのダウンロードと展開の処理が必要となります。
そのため、レイヤーのデータ サイズが大きい場合や、レイヤー数が多いコンテナー イメージの場合は、コンテナーが起動するまでに時間を要すことがあります。

特に、Pod のオートスケールをするシナリオでは、Pod の起動時間がオートスケールの速度に影響を与えます。

また、クラスター オートスケーラーによってノードが削減され、その後新規ノードが追加された場合には、ノード内のコンテナー イメージのキャッシュが利用できません (AKS ではノードプールの [スケールダウン モード](https://learn.microsoft.com/ja-jp/azure/aks/scale-down-mode)が `Delete` の場合)。
新規ノードでは、コンテナー イメージのダウンロードと展開が再び必要となってしまうため、Pod の起動完了までに時間を要する要因となってしまいます。

これらの問題は、Artifact Streaming を利用することで、解決を図ることができます。
Artifact Streaming を利用すると、コンテナー イメージ全体のダウンロードと展開を待つことなく、コンテナーを開始できます。

## Artifact Streaming を試してみよう

実際に AKS クラスターへコンテナー イメージをデプロイして、Artifact Streaming によってイメージの Pull 時間が変化するかを試してみましょう。

今回の検証では、コンテナー イメージとして `docker.io/jupyter/all-spark-notebook:latest` を使用します。
AKS にデプロイをする前に、まずは手元の PC でイメージの Pull を試してみます。
次のように、多数のレイヤーによって構成されているコンテナー イメージであることがわかります。

```shell
$ docker pull docker.io/jupyter/all-spark-notebook:latest
latest: Pulling from jupyter/all-spark-notebook
aece8493d397: Pull complete
fd92c719666c: Pull complete
088f11eb1e74: Pull complete
4f4fb700ef54: Pull complete
ef8373d600b0: Pull complete
77e45ee945dc: Pull complete
a30f89a0af6c: Download complete
dc42adc7eb73: Download complete
abaa8376a650: Downloading [==>                                                ]  4.314MB/104.8MB
aa099bb9e49a: Download complete
822c4cbcf6a6: Download complete
d25166dcdc7b: Downloading [====>                                              ]  2.494MB/30.5MB
964fc3e4ff9f: Waiting
2c4c69587ee4: Waiting
de2cdd875fa8: Waiting
75d33599f5f2: Waiting
31973ea82470: Waiting
96ee7e4439c7: Waiting
1f9ad23c07ac: Waiting
d19266e0cb17: Waiting
9a165b6e9dc7: Pulling fs layer
5689442fd4e1: Pulling fs layer
9a6a202f62a6: Waiting
734ea0c3d94e: Waiting
a21a167f7127: Waiting
467e20fcd668: Waiting
7024bb03412a: Waiting
7c128e9d2ddd: Waiting
80782ae10995: Waiting
691924032e73: Waiting
05c5a5d9ae5f: Waiting
15a3d66e1b80: Waiting
688c0dcd61fc: Waiting
ed7d16094f4e: Waiting
```

### Artifact Streaming を使用する準備

本記事の手順は、次のドキュメントに記載されている手順に沿っています。
ドキュメントをあわせてご参照ください。

> Azure Kubernetes Service (AKS) の成果物ストリーミングを使用してイメージのプル時間を短縮する (プレビュー)
> https://learn.microsoft.com/ja-jp/azure/aks/artifact-streaming

Artifact Streaming を利用するために、Azure Container Registry (ACR) のリポジトリを設定していきます。

はじめに、今回利用するコンテナーイメージを ACR にインポートします。

```shell
$ az acr import -n {ACR_NAME} \
    --source docker.io/jupyter/all-spark-notebook:latest \
    -t jupyter/all-spark-notebook:latest
```

イメージのインポートが完了したら、Artifact Streaming を作成します。
作成にはしばらく時間がかかります。

```shell
$ az acr artifact-streaming create -n {ACR_NAME} \
    --image jupyter/all-spark-notebook:latest
```

`az acr artifact-streaming create` コマンドを実行すると、作成の進捗を確認するためのコマンド例が表示されます。
`az acr artifact-streaming operation show` コマンドで進捗が確認できます。

```shell
$ az acr artifact-streaming operation show -n {ACR_NAME} \
    --repository jupyter/all-spark-notebook \
    --id d7ea8de0-1810-48a1-b9b8-ed7f667ae1f6

Command group 'acr artifact-streaming' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
{
  "details": "Conversion ongoing for resource jupyter/all-spark-notebook@sha256:b63bae2d9d34779ac969deeb4834efd838991f77269ca9a76bf6b0d1f8678d29",
  "name": "ArtifactStreamingConversion",
  "progress": "8%",
  "resource": "jupyter/all-spark-notebook@sha256:b63bae2d9d34779ac969deeb4834efd838991f77269ca9a76bf6b0d1f8678d29",
  "startTime": "2023-12-07T07:27:12Z",
  "status": "Running"
}
```

Artifact Streaming の作成が完了したら、レジストリに存在する Artifact Streaming の一覧を確認してみましょう。
`az acr manifest list-referrers` コマンドに、レジストリ名とイメージ名を指定して実行します。
`"artifactType"` が `"application/vnd.azure.artifact.streaming.v1"` となっていますね。

```shell
$ az acr manifest list-referrers -r {ACR_NAME} \
    -n jupyter/all-spark-notebook:latest

Command group 'acr manifest' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
{
  "manifests": [
    {
      "annotations": {
        "streaming.format": "overlaybd",
        "streaming.platform.arch": "amd64",
        "streaming.platform.os": "linux",
        "streaming.version": "v1"
      },
      "artifactType": "application/vnd.azure.artifact.streaming.v1",
      "digest": "sha256:2cba83dae18f99b6c958e9e34421dadaeee0db1cde4adc0241180de80efd4f34",
      "mediaType": "application/vnd.oci.image.manifest.v1+json",
      "size": 17266
    }
  ]
}
```

続いて AKS 側の設定をします。
Artifact Streaming を利用するには、Artifact Streaming オプションを有効化した AKS ノードプールが必要になります。

`az aks nodepool add` コマンドに `--enable-artifact-streaming` オプションを付与して、新しいノードプールを追加します。

```shell
$ az aks nodepool add \
    --resource-group myResourceGroup \
    --cluster-name myAKSCluster \
    --name acrtest \
    --node-count 1 \
    --enable-artifact-streaming
```

ここでは `acrtest` という名前でノードプールを追加しました。
`kubectl get nodes` コマンドでノードの一覧を表示すると、新しいノードが追加されていることが確認できます。

```shell
$ kubectl get nodes
NAME                                STATUS   ROLES   AGE     VERSION
aks-acrtest-29138108-vmss000000     Ready    agent   4h15m   v1.27.3
aks-nodepool2-20356098-vmss00001d   Ready    agent   27h     v1.27.3
```

これで ACR と AKS の準備は完了です！

### AKS へのデプロイを試してみる

準備したコンテナー イメージを AKS クラスターにデプロイして、Artifact Streaming によってイメージの Pull 時間が短縮されているか確かめてみましょう。

検証では、Artifact Streaming が無効のノードプールと、有効のノードプールのそれぞれに、同じコンテナー イメージを使用する Deployment をデプロイします。

#### Artifact Streaming が無効の場合

`nodeSelector` を使用して、Artifact Streaming が無効のノードプールに Pod をデプロイします。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jupyter
  labels:
    app: jupyter
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jupyter
  template:
    metadata:
      labels:
        app: jupyter
    spec:
      nodeSelector:
        "agentpool": nodepool2  # Artifact Streaming が無効のノードプール
      containers:
      - name: jupyter
        image: {ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest
        imagePullPolicy: Always
```

YAML マニフェストをクラスターにデプロイします。
`jupyter-79c4469c65-5cfpf` Pod が生成されました。

```shell
$ kubectl get pods -o wide
NAME                                          READY   STATUS    RESTARTS   AGE     IP            NODE                                NOMINATED NODE   READINESS GATES
jupyter-79c4469c65-5cfpf                      1/1     Running   0          3m16s   10.244.0.19   aks-nodepool2-20356098-vmss00001i   <none>           <none>
```

`kubectl describe pod` コマンドの結果から、Events フィールドのメッセージを確認します。

`Pulled` イベントでは、`Successfully pulled image "{イメージ名}" in 1m25.27926119s` のようにメッセージが表示されています。
イメージの Pull に 1分25秒 ほど要したようです。

```shell
$ kubectl describe pod jupyter-79c4469c65-5cfpf
Name:             jupyter-79c4469c65-5cfpf
  ...
Node:             aks-nodepool2-20356098-vmss00001i/10.240.0.4
  ...
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  3m25s  default-scheduler  Successfully assigned default/jupyter-79c4469c65-5cfpf to aks-nodepool2-20356098-vmss00001i
  Normal  Pulling    3m25s  kubelet            Pulling image "{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest"
  Normal  Pulled     2m     kubelet            Successfully pulled image "{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest" in 1m25.27926119s (1m25.279277391s including waiting)
  Normal  Created    2m     kubelet            Created container jupyter
  Normal  Started    119s   kubelet            Started container jupyter
```

#### Artifact Streaming が有効の場合

続いて Artifact Streaming を利用した場合の動作を確認してみましょう。

`nodeSelector` を使用して、Artifact Streaming が有効のノードプールに Pod をデプロイします。
Pod 名やコンテナー名を変更していますが、使用するコンテナー イメージは先ほどと同じ `{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest` です。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jupyter-artifact-streaming
  labels:
    app: jupyter-artifact-streaming
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jupyter-artifact-streaming
  template:
    metadata:
      labels:
        app: jupyter-artifact-streaming
    spec:
      nodeSelector:
        "agentpool": acrtest  # Artifact Streaming が有効のノードプール
      containers:
      - name: jupyter
        image: {ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest
        imagePullPolicy: Always
```

YAML マニフェストをクラスターにデプロイします。
`jupyter-artifact-streaming-5b58c9c797-pxs4l` Pod が生成されました。デプロイ先を指定したので、`acrtest`ノードプールのノードにデプロイされていますね。

```shell
$ kubectl get pods -o wide
NAME                                          READY   STATUS    RESTARTS   AGE     IP            NODE                                NOMINATED NODE   READINESS GATES
jupyter-79c4469c65-c8hm6                      1/1     Running   0          2m10s   10.244.1.24   aks-nodepool2-20356098-vmss00001d   <none>           <none>
jupyter-artifact-streaming-5b58c9c797-pxs4l   1/1     Running   0          6s      10.244.2.5    aks-acrtest-29138108-vmss000000     <none>           <none>
```

`kubectl describe pod` コマンドの結果から、Events フィールドのメッセージを確認します。

`Pulling` イベントでは、`Streaming enabled for "{イメージ名}"` のようにメッセージが表示されており、Artifact Streaming が利用されていることが確認できます。

また、`Pulled` イベントでは、`Successfully pulled image "{イメージ名}" in 3.442267417s` のようにメッセージが表示されています。
およそ 3.44 秒ほどでイメージ Pull が完了しました！

```shell
$ kubectl describe pod jupyter-artifact-streaming-5b58c9c797-pxs4l
Name:             jupyter-artifact-streaming-5b58c9c797-pxs4l
  ...
Events:
  Type    Reason     Age        From                                                   Message
  ----    ------     ----       ----                                                   -------
  Normal  Pulling    <unknown>  acr-nodemon, kubelet, aks-acrtest-29138108-vmss000000  Streaming enabled for "{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest", upgraded to streaming artifact with digest "sha256:2cba83dae18f99b6c958e9e34421dadaeee0db1cde4adc0241180de80efd4f34", container started in 5s
  Normal  Scheduled  19s        default-scheduler                                      Successfully assigned default/jupyter-artifact-streaming-5b58c9c797-pxs4l to aks-acrtest-29138108-vmss000000
  Normal  Pulling    19s        kubelet                                                Pulling image "{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest"
  Normal  Pulled     15s        kubelet                                                Successfully pulled image "{ACR_NAME}.azurecr.io/jupyter/all-spark-notebook:latest" in 3.442267417s (3.442273818s including waiting)
  Normal  Created    14s        kubelet                                                Created container jupyter
  Normal  Started    14s        kubelet                                                Started container jupyter
```

Artifact Streaming を使わない場合では 1分25秒 ほど要したため、大幅に短縮されていますね！

### Artifact Streaming を削除するには？

`az acr artifact-streaming delete` というコマンドは存在しないようです。

作成した Artifact Streaming を削除したい場合には、リポジトリに存在するイメージ自体を削除します。
イメージの削除にともない Artifact Streaming も一緒に削除されます。

```shell
$ az acr repository delete -n {ACR_NAME} --repository jupyter/all-spark-notebook
```

### どのようなしくみなのか？

Artifact Streaming を使うと、なぜイメージ Pull の時間が短縮されるのでしょうか？

Artifact Streaming では、OverlayBD イメージ フォーマットというオープンソースのソリューションを利用しています。

> ご参考) containerd/overlaybd
> https://github.com/containerd/overlaybd

> ご参考) containerd/accelerated-container-image
> https://github.com/containerd/accelerated-container-image

OverlayBD は、アリババクラウドのコンテナーイメージ加速技術プロジェクト DADI で開発されました。

> DADI: Alibaba Cloud's Open-Source Accelerated Container Image Technology
> https://www.alibabacloud.com/blog/dadi-alibaba-clouds-open-source-accelerated-container-image-technology_597956

OverlayBD は、コンテナー イメージのレイヤーを仮想ブロック デバイスとして提供し、オーバーレイ ファイルシステムとしてマウントします。
コンテナーは、オーバーレイ ファイルシステムを通してイメージのデータにアクセスをします。
コンテナーの起動前にイメージ全体をダウンロードや展開することなく、必要なデータのみをネットワーク経由でオンデマンドに読み込むことができます。

ネットワーク ドライブに保存されたファイルを、手元のマシンに一度ダウンロードしてから開くのではなく、SMB/CIFS でマウントして直接開く様子に似ていますね。

Pod がデプロイされたノードにログインし、`df` コマンドを実行すると、出力結果の中に `io.containerd.snapshotter.v1.overlaybd` の文字列が含まれていることが確認できます。

```shell
root@aks-acrtest-29138108-vmss000000:/# df -h | grep overlaybd
/dev/sdc        252G  5.6G  234G   3% /var/lib/containerd/io.containerd.snapshotter.v1.overlaybd/snapshots/239/block/mountpoint
```

---

## さいごに

本記事では、Artifact Streaming の概要と、実際に AKS クラスターへコンテナーをデプロイした様子を紹介しました。
サイズの大きいコンテナー イメージを使用する Pod で起動時間を短縮したい場合に、利用を検討してみると良さそうです。

今回紹介しました Artifact Streaming が、今後の技術選定や AKS をよりご活用いただくうえでのご参考になりましたら幸いです。

Artifact Streaming は2023年12月現在、パブリック プレビューとして提供されております。ご利用いただきました際にお気づきの点やご要望などがございました際は、お気兼ねなくフィードバックいただけましたら幸いでございます。
また、AKS のご利用において、お困りの点やご不明点がありました際は、いつでも Azure サポートまでお気兼ねなくご相談ください。

---

最後まで読んでいただきありがとうございました！
[Microsoft Azure Tech Advent Calendar 2023](https://qiita.com/advent-calendar/2023/microsoft-azure-tech) は明日が最終日となります。是非ご覧くださいー！

本年は多くのお客様にお世話になりました。ありがとうございました。
来年もみなさまにとって素晴らしい年でありますように、心よりお祈り申し上げます。
