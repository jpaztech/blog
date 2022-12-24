---
title: AKS で利用可能なオートスケールについて
date: 2022-12-24 12:00:00
tags:
  - Containers
  - Azure Kubernetes Service (AKS)
---

こんにちは！ Azure テクニカル サポート チームの川畑です。

Kubernetes を利用するにあたり、負荷に応じてワークロードを動的に増減させるオートスケーリングの構成を取ることがあります。 

この記事では、 Azure Kubernetes Service (AKS) を利用している環境を想定し、Pod およびノードのオートスケーリングの設定と動作についてご紹介します。 

<!-- more -->

---
## スケーリングとは？水平オートスケーラー (HPA)
スケーリングには、スケールアップ / スケールダウンとスケールアウト / スケール インの 2 種類があります。 

スケールアップは、垂直スケールとも呼ばれ、1 台あたりのコンピュート リソースを増やすことでシステムの性能を上げる手段となります。 
AKS では、AKS ノードとして利用している Azure 仮想マシンのサイズ (vCPU 数) を増やす、Pod に割り当てるリソース量を増やすなど、ノードや Podのコンピュート リソースを増やす方法が挙げられます。 

次に、スケールアウトは、水平スケールとも呼ばれ、コンピュート リソースは変えず、ノードの数や Pod のレプリカ数を増やすことでシステムの性能を上げる手段となります。 

これらのスケーリングの操作は、クラスターの利用者によって手動で実施される場合と、オートスケールの機能によって自動で実施される場合があります。 
表でまとめると次のような形となります。 

