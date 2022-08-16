---
title: "TLS 証明書の更新に関するアナウンスの補足説明"
date: 2020-10-22 12:00:00 
tags:
  - Network
  - Certificate
---
※ 2020 年 10 月 22 日更新: Windows のルート証明書に関する FAQ を追記しました。

こんにちは、Azure テクニカル サポート チームの飯塚です。

現在、Microsoft Azure では以下の公開資料のとおり、TLS 証明書の更新についてのアナウンスメントを行っております。
- [Azure TLS certificate changes](https://docs.microsoft.com/en-us/azure/security/fundamentals/tls-certificate-changes)

更新の内容やそれに伴う影響、また殆どのお客様に対しては影響がないということについても、上記の公開資料にてご説明させていただいております。しかし、現在のところ資料が英語版のみの公開となっており、わかりづらい可能性があるかと思いますので、本ブログ記事にて補足説明をさせていただきます。

以下の内容が参考になれば幸いです。

<!-- more -->

## 通知の背景

Microsoft Azure では様々なサービスにおいて、クライアントからのセキュアなアクセスを実現するため、TLS (HTTPS) を用いたエンドポイントの公開を行っています。Azure のパブリック サービスに対して、https:// で始まる URL でアクセスする際、TLS が利用されています。

クライアントから TLS で Azure サービスにアクセスする際、TLS のネゴシエーションの過程で、Azure 側からサーバー証明書が提示され、クライアントがその正当性を検証する動作が行われます。これは Azure に限らず、TLS を用いたアクセスで広く一般的に行われている動作です。

現在、Azure の各パブリック サービスにおいて、このサーバー証明書を新しいものに更新する対応を行っています。当然、新しいサーバー証明書も公的に信頼されている証明書ですので、証明書の更新後も大半のクライアントでは特に対応の必要は生じず、引き続きサービスへのアクセスが可能です。

しかし、ごくまれに、クライアント側で信頼するサーバー証明書を限定している場合などがあり、そのような構成をとっているお客様においては、対応の必要が生じます。

そのような場合に備えて、サーバー証明書の更新があることと、その更新内容をアナウンスするに至っています。


## 証明書更新の内容

現在、Azure のほとんどのサービスでは、以下のルート証明機関から発行されたサーバー証明書を利用しています。

|コモン ネーム|拇印 (SHA1)|
| ---- | ---- |
|[Baltimore CyberTrust Root](https://cacerts.digicert.com/BaltimoreCyberTrustRoot.crt)|d4de20d05e66fc53fe1a50882c78db2852cae474|

今後、以下のいずれかのルート証明機関から発行された証明書に置き換えられていきます。

|コモン ネーム|拇印 (SHA1)|
| ---- | ---- |
|[DigiCert Global Root G2](https://cacerts.digicert.com/DigiCertGlobalRootG2.crt)|df3c24f9bfd666761b268073fe06d1cc8d4f82a4|
|[DigiCert Global Root CA](https://cacerts.digicert.com/DigiCertGlobalRootCA.crt)|a8985d3a65e5e5c4b2d7d66d40c6dd2fb19c5436|
|[Baltimore CyberTrust Root](https://cacerts.digicert.com/BaltimoreCyberTrustRoot.crt)|d4de20d05e66fc53fe1a50882c78db2852cae474|
|[D-TRUST Root Class 3 CA 2 2009](https://www.d-trust.net/cgi-bin/D-TRUST_Root_Class_3_CA_2_2009.crt)|58e8abb0361533fb80f79b1b6d29d3ff8d5f00f0|
|[Microsoft RSA Root Certificate Authority 2017](https://www.microsoft.com/pkiops/certs/Microsoft%20RSA%20Root%20Certificate%20Authority%202017.crt)|73a5e64a3bff8316ff0edccc618a906e4eae4d74|
|[Microsoft EV ECC Root Certificate Authority 2017](https://www.microsoft.com/pkiops/certs/Microsoft%20EV%20ECC%20Root%20Certificate%20Authority%202017.crt)|6b1937abfd64e1e40daf2262a27857c015d6228d|


## 想定される影響

冒頭に記載しましたように、特別な制御を行っていない一般的なクライアントの場合、証明書が公的に信頼されているものであれば、サーバー証明書が新しいものに変わっても、引き続きサービスへのアクセスが継続可能です。このため、ほとんどのお客様においては、今回の更新による影響は特に想定されません。

影響が生じるケースとしては、以下のようなものが考えられます。

### 1. サーバー証明書が変わる場合に、その証明書を信頼対象に加える必要があるようなアプリケーションをご利用の場合

もし、信頼する証明書を決め打ちでリスト化しているようなアプリケーションがある場合は、新しい証明書をリストに加えるような措置を行わないと、影響を受ける可能性があります。

たとえば、アプリケーションが影響を受けるかどうかを確認する方法として、ソースコードがある場合は、アプリケーションのソース コードを対象に、[現在の中間証明書](https://www.microsoft.com/pki/mscorp/cps/default.htm)のコモン ネームや拇印が含まれるかどうかを検索するといったものが考えられます。

もし、アプリケーションがサードパーティ製のものであれば、必要に応じてアプリケーションの開発ベンダーに確認いただければと思います。


### 2. OS レベルでルート証明書を信頼していない場合

クライアントがサーバー証明書を信頼するかどうかを判断する基準として、(OS とは独立した証明書管理を行うアプリケーションでない限り) クライアントの OS がもつ、信頼されたルート証明書のリスト情報が利用されます。

公開資料では、以下のとおり OS ごとの注意点についても言及しています (便宜上、Java の実行環境についても本項で言及しています)。

- Windows: 通常の環境であれば、信頼すべきルート証明書は自動的に更新され、今回更新される新しい証明書 (上記) も信頼対象となります。しかし、ネットワークから切り離して (Windows Update が行われない環境で) Windows を利用しているような場合は、ルート証明書の自動更新が行われず、上記の証明書が信頼対象にならないことがあります。Windows Update によるルート証明書の更新が行われないような環境で、Azure のパブリック サービスにアクセスしている場合は、手動で証明書を信頼対象に追加する対応が必要になることがあります。

- Linux: /etc/ssl/certs への証明書の追加が必要になる場合があります。詳細はご利用のディストリビューションのドキュメントを参照してください。

- Java: 上記の新しいルート証明書が信頼されていることを確認してください。

- Android: ご利用の Android バージョンのドキュメントを参照してください。


### 3. 新しいサーバー証明書の CRL 配布ポイントや OCSP へのアクセスができないような、ファイアウォールやプロキシーのルールが設定されている場合

クライアントが証明書の信頼性を検証する動作の中で、証明書の失効確認という動作が発生します。これは、サーバーから提示されたサーバー証明書が、証明機関によって失効されたものでないことを確認するプロセスです。証明書の失効確認ができない場合、クライアントはサーバーが正しいものかどうかが判断できず、エラーになるなどの影響が想定されます。

証明書の失効確認にあたっては、クライアントから CRL 配布ポイントや OCSP へアクセスができる必要があります。具体的には、以下の CRL 配布ポイントや OCSP へのアクセスが必要になります。

- http://crl3.digicert.com
- http://crl4.digicert.com
- http://ocsp.digicert.com
- http://www.d-trust.net
- http://root-c3-ca2-2009.ocsp.d-trust.net
- http://crl.microsoft.com
- http://oneocsp.microsoft.com
- http://ocsp.msocsp.com

もしファイアウォールやプロキシーで URL 単位のフィルタリングを行っているような場合は、上記へのアクセスができるようになっていることをご確認ください。


## 証明書変更のスケジュール
- Azure Active Directory: 2020 年 7 月 7 日から更新を開始しています。
- その他既存のエンドポイント: 2020 年 8 月 13 日から - 同年 10 月 26 日にかけて証明書の更新を進めています。
- 新規のエンドポイント: 新しい証明書が利用されます。

最終的に、2021 年 2 月 15 日までには従来のルート証明書は利用されなくなることが予定されております。

なお、Azure IoT Hub および DPS、Storage については引き続き従来のルート証明書が利用されるものの、中間証明書が変わることが予定されています。詳細は、IoT Hub および DPS については[こちら](https://techcommunity.microsoft.com/t5/internet-of-things/azure-iot-tls-changes-are-coming-and-why-you-should-care/ba-p/1658456)を、Storage については[こちら](https://techcommunity.microsoft.com/t5/azure-storage/azure-storage-tls-changes-are-coming-and-why-you-care/ba-p/1705518)をご確認ください。


##  FAQ
**Q. Application Gateway や Azure Front Door、Azure CDN、仮想マシンなどに対して、自分で証明機関から取得したサーバー証明書を適用している場合などは影響を受けるか？**

A. 特に影響は生じません。今回影響が発生するのは、Azure 側で発行・管理されているサーバー証明書のみです。

**Q. Windows における証明書ストアの「信頼されたルート証明機関」に、更新後のルート証明書の一部が含まれていないように見えます。このままだと、証明書の検証に失敗してアクセスができない状況になりますか？**

A. 「D-TRUST Root Class 3 CA 2 2009」「Microsoft RSA Root Certificate Authority 2017」「Microsoft EV ECC Root Certificate Authority 2017」などについて、一部の Windows において「信頼されたルート証明機関」に含まれていない、ということからお問い合わせをいただくことがあります。Windows においては、これらのルート証明書は、ルート証明書更新プログラムにより自動的にインストールされます。このため、現時点でルート証明書がインストールされていなくても問題ありません。

Windows では、TLS 通信の中でサーバーから提示された証明書の検証を行う過程で、その証明書のルート証明書がインストールされていない場合は、「ルート証明書更新プログラム」によって自動的にルート証明書が取得・インストールされる動作があります。ルート証明書更新プログラムによってインストールされるのは、あらかじめ信頼対象と定められた証明書のみですが、上記の証明書は、いずれも信頼対象になっています。

たとえば、Windows 8 / Windows Server 2012 以降の場合、以下で公開されている、信頼されたルート証明書のリストにアクセスして、証明書をインストールする処理がバックグラウンドで行われます。
- [http://ctldl.windowsupdate.com/msdownload/update/v3/static/trustedr/en/authrootstl.cab](http://ctldl.windowsupdate.com/msdownload/update/v3/static/trustedr/en/authrootstl.cab)

このため、今の時点でルート証明書がインストールされていなくても、必要になったタイミングで自動的に取得・インストールされ、TLS の通信が成立することが想定されます。