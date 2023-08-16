---
title: Azure Files はユーザー毎のマウントが必要です 
date: 2023-8-16 17:30:00
tags:
  - Windows
  - Azure Files
---

こんにちは、Azure テクニカル サポート チームの富田です。  
今回はタイトルの通り、Azure Files はユーザー毎のマウントが必要となっております点についてご案内させていただきます。  

お客様より「Windows 環境でユーザー A でマウントした Azure Files についてユーザー B より参照ができない。」というお問い合わせをいただくことがございます。  
こちらは仕様となっており、マウントを行ったユーザー以外のユーザーからは Azure Files のマウント先を参照できないものとなっております。  
そのためユーザー毎にマウントを行っていただく必要がございます点、ご留意くださいませ。

なお、IIS といったミドルウェアで Azure Files を参照させる場合は、System アカウントで Azure Files のマウントが必要な場合がございます。  
しかしながら、System アカウントでの Azure Files のマウントは永続化が叶いませんため、起動の度にマウントが必要となります点ご留意くださいませ。  

簡単ではございますが、Azure Files のマウントについて解説をさせていただきました。  
Azure Files 自体についての詳細は公式ドキュメントをご参照くださいませ。  

■ご参考：Azure Files とは  
https://learn.microsoft.com/ja-jp/azure/storage/files/storage-files-introduction