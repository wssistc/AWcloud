"use strict"
export default function httpConfig($httpProvider){
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }    
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
        $httpProvider.interceptors.push([
            "$q", "$rootScope", "API_HOST", "$translate","$location","$timeout","APILOADING",
            function(q, $rootScope, api_host, $translate,$location,$timeout,APILOADING) {
                var apiReq=0;
                var apiRes=0;
                var apiResTime = null;
                function checkLoading(api,url){
                    var isEnle=true;
                    for(var i=0;i<APILOADING.exclude.length;i++){
                        var cur = new RegExp(APILOADING.exclude[i]);
                        if(cur.test(url)){
                            isEnle = false;
                            break;
                        }
                    }
                    if(isEnle){
                        APILOADING[api]+=1;
                        if(api=="reqNum"){
                           $timeout(function(){
                                //$rootScope.apiLoading = true;
                            },0) 
                        }else{
                            $rootScope.apiLoading = false;
                        }
                    }
                }
                return {
                    request(config) {
                        var user_url,loginData,bill_url,ass_url,schedule_url;
                        if (config.url.indexOf("awstack-resource") > -1) {
                            var res_url = config.url.split("awstack-resource");
                            config.url = api_host.RESOURCE + res_url[1];
                            if(!config.headers.project_id){
                                config.headers["domain_id"] = localStorage.domainUid;
                                config.headers["domain_name"] = encodeURI(localStorage.domainName);
                                config.headers["project_id"] = localStorage.projectUid;
                                config.headers["project_name"] = encodeURI(localStorage.projectName);
                            }
                            config.headers["X-Register-Code"] =config.headers["X-Register-Code"]?config.headers["X-Register-Code"]:localStorage.regionKey;
                        } else if (config.url.indexOf("awstack-user") > -1) {
                            user_url = config.url.split("awstack-user");
                            config.url = api_host.BASE + user_url[1];
                            config.headers["X-Register-Code"] =config.headers["X-Register-Code"]?config.headers["X-Register-Code"]:localStorage.regionKey;
                        } else if (config.url.indexOf("awstack-monitor") > -1) {
                            user_url = config.url.split("awstack-monitor");
                            loginData = JSON.parse(localStorage.$LOGINDATA);
                            config.url = api_host.MONITOR + user_url[1];
                            config.headers["enterprise_id"] = loginData.enterpriseUid;
                            config.headers["domain_id"] = localStorage.domainUid;
                            config.headers["domain_name"] = encodeURI(localStorage.domainName);
                            config.headers["project_id"] = localStorage.projectUid;
                            config.headers["project_name"] = encodeURI(localStorage.projectName);
                            config.headers["X-Register-Code"] =config.headers["X-Register-Code"]?config.headers["X-Register-Code"]:localStorage.regionKey;
                        } else if (config.url.indexOf("awstack-log") > -1) {
                            user_url = config.url.split("awstack-log");
                            config.url = api_host.LOG + user_url[1];
                        } else if (config.url.indexOf("awstack-workflow") > -1) {
                            user_url = config.url.split("awstack-workflow");
                            config.url = api_host.WORKFLOW + user_url[1];
                        } else if (config.url.indexOf("awstack-qcloud") > -1) {
                            user_url = config.url.split("awstack-qcloud");
                            config.url = api_host.QCLOUD + user_url[1];
                            loginData = JSON.parse(localStorage.$LOGINDATA);
                            // config.headers["enterprise_id"] = loginData.enterpriseUid;
                            // config.headers["SecretId"] = "AKIDiZmewrsxa4QUlvvl88GCOwu1HwxYgcdQ";
                            // config.headers["SecretKey"] = "nVxuziSQy9yKoJbI3gtR7nqOvuuVPbwX";
                            //config.headers["region"] = localStorage.q_Region;
                        } else if (config.url.indexOf("awstack-vmware") > -1) {
                            user_url = config.url.split("awstack-vmware");
                            config.url = api_host.VMWARE + user_url[1];
                        }
                        else if(config.url.indexOf("awcloud-boss") > -1){
                            bill_url = config.url.split("awcloud-boss");
                            config.url = api_host.BILL + bill_url[1];
                        }
                        else if(config.url.indexOf("awstack-boss") > -1){
                            loginData = JSON.parse(localStorage.$LOGINDATA);
                            bill_url = config.url.split("awstack-boss");
                            config.url = api_host.BILL + bill_url[1];
                            config.headers["enterpriseId"] = loginData.enterpriseUid;
                            config.headers["enterpriseName"] = loginData.enterpriseLoginName;
                        }
                        else if(config.url.indexOf("awstack-ass") > -1){
                            ass_url = config.url.split("awstack-ass");
                            config.url = api_host.ASS + ass_url[1];
                        }
                        else if(config.url.indexOf("awstack-schedule") > -1){
                            config.headers["project_id"] = localStorage.projectUid;
                            schedule_url = config.url.split("awstack-schedule");
                            config.url = api_host.SCHEDULE + schedule_url[1];
                        }else if(config.url.indexOf("awstack-wechat") > -1){
                            user_url = config.url.split("awstack-wechat");
                            config.url = api_host.WECHAT + user_url[1];
                        }
                        let auth_token = "";
                        if(config.url.indexOf("awstack-qcloud") > -1){
                            auth_token = localStorage.$QCLOUD_AUTH_TOKEN;
                        }else{
                            auth_token = localStorage.$AUTH_TOKEN;
                        }
                        if(!config.headers["X-Auth-Token"]){
                            config.headers["X-Auth-Token"] = auth_token;
                        }                     
                        config.headers["Cache-Control"] = "no-cache";
                        $rootScope.websocketLocalStorage = localStorage.$AUTH_TOKEN;

                        //Reg url for websocket
                        if (/physical\/server$/.test(config.url)&& config.method.toUpperCase() == "POST") {
                            sessionStorage.setItem("compute.phy_instance.create.start", "compute.phy_instance.create.start");
                            sessionStorage.setItem("compute.phy_instance.create.end", "compute.phy_instance.create.end");
                            sessionStorage.setItem("compute.phy_instance.create.error", "compute.phy_instance.create.error");
                            sessionStorage.setItem("compute_task.build_instances", "compute_task.build_instances");
                            sessionStorage.setItem("compute_task.build_phy_instances", "compute_task.build_phy_instances");
                        }else if (/physical\/server\/os-start/.test(config.url)) {
                            sessionStorage.setItem("compute.phy_instance.power_on.start", "compute.phy_instance.power_on.start");
                            sessionStorage.setItem("compute.phy_instance.power_on.end", "compute.phy_instance.power_on.end");
                        }  else if (/physical\/server\/os-reboot/.test(config.url)) {
                            sessionStorage.setItem("compute.phy_instance.reboot.start", "compute.phy_instance.reboot.start");
                            sessionStorage.setItem("compute.phy_instance.reboot.end", "compute.phy_instance.reboot.end");
                        } else if (/physical\/server\/os-stop/.test(config.url)) {
                            sessionStorage.setItem("compute.phy_instance.power_off.start", "compute.phy_instance.power_off.start");
                            sessionStorage.setItem("compute.phy_instance.power_off.end", "compute.phy_instance.power_off.end");
                        } else if (/physical\/server\/os-delete/.test(config.url)) {
                            sessionStorage.setItem("compute.phy_instance.delete.start", "compute.phy_instance.delete.start");
                            sessionStorage.setItem("compute.phy_instance.delete.end", "compute.phy_instance.delete.end");
                        } else if (/os-stop|os-force-stop/.test(config.url)) {
                            //关闭vm,强制关闭vm
                            sessionStorage.setItem("compute.instance.power_off.start", "compute.instance.power_off.start");
                            sessionStorage.setItem("compute.instance.power_off.end", "compute.instance.power_off.end");

                        } else if (/server$/.test(config.url)) {
                            sessionStorage.setItem("compute.instance.create.start", "compute.instance.create.start");
                            sessionStorage.setItem("compute.instance.create.end", "compute.instance.create.end");
                            sessionStorage.setItem("compute.instance.create.error", "compute.instance.create.error");
                            sessionStorage.setItem("compute_task.build_instances", "compute_task.build_instances");
                        } else if (/os-start/.test(config.url)) {
                            sessionStorage.setItem("compute.instance.power_on.start", "compute.instance.power_on.start");
                            sessionStorage.setItem("compute.instance.power_on.end", "compute.instance.power_on.end");
                        } /*else if (/imagedef/.test(config.url)) {
                            sessionStorage.setItem("compute.instance.create.end", "compute.instance.create.end");
                        } */else if (/imagedef$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            sessionStorage.setItem("compute.instance.create.start", "compute.instance.mkimg.start");
                            sessionStorage.setItem("compute.instance.create.end", "compute.instance.mkimg.end");
                            sessionStorage.setItem("compute.instance.create.error", "compute.instance.create.error");
                            sessionStorage.setItem("compute_task.build_instances", "compute_task.build_instances");
                        } else if (/os-reboot/.test(config.url)) {
                            //重启云主机
                            sessionStorage.setItem("compute.instance.reboot.start", "compute.instance.reboot.start");
                            sessionStorage.setItem("compute.instance.reboot.end", "compute.instance.reboot.end");
                        } else if (/volumes\/attach/.test(config.url)) {
                            //加载云硬盘
                            sessionStorage.setItem("volume.attach.start", "volume.attach.start");
                            sessionStorage.setItem("volume.attach.end", "volume.attach.end");
                            sessionStorage.setItem("compute.instance.volume.attach", "compute.instance.volume.attach");
                        } else if (/volumes\/detach/.test(config.url)) {
                            //卸载云硬盘
                            sessionStorage.setItem("compute.instance.volume.detach", "compute.instance.volume.detach");
                            sessionStorage.setItem("volume.detach.start", "volume.detach.start");
                            sessionStorage.setItem("volume.detach.end", "volume.detach.end");
                        } else if (/volumes\/extend/.test(config.url)) {
                            //扩容云硬盘
                            sessionStorage.setItem("volume.resize.start", "volume.resize.start");
                            sessionStorage.setItem("volume.resize.end", "volume.resize.end");
                            sessionStorage.setItem("resize_instance", "resize_instance");
                        } else if (/volumes\/force/.test(config.url)) {
                            //云硬盘强制删除
                            sessionStorage.setItem("volume.delete.start", "volume.delete.start");
                            sessionStorage.setItem("volume.delete.end", "volume.delete.end");
                        } else if (/volumes/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除云硬盘
                            sessionStorage.setItem("volume.delete.start", "volume.delete.start");
                            sessionStorage.setItem("volume.delete.end", "volume.delete.end");
                        }else if (/volumes/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑云硬盘
                            //sessionStorage.setItem("volume.update.start", "volume.update.start");
                            sessionStorage.setItem("volume.update.end", "volume.update.end");
                        } else if (/restore\/volume|restore-volume/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //备份还原
                            sessionStorage.setItem("backup.restore.start", "backup.restore.start");
                            sessionStorage.setItem("backup.restore.end", "backup.restore.end");
                        } else if (/os-reset/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //备份重置状态
                            sessionStorage.setItem("backup.reset_status.start", "backup.reset_status.start");
                            sessionStorage.setItem("backup.reset_status.end", "backup.reset_status.end");
                        }else if (/backups/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除备份
                            sessionStorage.setItem("backup.delete.start", "backup.delete.start");
                            sessionStorage.setItem("backup.delete.end", "backup.delete.end");
                        }  else if (/backups\/chain/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //删除备份链
                            sessionStorage.setItem("backup.delete.start", "backup.delete.start");
                            sessionStorage.setItem("backup.delete.end", "backup.delete.end");
                        }else if (/backups/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建备份
                            sessionStorage.setItem("backup.create.start", "backup.create.start");
                            sessionStorage.setItem("backup.create.end", "backup.create.end");
                            sessionStorage.setItem("backup.create.error", "backup.create.error");
                        } else if (/snapshots$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //云硬盘创建快照
                            sessionStorage.setItem("snapshot.create.error", "snapshot.create.error");
                            sessionStorage.setItem("snapshot.create.start", "snapshot.create.start");
                            sessionStorage.setItem("snapshot.create.end", "snapshot.create.end");
                        } else if (/snapshots/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除快照
                            sessionStorage.setItem("snapshot.delete.start", "snapshot.delete.start");
                            sessionStorage.setItem("snapshot.delete.end", "snapshot.delete.end");
                        } else if(/snapshot\/rollback/.test(config.url) && config.method.toUpperCase() == "POST"){
                            //快照回滚
                            sessionStorage.setItem("snapshot.rollback.start", "snapshot.rollback.start");
                            sessionStorage.setItem("snapshot.rollback.end", "snapshot.rollback.end");
                        } else if (/volumes$|createvolume$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建云硬盘,从快照创建云硬盘
                            sessionStorage.setItem("volume.create.error", "volume.create.error");
                            sessionStorage.setItem("volume.create.start", "volume.create.start");
                            sessionStorage.setItem("volume.create.end", "volume.create.end");
                            sessionStorage.setItem("scheduler.create_volume", "scheduler.create_volume");
                        } else if (/floating_ips\/association/.test(config.url)) {
                            //update公网IP
                            sessionStorage.setItem("floatingip.update.start", "floatingip.association.start");
                            sessionStorage.setItem("floatingip.update.end", "floatingip.association.end");
                        } else if (/floating_ips\/disassociation/.test(config.url)) {
                            //update公网IP
                            sessionStorage.setItem("floatingip.update.start", "floatingip.disassociation.start");
                            sessionStorage.setItem("floatingip.update.end", "floatingip.disassociation.end");
                        } else if (/os-image/.test(config.url)) {
                            //制作image
                            sessionStorage.setItem("compute.instance.snapshot.start", "compute.instance.mkimg.start");
                            sessionStorage.setItem("snapshot.create.start", "compute.instance.mkimg.start");
                            sessionStorage.setItem("compute.instance.snapshot.end", "compute.instance.mkimg.end");
                            sessionStorage.setItem("snapshot.create.end", "compute.instance.mkimg.end");
                        } else if (/backup/.test(config.url)) {
                            //备份
                            sessionStorage.setItem("compute.instance.snapshot.start", "compute.instance.backup.start");
                            sessionStorage.setItem("compute.instance.snapshot.end", "compute.instance.backup.end");
                        } else if (/live-migrate/.test(config.url)) {
                            //热迁移
                            sessionStorage.setItem("compute.instance.live_migration.pre.start", "compute.instance.live_migration.pre.start");
                            sessionStorage.setItem("compute.instance.live_migration.post.dest.end", "compute.instance.live_migration.post.dest.end");
                        } else if (/os-live-resize\/live_resize/.test(config.url)) {
                            //热升级
                            sessionStorage.setItem("compute.instance.resize.confirm.start", "compute.instance.upgrade.confirm.start");
                            sessionStorage.setItem("compute.instance.resize.confirm.end", "compute.instance.upgrade.confirm.end");
                        } else if (/resize|coldMigrate\/servers/.test(config.url)) {
                            //调整配置
                            sessionStorage.setItem("compute.instance.resize.start", "compute.instance.resize.start");
                            sessionStorage.setItem("compute.instance.finish_resize.end", "compute.instance.finish_resize.end");
                            sessionStorage.setItem("compute.instance.resize.confirm.end", "compute.instance.resize.confirm.end");
                        } else if (/os-delete|os-force-delete/.test(config.url)) {
                            //软删除,强制删除云主机目前没有
                            sessionStorage.setItem("compute.instance.delete.start", "compute.instance.delete.start");
                            sessionStorage.setItem("compute.instance.delete.end", "compute.instance.delete.end");
                            sessionStorage.setItem("compute.instance.soft_delete.start", "compute.instance.soft_delete.start");
                            sessionStorage.setItem("compute.instance.soft_delete.end", "compute.instance.soft_delete.end");
                            sessionStorage.setItem("floatingip.update.start", "floatingip.disassociation.start");
                            sessionStorage.setItem("floatingip.update.end", "floatingip.disassociation.end");
                        } else if (/os-restore/.test(config.url)) {
                            //恢复云主机
                            sessionStorage.setItem("compute.instance.restore.start", "compute.instance.restore.start");
                            sessionStorage.setItem("compute.instance.restore.end", "compute.instance.restore.end");
                        } else if (/pauseServer/.test(config.url)) {
                            //暂停云主机
                            sessionStorage.setItem("compute.instance.pause.start", "compute.instance.pause.start");
                            sessionStorage.setItem("compute.instance.pause.end", "compute.instance.pause.end");
                        } else if (/unPauseServer/.test(config.url)) {
                            //恢复暂停云主机
                            sessionStorage.setItem("compute.instance.unpause.start", "compute.instance.unpause.start");
                            sessionStorage.setItem("compute.instance.unpause.end", "compute.instance.unpause.end");
                        } else if (/sunpendServer/.test(config.url)) {
                            //挂起云主机
                            sessionStorage.setItem("compute.instance.suspend.start", "compute.instance.suspend.start");
                            sessionStorage.setItem("compute.instance.suspend.end", "compute.instance.suspend.end");
                        } else if (/resumeServer/.test(config.url)) {
                            //恢复挂起云主机
                            sessionStorage.setItem("compute.instance.resume.start", "compute.instance.resume.start");
                            sessionStorage.setItem("compute.instance.resume.end", "compute.instance.resume.end");
                        } else if (/networks$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除交换机
                            sessionStorage.setItem("network.delete.start", "network.delete.start");
                            sessionStorage.setItem("network.delete.end", "network.delete.end");
                        } else if (/\/networks$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //快速创建交换机
                            sessionStorage.setItem("router.create.error", "router.create.error");
                            sessionStorage.setItem("router.create.start", "router.create.start");
                            sessionStorage.setItem("router.create.end", "router.create.end");
                            sessionStorage.setItem("router.delete.start", "router.delete.start");
                            sessionStorage.setItem("router.delete.end", "router.delete.end");
                            sessionStorage.setItem("network.create.error", "network.create.error");
                            sessionStorage.setItem("network.create.start", "network.create.start");
                            sessionStorage.setItem("network.create.end", "network.create.end");
                            sessionStorage.setItem("network.delete.start", "network.delete.start");
                            sessionStorage.setItem("network.delete.end", "network.delete.end");
                            sessionStorage.setItem("subnet.create.error", "subnet.create.error");
                            sessionStorage.setItem("subnet.create.start", "subnet.create.start");
                            sessionStorage.setItem("subnet.create.end", "subnet.create.end");
                            sessionStorage.setItem("subnet.delete.start", "subnet.delete.start");
                            sessionStorage.setItem("subnet.delete.end", "subnet.delete.end");
                        }else if (/\/createPrivateNetwork$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建私有网络
                            sessionStorage.setItem("network.create.error", "network.create.error");
                            sessionStorage.setItem("network.create.start", "network.create.start");
                            sessionStorage.setItem("network.create.end", "network.create.end");
                        }else if (/\/createExternalNetwork$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建外部网络
                            sessionStorage.setItem("network.create.error", "network.create.error");
                            sessionStorage.setItem("network.create.start", "network.create.start");
                            sessionStorage.setItem("network.create.end", "network.create.end");
                        }else if (/projectNetworks$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //非admin创建交换机
                            sessionStorage.setItem("network.create.error", "network.create.error");
                            sessionStorage.setItem("network.create.start", "network.create.start");
                            sessionStorage.setItem("network.create.end", "network.create.end");
                            sessionStorage.setItem("subnet.create.error", "subnet.create.error");
                            sessionStorage.setItem("subnet.create.start", "subnet.create.start");
                            sessionStorage.setItem("subnet.create.end", "subnet.create.end");
                        }else if (/networks/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //update交换机
                            sessionStorage.setItem("network.update.start", "network.update.start");
                            sessionStorage.setItem("network.update.end", "network.update.end");
                        } else if (/subnets$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建子网
                            sessionStorage.setItem("subnet.create.start", "subnet.create.start");
                            sessionStorage.setItem("subnet.create.end", "subnet.create.end");
                        } else if (/subnets/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑子网
                            sessionStorage.setItem("subnet.update.start", "subnet.update.start");
                            sessionStorage.setItem("subnet.update.end", "subnet.update.end");
                        } else if (/subnets$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除子网
                            sessionStorage.setItem("subnet.delete.start", "subnet.delete.start");
                            sessionStorage.setItem("subnet.delete.end", "subnet.delete.end");
                        } else if (/interfaceRemove$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //解除关联子网
                            sessionStorage.setItem("router.interface.delete", "router.interface.delete");

                        } else if (/routers$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建路由
                            sessionStorage.setItem("router.create.start", "router.create.start");
                            sessionStorage.setItem("router.create.end", "router.create.end");
                        } else if (/routers$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除路由
                            sessionStorage.setItem("router.delete.start", "router.delete.start");
                            sessionStorage.setItem("router.delete.end", "router.delete.end");
                        } else if (/routers$/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //设置/清除路由器网关
                            sessionStorage.setItem("router.update.start", "router.update.start");
                            sessionStorage.setItem("router.update.end", "router.update.end");
                        } else if (/interfaceAdd$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //关联子网
                            sessionStorage.setItem("router.interface.create", "router.interface.create");
                        } else if (/ports/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //修改端口
                            sessionStorage.setItem("port.update.start", "port.update.start");
                            sessionStorage.setItem("port.update.end", "port.update.end");
                        } else if (/floating_ips$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //申请浮动IP
                            sessionStorage.setItem("floatingip.create.start", "floatingip.create.start");
                            sessionStorage.setItem("floatingip.create.end", "floatingip.create.end");
                        } else if (/floating_ips$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除公网IP
                            sessionStorage.setItem("floatingip.delete.start", "floatingip.delete.start");
                            sessionStorage.setItem("floatingip.delete.end", "floatingip.delete.end");
                        } else if (/security_groups$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建防火墙
                            sessionStorage.setItem("security_group.create.start", "security_group.create.start");
                            sessionStorage.setItem("security_group.create.end", "security_group.create.end");
                        } else if (/security_groups\/rule$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //防火墙新建规则
                            sessionStorage.setItem("security_group_rule.create.start", "security_group_rule.create.start");
                            sessionStorage.setItem("security_group_rule.create.end", "security_group_rule.create.end");
                        } else if (/security_groups\/rule$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除安全组规则
                            sessionStorage.setItem("security_group_rule.delete.start", "security_group_rule.delete.start");
                            sessionStorage.setItem("security_group_rule.delete.end", "security_group_rule.delete.end");
                        } else if (/security_groups$/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑防火墙
                            sessionStorage.setItem("security_group.update.start", "security_group.update.start");
                            sessionStorage.setItem("security_group.update.end", "security_group.update.end");
                        } else if (/security_groups$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除防火墙
                            sessionStorage.setItem("security_group.delete.start", "security_group.delete.start");
                            sessionStorage.setItem("security_group.delete.end", "security_group.delete.end");
                        } else if (/os-keypair$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建密钥对
                            sessionStorage.setItem("keypair.create.start", "keypair.create.start");
                            sessionStorage.setItem("keypair.create.end", "keypair.create.end");
                        } else if (/os-keypair\/import$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //导入密钥对
                            sessionStorage.setItem("keypair.import.start", "keypair.import.start");
                            sessionStorage.setItem("keypair.import.end", "keypair.import.end");
                        } else if (/os-keypair$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除密钥对
                            sessionStorage.setItem("keypair.delete.start", "keypair.delete.start");
                            sessionStorage.setItem("keypair.delete.end", "keypair.delete.end");
                        } else if (/os-aggregates$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //新建云主机集合
                            sessionStorage.setItem("aggregate.create.start", "aggregate.create.start");
                            sessionStorage.setItem("aggregate.create.end", "aggregate.create.end");
                        } else if (/os-aggregates$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除云主机集合
                            sessionStorage.setItem("aggregate.delete.start", "aggregate.delete.start");
                            sessionStorage.setItem("aggregate.delete.end", "aggregate.delete.end");
                        } else if (/os-aggregates/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑云主机集合
                            sessionStorage.setItem("aggregate.updateprop.start", "aggregate.updateprop.start");
                            sessionStorage.setItem("aggregate.updateprop.end", "aggregate.updateprop.end");
                        } else if (/os-aggregates\/(.*)\/setMetadata/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //云主机集合设置元数据
                            sessionStorage.setItem("aggregate.updatemetadata.start", "aggregate.updatemetadata.start");
                            sessionStorage.setItem("aggregate.updatemetadata.end", "aggregate.updatemetadata.end");
                        } else if (/os-aggregates/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //管理主机
                            sessionStorage.setItem("aggregate.addhost.start", "aggregate.addhost.start");
                            sessionStorage.setItem("aggregate.addhost.end", "aggregate.addhost.end");
                        } else if (/os-aggregates/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //管理主机
                            sessionStorage.setItem("aggregate.removehost.start", "aggregate.removehost.start");
                            sessionStorage.setItem("aggregate.removehost.end", "aggregate.removehost.end");
                        } else if (/firewallrule/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //新建防火墙规则
                            sessionStorage.setItem("firewall_rule.create.start", "firewall_rule.create.start");
                            sessionStorage.setItem("firewall_rule.create.end", "firewall_rule.create.end");
                        } else if (/firewallrule/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑防火墙规则
                            sessionStorage.setItem("firewall_rule.update.start", "firewall_rule.update.start");
                            sessionStorage.setItem("firewall_rule.update.end", "firewall_rule.update.end");
                        } else if (/firewallrule/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除防火墙规则
                            sessionStorage.setItem("firewall_rule.delete.start", "firewall_rule.delete.start");
                            sessionStorage.setItem("firewall_rule.delete.end", "firewall_rule.delete.end");
                        } else if (/firewallpolicy/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //新建防火墙策略
                            sessionStorage.setItem("firewall_policy.create.start", "firewall_policy.create.start");
                            sessionStorage.setItem("firewall_policy.create.end", "firewall_policy.create.end");
                        } else if (/firewallpolicy/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑防火墙策略
                            sessionStorage.setItem("firewall_policy.update.start", "firewall_policy.update.start");
                            sessionStorage.setItem("firewall_policy.update.end", "firewall_policy.update.end");
                        } else if (/firewallpolicy/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除防火墙策略
                            sessionStorage.setItem("firewall_policy.delete.start", "firewall_policy.delete.start");
                            sessionStorage.setItem("firewall_policy.delete.end", "firewall_policy.delete.end");
                        } else if (/firewall/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //新建防火墙
                            sessionStorage.setItem("firewall.create.start", "firewall.create.start");
                            sessionStorage.setItem("firewall.create.end", "firewall.create.end");
                        } else if (/firewall/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑防火墙
                            sessionStorage.setItem("firewall.update.start", "firewall.update.start");
                            sessionStorage.setItem("firewall.update.end", "firewall.update.end");
                        } else if (/firewall/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除防火墙
                            sessionStorage.setItem("firewall.delete.start", "firewall.delete.start");
                            sessionStorage.setItem("firewall.delete.end", "firewall.delete.end");
                        } else if (/license/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //更新license
                            sessionStorage.setItem("license", "license");
                        } else if (/listener$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建监听器
                            sessionStorage.setItem("listener.create.start", "listener.create.start");
                            sessionStorage.setItem("listener.create.end", "listener.create.end");
                        } else if (/listeners/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑监听器
                            sessionStorage.setItem("listener.update.start", "listener.update.start");
                            sessionStorage.setItem("listener.update.end", "listener.update.end");
                        } else if (/deleteListeners$/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //删除监听器
                            sessionStorage.setItem("listener.delete.start", "listener.delete.start");
                            sessionStorage.setItem("listener.delete.end", "listener.delete.end");
                        } else if (/addMembers$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建资源池成员
                            sessionStorage.setItem("member.create.start", "member.create.start");
                            sessionStorage.setItem("member.create.end", "member.create.end");
                        } else if (/members/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑资源池成员
                            sessionStorage.setItem("member.update.start", "member.update.start");
                            sessionStorage.setItem("member.update.end", "member.update.end");
                        } else if (/members$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除资源池成员
                            sessionStorage.setItem("member.delete.start", "member.delete.start");
                            sessionStorage.setItem("member.delete.end", "member.delete.end");
                        } else if (/pools$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建资源池
                            sessionStorage.setItem("pool.create.start", "pool.create.start");
                            sessionStorage.setItem("pool.create.end", "pool.create.end");
                        } else if (/pools/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑资源池
                            sessionStorage.setItem("pool.update.start", "pool.update.start");
                            sessionStorage.setItem("pool.update.end", "pool.update.end");
                        } else if (/pools$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除资源池
                            sessionStorage.setItem("pool.delete.start", "pool.delete.start");
                            sessionStorage.setItem("pool.delete.end", "pool.delete.end");
                        } else if (/lbaas\/healthmonitors$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建负载均衡监控器
                            sessionStorage.setItem("healthmonitor.create.start", "healthmonitor.create.start");
                            sessionStorage.setItem("healthmonitor.create.end", "healthmonitor.create.end");
                        } else if (/lbaas\/healthmonitors/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑负载均衡监控器
                            sessionStorage.setItem("healthmonitor.update.start", "healthmonitor.update.start");
                            sessionStorage.setItem("healthmonitor.update.end", "healthmonitor.update.end");
                        } else if (/lbaas\/healthmonitors$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除负载均衡监控器
                            sessionStorage.setItem("healthmonitor.delete.start", "healthmonitor.delete.start");
                            sessionStorage.setItem("healthmonitor.delete.end", "healthmonitor.delete.end");
                        } else if (/lbaas\/loadbalancers$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建负载均衡
                            sessionStorage.setItem("loadbalancer.create.start", "loadbalancer.create.start");
                            sessionStorage.setItem("loadbalancer.create.end", "loadbalancer.create.end");
                        } else if (/lbaas\/loadbalancers\/.+[0-9a-zA-Z]$/.test(config.url) && config.method.toUpperCase() == "PUT") {
                            //编辑负载均衡
                            sessionStorage.setItem("loadbalancer.update.start", "loadbalancer.update.start");
                            sessionStorage.setItem("loadbalancer.update.end", "loadbalancer.update.end");
                        } else if (/lbaas\/loadbalancers$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除负载均衡
                            sessionStorage.setItem("loadbalancer.delete.start", "loadbalancer.delete.start");
                            sessionStorage.setItem("loadbalancer.delete.end", "loadbalancer.delete.end");
                        } else if (/scaleclusters/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //创建scaleclusters
                            sessionStorage.setItem("compute.instance.create.start", "compute.instance.create.start");
                            sessionStorage.setItem("compute.instance.create.end", "compute.instance.create.end");
                            sessionStorage.setItem("compute.instance.create.error", "compute.instance.create.error");
                            sessionStorage.setItem("loadbalancer.create.start", "loadbalancer.create.start");
                            sessionStorage.setItem("loadbalancer.create.end", "loadbalancer.create.end");
                            sessionStorage.setItem("listener.create.start", "listener.create.start");
                            sessionStorage.setItem("listener.create.end", "listener.create.end");
                            sessionStorage.setItem("pool.create.start", "pool.create.start");
                            sessionStorage.setItem("pool.create.end", "pool.create.end");
                            sessionStorage.setItem("member.create.start", "member.create.start");
                            sessionStorage.setItem("member.create.end", "member.create.end");
                            sessionStorage.setItem("cluster.instance.end", "cluster.instance.end");
                        } else if (/scaleclusters/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除scaleclusters
                            sessionStorage.setItem("member.delete.start", "member.delete.start");
                            sessionStorage.setItem("member.delete.end", "member.delete.end");
                            sessionStorage.setItem("pool.delete.start", "pool.delete.start");
                            sessionStorage.setItem("pool.delete.end", "pool.delete.end");
                            sessionStorage.setItem("listener.delete.start", "listener.delete.start");
                            sessionStorage.setItem("listener.delete.end", "listener.delete.end");
                            sessionStorage.setItem("loadbalancer.delete.start", "loadbalancer.delete.start");
                            sessionStorage.setItem("loadbalancer.delete.end", "loadbalancer.delete.end");
                            sessionStorage.setItem("compute.instance.delete.start", "compute.instance.delete.start");
                            sessionStorage.setItem("compute.instance.delete.end", "compute.instance.delete.end");
                            sessionStorage.setItem("compute.instance.soft_delete.start", "compute.instance.soft_delete.start");
                            sessionStorage.setItem("compute.instance.soft_delete.end", "compute.instance.soft_delete.end");
                        }
                        /*else if(/nodes$/.test(config.url) && config.method.toUpperCase() == "POST") {
                            //添加节点
                            sessionStorage.setItem("nodeMng.add.ing", "nodeMng.add.ing");
                            sessionStorage.setItem("nodeMng.add.fail", "nodeMng.add.fail");
                            sessionStorage.setItem("nodeMng.add.success", "nodeMng.add.success");
                        } else if(/nodes$/.test(config.url) && config.method.toUpperCase() == "DELETE") {
                            //删除节点
                            sessionStorage.setItem("nodeMng.del.ing", "nodeMng.add.ing");
                            sessionStorage.setItem("nodeMng.del.fail", "nodeMng.add.fail");
                            sessionStorage.setItem("nodeMng.del.success", "nodeMng.add.success");
                            sessionStorage.setItem("nodeMng.del.autoretry", "nodeMng.add.autoretry");
                        }  else if(/nodes\/mainte/.test(config.url)) {
                            //维护节点
                            sessionStorage.setItem("nodeMng.manit.ing", "nodeMng.manit.ing");
                            sessionStorage.setItem("nodeMng.manit.fail", "nodeMng.manit.fail");
                            sessionStorage.setItem("nodeMng.manit.success", "nodeMng.manit.success");
                        } else if(/nodes\/active/.test(config.url)) {
                            //激活节点
                            sessionStorage.setItem("nodeMng.active.ing", "nodeMng.active.ing");
                            sessionStorage.setItem("nodeMng.active.fail", "nodeMng.active.fail");
                            sessionStorage.setItem("nodeMng.active.success", "nodeMng.active.success");
                        } else if(/nodes\/retry/.test(config.url)) {
                            //激活节点
                            sessionStorage.setItem("nodeMng.active.ing", "nodeMng.active.ing");
                            sessionStorage.setItem("nodeMng.active.fail", "nodeMng.active.fail");
                            sessionStorage.setItem("nodeMng.active.success", "nodeMng.active.success");
                        }*/

                        return config;
                    },
                    response(res) {
                        if (/\.html/.test(res.config.url)) {
                            return res;
                        }
                        if (res.headers("X-Auth-Token")) {
                            localStorage.$AUTH_TOKEN = res.headers("X-Auth-Token");
                        }
                        if (res.data.code == "00010105" || res.data.status == "00010105") {
                            sessionStorage.$AUTH_RETURN_URL = location.href;
                            $rootScope.effeToken = true;
                            if($location.path()=="/"||$location.path()==""){
                                $rootScope.effeToken = false;
                            }
                            //$location.path("/").replace();
                        }
                        // 获取验证码
                        if (/v1\/verifycode/.test(res.config.url)) {
                            //$rootScope.$broadcast("code",res);
                            return res;
                        }
                        if (res.data.code == "01030702") {
                            $rootScope.$broadcast("loginerror", "error");
                            return res.data;
                        }
                        if (res.data.code == "01030703") {
                            $rootScope.$broadcast("loginerror", "ipOut");
                            return res.data;
                        }
                        if (res.data.code == "404") {
                            return res.data;
                        }
                        if (res.data.code == "01030704") {
                            $rootScope.$broadcast("loginerror", "noProject");
                            return res.data;
                        }
                        if (res.data.code == "01030708") {
                            $rootScope.$broadcast("loginerror", "sysUpdate");
                            if($location.path()=="/"||$location.path()==""){
                                $rootScope.effeToken = false;
                            }else{
                                $rootScope.cloudGrading = true;
                            }
                            
                            return res.data;
                        }
                        if (res.data.code == "01030706") {
                            $rootScope.$broadcast("loginerror", "overTimes");
                            return res.data;
                        }
                        if (res.data.code == "01030707") {
                            $rootScope.$broadcast("loginerror", "repeatLogin");
                            return res.data;
                        }
                        //用户锁定
                        if (res.data.code == "01030709") {
                            $rootScope.$broadcast("loginerror", "userLocked");
                            return res.data;
                        }
                        // 验证码失效
                        if (res.data.code == "01090301") {
                            $rootScope.$broadcast("loginerror", "codeInvalid");
                            return res.data;
                        }
                        // 验证码错误
                        if (res.data.code == "01090302") {
                            $rootScope.$broadcast("loginerror", "codeError");
                            return res.data;
                        }

                        if (res.data.code == "03012902") {
                            $rootScope.$broadcast("contractGroupError", "repeatEmailOrPhone");
                            return res.data;
                        }
                        if (res.data.code == "03015101") {
                            return res.data;
                        }
                        if (res.data.code == "03050101") {
                            $rootScope.$broadcast("alert-error", res.data.code);
                            return res.data;
                        }
                        if (res.data.code == "01180401") {
                            $rootScope.$broadcast("modifyerror", "modifyFrequent");
                            return res.data;
                        }
                        if (res.data.code == "01080303") {
                            $rootScope.$broadcast("modifyerror", "prePasswordError");
                            return res.data;
                        }
                        if (res.data.code == "01080302") {
                            $rootScope.$broadcast("modifyerror", "modifyError");
                            return res.data;
                        }
                        if (res.data.code == "01080305") {
                            $rootScope.$broadcast("modifyerror", "preventError");
                            $rootScope.$broadcast("clustereError", res.data.code );
                            return res.data;
                        }
                        if (res.data.code == "01080306") {
                            $rootScope.$broadcast("modifyerror", "sameWithPrePwd");
                            return res.data;
                        }
                        if (res.data.code == "01080304") {
                            $rootScope.$broadcast("modifyerror", "keystoneError");
                            return res.data;
                        }
                        if (res.data.code == "01100110") {
                            $rootScope.$broadcast("modifyerror", "clusterAbnormal");
                            return res.data;
                        }
                        if (res.data.code == "01060702") {//切换多数据中心失败
                            $rootScope.$broadcast("alert-error", res.data.code);
                            res.data.data = "changeError";
                            return res.data;
                        }
                        if (res.data.code == -1 || res.data.code == 500) {
                            if (/awstack-user\/v1\/login/.test(res.config.url)) {
                                $rootScope.$broadcast("loginerror", "servererror");
                                return res.data;
                            }
                            if (/awstack-user\/v1\/back\/login\/token/.test(res.config.url)) {
                                $rootScope.$broadcast("loginerror", "servererror");
                                return res.data;
                            }
                            if (/dictvalues\/25\/datas/.test(res.config.url)) {
                                return res.data;
                            }
                        }
                        if (res.data) {

                            if(res.config.url.indexOf("awstack-vmware/v1/enterprises") > -1){
                                return res.data; 
                            }

                            if(res.config.url.indexOf("awstack-user/v1/login") > -1){
                                return res.data; 
                            }
                            if(res.config.url.indexOf("awstack-user/v1/back/login/token") > -1){
                                return res.data; 
                            }
                            if(res.config.url.indexOf("awstack-user/v1/enterprises/modify") > -1){
                                return res.data; 
                            }

                            if(res.config.url.indexOf("awstack-user/v1/enterprises/force/modify") > -1){
                                return res.data; 
                            }

                            if (res.data.code == "01060202") {
                                return res.data.data
                            }

                            if(res.config.url.indexOf("promotestep") > -1){
                                return res.data; 
                            }

                            if (res.data.code == "0") {

                                /*只返回数据不做操作成功广播*/
                                if(res.config.method != "GET" && res.config.url.indexOf("/awstack-user/v1/bob/logs") > -1){
                                    return res.data.data;
                                }

                                /*  
                                    向页面广播操作成功
                                    1.类型一，存在某些关键字接口进行广播（开始过滤其中的特殊接口）
                                    2.类型二，对以上不存在类型一中任意方法关键字类型的接口做补充可以存在交集
                                */
                                if(
                                    (
                                        /*类型一*/
                                        (
                                            res.config.method != "GET" &&
                                            res.config.url.indexOf("storage_license_options_query")  == -1 &&
                                            res.config.url.indexOf("/awstack-user/v1/k8s/nodes/labels") == -1 &&
                                            res.config.url.indexOf("/params/list") == -1
                                        )&&(
                                            res.config.url.indexOf("awstack-resource/v1/image") > -1 ||
                                            res.config.url.indexOf("/awstack-resource/v1/storage") > -1 ||
                                            res.config.url.indexOf("storage/editstorage") > -1 ||
                                            res.config.url.indexOf("/bandwidth?serverName") > -1 ||
                                            res.config.url.indexOf("storage/activitystorage") > -1 ||
                                            res.config.url.indexOf("storage/deletestorage") > -1 ||
                                            res.config.url.indexOf("os-mac") > -1 ||
                                            res.config.url.indexOf("makeImage") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/os-access") > -1 ||
                                            res.config.url.indexOf("awstack-user/v1/quotas/default") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/flavor") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/os-keypair/import") > -1 ||
                                            res.config.url.indexOf("awstack-monitor/v1/contactLists") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/networkSetting/addExternalPhyNetwork") > -1 ||
                                            res.config.url.indexOf("awstack-monitor/v1/contacts") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/uploadimagez/space") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/server/groups") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/vpn/addVpn") > -1 ||
                                            res.config.url.indexOf("/system_check_tasks") > -1 ||    
                                            res.config.url.indexOf("awstack-resource/v1/vpn/updateIPSecSite") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/vpn/disabledVPN") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/vpn/enabledVPN") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/vpn/deleteVPN") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/firewall/enableFirewallRule") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/firewall/disableFirewallRule") > -1 ||
                                            res.config.url.indexOf("addFirewallRule") > -1 ||
                                            res.config.url.indexOf("updateVPNEndpointGroup") > -1 ||
                                            res.config.url.indexOf("addPhyNetwork") > -1 ||    
                                            res.config.url.indexOf("os-change") > -1||
                                            res.config.url.indexOf("extra") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/scalePolicies") > -1||
                                            res.config.url.indexOf("awstack-boss/priceManager/addChargeItem") > -1 ||
                                            res.config.url.indexOf("awstack-boss/priceManager/editChargeItem") > -1 ||
                                            res.config.url.indexOf("awstack-boss/priceManager/deleteChargeItem") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/ports") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/updatePorts") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/servers") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/updatePortSecPolicy") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/volume/migrateVolume") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/physical/networks") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/physical/image") > -1||
                                            res.config.url.indexOf("awstack-resource/v1/qos-specs") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/ipmi") > -1 ||
                                            res.config.url.indexOf("awstack-resource/v1/ironic") > -1 ||
                                            res.config.url.indexOf("awstack-user/v1/k8s/nodes") > -1 ||
                                            res.config.url.indexOf("awstack-workflow/v1/enterpriseUid/processInstanceId") > -1 
                                        )
                                    )||(
                                        /*类型二*/    
                                        res.config.method != "GET" &&
                                        res.config.url.indexOf("check") == -1 &&
                                        res.config.url.indexOf("v1/login") == -1 &&
                                        res.config.url.indexOf("v1/back/login/token") == -1 &&
                                        res.config.url.indexOf("awstack-resource") == -1 &&
                                        res.config.url.indexOf("query") == -1 &&
                                        res.config.url.indexOf("awcloud-log") == -1 &&
                                        res.config.url.indexOf("quotas") == -1 &&
                                        res.config.url.indexOf("Usages") == -1 &&
                                        res.config.url.indexOf("license") == -1 &&
                                        res.config.url.indexOf("nodes") == -1 &&
                                        res.config.url.indexOf("rdqa") == -1 &&
                                        res.config.url.indexOf("awstack-user/v1/newregion") == -1 &&
                                        res.config.url.indexOf("awstack-qcloud") == -1 &&
                                        res.config.url.indexOf("awstack-boss") == -1 &&
                                        res.config.url.indexOf("awstack-monitor/v1/resource/used/statistic") == -1 &&
                                        res.config.url.indexOf("/params/list") == -1 &&
                                        res.config.url.indexOf("awstack-monitor/v2/history/resource/allocation") == -1
                                    )
                                ){
                                    $rootScope.$broadcast("alert-success", res.data.code);
                                }
                          
                                /*腾讯云和联系人组做拦截*/
                                if(res.config.url.indexOf("awstack-qcloud") >-1){
                                    return res.data;
                                }
                                
                                if(res.config.url.indexOf("awstack-monitor/v1/contact") > -1){
                                    return res.data;
                                }

                                if(res.config.url.indexOf("awstack-monitor/v1/contactLists") > -1){
                                    return res.data;
                                }

                                return res.data.data;
                            } 

                            if (res.data.status == "0") {
                                if (res.config.method != "GET" &&
                                    res.config.url.indexOf("v1/login") == -1 &&
                                    res.config.url.indexOf("v1/back/login/token") == -1 &&
                                    res.config.url.indexOf("awstack-resource") == -1 &&
                                    res.config.url.indexOf("awcloud-log") == -1) {
                                    $rootScope.$broadcast("alert-success", res.data.code);
                                }
                                return res.data;
                            }

                            if (res.data.code != "00010105" && res.data.code != "02014501") {
                                //错误码详细处理
                                if (res.data && res.data.code && res.data.code.indexOf("#") > -1) {
                                    let codeArr = res.data.code.split("#");
                                    let pattern = /\#/g;
                                    for (let i = 0; i < codeArr.length; i++) {
                                        codeArr[i] ? codeArr[i] = $translate.instant("aws.statusCode." + codeArr[i]) : "";
                                    }
                                    codeArr = codeArr.join("#");
                                    let arrl = codeArr.match(pattern);
                                    for (let i = 0; i < arrl.length; i++) {
                                        codeArr = codeArr.replace(/\#/, res.data.message[i]);
                                    }
                                    $rootScope.$broadcast("alert-error", codeArr);
                                } else if (res.config && res.config.url && 
                                    res.config.url.indexOf("volume_type_match") > -1 ||
                                    res.config.url.indexOf("toyou_storage_base_info_query") > -1 ||
                                    res.config.url.indexOf("storage_license_options_query") > -1  ||
                                    res.config.url.indexOf("storage_pool_info_query") > -1 ||
                                    res.config.url.indexOf("volume_type_analysis") > -1 ||
                                    res.config.url.indexOf("awstack-resource/v1/volume/images") > -1
                                ) {
                                    return res.data.data;
                                } else {
                                    let resCode = res.data.code;
                                    if (res.data.data && res.data.data.type) {
                                        let errorFromList = res.data.data.type.split(".");
                                        if (errorFromList[0] == "openstack") { //环境
                                            switch (errorFromList[1]) { //组件
                                                case "neutron":
                                                    switch (errorFromList[2]) { //具体业务
                                                        case "network":
                                                            if (res.data.data.data) {
                                                                if (res.data.data.data.indexOf("InvalidSharedSetting") > -1 && res.data.data.data.indexOf("Multiple") > -1) { //查找关键字
                                                                    resCode = "02050302"; //重定义状态码
                                                                }
                                                                if (res.data.data.data.indexOf("IpAddressInUse") > -1 && res.data.data.data.indexOf("Unable to complete operation for network") > -1) {
                                                                    resCode = "02052202"; //操作失败，IP地址在使用中
                                                                }
                                                                if (res.data.data.data.indexOf("VlanIdInUse") > -1 && res.data.data.data.indexOf("on physical network tenant is in use") > -1) {
                                                                    resCode = "02050204"; //创建网络失败。在物理网络：tenant上，该VLAN ID被使用。。
                                                                }
                                                                if (res.data.data.data.indexOf("RouterInterfaceInUseByFloatingIP") > -1) {
                                                                    resCode = "02051302"; //无法解除路由器关联子网，as it is required by one or more floating IPs.RouterInterfaceInUseByFloatingIP
                                                                }
                                                                if (res.data.data.data.indexOf("GatewayConflictWithAllocationPools") > -1) {
                                                                    resCode = "02050703"; //创建子网失败，网关IP和分配地址池中的IP发生了冲突
                                                                }
                                                                if (res.data.data.data.indexOf("RouterInUse") > -1 && res.data.data.data.indexOf("has ports") > -1) {
                                                                    resCode = "02051502"; //路由器上存在端口删除失败
                                                                }
                                                                if(res.data.data.data.indexOf("Bad router request") > -1 && res.data.data.data.indexOf("overlaps with cidr") > -1){
                                                                    resCode = "02051403"; //不允许路由器子网地址与外部网关地址有重叠
                                                                }
                                                                if(res.data.data.data.indexOf("No more IP addresses available") > -1 && res.data.data.data.indexOf("IpAddressGenerationFailure") > -1){
                                                                    resCode = "02051704"; //外部网络可用IP地址不足
                                                                }
                                                            }
                                                            break;
                                                        case "subnet":
                                                            if (res.data.data.data) {
                                                                //新建子网
                                                                if (res.data.data.data.indexOf("Requested subnet with cidr") > -1 && res.data.data.data.indexOf("overlaps with another subnet") > -1) { 
                                                                    resCode = "02050704"; //创建的子网与所选交换机上已绑定的子网网段有重叠
                                                                }
                                                                if (res.data.data.data.indexOf("number of host routes exceeds") > -1 && res.data.data.data.indexOf("HostRoutesExhausted") > -1) { 
                                                                    resCode = "02050705"; //无法完成该操作，主机路由数超过限制
                                                                }
                                                                if (res.data.data.data.indexOf("number of DNS nameservers exceeds") > -1 && res.data.data.data.indexOf("DNSNameServersExhausted") > -1) { 
                                                                    resCode = "02050706"; //无法完成该操作，DNS域名服务器数量超过限制
                                                                }
                                                                if (res.data.data.data.indexOf("is not valid") > -1 && res.data.data.data.indexOf("InvalidAllocationPool") > -1) { 
                                                                    resCode = "02050707"; //IP池无效
                                                                }
                                                                if (res.data.data.data.indexOf("Found overlapping allocation pools") > -1 && res.data.data.data.indexOf("OverlappingAllocationPools") > -1) { 
                                                                    resCode = "02050708"; //子网的IP池有重叠
                                                                }
                                                                if (res.data.data.data.indexOf("spans beyond the subnet cidr") > -1 && res.data.data.data.indexOf("OutOfBoundsAllocationPool") > -1) { 
                                                                    resCode = "02050709"; //子网的IP池超出了子网的cidr
                                                                }
                                                                if (res.data.data.data.indexOf("conflicts with allocation pool") > -1 && res.data.data.data.indexOf("GatewayConflictWithAllocationPools") > -1) { 
                                                                    resCode = "02050710"; //网关IP与IP分配池冲突
                                                                }
                                                                if (res.data.data.data.indexOf("already in use by port") > -1 && res.data.data.data.indexOf("GatewayIpInUse") > -1) { 
                                                                    resCode = "02050711"; //网关IP已经被端口使用，无法进行创建
                                                                }
                                                                if (res.data.data.data.indexOf("Invalid CIDR") > -1 && res.data.data.data.indexOf("InvalidCIDR") > -1) { 
                                                                    resCode = "02050712"; //CIDR是无效的
                                                                }
                                                                if (res.data.data.data.indexOf("must be allocated from the same subnet pool") > -1 && res.data.data.data.indexOf("NetworkSubnetPoolAffinityError") > -1) { 
                                                                    resCode = "02050713"; //属于同一网络的子网必须从相同的子网池中分配
                                                                }
                                                                if (res.data.data.data.indexOf("mechanism_manager.create_subnet_postcommit failed") > -1 && res.data.data.data.indexOf("MechanismDriverError") > -1) { 
                                                                    resCode = "02050714"; //创建该子网的信息提交失败，删除该子网
                                                                }
                                                                if (res.data.data.data.indexOf("Failed to allocate subnet") > -1 && res.data.data.data.indexOf("SubnetAllocationError") > -1) { 
                                                                    resCode = "02050715"; //无法分配子网
                                                                }
                                                                if (res.data.data.data.indexOf("Illegal subnetpool association") > -1 && res.data.data.data.indexOf("IllegalSubnetPoolAssociationToAddressScope") > -1) { 
                                                                    resCode = "02050716"; //非法子网池关联
                                                                }
                                                                if (res.data.data.data.indexOf("Illegal subnetpool association") > -1 && res.data.data.data.indexOf("IllegalSubnetPoolIpVersionAssociationToAddressScope") > -1) { 
                                                                    resCode = "02050717"; //非法子网池关联
                                                                }
                                                                if (res.data.data.data.indexOf("Unspecified minimum subnet pool prefix") > -1 && res.data.data.data.indexOf("MissingMinSubnetPoolPrefix") > -1) { 
                                                                    resCode = "02050718"; //未指定最小的网络子网池前缀
                                                                }
                                                                if (res.data.data.data.indexOf("Loopback IP subnet is not supported if enable_dhcp is True") > -1 && res.data.data.data.indexOf("InvalidInput") > -1) { 
                                                                    resCode = "02050720"; //环回IP类型的子网不支持开启dhcp
                                                                }
                                                                if (res.data.data.data.indexOf("Multicast IP subnet is not supported if enable_dhcp is True") > -1 && res.data.data.data.indexOf("InvalidInput") > -1) { 
                                                                    resCode = "02050721"; //多播IP类型的子网不支持开启dhcp
                                                                }
                                                                if (res.data.data.data.indexOf("Subnet has a prefix length that is incompatible with DHCP service enabled") > -1 && res.data.data.data.indexOf("InvalidInput") > -1) { 
                                                                    resCode = "02050722"; //子网的前缀长度不允许开启dhcp
                                                                }
                                                                if (res.data.data.data.indexOf("Gateway is not valid on subnet") > -1 && res.data.data.data.indexOf("InvalidInput") > -1) { 
                                                                    resCode = "02050723"; //网关在该子网上无效
                                                                }
                                                                if (res.data.data.data.indexOf("Error parsing dns address") > -1 && res.data.data.data.indexOf("InvalidInput") > -1) { 
                                                                    resCode = "02050724"; //dns地址解析失败
                                                                }
                                                                //删除子网
                                                                if (res.data.data.data.indexOf("One or more ports have an IP allocation from this subnet") > -1 && res.data.data.data.indexOf("SubnetInUse") > -1) { 
                                                                    resCode = "02050719"; //无法完成对该子网的操作，该子网上有一个或多个端口正在被使用
                                                                }
                                                            }
                                                            break;

                                                    }
                                                    break;
                                                case "cinder":
                                                    switch (errorFromList[2]){
                                                        case "volume":
                                                            if(res.data.data.data.indexOf("Not enough pool capacity to extend") > -1){
                                                                resCode = "02030703"; //没有足够的资源池容量来扩容
                                                            }
                                                    }
                                                    break;
                                                case "nova":
                                                        if(res.data.data.data.indexOf("Failed to set admin password") > -1 ){
                                                                resCode = "02051705"; 
                                                            }
                                                        break ;   
                                            }
                                        }
                                    }
                                    $rootScope.$broadcast("alert-error", resCode);
                                }
                                return res.data.data;
                            }
                        }
                        return res.data;
                    },
                    requestError(rej) {
                        return rej;
                    },
                    responseError(rej) {
                        checkLoading("resNum",rej.url);
                        if (rej.status == -1 || rej.status == 500) {
                            if (/awstack-user\/v1\/login/.test(rej.config.url)) {
                                $rootScope.$broadcast("loginerror", "servererror");
                                return rej;
                            }
                            if (/awstack-user\/v1\/back\/login\/token/.test(rej.config.url)) {
                                $rootScope.$broadcast("loginerror", "servererror");
                                return rej;
                            }

                        }
                        //localStorage.$AUTH_RETURN_URL = location.href;
                        //location.replace("/auth/");
                        return null;
                    }
                };
            }
        ]);
}
httpConfig.$inject = ["$httpProvider"];