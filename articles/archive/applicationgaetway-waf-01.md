---
title: Application Gateway で利用できる WAF について
date: 2017-09-07 09:23:52
tags:
  - Archive
  - Application Gateway
  - WAF
---

皆さんこんにちは、Azure テクニカルサポートの平原です。
本日は、Application Gateway (以下 AppGW) で利用ができるようになった Web Application Firewall (以下 WAF) についてよくお問い合わせいただく内容についてご案内をいたします。


## ■ WAF でサポートされるルール
2017 年 9 月現在、AppGW で利用できる WAF は、OWASP と呼ばれるオンライン上の国際的なオープン コミュニティで議論されている OWASP ModSecurity Core Rule Set (CRS) を採用しています。

利用できるものは、バージョン 2.2.9 および 3.0 になりますが、それ以外の WAF コンポーネント等は現状は利用はできません。
また、ご利用をいただくユーザーの方は、OWASP ModSecurity CRS の中で定義されているルールの中から、必要なものを選んでご利用をいただくこともできます。
他の WAF コンポーネント等の導入は未定ですが、必要に応じて、新しいバージョンの CRS セットや他の WAF コンポーネント等は導入されるかと思います。


CRS で定義されている各種ルールについては、主に Trustwave 社及び開発者有志により開発されていますが、各ルールに関する情報ファイルは GitHub にて公開をされているので、こちらをご参照ください。

OWASP ModSecurity Core Rule Set (CRS) Project (Official Repository)
[https://github.com/SpiderLabs/owasp-modsecurity-crs](https://github.com/SpiderLabs/owasp-modsecurity-crs)

 
また、各種 CRS については、OWASP コミュニティ上でプロジェクトとして議論を深められ開発・検討されています。
マイクロソフトサポートでは AppGW 上の正常動作に関するご質問等はお受けしていますが、OWASP 側で制定している CRS ルールに関して踏み入ったご相談やアドバイスに関するサポートは提供しておりません。(コンサルティングサポートなど一部上位のサポート契約でご相談いただける場合もあります)
もし各種 CRS ルールに関する詳細などを確認されたい場合には、関連するメーリングリスト等にご相談いただくか、直接 GitHub で公開されているソースコード等をご参照ください。

OWASP ModSecurity Core Rule Set Project
[https://www.owasp.org/index.php/Category:OWASP_ModSecurity_Core_Rule_Set_Project](https://www.owasp.org/index.php/Category:OWASP_ModSecurity_Core_Rule_Set_Project)


## ■ 留意点
1. AppGW では、WAF 用の診断情報の収集が可能です。この診断情報を収集することで、ルールにより検知されたかどうかや、ブロックされたかどうかの確認が可能です。詳細については、以下をご参考ください。

   - Application Gateway のバックエンドの正常性、診断ログ、およびメトリック
   - [https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-diagnostics](https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-diagnostics)
   - Azure で提供する Log Analytics (OMS) の機能と連携することで、収集されたデータを容易に検索することなどが可能になります。詳細は、Log Analytics のドキュメントをご参照ください。

2. AppGW で WAF を利用の際には、パフォーマンスに気を付ける必要があります。
   WAF は到達する各 HTTP/HTTPS リクエストごとに処理が行われるため、リクエストのサイズ等で処理が大きく変わってきます。
   そのため、スループットの厳しい要件等がある場合には、利用にそぐわない場合もありますので、ご利用の際には十分ご検討いただき、必ず事前に実測データに近い形でパフォーマンスの検証を実施していただくことをお勧めします。
   
   もし Web サイトを Azure 仮想マシン等でホストしている場合には、サードパーティ製の WAF によって、直接 Web サーバー (IIS や Apache など) に適用できる WAF コンポーネントもあります。
   直接インストールをすることになるため、細かなカスタマイズも可能になる場合も多いので、もし必要がある場合はそちらもご検討ください。

3. AppGW 側の構成にて、適用できるルールは、カスタマイズができますが、OWASP Content Security Policy （ CSP ）の定義によって無効化などができず強制的に有効になるルールもあります。各種ルールの詳細につきましては、OWASP の各種定義をご参照ください。

4. AppGW で WAF を利用する場合には、AppGW 上のインスタンス サイズが M 以上のサイズが必要になります。
   また、WAF に特化した料金になりますので、ご留意ください。
   また、WAF が有効な場合に限りませんが、AppGW で SLA 適用の際には、2 つ以上のインスタンスでの運用が必要になります。
   - Application Gateway の価格
   - [https://azure.microsoft.com/ja-jp/pricing/details/application-gateway/](https://azure.microsoft.com/ja-jp/pricing/details/application-gateway/)


以上、参考になれば幸いです。