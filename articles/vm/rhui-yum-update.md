---
title: yum/dnf update に失敗する場合の原因と解決方法
date: 2022-02-01 11:00:00
tags:
  - VM
  - RHEL
  - Linux
  - RHUI
---

こんにちは！Azure テクニカル サポート チームの高橋です。
今回はよく、お問い合わせを頂く
Azure Marketplace から作成した Red Hat Enterprise Linux (RHEL) の仮想マシンにおいて
yum / dnf update やパッケージのインストールに失敗する場合の
よくある原因とその解決方法についてご紹介いたします。

<!-- more -->

---

## Azure RHUI (リポジトリ) とは？
Azure RHUI  (Red Hat Update Infrastructure) は、Azure Marketplace にある
Red Hat Enterprise Linux (RHEL) の従量課金 (PAYG) イメージから作成した VM を更新するために
提供されているリポジトリサーバーです。

Azure Marketplace から 作成した RHEL VM は、規定で Azure RHUI へのアクセスする構成が設定されているため
追加の設定は不要となります。
 
VM から、Azure RHUI にアクセスするためには、下記の IP アドレスに対する送信規則の 443 ポートの通信許可を設定する必要があります。
Azure RHUI の IP アドレスは下記公開ドキュメントにおまとめしておりますのでご確認ください。

>  □ 参考 : RHUI コンテンツ配信サーバーの IP アドレス
>    https://docs.microsoft.com/ja-jp/azure/virtual-machines/workloads/redhat/redhat-rhui#the-ips-for-the-rhui-content-delivery-servers

> [!IMPORTANT]
> ※Azure RHUI へのアクセスは、弊社バックボーンネットワーク経由にて接続されており、
> Azure VM から、オンプレミスのネットワークインフラストラクチャや、プロキシ、NVA (仮想アプライアンス) 経由でのアクセスはサポートされておらず、
> Azure VM から直接、Azure RHUI に接続する必要がある点に注意してください。

---

## Azure RHUI への接続確認

yum / dnf update やパッケージのインストールに失敗する場合、
Azure RHUI への接続ができていない可能性がございます。
Azure VM 内から、curl コマンド等を使うことで、Azure RHUI への接続状況を確認することができます。
下記のコマンドをお試しください。

```bash
    # curl -v https://rhui-1.microsoft.com:443
    # curl -v https://rhui-2.microsoft.com:443
    # curl -v https://rhui-3.microsoft.com:443
```

< 実行結果例 (成功時) >
```bash
    [root@rheltest ~]# curl -v https://rhui-1.microsoft.com:443
    * Rebuilt URL to: https://rhui-1.microsoft.com:443/
    *   Trying 52.187.75.218...
    * TCP_NODELAY set
    * Connected to rhui-1.microsoft.com (52.187.75.218) port 443 (#0)
    * ALPN, offering h2
    * ALPN, offering http/1.1
    * successfully set certificate verify locations:
    *   CAfile: /etc/pki/tls/certs/ca-bundle.crt
    CApath: none
    * TLSv1.3 (OUT), TLS handshake, Client hello (1):
    * TLSv1.3 (IN), TLS handshake, Server hello (2):
    * TLSv1.2 (IN), TLS handshake, Certificate (11):
    * TLSv1.2 (IN), TLS handshake, Server key exchange (12):
    * TLSv1.2 (IN), TLS handshake, Server finished (14):
    * TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
    * TLSv1.2 (OUT), TLS change cipher, Change cipher spec (1):
    * TLSv1.2 (OUT), TLS handshake, Finished (20):
    * TLSv1.2 (IN), TLS handshake, Finished (20):
    * SSL connection using TLSv1.2 / ECDHE-RSA-AES256-GCM-SHA384
    * ALPN, server did not agree to a protocol
    * Server certificate:
    *  subject: C=US; ST=WA; L=Redmond; O=Microsoft Corporation; CN=rhui-1.microsoft.com
    *  start date: Dec  7 11:14:49 2021 GMT
    *  expire date: Dec  2 11:14:49 2022 GMT
    *  subjectAltName: host "rhui-1.microsoft.com" matched cert's "rhui-1.microsoft.com"
    *  issuer: C=US; O=Microsoft Corporation; CN=Microsoft Azure TLS Issuing CA 01
    *  SSL certificate verify ok.
    > GET / HTTP/1.1
    > Host: rhui-1.microsoft.com
    > User-Agent: curl/7.61.1
    > Accept: */*
    >
    < HTTP/1.1 200 OK
    < Date: Mon, 24 Jan 2022 06:51:00 GMT
    < Server: Apache/2.4.6 (Red Hat Enterprise Linux)
    < X-Served-By: southeastasia-cds0
    < X-Content-Type-Options: nosniff
    < Last-Modified: Thu, 20 Jun 2019 06:37:48 GMT
    < ETag: "0-58bbb9592306b"
    < Accept-Ranges: bytes
    < Content-Length: 0
    < Connection: close
    < Content-Type: text/html
    <
    * Closing connection 0
    * TLSv1.2 (OUT), TLS alert, close notify (256):
```

< 実行結果例 (失敗時) > 
```bash
    [root@rhelvm ~]# curl -v https://rhui-1.microsoft.com:443
    * Rebuilt URL to: https://rhui-1.microsoft.com:443/
    *   Trying 52.187.75.218...
    * TCP_NODELAY set
    * connect to 52.187.75.218 port 443 failed: Connection timed out
    * Failed to connect to rhui-1.microsoft.com port 443: Connection timed out
    * Closing connection 0
    curl: (7) Failed to connect to rhui-1.microsoft.com port 443: Connection timed out
```

