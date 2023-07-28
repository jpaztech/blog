---
title: イベント ログ Service Control Manage 7031 - RdAgent サービスの再起動について
date: 2023-7-28 17:30:00
tags:
  - VM
  - Windows
---

こんにちは。Azure テクニカル サポート チームの新見です。

Azure VM のゲスト OS 内から DNS サーバーの設定や ゲスト OS 自体の IP アドレスなどのようなネットワーク接続のプロパティを変更した際に、Azure VM への接続に失敗してしまったというお問い合わせをいただくことがあります。 
本記事では、Azure VM のゲスト OS 内からネットワーク接続のプロパティを変更することは非推奨であることと、変更してしまった場合の対処法と、推奨している手順についてご紹介いたします。 
  
# ゲスト OS からネットワーク接続のプロパティを変更することは非推奨 
 
以下公開資料にもございますように、 Azure VM ではゲスト OS 内部で DNS サーバーの設定や ゲスト OS 自体の IP アドレスなどのネットワーク接続のプロパティの設定は原則変更しないようお願いしています。 
  
>ご参考) [DNS サーバーの指定 ](https://docs.microsoft.com/ja-jp/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances#specify-dns-servers)
>ーーーーーーーーー抜粋ーーーーーーーーー
>DNS サーバーの IP などのネットワーク接続プロパティは、VM 内で直接編集しないでください。 
>これは、仮想ネットワーク アダプターを交換したときのサービス回復時にネットワーク接続プロパティが消去される可能性があるためです。 
>これは、Windows VM と Linux VM の両方に適用されます。 
>ーーーーーーーーーーーーーーーーーーーー
 
>ご参考) [Azure ネットワーク インターフェイスの IP アドレスの追加、変更、削除](https://docs.microsoft.com/ja-jp/azure/virtual-network/virtual-network-network-interface-addresses#private)
>ーーーーーーーーー抜粋ーーーーーーーーー
> 必要がない限り、仮想マシンのオペレーティング システム内のネットワーク インターフェイスの IP アドレスを手動で設定しないでください。 
>ーーーーーーーーーーーーーーーーーーーー 
 
Azure VM には、必ず 1 個以上のネットワーク インターフェイス(NIC) が接続されている必要があります。 
Azure VM のゲスト OS 側の NIC に設定される IP アドレスは、デフォルトで DHCP サーバーから Azure 側の NIC で指定した IP アドレスが割り振られるように設定されています。 
もし、Azure VM のゲスト OS 内でネットワーク接続のプロパティを変更した場合、Azure 側で保持している NIC のプロパティと整合性が取れなくなり、一切の通信が出来なくなることがあります。 
  
# ゲスト OS から直接設定を変更したことで接続不可となってしまった場合の対処策 
  
Azure VM のゲスト OS 内で ネットワーク設定の変更をしたことにより接続に失敗した際の対処法としては、まず、再起動をすることで解決する場合があります。 
 
再起動後も復旧しない場合は、一般的に NIC をリセットすることで復旧可能です。 
NIC リセットの手順は、以下の公開情報をご参照ください。 
  
ご参考) [Azure Windows VM のネットワーク インターフェイスをリセットする方法](https://learn.microsoft.com/ja-jp/troubleshoot/azure/virtual-machines/reset-network-interface)
  
# 推奨している DNS サーバーの変更手順 
  
DNS サーバーの設定は Azure 上で変更することで、自動的にAzure VM のゲスト OS 内の情報も変更されます。 
そのため、DNS サーバーの設定を変更する場合は、Azure 上で DNS サーバーを変更するようお願いいたします。 
DNS サーバーの設定変更の手順は、以下の公開情報をご参照ください。 
 
ご参考) [ネットワーク インターフェイスの作成、変更、削除 | DNS サーバーの変更](https://learn.microsoft.com/ja-jp/azure/virtual-network/virtual-network-network-interface?tabs=network-interface-portal#change-dns-servers)
  
# 推奨しているプライベート IP アドレスの変更手順 
 
プライベート IP アドレスも Azure 上で変更することで ゲスト OS 内の情報も変更されるため、Azure 上で変更するようお願いいたします。 
プライベート IP アドレスは、静的割り当てに変更することで、サブネットの範囲内での任意の IP アドレスを割り当てられます。 
同じネットワークに割り当てたいプライベート IP アドレスが存在する場合は指定できないので、割り当てられている VM のプライベート IP アドレスを予め別のものに変更するなどして対応いただくようお願いいたします。 
プライベート IP の設定変更の手順は、以下の公開資料をご参照ください。 
 
ご参考) [静的プライベート IP アドレスを持つ VM を作成する](https://docs.microsoft.com/ja-jp/azure/virtual-network/ip-services/virtual-networks-static-private-ip-arm-pportal#change-private-ip-address-to-static)
 
 
# さいごに 
  
この記事では、Azure VM のゲスト OS からネットワーク接続のプロパティを変更することが非推奨であることと、変更してしまった場合の対処法についてお伝えしました。 
接続失敗の発生を防ぐためにネットワーク接続のプロパティを変更したい場合は、原則 Azure 上から変更するようお願いします。 
本稿が少しでも皆様の一助となれば幸いです。 
 

