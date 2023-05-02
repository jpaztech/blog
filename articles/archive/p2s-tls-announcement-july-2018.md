--- 
title: ポイント対サイト VPN の TLS に関するアナウンス
date: 2023-05-02 18:30:00 
tags: 
  - Archive
  - Network
---

現在、Azure の仮想ネットワーク環境において、ポイント対サイト VPN 接続をご利用いただいているお客様向けに「対応が必要: Windows 7 および Windows 8 のポイント対サイト VPN クライアントを 2018年7月1日 までに更新してください」（Update Windows 7 and Windows 8 point-to-site VPN clients for PCI compliance）というタイトルのメールがお手元に届いているかと思います。こちらのメールの内容について、本ブログにて少し補足させていただきます。

なお、今回の変更は、あくまでポイント対サイト VPN 接続で利用される SSTP に影響を与えるものであり、サイト対サイト VPN 接続や Mac OS や Linux のポイント対サイト接続 VPNで使用されている IKE プロトコルには影響がございません。

</br>

## TLS 1.0 および 1.1 のサポート終了
ポイント対サイト VPN 接続で利用されている SSTP（Secure Socket Tunneling Protocol）では、その暗号化通信の機能として TLS を利用しています。

これまで、Microsoft では、より高いセキュリティで安心してシステムをご利用いただくため、段階的に TLS 1.2 への移行をお願いして参りました。Azure のポイント対サイト VPN 接続におきましても、より高いセキュリティでご利用いただくため、仮想ネットワーク ゲートウェイにて、以前より TLS 1.2 の利用を可能にするなどの取り組みを行ってきました。

この度、多くのお客様により安心してご利用いただくため、また、PCI（Payment Card Industry）基準に準拠するため、ポイント対サイト VPN 接続で利用される TLS において、TLS 1.0 および TLS 1.1 のサポートを終了し、TLS 1.2 のみをサポートするように変更することになりました。

ポイント対サイト VPN 接続のクライアントとして Windows 10 をご利用いただいているお客様におきましては、既定の状態で TLS 1.2 をサポートしているため、特に対処いただく必要はありません。

Windows 7 または Windows 8.1 をご利用いただいているお客様におきましては、TLS 1.2 を利用いただくために以下の更新プログラムを適用いただく必要があります。

- Microsoft の EAP 実装で TLS の使用を有効にする更新プログラム

  [マイクロソフト セキュリティ アドバイザリ: TLS の使用を可能にする Microsoft EAP 実装の更新プログラム (2014 年 10 月 14 日)](https://support.microsoft.com/ja-jp/help/2977292/microsoft-security-advisory-update-for-microsoft-eap-implementation-th)

- WinHTTP の既定の安全なプロトコルとして TLS 1.1 と TLS 1.2 を有効にする更新プログラム

  [WinHTTP が Windows での既定のセキュリティで保護されたプロトコルとして TLS 1.1 および TLS 1.2 を有効にする更新プログラム](https://support.microsoft.com/ja-jp/help/3140245/update-to-enable-tls-1-1-and-tls-1-2-as-a-default-secure-protocols-in)

</br>

[2018 年 8 月 20 日追記]

なお、上記の資料でも言及されておりますが、今回の変更に対応するには、更新プログラムの適用に加えて、レジストリの変更も必要になります。資料を参照してレジストリ エディタから変更いただくか、「管理者として実行」したコマンドプロンプトで以下の 3 つのレジストリ設定のコマンドを実行いただければ、対応が可能ですので、参考にしていただければと思います。

```
reg add HKLM\SYSTEM\CurrentControlSet\Services\RasMan\PPP\EAP\13 /v TlsVersion /t REG_DWORD /d 0xC00

reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\WinHttp" /v DefaultSecureProtocols /t REG_DWORD /d 0xaa0

if %PROCESSOR_ARCHITECTURE% EQU AMD64 reg add "HKLM\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Internet Settings\WinHttp" /v DefaultSecureProtocols /t REG_DWORD /d 0xaa0
```

</br>

## 暗号スイートの変更

また、今回の変更と併せて、ポイント対サイト VPN 接続の TLS で使用される暗号化スイートにも一部変更が生じます。具体的には、以下のアルゴリズムが利用できなくなります。

* RC4 (Rivest Cipher 4)
* DES (Data Encryption Algorithm)
* 3DES (Triple Data Encryption Algorithm)
* MD5 (Message Digest 5)
* SHA-1 (Secure Hash Algorithm 1)

この変更に伴いポイント対サイト VPN 接続のクライアントでは、暗号化アルゴリズムとして AES（AES128、AES192、AES256） 、ハッシュ アルゴリズムとして SHA-2（SHA256、SHA384）といったアルゴリズムが利用可能である必要が生じます。

ただし、ポイント対サイト VPN 接続でサポートされているWindows 7、Windows 8.1、Windows 10 においては、AES や SHA-2 を使った暗号化スイートが既定でサポートされているため、特に対処は必要ありません。

TLS 1.2 への移行に関しましては、こちらのブログでもご案内しておりますので、併せてご覧いただければと思います。

* [[IT 管理者向け] TLS 1.2 への移行を推奨しています](https://blogs.technet.microsoft.com/jpsecurity/2017/07/11/tlsmigration/)

</br>

## 本件に関する FAQ

**Q1. Windows 8.1 に「マイクロソフト セキュリティ アドバイザリ: TLS の使用を可能にする Microsoft EAP 実装の更新プログラム (2014 年 10 月 14 日)」（KB2977292）を適用しようとしたところ、「この更新プログラムはお使いのコンピューターには適用できません」と表示されます。_**

この更新プログラムを適用するには事前に以下の更新プログラムが適用されている必要があります。
Windows RT 8.1、Windows 8.1、および Windows Server 2012 R2 の更新プログラム: 2014 年 4 月
最新の Windows Update を適用した場合も、今回の TLS1.2 への変更に対応することができますので、弊社といたしましては最新の Windows Update を適用いただくことをお勧めいたします。

**Q2. Windows 8.1 / Windows Server 2012 R2用の「WinHTTP の既定の安全なプロトコルとして TLS 1.1 と TLS 1.2 を有効にする更新プログラム」が見つかりません。**

Windows 8.1 および Windows Server 2012 R2 への本モジュールの適用は不要です。

**Q3. 更新プログラムを適用後にそれぞれの手順に記載されたレジストリの変更は必要ですか。**

TLS1.2 を利用するには、更新プログラムを適用後、レジストリを変更いただく必要があります。

**Q4. VPN 接続ができないときに、この問題に合致しているかどうかをどのように判断できますか。**

この問題に合致すると、VPN 接続時のエラーコードとして「812」「0x80072746」「2147014842」が出ます (更新プログラムの適用状況などにより異なります)。このエラーコードとクライアントの Windows のバージョンが判断の目安になります。