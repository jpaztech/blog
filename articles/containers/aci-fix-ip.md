---
title: Azure Container Instances に固定の IP アドレスを割り当てる以外の代替案
date: 2023-11-15 12:00:00
tags:
  - Containers
  - Azure Container Instances (ACI)
---

こんにちは。Azure テクニカル サポートチームのシンです。

Azure Container Instances (ACI) のサービスには、静的な IP アドレスを割り当てる (IP アドレスを固定する) 方法がございません。  
本記事では、IP アドレス固定化に代わる代替案についてご案内いたします。

<!-- more -->

---

## コンテナー インスタンスのネットワークの種類  
  
コンテナー インスタンスのネットワーク種類には、「パブリック」、「プライベート」、「なし」の3つがあります。

「パブリック」のネットワーク種類を選択した場合、コンテナーインスタンスの起動時に自動的にパブリックIPアドレスが生成されます。コンテナーインスタンスを停止すると、そのパブリックIPアドレスがリリースされます。コンテナーインスタンスタンスの起動時には、新しいパブリックIPアドレスが使用されます。

「プライベート」のネットワーク種類を選択した場合、コンテナーインスタンスは指定された仮想ネットワーク上にデプロイされ、その仮想ネットワーク上のプライベートIPアドレスが使用されます。コンテナーインスタンスを停止すると、プライベートIPアドレスがリリースされます。次回の起動時には、仮想ネットワーク上で利用可能なIPアドレスが自動的に割り当てられます。前回使用したプライベートIPアドレスと異なる可能性があります。

「なし」のネットワーク種類を選択した場合、パブリックIPアドレスもプライベートIPアドレスも生成されません。

> [!IMPORTANT]
>したがって、コンテナーインスタンスに割り当てられたパブリックIPアドレスやプライベートIPアドレスは、ACIの開始、起動もしくは再起動により変更されることがあります。  
>また、Azure Container Instances のサービスとしては、固定のアドレスを割り当てる方法は提供されていません。


一方で、お客様のシステム構成や要件により、コンテナーインスタンスが再起動しても同じIPアドレスでアクセスできるように実現したいというご要望があるかと存じます。以下にネットワークの種類ごとの代替案をご紹介します。


## [パブリック] ネットワーク種類について  

「パブリック」ネットワーク種類を選択する際には、DNS名ラベルを指定することが可能です。コンテナーインスタンスを作成する際にDNS名ラベルを指定すると、そのDNS名ラベルから始まるFQDN名が生成されます。パブリックIPの代わりに、このFQDN名を使用してアプリケーションにアクセスできます。  
DNS名ラベルの指定手順は、公開ドキュメントで紹介されています。ご確認くださいませ。  

> ご参考情報：Azure portalを使用してコンテナーインスタンスをAzure内にデプロイする  
> https://learn.microsoft.com/ja-jp/azure/container-instances/container-instances-quickstart-portal

> ご参考情報：Azure CLIを使用してコンテナーインスタンスをAzureにデプロイする  
> https://learn.microsoft.com/ja-jp/azure/container-instances/container-instances-quickstart


## [プライベート] のネットワーク種類について  

[プライベート] のネットワーク種類の場合、以下2つの代替案を挙げさせていただきます。

### 案1: コンテナー インスタンスの前段に Application Gateway を配置する

コンテナー インスタンスの前段に Application Gateway を配置し、コンテナー インスタンス側割り当てられたIPアドレスではなく、Application Gateway に割り当てられた静的 IP アドレスでアクセスします。  

> ご参考情報：コンテナー グループの静的 IP アドレス - Azure Container Instances | Microsoft Docs  
> https://learn.microsoft.com/ja-jp/azure/container-instances/container-instances-application-gateway


> [!IMPORTANT]
> コンテナー インスタンスの停止、起動もしくは再起動によりコンテナー インスタンスの IP アドレスが変更となった場合、手動でApplication Gateway のバックエンドの設定を更新する必要があります。  
> この仕組みを自動化したい場合は、Azure Automation などをご利用いただき、お客様にて自動化の仕組みをご構築いただく必要がございます。

### 案２: DNS 名でアクセスをする (コンテナー インスタンス起動時に DNS レコードを更新)  

IPアドレスの代わりに、外部から完全修飾ドメイン名 (FQDN) を利用して、コンテナー インスタンスへアクセスします。  
実現方法として、init コンテナーを使用します。Init コンテナーは、アプリケーション本体のコンテナーが実行される前に実行される、環境の初期化の用途などで使用されるコンテナーです。  
init コンテナーは、アプリケーション コンテナーに割り当てられている IP アドレスを取得し、Azure クライアントツールでコンテナーに到達するために使用される DNS エントリを更新します。 init コンテナーとアプリケーション コンテナーは同じネットワーク スタックを共有するため、init コンテナーから参照可能な IP アドレスは、アプリケーション コンテナーで使用されるアドレスと同じです。  
以下は、実現手順となります。


１、リソースグループやコンテナー インスタンスにデプロイされた仮想ネットワークを作成します。 

```shell
rg=myResourceGroup
aci_name=myaci
vnet_name=aci-vnet
az group create --name $rg --location japaneast
az network vnet create --resource-group $rg --name aci-vnet --address-prefixes 10.0.0.0/16 --subnet-name aci-subnet --subnet-prefix 10.0.0.0/24
aci_subnet_id=$(az network vnet subnet update --resource-group $rg --name aci-subnet --vnet-name $vnet_name   --delegations Microsoft.ContainerInstance/containerGroups  --query id -o tsv)
```