Azure RHUI への接続確認が失敗する場合には、NSG やプロキシ等のネットワーク設定を確認する必要がございます。
よくお問い合わせを頂くエラー原因と解決方法は、以下のようになります。

---

## エラーの原因その 1 : Azure RHUI への接続ができない (NSG)

セキュリティ上の理由から、Network Security Group (NSG) を利用して、
Azure VM からインターネットへのアクセスを制限を設定している場合がございます。
Azure portal から対象の仮想マシンを選択後、[ネットワーク] から確認することができます。
下記画像の例では、送信ポートの規則で、インターネットへの接続を拒否しています。

![](./rhui-yum-update/01.png)

本設定がある場合には、Azure RHUI への接続確認は、失敗することが想定され、
yum update を実施した際や、パッケージのインストール時にはタイムアウトエラーが発生します。

```bash
    [root@rhelvm ~]# yum update
    Red Hat Enterprise Linux 8 for x86_64 - BaseOS - Extended Update Support from RHUI (RPMs)                                                              0.0  B/s |   0  B     01:30
    Failed to download metadata for repo 'rhel-8-for-x86_64-baseos-eus-rhui-rpms'
    Error: Failed to download metadata for repo 'rhel-8-for-x86_64-baseos-eus-rhui-rpms'
```

![](./rhui-yum-update/02.png)

この場合の解決方法としては、Azure RHUI へアクセスできるように、
Azure RHUI サーバーの IP アドレスに対する送信規則の 443 ポートの通信許可を設定する必要があります。
下記画像の通り、"送信セキュリティ規則の追加" から、通信許可の設定を追加する必要があります。
また、優先度は、DenyInternet (インターネットへの制限規則) より高くする必要がある点にご注意ください。

![](./rhui-yum-update/03.png)

---

## エラーの原因その 2 : Azure RHUI への接続ができない (Proxy 等)

Azure VM から、オンプレミスのネットワークインフラストラクチャや、プロキシ、NVA (仮想アプライアンス) 経由での Azure RHUI へのアクセスはサポートされていないため、
Azure VM から直接、Azure RHUI に接続する必要があります。

この場合の解決方法としては、Azure VM が Azure RHUI の IP アドレスに直接接続できるようユーザー定義のルートテーブル UDR (User Defined Route) を作成する必要があります。
下記画像のように、RHUI コンテンツ配信サーバーの IP アドレス全てに対して、
次ホップ (Next hops) の種類に "Internet" を指定した UDR を作成頂く必要があります。

![](./rhui-yum-update/04.png)

Azure VM のルートテーブルの作成手順については、下記公開ドキュメントをご確認ください。
>   □ 参考 : ルート テーブルの作成、変更、削除 | ルートの作成
>	https://docs.microsoft.com/ja-jp/azure/virtual-network/manage-route-table#create-a-route-table


> [!TIP]
> ※プロキシの設定を実施している場合は、/etc/yum.conf 内の "proxy=" のプロキシ設定がないかご確認ください。
>   プロキシ設定があった場合、コメントアウト等で無効にしてください。

---

## エラーの原因その 3 : クライアント証明書の期限切れ
古い RHEL VM イメージを利用している際には、 TLS/SSL クライアント証明書の期限が切れているために、
Azure RHUI に接続できない問題が発生することがあります。
クライアント証明書の期限が切れた際には、yum update を実施した際に下記のようなエラーが出力されることがあります。

```bash
    [root@rhelvm ~]# yum update
    Loaded plugins: langpacks, product-id, search-disabled-repos
    rhui-microsoft-azure-rhel7-eus                                                                   | 2.1 kB  00:00:00
    https://rhui-1.microsoft.com/pulp/repos//content/dist/rhel/rhui/server/7/7Server/x86_64/dotnet/1/os/repodata/repomd.xml: [Errno 14] curl#58 - "SSL peer rejected your certificate as expired."
    Trying other mirror.
    https://rhui-2.microsoft.com/pulp/repos//content/dist/rhel/rhui/server/7/7Server/x86_64/dotnet/1/os/repodata/repomd.xml: [Errno 14] curl#58 - "SSL peer rejected your certificate as expired."
    Trying other mirror.
    https://rhui-3.microsoft.com/pulp/repos//content/dist/rhel/rhui/server/7/7Server/x86_64/dotnet/1/os/repodata/repomd.xml: [Errno 14] curl#58 - "SSL peer rejected your certificate as expired."
    Trying other mirror.
```

この場合の解決方法としては、下記コマンドを実施頂き、
クライアント証明書を更新頂くことで、Azure RHUI へのアクセスができるようになることが想定されます。

```bash
sudo yum update -y --disablerepo='*' --enablerepo='*microsoft*'
```

※本コマンドは、ruhi の rpm のみを更新するコマンドとなります。


> [!TIP]
> 解消しない場合には、下記コマンドも併せてお試しください
> 
> sudo yum clean all
> sudo yum makecache

---

## 補足情報

今回ご紹介した方法でも、事象が解消しない場合には、
yum repolist all コマンドを実行頂き、有効なリポジトリをご確認頂ければと思います。
 
カスタムイメージや、ゴールドイメージの BYOS イメージをご利用されている場合には、
RHSM や サテライトに接続する必要があります。
 
> □ 参考 : Azure のオンデマンド Red Hat Enterprise Linux VM 用 Red Hat Update Infrastructure
>	https://docs.microsoft.com/ja-jp/azure/virtual-machines/workloads/redhat/redhat-rhui

本稿が皆様のお役に立てれば幸いです。
