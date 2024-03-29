---
title: AKS に問題が発生した際にお寄せいただきたい情報について
date: 2022-10-13 09:00:00
tags:
  - Containers
  - Azure Kubernetes Service (AKS)
---

こんにちは、Azure テクニカル サポート チームの山下です。

今回は、ご利用いただいている AKS に問題（Pod に接続できない、Pending の状態となっている、等) が発生し、弊サポートチームにお問い合わせをいただく際に採取いただきたい情報についてご紹介します。
<!-- more -->

---
## はじめに
弊サポートチームでは、日々多くのお客様より AKS で発生した問題のご支援をしております。その際、状況の把握のためにいくつかのコマンドの実行をお願いしております。  
本記事では、お問い合わせ前にお客様にて情報採取を可能とすることや、コマンドの内容に齟齬が生まれないようにすることを目的として、実行いただくコマンドをご紹介いたします。  

---
## 必要な権限について
kubectl コマンドを実行し、各ネームスペースから関連するリソースを取得できる権限が必要になります。
具体的には、Kubernetes RBAC を使用している AKS クラスターであれば「Azure Kubernetes Service クラスター ユーザー ロール」、Azure RBAC を使用している AKS クラスターであれば「Azure Kubernetes Service RBAC 管理者」または「Azure Kubernetes Service RBAC クラスター管理者」の権限が必要となります。

> 参考）
> - [Azure Kubernetes Service (AKS) でのアクセスと ID オプション](https://learn.microsoft.com/ja-jp/azure/aks/concepts-identity)
> - [Azure ロールベースのアクセス制御を使用して、Azure Kubernetes Service (AKS) 内の Kubernetes 構成ファイルへのアクセス権を定義する](https://learn.microsoft.com/ja-jp/azure/aks/control-kubeconfig-access)


お客様にて何らかの異常を検知されたことでお問い合わせをいただいた際に、コマンドの実行をご案内したところ、お問い合わせいただいた方はコマンドを実行するための権限をお持ちではなかったため、情報の採取ならびに解決までにお時間を要してしまったケースも残念ながら過去に複数ございました。

そのような時に、「サポートの方で基盤から確認してもらえないか」「代わりにコマンドを実行して確認してもらえないか」といったご相談をいただくこともございました。

しかしながら、Azure ではお客様のデータを保護する観点から、我々サポートチームからお客様環境にコマンドを実行して取得する、といった仕組みがございませんため、そのようなご相談をお受けすることが残念ながら叶いません。  

正常性を監視されている方には必要な権限を付与していただく、または情報のご取得ができる方へのエスカレーションができるよう、緊急時のプロセスをお客様内で確立していただくことを予めご検討くださいますよう、何卒お願い申し上げます。

---
## 取得いただきたい情報
それでは問題が発生している AKS クラスターより情報を採取するためのコマンドを以下にご案内いたします。お問い合わせいただく際には、下記コマンドの実行結果とともに、どのリソース (Pod/Service 等) で問題が発生しているかをお寄せください。問題の内容によっては必ずしも必要ではない情報もございますが、本記事では多くの状況に対応するという観点で網羅的に記載しておりますので、冗長な点はご容赦頂ければ幸いです。  
実行した結果、何も出力されなかった場合や、kubectl コマンドの実行が失敗する場合には、その旨を弊サポートチームまでお知らせくださいますと幸いです。


```shell
kubectl get nodes -o wide > get_nodes.txt
kubectl describe nodes > describe_nodes.txt
kubectl get pod -A -o wide > get_pods.txt
kubectl describe pods -A > describe_pods.txt
kubectl get svc -A > get_svc.txt
kubectl describe svc -A > describe_svc.txt
kubectl describe ep -A > describe_ep.txt
kubectl get ingress -A -o yaml > ingress.yaml
kubectl get networkpolicy -A -o yaml > networkpolicy.yaml
kubectl logs <対象の pod 名> -n <pod の namespace> --timestamps=true > <pod 名>.log
kubectl logs <対象の pod 名> -n <pod の namespace> --timestamps=true -p > <pod 名>_p.log
```

---
### 補足事項
Azure Portal からお問い合わせをいただく際、ファイルを複数添付できないという制限がございます。ご提供いただく際には一つのファイルに圧縮したうえで添付いただく、もしくはお問い合わせ後に弊サポートチームよりお知らせするアップロードサイトにてご提供いただきますようお願い申し上げます。


本稿が少しでも皆様のご参考となれば幸いです。
