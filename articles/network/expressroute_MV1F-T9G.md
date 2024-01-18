---
title: ExpressRoute 回線に対するマイクロソフト側エッジルーターにおけるレート制限に関する補足
date: 2024-01-17 00:00:00 
tags:
  - Network 
  - ExpressRoute 
  - FAQ
---
こんにちは、Azure テクニカル サポート チームです。 2024 年 1 月 17 日に ExpressRoute の使用に関するアナウンス Tracking ID MV1F-T9G (タイトル : We have important information for your ExpressRoute service ) が ExpressRoute をご利用中のお客様に送付されました。  
アナウンスされた内容は英語でのご案内であるため、この記事にて補足させていただきます。  
 
<!-- more -->

---

## ExpressRoute 回線に対するお客様による回線帯域幅の設定と、マイクロソフトによる流量制御の実施  
この度の通知以前から、お客様が ExpressRoute 回線リソースをご作成される際には 50 Mbps から 10 Gbps の間で回線帯域幅をご選択いただいております。この回線帯域幅は作成後にお客様にて増速することが可能です。この回線帯域幅はマイクロソフト側エッジルーターの割り当て済み帯域幅の計算に利用されております。<br>
2024 年 1 月 17 日 の Tracking ID MV1F-T9G (タイトル : We have important information for your ExpressRoute service ) の通知は、すべてのお客様がご契約済みの回線帯域幅をより公平にご利用いただくために、ExpressRoute 回線のマイクロソフト側エッジルーターにおいて流量制御を今後実施する旨をご案内しております。<br>
<br>
  
## マイクロソフトによる流量制御の有効化時期と、お客様において必要な作業  
2024 年 2 月 15 日から 6 月 30 日の間にかけて、Azure における標準的な変更管理プロセス(※)に則って、順次マイクロソフト側エッジルーターにおけるレート制限は有効化されます。
  
(※) [Advancing safe deployment practices | Microsoft Azure Blog](https://azure.microsoft.com/en-us/blog/advancing-safe-deployment-practices/)  
  
マイクロソフト側エッジルーターにおけるレート制限に際して、ほとんどのお客様において構成変更作業は発生いたしません。  
この流量制御の影響を受けるのは、お客様にてご選択済みの ExpressRoute 回線帯域幅を超える帯域幅をご利用になっているお客様のみであるためです。  
  
ご利用中の回線において実際に利用している帯域幅が、お客様にてご選択済みの ExpressRoute 回線帯域幅を下回っていることを確認するには、ExpressRoute 回線のメトリックをご利用ください。  
  
（参考ドキュメント）  
[Azure ExpressRoute： 監視、メトリック、およびアラート | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/expressroute/expressroute-monitoring-metrics-alerts#bits-in-and-out---metrics-per-peering)  
ビットのインとアウト - ピアリングごとのメトリック  

ご利用中の回線において実際に利用している帯域幅が、お客様にてご選択済みの ExpressRoute 回線帯域幅を上回っている場合、ご選択いただいた回線帯域幅の増速をご検討ください。  
ExpressRoute 回線帯域幅の増速にあたっては、お客様と ExpressRoute プロバイダー様の間でご契約いただいている回線帯域幅についても過不足がないかをご確認ください。  
<br>
  
## エッジルーターのレート制限に関わる FAQ
* Q: 流量制御機能が動作した場合、私の ExpressRoute 回線にどのような影響がありますか？<br>
* A: まず、ExpressRoute 回線の帯域幅を 50 Mbps とご選択いただいた場合、プライマリ回線とセカンダリ回線の両系統がそれぞれ 50 Mbps ご利用可能です。これは片系統のメンテナンスや障害が発生した場合でも、ご選択いただいた 50 Mbps が利用可能であり続けることを目的に構成されています。 <br>
この度有効となる流量制御は、各回線ごとに 50 Mbps を上回った場合に、パケットが破棄されるように動作します。
<br>
なお、レート制限の有効後も、両系統をアクティブ/アクティブ構成で均等にご使用されている場合に限れば、理論上は同回線で 2 倍の最大 100 Mbps まで一時的に「バースト」して利用いただけます。<br>
ただし、アクティブ/アクティブ構成の場合もメンテナンスや障害等で一時的に片系統が利用できない場合も考えられ、その場合の最大値は 50 Mbps となりますのでご注意いただければと存じます。<br>
<br>
* Q: なぜ流量制御を実施するのですか？<br>
* A: ごく一部のお客様において、ご選択いただいた回線帯域幅を上回る帯域の利用が恒常化しているためです。すべてのお客様が公平に帯域幅をご利用いただき続けるために、マイクロソフト側エッジルーターにおける流量制御を有効化することになりました。<br>
<br>
* Q: どのようにして ExpressRoute 回線帯域幅を増速することができますか？<br>
* A: Azure Portal より ExpressRoute 回線リソースの「構成」をご選択いただき、増速後の「帯域幅」をプルダウンからご選択のうえ、設定を「保存」してください。  
<br>

（参考ドキュメント）
[クイックスタート： ExpressRoute を使った回線の作成と変更 - Azure portal | Microsoft Learn](https://learn.microsoft.com/ja-jp/azure/expressroute/expressroute-howto-circuit-portal-resource-manager#modify)  
ExpressRoute 回線の変更  

* Q: 増速時にはどのくらいの時間が必要ですか？増速時に通信断は発生しますか？<br>
* A: 増速に伴う設定変更は数秒で完了します。この間にお客様の通信の切断は想定されていませんが、設定変更に伴う不測の事態の影響を回避するためにも、慎重を期してお客様のシステムのメンテナンス時間帯に増速することを推奨いたします。<br>
<br>
* Q: ExpressRoute 回線帯域幅を増速したあと、元の帯域幅に戻したくなった場合には同様の操作で戻せますか？<br>
* A: いいえ、帯域幅の減速には ExpressRoute 回線リソースの削除と再作成が必要となります。増速時と同様の操作で減速することはできません。また、ExpressRoute 回線リソースの削除から再作成までの間は ExpressRoute 回線経由の通信ができないため、お客様のシステムにおいて通信断が発生します。
<br>
<br>
<br>
本ブログが皆様のお役に立てれば幸いです。  