２、プライベート DNS ゾーンを操作するサービス プリンシパルを作成します。init コンテナーからは該当サービス プリンシパルを使用して、プライベート DNS ゾーンのレコードを更新します。  

```shell
scope=$(az group show -n $rg --query id -o tsv)
new_sp=$(az ad sp create-for-rbac --scopes $scope --role Contributor --name acilabsp -o json)
sp_appid=$(echo $new_sp | jq -r '.appId') && echo $sp_appid
sp_tenant=$(echo $new_sp | jq -r '.tenant') && echo $sp_tenant
sp_password=$(echo $new_sp | jq -r '.password')
```

３、init コンテナーで実行するスクリプトを作成し、該当スクリプトをAzure Filesにアップロードします。
init コンテナーは、該当スクリプトをAzure Filesからマウントします。コンテナー インスタンスを起動すると、メインコンテナーが実行される前に、init コンテナーで該当スクリプトが実行されます。 

```shell
# Create script for init container
storage_account_name="acilab$RANDOM"
az storage account create -n $storage_account_name -g $rg --sku Standard_LRS --kind StorageV2
storage_account_key=$(az storage account keys list --account-name $storage_account_name -g $rg --query '[0].value' -o tsv)
az storage share create --account-name $storage_account_name --account-key $storage_account_key --name initscript
init_script_filename=init.sh
init_script_path=/tmp/

cat <<EOF > ${init_script_path}${init_script_filename}
echo "Logging into Azure..."
az login --service-principal -u \$SP_APPID -p \$SP_PASSWORD --tenant \$SP_TENANT
echo "Finding out IP address..."
# my_private_ip=\$(az container show -n \$ACI_NAME -g \$RG --query 'ipAddress.ip' -o tsv) && echo \$my_private_ip
my_private_ip=\$(ifconfig eth0 | grep 'inet addr' | cut -d: -f2 | cut -d' ' -f 1) && echo \$my_private_ip
echo "Deleting previous record if there was one…"
az network private-dns record-set a delete -n \$HOSTNAME -z \$DNS_ZONE_NAME -g \$RG -y
echo "Creating DNS record..."
az network private-dns record-set a create -n \$HOSTNAME -z \$DNS_ZONE_NAME -g \$RG
az network private-dns record-set a add-record --record-set-name \$HOSTNAME -z \$DNS_ZONE_NAME -g \$RG -a \$my_private_ip
EOF

az storage file upload --account-name $storage_account_name --account-key $storage_account_key -s initscript --source ${init_script_path}${init_script_filename}

```

4、コンテナーの YAML 定義を作成します。 
```shell
# Create YAML
aci_yaml_file=/tmp/acilab.yaml
cat <<EOF > $aci_yaml_file
apiVersion: '2023-05-01'
location: $location
name: $aci_name
properties:
  subnetIds:
  - id: $aci_subnet_id
  initContainers:
  - name: azcli
    properties:
      image: mcr.microsoft.com/azure-cli:latest
      command:
      - "/bin/sh"
      - "-c"
      - "/mnt/init/$init_script_filename"
      environmentVariables:
      - name: RG
        value: $rg
      - name: SP_APPID
        value: $sp_appid
      - name: SP_PASSWORD
        secureValue: $sp_password
      - name: SP_TENANT
        value: $sp_tenant
      - name: DNS_ZONE_NAME
        value: $dns_zone_name
      - name: HOSTNAME
        value: $aci_name
      - name: ACI_NAME
        value: $aci_name
      volumeMounts:
      - name: initscript
        mountPath: /mnt/init/
  containers:
  - name: aci-helloworld
    properties:
      image: mcr.microsoft.com/azuredocs/aci-helloworld
      ports:
      - port: 80
        protocol: TCP
      resources:
        requests:
          cpu: 1.0
          memoryInGB: 1.5
  volumes:
  - name: initscript
    azureFile:
      readOnly: false
      shareName: initscript
      storageAccountName: $storage_account_name
      storageAccountKey: $storage_account_key
  ipAddress:
    ports:
    - port: 80
      protocol: TCP
    type: Private
  osType: Linux
tags: null
type: Microsoft.ContainerInstance/containerGroups
EOF
```

5、コンテナーインスタンスをデプロイします。
```shell
az container create -g $rg --file $aci_yaml_file
```

NginxアプリケーションをDNS名でアクセスする例も、以下のドキュメントに公開されています。 
> ご参考情報：サイドカー コンテナーを使用して Azure Container Instances をデプロイするDocs  
> https://learn.microsoft.com/ja-jp/training/modules/secure-apps-azure-container-instances-sidecar/4-deploy-sidecar


## さいごに
Application GatewayはOSIレイヤー7のロードバランサーとなりますので、コンテナー インスタンスの前段にApplication Gatewayを配置する案につきましては、コンテナー インスタンスを冗長化配置する場合でも、構成を変更することなく対応可能です。また、ロードバランサー機能以外にも、TLS終端などの機能も備えていますので、様々なシナリオに対応可能です。一方、Application Gatewayを追加することで、構成が複雑になる点は留意が必要です。  
DNS名でアクセスするという案については、コンテナーインスタンスとAzureプライベートDNSゾーン機能を利用すれば、シンプルに実現可能です。ただし、アプリケーションから完全修飾ドメイン名 (FQDN) でアクセス可能であることを考慮する必要があります。  


以上で、AzureコンテナーインスタンスIPを固定する代替案を紹介させていただきました。 本稿がお役に立てれば幸いです。