|   | 自動/手動  | 水平/垂直  | Pod/ノード |
| ------------ | ------------ | ------------ | ------------ |
| [水平オートスケーラー (HPA)](https://learn.microsoft.com/ja-jp/azure/aks/concepts-scale#horizontal-pod-autoscaler) | 自動 | 水平 | Pod|
| [クラスター オートスケーラー](https://learn.microsoft.com/ja-jp/azure/aks/cluster-autoscaler) | 自動 | 水平 | ノード |
| [KEDA](https://learn.microsoft.com/ja-JP/azure/aks/keda-about)<br />※2022.12.24 時点ではプレビュー | 自動 | 水平 | Pod |
| [垂直オートスケーラー (VPA)](https://learn.microsoft.com/ja-jp/azure/aks/vertical-pod-autoscaler)<br />※2022.12.24 時点ではプレビュー | 自動 | 垂直 | Pod |
| レプリカ数の定義変更 | 手動 | 水平 | Pod |
| [Azure CLI (az aks acale) / Azure Portal](https://learn.microsoft.com/ja-jp/azure/aks/scale-cluster?tabs=azure-cli) | 手動 | 水平 | ノード |
| [ノード プールのサイズ変更](https://learn.microsoft.com/ja-jp/azure/aks/resize-node-pool?tabs=azure-cli) <br /> 
※ドキュメントのタイトルは「変更」となっておりますが、新しいサイズでノードプールを作成・削除する手順となります。| 手動 | 垂直 | ノード |

今回はこれらの方法のうち、自動でスケーリング可能な水平オートスケーラー (HPA) とクラスター オートスケーラーについて紹介します。 

## Pod のオートスケーリング (HPA)
AKS では、Pod のレプリカ数を負荷に応じてスケーリングする Pod の水平オートスケーラー (HPA) を使用することが出来ます。 
HPA は、Kubernetes の標準 API リソースであり、AKS 固有の機能ではありません。 
そのため、HPA の内容に関しましては、下記 Kubernetes 公式ドキュメントの内容に準拠いたします。 

> ご参考情報：Horizontal Pod Autoscalerウォークスルー | Kubernetes 
> https://kubernetes.io/ja/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/ 

HPA では、ノード上のメトリクス情報を kubelet を経由して Kubernetes クラスター内に存在するメトリクス サーバーに収集します。
なお、このメトリクス サーバーは現時点でサポートされている AKS クラスターでは標準でデプロイされております。 

```shell 
$ kubectl get pods -n kube-system -l k8s-app=metrics-server
NAME                              READY   STATUS    RESTARTS   AGE
metrics-server-5f87fccc7d-724vf   2/2     Running   0          2d11h
metrics-server-5f87fccc7d-bl2d4   2/2     Running   0          2d11h
``` 

メトリクス サーバーは収集された情報より、Pod が使用している CPU やメモリ等のメトリクス情報に基づき Deployment、ReplicaSet または StatefulSet といったレプリケーション コントローラー内のPodのレプリカ数をスケーリングします。 

これによって、負荷に応じて Pod のレプリカ数が増減します。 

それでは、実際に AKS クラスターを利用して HPA の設定をします。 

### HPA の挙動を確認してみる 

ここでは、AKS のチュートリアルで利用されているサンプル アプリケーション (azure-vote) を用いて確認を行います。 
サンプル アプリケーションをローカル端末にクローンします。 

```shell 
$ git clone https://github.com/Azure-Samples/azure-voting-app-redis.git 
``` 

上記コマンドによってクローンされたマニフェスト ファイルを確認し、コンテナーにリソース要求が設定されていることを確認します。 
``` shell 
$ less ./azure-voting-app-redis/azure-vote-all-in-one-redis.yaml 
``` 

azure-vote-front コンテナーでは、次のようにリソース要求が設定されていることが確認できます。 
``` yaml 
      containers: 
      - name: azure-vote-front 
        image: mcr.microsoft.com/azuredocs/azure-vote-front:v1 
        ports: 
        - containerPort: 80 
        resources: 
          requests: 
            cpu: 250m 
          limits: 
            cpu: 500m 
``` 

上記リソース要求を確認すると、コンテナーをデプロイするために必要なリソースは、250 ミリ CPU であり、制限は 500 ミリ CPU となっていることが確認できました。
HPA では、対象のレプリケーション コントローラー内の Pod に設定された、リソース要求に対する使用率の平均を計算します。

それでは、当該 Pod をデプロイします。 
```shell 
$ kubectl apply -f ./azure-voting-app-redis/azure-vote-all-in-one-redis.yaml 
``` 

デプロイされた Pod を確認します。 
```shell 
$ kubectl get pods 
NAME                                READY   STATUS    RESTARTS   AGE 
azure-vote-back-5fb9656dff-6ln9w    1/1     Running   0          47s 
azure-vote-front-7589b695dd-wb7mq   1/1     Running   0          47s 
``` 

azure-vote-front の Pod が作成されていることを確認できました。 

それでは、ここから HPA の設定をします。 

HPA の設定は、HorizontalPodAutoscaler リソースを用いて定義することが可能となり、kubectl autoscale コマンドもしくは、マニフェスト ファイルを用いて作成することが可能となります。 

今回の検証では、Deplyoment “azure-vote-front” 内の全 Pod の平均 CPU 使用率が 50% を目標に、最小 3 台、最大 10 台まで Pod のレプリカ数を増減させるように設定します。 

この設定を kubectl autoscale コマンドにて実施する場合は、下記コマンドとなります。 
```shell 
$ kubectl autoscale deployment azure-vote-front --cpu-percent=50 --min=3 --max=10 
``` 

この HPA によって Deplyoment “azure-vote-front” 内の Pod のレプリカ数は最小 3 台となるため、先ほど確認した Pod のレプリカ数は 1 台でしたが、3 台に増えていることが確認できます。 
``` shell 
$ kubectl get pods -l app=azure-vote-front 
NAME                                READY   STATUS    RESTARTS   AGE 
azure-vote-front-7589b695dd-d7psh   1/1     Running   0          98s 
azure-vote-front-7589b695dd-km4hq   1/1     Running   0          98s 
azure-vote-front-7589b695dd-wb7mq   1/1     Running   0          11m 

$ kubectl get hpa 
NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS   AGE 
azure-vote-front   Deployment/azure-vote-front   2%/50%    3         10        3          110s 
``` 

想定どおり、Pod のレプリカ数が HPA の設定にしたがって Pod のレプリカ数が増えたことが確認できました。 

次に、Pod に負荷をかけることで、HPA によって Pod のレプリカ数が増えることを確認します。 
まずは、事前に現在の Pod の CPU 負荷状況を kubectl top pods コマンドを用いて確認します。 
``` shell 
$ kubectl top pods -l app=azure-vote-front
NAME                                CPU(cores)   MEMORY(bytes) 
azure-vote-front-7589b695dd-d7psh   1m           60Mi 
azure-vote-front-7589b695dd-km4hq   1m           58Mi 
azure-vote-front-7589b695dd-wb7mq   1m           45Mi 
``` 

現在の Pod の CPU 使用量が低い状況であることが確認できました。 
次に、CPU に負荷をかけるために、今回は stress コマンドを用います。 
```shell 
$ kubectl exec -it azure-vote-front-7589b695dd-d7psh -- stress -c 1 
stress: info: [330] dispatching hogs: 1 cpu, 0 io, 0 vm, 0 hdd 
``` 

stress コマンドによって、Pod “azure-vote-front-7589b695dd-d7psh” の CPU に負荷をかけ始めました。再度 kubectl top pods コマンドを用いて CPU の負荷状況を確認します。 
``` shell 
$ kubectl top pods -l app=azure-vote-front
NAME                                CPU(cores)   MEMORY(bytes) 
azure-vote-front-7589b695dd-d7psh   312m         65Mi 
azure-vote-front-7589b695dd-km4hq   1m           58Mi 
azure-vote-front-7589b695dd-wb7mq   1m           45Mi 
``` 

先ほど 2 ミリ CPU 程度であったのに対して、312 ミリ CPU 程リソースを消費していることが確認できました。 
ここで HPA の状況ならびに Pod の稼働状況を確認します。 
``` shell 
$ kubectl get hpa 
NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS   AGE 
azure-vote-front   Deployment/azure-vote-front   67%/50%   3         10        4          30m 

$ kubectl get pods -l app=azure-vote-front
NAME                                READY   STATUS    RESTARTS   AGE 
azure-vote-front-7589b695dd-4q79q   1/1     Running   0          101s 
azure-vote-front-7589b695dd-d7psh   1/1     Running   0          30m 
azure-vote-front-7589b695dd-km4hq   1/1     Running   0          30m 
azure-vote-front-7589b695dd-wb7mq   1/1     Running   0          39m 
``` 

stress コマンドを用いて CPU の負荷をかけたことによって、Pod のレプリカ数が 3 から 4 に増えたことが確認できました。 
最後に stress コマンドを停止し、増えた Pod が自動で削除されることも確認します。 
``` shell 
< - Control + Cキー によってプロセスを終了する 
command terminated with exit code 130 
``` 

再度 kubectl top pods コマンドを用いて CPU の負荷状況を確認します。 
``` shell 
$ kubectl top pods -l app=azure-vote-front
NAME                                CPU(cores)   MEMORY(bytes) 
azure-vote-front-7589b695dd-4q79q   1m           39Mi 
azure-vote-front-7589b695dd-d7psh   1m           65Mi 
azure-vote-front-7589b695dd-km4hq   1m           58Mi 
azure-vote-front-7589b695dd-wb7mq   1m           45Mi 
``` 

Pod “azure-vote-front-7589b695dd-d7psh” の CPU 使用量が減少したことが確認できました。 
その後、しばらくした後に、次のように Pod のレプリカ数が最小の 3 に戻ることが確認できます。 

``` shell 
$ kubectl get hpa 
NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS   AGE 
azure-vote-front   Deployment/azure-vote-front   0%/50%    3         10        4          38m 

$ kubectl get hpa 
NAME               REFERENCE                     TARGETS   MINPODS   MAXPODS   REPLICAS   AGE 
azure-vote-front   Deployment/azure-vote-front   0%/50%    3         10        3          38m 

$ kubectl get pods 
NAME                                READY   STATUS    RESTARTS   AGE 
azure-vote-front-7589b695dd-d7psh   1/1     Running   0          39m 
azure-vote-front-7589b695dd-km4hq   1/1     Running   0          39m 
azure-vote-front-7589b695dd-wb7mq   1/1     Running   0          48m 
``` 

このように HPA を利用することで、Pod の負荷状況に応じて Pod のレプリカ数を自動で増減可能なことを確認しました。 


## クラスター オートスケーラーについて 
AKS では、ノードをオートスケールするための機能として、クラスター オートスケーラーが提供されています。 
クラスター オートスケーラーを利用することで、新規 Pod がデプロイ可能な空きノードが不足し、Pending (割り当て不可) 状態となった際にノードである Azure 仮想マシンの数を自動で増減することが可能となります。 
これによって、Pod のデプロイに必要なノード数のみ稼働させることで、コストの最適化などが期待されます。 

> [!IMPORTANT]
> クラスター オートスケーラーは、CPU やメモリ等のリソースの使用率を監視し自動でスケールする機能ではありません。
> 新規 Pod がデプロイ可能な空きノードが不足し、Pending (割り当て不可) 状態となった際に自動でスケールアウトする機能となります。

> [!WARNING]
> AKS のクラスター オートスケーラーを利用する場合、VMSS のオートスケール機能を有効にしないでください。
> AKS では、VMSS などの IaaS リソースの API を用いて直接変更することはサポート外となります。
> いずれの機能も有効にした場合は、 VMSS へ直接変更を加えたことにより、AKS クラスターがサポートされない状態になる恐れや、2 つのオートスケ
ールの処理が競合することで、ノードの増減が想定通りに動作しない可能性がございます。
> > ご参考情報：エージェント ノードのユーザー カスタマイズ
> > https://learn.microsoft.com/ja-jp/azure/aks/support-policies#user-customization-of-agent-nodes
> > ご参考情報： AKS クラスターの作成とクラスター オートスケーラーの有効化
> > https://learn.microsoft.com/ja-jp/azure/aks/cluster-autoscaler#create-an-aks-cluster-and-enable-the-cluster-autoscaler
 

そのため、適切にクラスター オートスケーラーを利用するためには、各 Pod に適切なリソース要求を設定することが重要となります。 

それでは、実際に AKS クラスターを利用してクラスター オートスケーラーの挙動を確認します。 

### クラスター オートスケーラーの挙動を確認してみる 

クラスター オートスケーラーの挙動を確認するにあたり、まずはユーザー ノードプールを追加します。 
ここでは、ノード数が 1、仮想マシンのサイズが Standard_DS2_v2 (2vCPU, 7GiB) のノード プールを追加します。 
```shell 
$ az aks nodepool add \​ 
    --resource-group <リソースグループ名> \​ 
    --cluster-name <クラスター名> \​ 
    --name usernp1 \​ 
    --node-count 1 \​ 
    --mode User \​ 
    --node-vm-size Standard_ DS2_v2 \​ 
    --labels nodelabel=catest​ 
``` 

追加されたノードの情報を確認します。 
```shell 
$ kubectl get nodes 
NAME                                STATUS   ROLES   AGE     VERSION 
aks-nodepool1-12285779-vmss000000   Ready    agent   4h14m   v1.24.6 
aks-nodepool1-12285779-vmss000001   Ready    agent   4h13m   v1.24.6 
aks-nodepool1-12285779-vmss000002   Ready    agent   4h13m   v1.24.6 
aks-usernp1-70474131-vmss000000     Ready    agent   3m      v1.24.6 

$ kubectl describe node aks-usernp1-70474131-vmss000000 
<中略> 
Allocatable: 
  cpu:                1900m 
  ephemeral-storage:  119703055367 
  hugepages-1Gi:      0 
  hugepages-2Mi:      0 
  memory:             4670956Ki 
  pods:               110 
<中略> 
``` 

ノードが追加されていることを確認しました。 
それでは、このノード プールにリソース要求を設定した Pod をデプロイするために、Deployments のマニフェスト ファイルを作成します。 
```shell 
$ cat << EOF >> ca-test-pod.yaml 
apiVersion: apps/v1 
kind: Deployment 
metadata: 
  name: nginx 
spec: 
  replicas: 2 
  selector: 
    matchLabels: 
      app: nginx 
  template: 
    metadata: 
      labels: 
        app: nginx 
    spec: 
      nodeSelector: 
        nodelabel: catest 
      containers: 
      - name: nginx 
        image: nginx 
        resources: 
          requests: 
            cpu: 100m 
            memory: 2.5Gi 
EOF 
``` 

上記定義によって、nodelabel キーにcatest を持つノードにのみ nginx Pod が配置されます。これによって、他のノードに Pod がデプロイされることを防げます。 
それでは、このマニフェスト ファイルに従い、Deployment を作成します。 
```shell 
$ kubectl apply -f ca-test-pod.yaml 
deployment.apps/nginx created 

$ kubectl get pods -o wide 
NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE                              NOMINATED NODE   READINESS GATES 
nginx-67d6486785-7rj7r   0/1     Pending   0          18s   <none>       <none>                            <none>           <none> 
nginx-67d6486785-hfcmw   1/1     Running   0          18s   10.244.3.5   aks-usernp1-70474131-vmss000000   <none>           <none> 
``` 

Pod “nginx-67d6486785-7rj7r” が Pending 状態であることが確認できました。 原因を確認します。 
```shell 
$ kubectl describe pod nginx-67d6486785-7rj7r 

<中略> 
Events: 
  Type     Reason            Age    From               Message 
  ----     ------            ----   ----               ------- 
  Warning  FailedScheduling  2m54s  default-scheduler  0/4 nodes are available: 1 Insufficient memory, 3 node(s) didn't match Pod's node affinity/selector. preemption: 0/4 nodes are available: 1 No preemption victims found for incoming pod, 3 Preemption is not helpful for scheduling. 
``` 

このメッセージは、クラスター内の全 4 台のノードのうち、1 ノードはメモリの空き容量が不足しており、他 3 ノードがセレクターを満たさず、Pod をスケジューリング可能なノードが見つからなかったことを示します。 

これによって、ノード プール “usernp1” では、リソースの不足に伴い Pod が Pending となる状況となりました。 

 

この状態で、ノード プール “usernp1” に対して、クラスター オートスケーラーを有効にします。 
```shell 
$ az aks nodepool update \
  --resource-group <リソースグループ名> \ 
  --cluster-name <クラスター名> \ 
  --name usernp1 \​ 
  --enable-cluster-autoscaler \​ 
  --min-count 1 \​ 
  --max-count 3 
``` 

クラスター オートスケーラーを有効化したので、ノードが追加されていることを確認します。 
```shell 
$ kubectl get nodes 
NAME                                STATUS   ROLES   AGE     VERSION 
aks-nodepool1-12285779-vmss000000   Ready    agent   4h47m   v1.24.6 
aks-nodepool1-12285779-vmss000001   Ready    agent   4h47m   v1.24.6 
aks-nodepool1-12285779-vmss000002   Ready    agent   4h46m   v1.24.6 
aks-usernp1-70474131-vmss000000     Ready    agent   36m     v1.24.6 
aks-usernp1-70474131-vmss000001     Ready    agent   34s     v1.24.6 

$ kubectl get pods -o wide 
NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE                              NOMINATED NODE   READINESS GATES 
nginx-67d6486785-7rj7r   1/1     Running   0          14m   10.244.4.2   aks-usernp1-70474131-vmss000001   <none>           <none> 
nginx-67d6486785-hfcmw   1/1     Running   0          14m   10.244.3.5   aks-usernp1-70474131-vmss000000   <none>           <none> 
``` 

期待どおりノード プール “usernp1” に新規ノード “usernp1-70474131-vmss000001”が作成され、Pod “nginx-67d6486785-7rj7r” がデプロイされていることが確認できました。 

最後に Pod のレプリカ数を 1 に減らし、ノードが自動削除されることを確認します。 
マニフェスト ファイルを修正し、Pod のレプリカ数を 1 に減らした後に、再度マニフェスト ファイルを適用します。 

```shell 
$ kubectl apply -f ca-test-pod.yaml 
deployment.apps/nginx configured 
``` 

これによって、Pod のレプリカ数およびノードが減っていることを確認します。 
```shell 
$ kubectl get pods -o wide 
NAME                     READY   STATUS    RESTARTS   AGE   IP           NODE                              NOMINATED NODE   READINESS GATES 
nginx-67d6486785-hfcmw   1/1     Running   0          19m   10.244.3.5   aks-usernp1-70474131-vmss000000   <none>           <none> 

$ kubectl get nodes 
NAME                                STATUS   ROLES   AGE    VERSION 
aks-nodepool1-12285779-vmss000000   Ready    agent   5h3m   v1.24.6 
aks-nodepool1-12285779-vmss000001   Ready    agent   5h3m   v1.24.6 
aks-nodepool1-12285779-vmss000002   Ready    agent   5h3m   v1.24.6 
aks-usernp1-70474131-vmss000000     Ready    agent   52m    v1.24.6 
``` 

このように クラスター オートスケーラーを利用することで、ノード上のリソース不足が原因で Pending となった Pod が発生した際にノード プール内のノードの数を自動で増え、リソースの使用率が低下した際にノードの数が自動で減ることが確認できました。


### さいごに 
この記事では、HPA とクラスター オートスケーラーによる Pod とノードのオートスケーリングのしくみについて、サンプル アプリケーションを例にご紹介しました。設定した条件に応じて、自動でスケールアウトされることが確認いただけたかと思います。 
こういったオートスケールの設定を適切にお使いいただくことで、お客様のワークロードの可用性を高めることができるかと存じますので、ご参考にいただけますと幸いです。 

本稿が皆様のお役に立ちましたら幸いです。 

最後まで読んでいただきありがとうございました！ 