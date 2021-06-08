---
title: 特定の AKS ノードを再起動または削除したい
date: 2021-02-10 12:00
tags:
  - Containers
  - Azure Kubernetes Service (AKS)
---

こんにちは- Azure テクニカルサポートチームの大野です。
今回は良くお問合せいただく内容として、特定の AKS ノードの再起動または削除についてご案内したいと思います。

## そもそもサポート外の操作ですか？

Azure Kubernetes Service (AKS) についてよく寄せられる質問でも下記の通り、サポートされない操作と記載があります。

  >[すべての VM を停止したり、その割り当てを解除したりできますか?](https://docs.microsoft.com/ja-jp/azure/aks/faq#can-i-stop-or-de-allocate-all-my-vms) より引用
  >
  >これは、直接 AKS のリソースの操作を行うことにより、AKS として管理している情報と不整合 (例えば、仮想マシ
  >ンを直接削除したが、AKS のノードとしてまだ残っている状態、等) が起きる恐れがあるため、このような記載が
  >されています。

これは、Azure のリソースを直接操作した場合に、AKS (Kubernetes) から見たときに情報の整合性が取れなくなるためになります。
ただ、特定のノードがおかしい等により再起動や削除されたいといったご要望があるかと思いますので、以下、実行例を交えて手順について纏めてみました。

なお、ノードの不調については、Azure 基盤の自動修復をはじめ、AKS の自動修復により改善されることがあります。
この話はまた別の機会にでも。

## 特定のノードを再起動

まずは、特定のノードを再起動する場合の操作手順になります。
流れとしては、以下になります。

1. 該当ノードからワークロードを退避し、新たに Pod がスケジュールされないように対象から除外
2. 再起動を実施
3. 該当ノードを再度 AKS クラスターのスケジュールに組み込むよう設定

---

1. 該当ノードからワークロードを退避し、新たに Pod がスケジュールされないように対象から除外

```shell
$ kubectl get nodes
NAME                                STATUS   ROLES   AGE   VERSION
aks-nodepool1-40771167-vmss000000   Ready    agent   24h   v1.18.10
aks-nodepool1-40771167-vmss000001   Ready    agent   24h   v1.18.10
aks-nodepool1-40771167-vmss000002   Ready    agent   24h   v1.18.10

# 対象ノードからワークロードを退避し、スケジュールから除外 (drain)
$ kubectl drain <ノード名> --ignore-daemonsets --delete-local-data --force

# 対象ノードが "SchedulingDisabled" になっていることを確認
$ kubectl get nodes
NAME                                STATUS                     ROLES   AGE     VERSION
aks-nodepool1-40771167-vmss000000   Ready,SchedulingDisabled   agent   4d17h   v1.18.10
aks-nodepool1-40771167-vmss000001   Ready                      agent   4d17h   v1.18.10
aks-nodepool1-40771167-vmss000002   Ready                      agent   4d17h   v1.18.10
```

2. 再起動を実施

```shell
# VMSS の場合
az vmss restart -g MC_labvmssaks_labvmssaks_japaneast -n aks-nodepool1-40771167-vmss --instance-ids 0

# 可用性セットの場合
az vm restart -g MC_labasaks_labasaks_japaneast -n aks-nodepool1-19417627-0
```

3. 該当ノードを再度 AKS クラスターのスケジュールに組み込むよう設定

```shell
$ kubectl uncordon aks-nodepool1-40771167-vmss000000
node/aks-nodepool1-40771167-vmss000000 uncordoned

# 対象ノードの STATUS が "Ready" になっていることを確認
$ kubectl get nodes
NAME                                STATUS   ROLES   AGE     VERSION
aks-nodepool1-40771167-vmss000000   Ready    agent   4d17h   v1.18.10
aks-nodepool1-40771167-vmss000001   Ready    agent   4d17h   v1.18.10
aks-nodepool1-40771167-vmss000002   Ready    agent   4d17h   v1.18.10
```

> [!WARNING]
> ノードを組み込んだ後に、Pod の配置の平滑化は行なわれることはありませんので、必要に応じて、[Descheduler](https://github.com/kubernetes-sigs/descheduler) 等による平滑化をご検討ください。

## 特定のノードを削除

特定のノードの削除時も ```kubectl drain``` により退避させてから行う点は同じになります。
加えて、```kubectl delete node``` により、Kubernetes におけるノードリソースの削除を行います。

1. 該当ノードからワークロードを退避し、新たに Pod がスケジュールされないように対象から除外
2. 該当ノードを AKS の管理情報から削除
3. 対象ノードやリソースを削除
4. 必要に応じてスケールアウトを実施

---

1. 該当ノードで稼働するワークロードを別のノードに退避

```shell
# 対象ノードを確認
$ kubectl get nodes
NAME                                STATUS   ROLES   AGE     VERSION
aks-nodepool1-40771167-vmss000000   Ready    agent   5d15h   v1.18.10
aks-nodepool1-40771167-vmss000001   Ready    agent   5d15h   v1.18.10
aks-nodepool1-40771167-vmss000002   Ready    agent   5d15h   v1.18.10

# 対象ノードからワークロードを退避し、スケジュールから除外 (drain)
$ kubectl drain aks-nodepool1-40771167-vmss000000 --ignore-daemonsets --delete-emptydir-data
```

2. 該当ノードを AKS の管理情報から削除

```shell
kubectl delete node aks-nodepool1-40771167-vmss000000
```

次にノードにあたる仮想マシン/仮想マシンスケールセット インスタンスや関連するリソースを Azure ポータルまたは CLI 操作により削除します。

3. 対象ノードやリソースを削除

```shell
# 可用性セットの場合 (AvailabilitySet)
$ az vm delete -g MC_LABASAKS_LABASAKS_JAPANEAST -n aks-nodepool1-19417627-0
Are you sure you want to perform this operation? (y/n): y
$ az network nic delete -g MC_labasaks_labasaks_japaneast -n aks-nodepool1-19417627-nic-0
$ az disk delete -g MC_LABASAKS_LABASAKS_JAPANEAST -n aks-nodepool1-19417627-0_OsDisk_1_17ecc8db96374f15a4b91dfc9ce17749
Are you sure you want to perform this operation? (y/n): y

# 仮想マシンスケールセットの場合 (VirtualMachineScaleSets)
az vmss delete-instances -g MC_labvmssaks_labvmssaks_japaneast -n aks-nodepool1-40771167-vmss --instance-ids 0
```


> [!WARNING]
> 上記のように Azure のリソースを削除しない場合に、スケーリング操作を行なうと、まだノードがあると認識され、正しくスケーリング操作が行なわれません。
>　
> 例えば、3台ノードがあった場合に、1台ノードを ```kubectl delete``` により削除後、Azure のリソースを削除を行わないで、スケールイン (2 台) を行なった場合、先のノードが存在すると認識され、別の仮想マシンまたは仮想マシンスケールセット インスタンスが削除されてしまいます。
>　
> そのため、本操作を実施される場合には、必ず Azure のリソースも併せて削除してください。

4. 必要に応じてスケールアウトを実施

最後に必要に応じまして、台数の調整を実施してください。

```shell
$ az aks scale -g labasaks -n labasaks --node-count 3
```

## PodDisruptionBudget による可用性の向上

```kubectl drain``` は内部で、Eviction (退避) API が呼ばれますが、この Eviction API は Pod を削除する動作となります。
(ReplicaSet を組んでいない Pod は単純に削除されることになります。)

  > [The Eviction API](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/#eviction-api) より引用
  >
  > The eviction subresource of a Pod can be thought of as a kind of policy-controlled DELETE operation on the Pod itself

そのため、連続してノードを Drain を実施されたとき、Pod がまだ正常に起動しておらず、サービス断が発生する恐れがあります。

PodDisruptionBudget 設定されておりますと、Eviction API が呼ばれたときに、設定された Pod 数の稼働状況を見て、Pod を削除するか判断されますので、ワークロードの可用性に考慮して設定いただければと思います。

  > ご参考情報
  > * [Safely Drain a Node - Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/)
  > * [Disruption - Kubernetess](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/)
  > * [ポッド中断バジェットを使用して可用性を計画する - Azure Kubernetes Service (AKS) での基本的なスケジューラ機能に関するベスト プラクティス](https://docs.microsoft.com/ja-jp/azure/aks/operator-best-practices-scheduler#plan-for-availability-using-pod-disruption-budgets)

<br>
以上で、特定のノードを再起動/削除する手順を紹介させていただきました。
本稿がお役に立てれば幸いです。
