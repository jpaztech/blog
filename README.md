# blog
日本マイクロソフト Azure IaaS Core サポート チームのブログです。
[https://jpaztech.github.io/blog/](https://jpaztech.github.io/blog/)

## Information
- [comming soon](./articles/information/)

## VM
- [Azure 上の Windows OS が起動しない場合の情報まとめ (2021 年 5 月 14 日更新版)](./articles/vm/windows-noboot-summary.md)
- [【管理ディスク編】 復旧 VM を使った Windows VM の Noboot 復旧手順](./articles/vm/noboot-recovery-managed-disk.md)
- [【非管理ディスク編】 復旧 VM を使った Windows VM の Noboot 復旧手順](./articles/vm/noboot-recovery-unmanaged-disk.md)
- [Azure 環境における Windows Server 2016 にて日本語の言語パック適用ができない](./articles/vm/win2016-jp-lpk-issue.md)
- [Azure VM からエクスポートした VHD ファイルを用いた複製 VM の作成方法](./articles/vm/create-vm-using-vhd.md)
- [VM 複製方法について part.1/3 2 つの方法の紹介](./articles/vm/vm-replica-1.md)
- [VM 複製方法について part.2/3 一般化したイメージから VM を複製する手順](./articles/vm/vm-replica-2.md)
- [VM 複製方法について part.3/3 OS ディスクのスナップショットから複製する手順](./articles/vm/vm-replica-3.md)
- [Tracking ID PLWV-BT0 と可用性について](./articles/vm/plwv-bt0.md)
- [リソース グループ名の大文字・小文字について](./articles/vm/resourcegroup-uppercase-lowercase.md)
- [Azure Windows VM で記憶域スペースを拡張する](./articles/vm/extend-storage-space-on-azure-windows-vm.md)
- [VM の再作成により可用性ゾーンを変更する (PowerShell 編)](./articles/vm/change-availability-zone-using-powershell.md)
- [一時ディスクのドライブ文字が変わる](./articles/vm/drive-letter-changed-2.md)
- [Windows ゲスト エージェント (WinGA) の再インストール方法](./articles/vm/re-install-windows-azure-guest-agent.md)
- [データ ディスクのドライブ文字が変わる](./articles/vm/drive-letter-changed-1.md)
- [Azure Linux VM の OS ディスク拡張方法](./articles/vm/linux-expand-os-disk.md)
- [Azure 環境における Windows Server 2019 の日本語の言語パック適用手順について](./articles/vm/win2019-jp-lpk.md)
- [リソース正常性（Resource Health）アラートの構成方法](./articles/vm/resource-health-alert.md)
- [Azure リソースの意図しない削除について](./articles/vm/resource-delete.md)

## Storage
- [Azure File Sync よくあるお問合せ - FAQ](./articles/storage/storageFileSyncFAQ.md)
- [403 エラーが発生し Azure ストレージ アカウント内のコンテンツにアクセスできない](./articles/storage/storageFirewall-403Error.md)

## Network
- [Azure Front Door を用いた App Service などへのセキュアな接続の構成](./articles/network/AzureFrontDoor-LockDown.md)
- [Azure Firewall の各ルールの動作について](f./articles/network/irewall-rules.md)
- [VPN Gateway よくあるお問合せ - FAQ](./articles/network/vpngw-FAQ1.md)
- [NSG と Azure Firewall の違い](./articles/network/difference-nsg-fw.md)
- [TLS 証明書の更新に関するアナウンスの補足説明](./articles/network/tls-certificate-update-2020.md)
- [VPN Gateway よくあるお問合せ - FAQ](./articles/network/vpngw-FAQ1.md)
- [VPN Gateway サービスにおける Azure テクニカル サポートの対応範囲](./articles/network/vpngw-support-policy.md)
- [ExpressRoute の Monthly Prefix Updates に関して](./articles/network/ExpressRoutePrefixRollout.md)
- [Bastion のサブネットに 適用する NSG の設定例](./articles/network/bastion-nsg.md/)
- [証明書の失効に関するアドバイザリ PVKM-5T8 の補足情報](./articles/network/20200716-net.md)
- [Azure CDN の各 SKU の特徴、トラブルシューティングの紹介](./articles/network/cdn-specific-sku.md)
- [Azure CDN の特徴やよくあるお問い合わせ、トラブル シューティングの紹介](./articles/network/cdn-common.md)
- [Azure VM の外部接続 (SNAT) オプション まとめ](./articles/network/snat-options-for-azure-vm.md)
- [Microsoft Peering 導入時の注意事項](./articles/network/considerations-of-microsoft-peering.md)
- [Microsoft ピアリングを経由するかどうかの確認方法](./articles/network/judge-via-ms-peering.md)
- [Application Gateway でサブネットを変更する方法](./articles/network/appgw_change_subnet.md)
- [Azure VM の外部接続 (SNAT) オプション まとめ](./articles/network/snat-options-for-auzre-vm.md)
- [NSG と Azure Firewall の違い](./articles/network/difference-nsg-fw.md)

## Containers
- [特定の AKS ノードを再起動または削除したい](./articles/containers/aks-maintenance-for-node.md)
- [AAD Pod Identity の使用例 - AKS の Pod にマネージド ID で Azure リソースへのアクセス権を割り当てる](./articles/containers/aks-aad-pod-identity.md)
- [AKS の送信トラフィック - Load Balancer SKU と SNAT オプション](./articles/containers/aks-load-balancer-sku-and-snat-options.md)

## OSS
- [comming soon](./articles/oss/)

## Other
- [Azure IaaS における有償 Azure テクニカル サポートの対応範囲](./articles/other/azure_technical_support_explained.md)
- [なぜ今サポートエンジニアが熱いか](./articles/other/technical_support_engineer_explained.md)

## TechNet Archives
- [Application Gateway の構成について](./articles/archive/about-application-gateway.md)
- [Application Gateway における 502 Error について](./articles/archive/application-gateway-502-error-info.md)
- [Application Gateway (WAF) での脆弱性検知について](./articles/archive/application-gateway-waf-vulnerability-detection.md)
- [Application Gateway で利用できる WAF について](./articles/archive/applicationgaetway-waf-01.md)
- [Application Gateway を PowerShell で設定変更するコツ](./articles/archive/powershell-applicationgateway-configuration.md)
- [Azure PowerShell 最新版のインストール手順 (v3.8.0 現在) **追記あり](./articles/archive/azure-powershell-3-8-0-install.md)
- [1 TB 以上のディスクを持つ VM の Azure Backup (Private Preview)](./articles/archive/backup-morethan-1tb-disk.md)
- [2016 年 9 月 15 日に発生した DNS の問題について](./articles/archive/dns-2016-09-16.md)
- [2017/10/31 に AzureBackup コンテナー (ASM) が、RecoveryServices コンテナー (ARM) にアップグレードされるお知らせ ](./articles/archive/upgrade-backup-container-asm2arm.md)
- [2017/12/9 以降 Azure VM の起動に時間がかかる事象についての対処方法](./articles/archive/take-time-to-boot-after20171209.md)
- [2018 年 1 月 4 日以降で Disk 11 のエラーが発生し MARS Agent バックアップが失敗する (0x8007045D)](./articles/archive/disk11-after20180104.md)
- [5 月のセキュリティ更新を適用後、Windows 仮想マシンに RDP 接続時にエラーが発生する事象の回避策](./articles/archive/mayupdate_unable-to-rdp.md)
- [’azurebox32.ico’ が必要です](./articles/archive/need-azurebox32-ico.md)
- [(PowerShell編) Azure仮想マシン (管理ディスク) の交換を活用して元のネットワークにリストアする](./articles/archive/restore-vm-by-swap-manageddisk.md)
- [ARMのWindowsでディスクやVMレベルでのIOスロットリングを監視・通知する方法](./articles/archive/monitor-io-throttoling-on-win-vm-arm.md)
- [ARM 環境から ARM 環境への仮想マシンの移行方法](./articles/archive/migration_arm_to_arm.md)
- [ASR レプリケーション有効化後ターゲット リソース グループ名が小文字で表示される。](./articles/archive/asrreplication_resourcedisplaynameissue.md)
- [Azure Automation： PowerShell Runbook で Azure VM の起動 / 停止（割り当て解除）](./articles/archive/automation-vm-start-deallocate.md)
- [Azure Automation： Runbook Webhook を使って仮想マシンの自動垂直スケール（スケールアップ / ダウン）](./articles/archive/automation-runbook-webhook.md)
- [Azure Automation で VM を自動停止する](./articles/archive/automation-vm-auto-deallocate.md)
- [Azure Load Balancer で IP フラグメンテーションは未サポート](./articles/archive/azure-load-balancer-ip-fragmentation.md)