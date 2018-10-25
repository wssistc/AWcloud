let wsModule = angular.module("wsModule",[]);
wsModule.service("bobMesSrv",WsInit)
WsInit.$inject = ['$rootScope',"$window","$timeout","$http","$location","$translate","alertSrv"];
function WsInit(scope,$window,$timeout,$http,$location,$translate,alert){
    function onmessage(event){
            if ($location.path() == "/system/plugin") {
                var data = angular.fromJson(event);
                if(data.data.indexOf('plugin.k8s.manager')>-1||
                    data.data.indexOf('plugin.k8s.install.kube')>-1||
                    data.data.indexOf('plugin.ironic')>-1||
                    data.data.indexOf('task_queue_status')>-1
                    ){
                    scope.$broadcast("functionSocket", data.data);
                }
            }

            /*当容器和物理机安装部署成功的时候云管给予相应的提示怎么获取菜单。*/
            if(event){
                var data = angular.fromJson(event);
                if(data.data.indexOf('plugin.k8s.manager')>-1||
                    data.data.indexOf('plugin.ironic')>-1||
                    data.data.indexOf('task_queue_status')>-1
                    ){

                    //容器安装成功
                    if(data.data.indexOf('task_queue_status')>-1&&data.data.indexOf('install')>-1){
                        var conItem = JSON.parse(data.data)
                        if(conItem.subtask_status&&conItem.subtask_status.length==2){
                            scope.$broadcast("openPluginTips", 'con'); 
                            localStorage.installK8s = 1;
                        }
                    }

                    //物理机安装成功
                    if(data.data.indexOf('plugin.ironic.install.success')>-1){
                        // var phyItem = JSON.parse(data.data);
                        // if(phyItem.process.taskCount==35){
                            scope.$broadcast("openPluginTips", 'phy'); 
                            localStorage.installIronic = 1;  
                        //}
                    }


                    //清除容器
                    if(data.data.indexOf('task_queue_status')>-1&&data.data.indexOf('clean')>-1){
                        let conClean = JSON.parse(data.data)
                        if(conClean.subtask_status&&conClean.subtask_status==3){
                            localStorage.installK8s = 2;
                        }
                    }

                    //清除物理机
                    if(data.data.indexOf('plugin.ironic')>-1&&data.data.indexOf('remove')>-1){
                        let phyClean = JSON.parse(data.data)
                        if(phyClean.process&&phyClean.process.taskStatus&&phyClean.process.taskStatus==6){
                            localStorage.installIronic = 2;
                        }
                    }
                }
            }

            if (event.data&&event.data.indexOf('network.check.storage')>-1) {
                scope.$broadcast("netCheckSocket", event.data);
            }

            //单机登陆
            if(event.data&&event.data.indexOf('single.user.logout')>-1){
               var singleLoginData=JSON.parse(event.data);
               if(singleLoginData.meta&&singleLoginData.meta.uid&&singleLoginData.meta.token){
                   //userId相同token不同则退出登陆
                   if(singleLoginData.meta.uid==localStorage.userUid&&singleLoginData.meta.token!=localStorage.$AUTH_TOKEN){
                      //退出登陆
                      scope.logOut();
                      scope.hadLoginedMsg=true;
                      $timeout(function(){
                         scope.hadLoginedMsg = false; 
                      },4000);
                   }
               }
            }

            //一键关闭消息event.data.indexOf('shutdown_cluster')>-1
            if ($location.path() == "/system/datacluster") {
                if(event.data&&event.data.indexOf('shutdown_cluster')>-1){
                   var shutDownData=JSON.parse(event.data);
                   scope.$broadcast("shutDownData", shutDownData);
                }
            }
            
            if(event.data.length>0){
                scope.$broadcast('clickplatbtn',false)
            }
            //sftp密码
            if(event.data.indexOf('platformMng.update.setsftppasswd')>-1){
                //推送成功后重新获取密码
                if(JSON.parse(event.data).event_type=="platformMng.update.setsftppasswd.success"){
                    scope.$broadcast('setsftppasswd',true)
                //推送失败后操作    
                }else if(JSON.parse(event.data).event_type=="platformMng.update.setsftppasswd.fail"){
                    scope.$broadcast('setsftppasswd',false)
                }
            
            //检查更新包
            }else if(event.data.indexOf('platformMng.update.listpack')>-1){
                if(JSON.parse(event.data).event_type=="platformMng.update.listpack.success"){
                    scope.$broadcast("getlistpack",{version:JSON.parse(JSON.parse(event.data).output).sys_version,packList:JSON.parse(JSON.parse(event.data).output).packs})
                }else if(JSON.parse(event.data).event_type=="platformMng.update.listpack.fail"){
                    scope.$broadcast("getlistpack",false)
                }
            }else if(event.data.indexOf('platformMng.update.runpack')>-1){
                if(JSON.parse(event.data).event_type=="platformMng.update.runpack.ing"){
                    if(JSON.parse(event.data).output!=''){
                        scope.$broadcast("runPackJob",JSON.parse(JSON.parse(event.data).output).job_id)
                    }
                    //scope.$broadcast("runPackJob",JSON.parse(JSON.parse(event.data).output).job_id)
                }else if(JSON.parse(event.data).event_type=="platformMng.update.runpack.success"){
                    scope.$broadcast("runPackJob",1);
                }else if(JSON.parse(event.data).event_type=="platformMng.update.runpack.fail"){
                    scope.$broadcast("runPackJob",2);
                }
            }else if(event.data == "transfer.image.success") {
                scope.$broadcast("transferSuccess", event.data);
            }else if(event.data.indexOf("transfer.image.fail") > -1) {
                scope.$broadcast("transferFailed", event.data);
            }else if(event.data.indexOf("migrate_glance") > -1) {
                scope.$broadcast("transferProgress", event.data);
            }else if(event.data == "checkout.ip.success") {
                scope.$broadcast("checkIpSuccess", event.data);
            }else if(event.data.indexOf("checkout.ip.fail") > -1) {
                scope.$broadcast("checkIpFailed", event.data);
            }else if(event.data.indexOf("share_dir") > -1) {
                scope.$broadcast("checkNfsSuccess", event.data);
            }else if(event.data.indexOf("nfs.sharedir.fail") > -1) {
                scope.$broadcast("checkNfsFiled", event.data);
            }else if(event.data.indexOf("run.script.discovery_iscsi_target.py.success") > -1) {
                scope.$broadcast("discoveryIscsiSuccess", event.data);
            }else if(event.data.indexOf("run.script.discovery_iscsi_target.py.fail") > -1) {
                scope.$broadcast("discoveryIscsiFailed", event.data);
            }else if(event.data.indexOf("run.script.fetch_iscsi_disk_list.py.success") > -1) {
                scope.$broadcast("loginIscsiSuccess", event.data);
            }else if(event.data.indexOf("run.script.fetch_iscsi_disk_list.py.fail") > -1) {
                scope.$broadcast("loginIscsiFailed", event.data);
            }else if(event.data == "cinder.joint.success" || event.data == "cinder.joint.backup.success") {
                getStorage(scope)
                scope.$broadcast("addStorageSuccess", event.data);
            }else if(event.data.indexOf("cinder.joint.fail") > -1 || event.data.indexOf("cinder.joint.backup.fail") > -1) {
                scope.$broadcast("addStorageFailed", event.data);
            }else if(event.data.indexOf("run.operation.log") > -1) {
                scope.$broadcast("netConfigureProgress", event.data);
            }else if(event.data == "run.operation.success") {
                scope.$broadcast("netConfigureSuccess", event.data);
            }else if(event.data.indexOf("run.operation.fail") > -1) {
                scope.$broadcast("netConfigureFailed", event.data);
            }
                        

            /*
            if (sessionStorage.getItem("license") && event.data.indexOf("license") > -1) {
                if (event.data.indexOf("format") > -1) {
                    alert.set("", translate.instant("aws.license.format_error"), "error", 5000);
                } else if (event.data.indexOf("check") > -1) {
                    alert.set("", translate.instant("aws.license.check_error"), "error", 5000);
                } else if (event.data.indexOf("failed") > -1) {
                    alert.set("", translate.instant("aws.license.error"), "error", 5000);
                } else if (event.data.indexOf("update") > -1) {
                    alert.set("", translate.instant("aws.license.success"), "success", 5000);
                    rootscope.$broadcast("licenseSocket", event.data);
                }

                setTimeout(function() {
                    sessionStorage.removeItem("license");
                }, 3000);
            }*/
            // 数据中心节点状态变化
            //if ($location.path() == "/configure/node") {
                if (/^\{\S*\}$/.test(event.data)) {
                    var data = angular.fromJson(event.data);
                    if (data.event_type&&data.event_type.indexOf('nodeMng')>-1) {
                        var nodeMsg = $translate.instant("aws.node.status." + data.event_type);
                        switch (data.event_type) {
                            case "nodeMng.add.ing":
                            case "nodeMng.del.ing":
                            case "nodeMng.promote.ing":
                            case "nodeMng.manit.ing":
                            case "nodeMng.active.ing":
                                if ($location.path() == "/configure/node") {
                                    alert.set(data.nodes[0], nodeMsg, "building");
                                }
                                break;
                            case "nodeMng.add.fail":
                            case "nodeMng.del.fail":
                            case "nodeMng.promote.fail":
                            case "nodeMng.manit.fail":
                            case "nodeMng.active.fail":
                                alert.set(data.nodes[0], nodeMsg, "error",5000);
                                break;
                            default:
                                alert.set(data.nodes[0], nodeMsg, "success", 5000);
                                break;
                        }
                        scope.$broadcast("nodeSocket", data);
                    }
                }
            //}        
            if (sessionStorage.getItem("license") && event.data.indexOf("license") > -1) {
                if (event.data.indexOf("format") > -1) {
                    alert.set("", $translate.instant("aws.license.format_error"), "error", 5000);
                } else if (event.data.indexOf("check") > -1) {
                    alert.set("", $translate.instant("aws.license.check_error"), "error", 5000);
                } else if (event.data.indexOf("failed") > -1) {
                    alert.set("", $translate.instant("aws.license.error"), "error", 5000);
                } else if (event.data.indexOf("update") > -1) {
                    alert.set("", $translate.instant("aws.license.success"), "success", 5000);
                    scope.$broadcast("licenseSocket", event.data);
                }

                setTimeout(function() {
                    sessionStorage.removeItem("license");
                }, 3000);
            }
            if($location.path() == "/system/general"){
                var type = event.data.split(".")[2];
                if(event.data == "config.Update."+ type + ".success") {
                    scope.$broadcast("saasServiceSuccess",event.data);
                    alert.set("", $translate.instant("aws.sockets.opLog."+"update_"+type+"_success"), "success", 5000);
                }else if(event.data.indexOf("config.Update."+type+".fail") > -1) {
                    scope.$broadcast(type+"ServiceFail",event.data);
                    alert.set("", $translate.instant("aws.sockets.opLog."+"update_"+type+"_fail"), "error", 5000);
                }
                
                
            }
            if($location.path() == "/system/cephView"){
                if(event.data.indexOf("ceph_osd_restart.py.success") > -1){
                    scope.$broadcast("restartOSDSuccess", event.data);
                }else if(event.data.indexOf("ceph_osd_restart.py.failed") > -1){
                    scope.$broadcast("restartOSDFailed", event.data);
                }else if(event.data.indexOf("operate.ceph.disk.ing") > -1 ){
                    scope.$broadcast("startTasking", event.data);
                }else if(event.data.indexOf("operate.ceph.disk.fail.server failed") > -1){
                    scope.$broadcast("startTaskFailed", event.data);
                }else if(event.data.indexOf("operate.ceph.disk.success") > -1){
                    scope.$broadcast("startTaskSuccess", event.data);
                }
            } 
            scope.$apply();           
    }
    /*断开连接非登录页，ws5秒钟重连一次*/
    var that = this;
    function relink(that){
         $timeout(function(){
            if($location.path()!='/'){
                that.opened()
            }
        },5000)
    }
    function onopen(){        
    }
    $window.gradeStatus = false;
    function getStorage(scope){
        $http({
            method: "GET",
            url: "/awstack-user/v1/storage"
        }).success(function(result){
            if(result  && angular.isArray(result)){
                localStorage.cinderService = "";
                scope.services.cinder = "";
                localStorage.backupsService = "";
                scope.services.backups = "";
                localStorage.cephService = "";
                scope.services.ceph = "";
                result.map(item => {
                    if(item.use == "0"){
                        localStorage.cinderService = "cinder";
                        scope.services.cinder = "cinder";
                        if(item.storageFirm == "ceph"){
                            localStorage.cephService = "ceph";
                            scope.services.ceph = "ceph";
                        }
                    }
                    if(item.use == "1"){
                        localStorage.backupsService = "backups";
                        scope.services.backups = "backups";
                    }
                })
            }
        })
    }
    function getStatus (){
        if(localStorage.regionKey){
            var path = $location.path();
            var regionKey = localStorage.regionKey;
            var data={
                "regionKey":regionKey
            } 
            $timeout(function(){
                if(!$window.gradeStatus&&(path.indexOf('/system/grade')>-1)){
                    $http({
                        method: "GET",
                        url: "/awstack-user/back/v1/enterprises/regions/status",
                        params:data
                    }).then(function(res) {
                        if(res&&res.data==3){
                            $window.gradeStatus = true;
                            //可能及请求发出后用户跳出升级页面重新拿一次
                            var path = $location.path();
                            if(path.indexOf('/system/grade')>-1){
                                window.location.reload();
                            }
                        }else if(res&&res.data==5){
                            $window.gradeStatus = true;
                            var path = $location.path();
                            if(path.indexOf('/system/grade')>-1){
                                window.location.reload();
                            }
                        }
                    }).finally(function(){
                        if(!$window.gradeStatus){
                            getStatus() 
                        }
                    })
                }
            },15000)

        }
    }
    this.closed = function(){
        if(this.wsInstan){
            this.wsInstan.close();
        }  
    };
    function onclose(){
        getStatus ()
        relink(that)
    }   
    this.opened = function() {
        var url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + localStorage.regionKey;
        this.wsInstan = new WebSocket(url);
        this.wsInstan.onmessage = onmessage;
        this.wsInstan.onopen = onopen;
        this.wsInstan.onclose = onclose;
    };

}

export default wsModule.name;
