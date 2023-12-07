---
title: Proxy 環境下でのポイント対サイト接続 (P2S VPN) について
date: 2017-07-18 10:17:59
tags:
  - Archive
  - Network
  - VPN Gateway
---
> [!WARNING]
> 本記事は、投稿より時間が経過しており、**一部内容が古い可能性があります。**

こんにちは。Azure サポートの宇田です。

今回は、Proxy 環境下でポイント対サイト接続 (P2S VPN) を利用する場合の注意点についてご案内します。

## 概要

ポイント対サイト接続では、SSTP と呼ばれるプロトコルを利用して VPN 接続を行っており、TCP 443 番ポート (HTTPS) を使用しています。

このため、企業内のネットワークなど Proxy を使用している環境下では、以下のような設定を行わないと VPN 接続ができない事象が発生します。

* プロキシ サーバーの指定
* プロキシ サーバーでの VPN Gateway ならびに CRL へのアクセス許可

Proxy の使用有無や設定方法については、社内のネットワーク管理者様までご確認ください。

## ポイント対サイト接続でのアクセス先

ポイント対サイト接続を行うにあたっては、以下の URL に対してアクセスできる必要があります。

* VPN Gateway の FQDN
https://azuregateway-*.cloudapp.net/*
https://azuregateway-*.vpn.azure.com/*

* VPN Gateway が使用するサーバー証明書の CRL 配布ポイント (2017/07 以降に作成した VPN Gateway の場合)
http://crl3.digicert.com/*
http://crl4.digicert.com/*

なお、Windows OS では以下 2 種類の Proxy 設定が存在していますが、ポイント対サイト接続では、実際の VPN 接続 (SSTP での通信) には wininet モジュール側の Proxy 設定を、証明書の失効確認に winhttp モジュール側の Proxy 設定を参照しているため、注意が必要です。

* wininet モジュールの Proxy 設定 (ユーザーモード アプリケーション向けのモジュール)
* winhttp モジュールの Proxy 設定 (バックグラウンドで動作するサービス向けのモジュール)

wininet 側の Proxy 設定については Internet Explorer のプロキシ設定画面から、winhttp の Proxy 設定は管理者権限のコマンドプロンプトで以下のように設定ください。([参考リンク](https://jpdsi.github.io/blog/internet-explorer-microsoft-edge/ProxySettings/))

<pre>netsh winhttp set proxy proxy-server=”<プロキシ サーバー の IP アドレス or ホスト名>:<ポート番号>”</pre>

## 証明書の失効確認についての補足

ポイント対サイト接続では VPN Gateway とクライアント端末の双方で、互いに信頼できる接続先か証明書を用いて検証しています。

* VPN Gateway 側で自動生成されるサーバー証明書 (クライアント端末が VPN Gateywa を検証するための証明書)
* VPN 構成時にご用意いただくルート証明書 / クライアント証明書 (VPN Gateway が、接続元のクライアントを検証するための証明書)

2017 年 7 月以降に作成された VPN Gateway では、前述のとおり、前者のサーバー証明書について、digicert から発行された証明書が利用されています。証明書を利用する際は、有効な証明書か (期限切れや失効されていないか) を検証するため、クライアントから CRL 配布ポイントへのアクセスを行います。この際、Proxy の指定が適切に行われていない場合や、Proxy サーバー側でアクセスがブロックされた場合には、以下のような失効確認に失敗した旨のエラーが発生します。

> 失効サーバーがオフラインのため、失効の関数は失効を確認できませんでした。0x80092013

また、後者の証明書による検証に失敗した場合、エラー 798 が発生します。こちらについては、クライアント端末の適切な証明書ストアに証明書がインポートされていないことが原因で発生しますので、以下の投稿をあわせてご確認ください。

* [Azure ポイント対サイト接続における エラー798](https://jpaztech.github.io/blog/archive/p2s-vpn-error798/)

**(2018/03/29 追記)**
Windows OS の動作として、SSTP では認証が必要な Proxy サーバーの利用をサポートしておりません。このため、SSTP を利用している Azure のポイント対サイト接続につきましても、認証プロキシの利用はサポートされておりませんので、何卒ご了承ください。

* The Cable Guy The Secure Socket Tunneling Protocol
https://technet.microsoft.com/en-us/library/2007.06.cableguy.aspx
(抜粋)
SSTP does not support authenticated Web proxy configurations

**(2018/03/29 追記ここまで)**
